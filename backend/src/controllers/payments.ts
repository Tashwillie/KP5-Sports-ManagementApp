import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

// Get all payments with pagination and filtering
export const getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).user.id;

    // Build where clause
    const where: any = {
      userId,
    };

    if (status) where.status = status;
    if (method) where.method = method;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = Number(minAmount);
      if (maxAmount) where.amount.lte = Number(maxAmount);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          registrations: {
            select: {
              id: true,
              type: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    next(error);
  }
};

// Get single payment by ID
export const getPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        registrations: {
          select: {
            id: true,
            type: true,
            status: true,
            formData: true,
            waiverSigned: true,
            createdAt: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Error fetching payment:', error);
    next(error);
  }
};

// Create new payment
export const createPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      amount,
      currency = 'USD',
      method,
      description,
      metadata,
    } = req.body;

    const userId = (req as any).user.id;

    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        currency,
        method,
        description,
        metadata,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment created successfully',
    });
  } catch (error) {
    logger.error('Error creating payment:', error);
    next(error);
  }
};

// Update payment
export const updatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;
    const updateData = { ...req.body };

    // Check if user owns the payment
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!payment) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to update this payment',
      });
      return;
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        registrations: {
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment updated successfully',
    });
  } catch (error) {
    logger.error('Error updating payment:', error);
    next(error);
  }
};

// Delete payment (soft delete by setting status to CANCELLED)
export const deletePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
      return;
    }

    const userId = (req as any).user.id;

    // Check if user owns the payment
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!payment) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this payment',
      });
      return;
    }

    // Soft delete by setting status to CANCELLED
    await prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.CANCELLED },
    });

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
    });
  } catch (error) {
    logger.error('Error deleting payment:', error);
    next(error);
  }
};

// Process Stripe payment
export const processStripePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      amount,
      currency = 'USD',
      paymentMethodId: _paymentMethodId, // Unused for now, will be used with actual Stripe integration
      description,
      metadata,
    } = req.body;

    const userId = (req as any).user.id;

    // TODO: Implement actual Stripe payment processing
    // This would integrate with Stripe API to process the payment
    // For now, we'll simulate a successful payment

    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        currency,
        method: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.COMPLETED,
        stripePaymentId: `stripe_${Date.now()}`, // Simulated Stripe payment ID
        description,
        metadata,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    logger.error('Error processing Stripe payment:', error);
    next(error);
  }
};

// Refund payment
export const refundPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Payment ID is required',
      });
      return;
    }

    const { amount, reason } = req.body;
    const userId = (req as any).user.id;

    // Check if user owns the payment
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId,
        status: PaymentStatus.COMPLETED,
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found or not eligible for refund',
      });
      return;
    }

    // TODO: Implement actual Stripe refund processing
    // This would integrate with Stripe API to process the refund

    const refundAmount = amount || payment.amount;

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
        metadata: {
          ...(payment.metadata as any || {}),
          refundAmount,
          refundReason: reason,
          refundedAt: new Date().toISOString(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment refunded successfully',
    });
  } catch (error) {
    logger.error('Error refunding payment:', error);
    next(error);
  }
};

// Get payment history and analytics
export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Get payment statistics
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
      _sum: { amount: true },
    });

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        description: true,
        createdAt: true,
      },
    });

    // Calculate totals
    const totalPaid = stats
      .filter(s => s.status === PaymentStatus.COMPLETED)
      .reduce((sum, s) => sum + (s._sum.amount || 0), 0);

    const totalRefunded = stats
      .filter(s => s.status === PaymentStatus.REFUNDED)
      .reduce((sum, s) => sum + (s._sum.amount || 0), 0);

    const pendingAmount = stats
      .filter(s => s.status === PaymentStatus.PENDING)
      .reduce((sum, s) => sum + (s._sum.amount || 0), 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalPaid,
          totalRefunded,
          pendingAmount,
          netAmount: totalPaid - totalRefunded,
          totalPayments: stats.reduce((sum, s) => sum + s._count.id, 0),
        },
        recentPayments,
        statusBreakdown: stats.map(s => ({
          status: s.status,
          count: s._count.id,
          amount: s._sum.amount || 0,
        })),
      },
    });
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    next(error);
  }
};
