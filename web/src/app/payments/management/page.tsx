'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Payment, Subscription, Invoice } from '../../../../shared/src/types';
import { paymentService } from '@/lib/services/paymentService';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingPayments: number;
  overdueInvoices: number;
}

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    overdueInvoices: 0,
  });
  const [selectedTab, setSelectedTab] = useState<'payments' | 'subscriptions' | 'invoices'>('payments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '30',
    search: '',
  });

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    loadPaymentData();
  }, [selectedTab, filters]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      const [paymentsData, subscriptionsData, invoicesData, statsData] = await Promise.all([
        paymentService.getPayments(filters),
        paymentService.getSubscriptions(filters),
        paymentService.getInvoices(filters),
        paymentService.getPaymentStats(),
      ]);
      
      setPayments(paymentsData);
      setSubscriptions(subscriptionsData);
      setInvoices(invoicesData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load payment data');
      console.error('Error loading payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (paymentId: string, status: string) => {
    try {
      await paymentService.updatePaymentStatus(paymentId, status);
      await loadPaymentData();
    } catch (err) {
      setError('Failed to update payment status');
      console.error('Error updating payment status:', err);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (confirm('Are you sure you want to process a refund for this payment?')) {
      try {
        await paymentService.processRefund(paymentId);
        await loadPaymentData();
      } catch (err) {
        setError('Failed to process refund');
        console.error('Error processing refund:', err);
      }
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      try {
        await paymentService.cancelSubscription(subscriptionId);
        await loadPaymentData();
      } catch (err) {
        setError('Failed to cancel subscription');
        console.error('Error canceling subscription:', err);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100); // Convert cents to dollars
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-gray-600 mt-1">Manage payments, subscriptions, and invoices</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                Export Data
              </Button>
              <Button>
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Overdue Invoices</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.overdueInvoices}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search payments..."
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={loadPaymentData} variant="outline">
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'payments', label: 'Payments', count: payments.length },
                { id: 'subscriptions', label: 'Subscriptions', count: subscriptions.length },
                { id: 'invoices', label: 'Invoices', count: invoices.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <Card className="overflow-hidden">
          {selectedTab === 'payments' && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleStatusChange(payment.id, 'completed')}
                            variant="outline"
                            size="sm"
                            disabled={payment.status === 'completed'}
                          >
                            Mark Complete
                          </Button>
                          <Button
                            onClick={() => handleRefund(payment.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled={payment.status === 'refunded'}
                          >
                            Refund
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTab === 'subscriptions' && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscription ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-mono text-sm">{subscription.id}</TableCell>
                      <TableCell>{subscription.customerName}</TableCell>
                      <TableCell>{subscription.planName}</TableCell>
                      <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscription.nextBillingDate ? 
                          new Date(subscription.nextBillingDate).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleCancelSubscription(subscription.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled={subscription.status === 'cancelled'}
                          >
                            Cancel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedTab === 'invoices' && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => window.open(invoice.pdfUrl, '_blank')}
                            variant="outline"
                            size="sm"
                          >
                            View PDF
                          </Button>
                          <Button
                            onClick={() => paymentService.sendInvoiceReminder(invoice.id)}
                            variant="outline"
                            size="sm"
                          >
                            Send Reminder
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 