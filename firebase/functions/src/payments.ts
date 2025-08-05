import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const paymentFunctions = {
  // Create a payment intent for one-time payments
  createPaymentIntent: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { amount, currency = 'usd', description, metadata = {} } = data;

      if (!amount || amount < 50) { // Minimum 50 cents
        throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
      }

      // Get user data
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      // Create or get Stripe customer
      let customerId = userData.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userData.email,
          name: userData.displayName,
          metadata: {
            firebase_uid: context.auth.uid
          }
        });
        customerId = customer.id;

        // Save customer ID to user profile
        await db.collection('users').doc(context.auth.uid).update({
          stripeCustomerId: customerId
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        description,
        metadata: {
          ...metadata,
          firebase_uid: context.auth.uid,
          user_email: userData.email
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Save payment intent to Firestore
      await db.collection('paymentIntents').doc(paymentIntent.id).set({
        id: paymentIntent.id,
        userId: context.auth.uid,
        amount,
        currency,
        status: paymentIntent.status,
        description,
        metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create payment intent');
    }
  }),

  // Confirm a payment
  confirmPayment: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { paymentIntentId } = data;

      if (!paymentIntentId) {
        throw new functions.https.HttpsError('invalid-argument', 'Payment intent ID is required');
      }

      // Get payment intent from Firestore
      const paymentIntentDoc = await db.collection('paymentIntents').doc(paymentIntentId).get();
      if (!paymentIntentDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Payment intent not found');
      }

      const paymentIntentData = paymentIntentDoc.data();
      if (paymentIntentData!.userId !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied');
      }

      // Confirm payment with Stripe
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

      // Update payment intent in Firestore
      await db.collection('paymentIntents').doc(paymentIntentId).update({
        status: paymentIntent.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create payment record
      if (paymentIntent.status === 'succeeded') {
        await db.collection('payments').add({
          userId: context.auth.uid,
          stripePaymentIntentId: paymentIntentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          description: paymentIntentData!.description,
          metadata: paymentIntentData!.metadata,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return { status: paymentIntent.status };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new functions.https.HttpsError('internal', 'Failed to confirm payment');
    }
  }),

  // Create a subscription
  createSubscription: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { priceId, metadata = {} } = data;

      if (!priceId) {
        throw new functions.https.HttpsError('invalid-argument', 'Price ID is required');
      }

      // Get user data
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      // Get or create Stripe customer
      let customerId = userData.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userData.email,
          name: userData.displayName,
          metadata: {
            firebase_uid: context.auth.uid
          }
        });
        customerId = customer.id;

        await db.collection('users').doc(context.auth.uid).update({
          stripeCustomerId: customerId
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          ...metadata,
          firebase_uid: context.auth.uid
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });

      // Save subscription to Firestore
      await db.collection('subscriptions').doc(subscription.id).set({
        id: subscription.id,
        userId: context.auth.uid,
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: (subscription.latest_invoice as any).payment_intent?.client_secret
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new functions.https.HttpsError('internal', 'Failed to create subscription');
    }
  }),

  // Cancel a subscription
  cancelSubscription: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { subscriptionId } = data;

      if (!subscriptionId) {
        throw new functions.https.HttpsError('invalid-argument', 'Subscription ID is required');
      }

      // Get subscription from Firestore
      const subscriptionDoc = await db.collection('subscriptions').doc(subscriptionId).get();
      if (!subscriptionDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Subscription not found');
      }

      const subscriptionData = subscriptionDoc.data();
      if (subscriptionData!.userId !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied');
      }

      // Cancel subscription in Stripe
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      // Update subscription in Firestore
      await db.collection('subscriptions').doc(subscriptionId).update({
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { status: subscription.status };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new functions.https.HttpsError('internal', 'Failed to cancel subscription');
    }
  }),

  // Process a refund
  processRefund: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { paymentIntentId, amount, reason } = data;

      if (!paymentIntentId) {
        throw new functions.https.HttpsError('invalid-argument', 'Payment intent ID is required');
      }

      // Check if user has permission to process refunds
      const userDoc = await db.collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();

      if (!userData || !['super_admin', 'club_admin'].includes(userData.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
      }

      // Get payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (!paymentIntent.latest_charge) {
        throw new functions.https.HttpsError('failed-precondition', 'No charge found for payment intent');
      }

      // Create refund
      const refund = await stripe.refunds.create({
        charge: paymentIntent.latest_charge as string,
        amount,
        reason: reason || 'requested_by_customer',
        metadata: {
          processed_by: context.auth.uid,
          reason
        }
      });

      // Save refund to Firestore
      await db.collection('refunds').add({
        stripeRefundId: refund.id,
        paymentIntentId,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        processedBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { refundId: refund.id, status: refund.status };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new functions.https.HttpsError('internal', 'Failed to process refund');
    }
  }),

  // Handle Stripe webhooks
  handleStripeWebhook: functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      res.status(400).send('Webhook signature verification failed');
      return;
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).send('Webhook signature verification failed');
      return;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object);
          break;
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).send('Webhook handler failed');
    }
  }),

  // Generate invoice
  generateInvoice: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { customerId, items, description, dueDate } = data;

      if (!customerId || !items || items.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Customer ID and items are required');
      }

      // Create invoice in Stripe
      const invoice = await stripe.invoices.create({
        customer: customerId,
        description,
        due_date: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : undefined,
        collection_method: 'send_invoice',
        days_until_due: 30
      });

      // Add invoice items
      for (const item of items) {
        await stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          amount: item.amount,
          currency: item.currency || 'usd',
          description: item.description
        });
      }

      // Finalize and send invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.sendInvoice(invoice.id);

      // Save invoice to Firestore
      await db.collection('invoices').doc(invoice.id).set({
        id: invoice.id,
        stripeCustomerId: customerId,
        amount: finalizedInvoice.amount_due,
        currency: finalizedInvoice.currency,
        status: finalizedInvoice.status,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { invoiceId: invoice.id, status: finalizedInvoice.status };
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new functions.https.HttpsError('internal', 'Failed to generate invoice');
    }
  }),

  // Send payment reminder
  sendPaymentReminder: functions.https.onCall(async (data, context) => {
    try {
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { invoiceId } = data;

      if (!invoiceId) {
        throw new functions.https.HttpsError('invalid-argument', 'Invoice ID is required');
      }

      // Send payment reminder
      await stripe.invoices.sendInvoice(invoiceId);

      return { success: true };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw new functions.https.HttpsError('internal', 'Failed to send payment reminder');
    }
  })
};

// Webhook handlers
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Update payment intent in Firestore
  await db.collection('paymentIntents').doc(paymentIntent.id).update({
    status: paymentIntent.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Create payment record
  await db.collection('payments').add({
    stripePaymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    metadata: paymentIntent.metadata,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id);
  
  await db.collection('paymentIntents').doc(paymentIntent.id).update({
    status: paymentIntent.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id);
  
  await db.collection('subscriptions').doc(subscription.id).update({
    status: subscription.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id);
  
  await db.collection('subscriptions').doc(subscription.id).update({
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id);
  
  await db.collection('subscriptions').doc(subscription.id).update({
    status: subscription.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  await db.collection('invoices').doc(invoice.id).update({
    status: invoice.status,
    paidAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log('Invoice payment failed:', invoice.id);
  
  await db.collection('invoices').doc(invoice.id).update({
    status: invoice.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
} 