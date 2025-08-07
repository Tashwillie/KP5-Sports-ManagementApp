"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  Lock,
  Shield,
  Zap,
  Trophy,
  User,
  Building,
  Clock,
  MapPin,
  FileText
} from 'lucide-react';

interface PaymentItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  type: 'one_time' | 'recurring';
  category: 'tournament' | 'membership' | 'equipment' | 'training' | 'other';
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  maxParticipants?: number;
  currentParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  venue?: string;
  isActive: boolean;
}

interface PaymentTransaction {
  id: string;
  paymentItemId: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'cash';
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

interface PaymentSystemProps {
  paymentItems: PaymentItem[];
  transactions: PaymentTransaction[];
  onPaymentItemCreate: (item: Omit<PaymentItem, 'id'>) => void;
  onPaymentItemUpdate: (id: string, updates: Partial<PaymentItem>) => void;
  onPaymentItemDelete: (id: string) => void;
  onPaymentProcess: (paymentItemId: string, userId: string, paymentMethod: string) => Promise<void>;
  onPaymentRefund: (transactionId: string, reason: string) => Promise<void>;
}

export function PaymentSystem({
  paymentItems,
  transactions,
  onPaymentItemCreate,
  onPaymentItemUpdate,
  onPaymentItemDelete,
  onPaymentProcess,
  onPaymentRefund
}: PaymentSystemProps) {
  const [selectedTab, setSelectedTab] = useState('items');
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

  // Form state for creating/editing payment items
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [itemCurrency, setItemCurrency] = useState('USD');
  const [itemType, setItemType] = useState<'one_time' | 'recurring'>('one_time');
  const [itemCategory, setItemCategory] = useState<PaymentItem['category']>('tournament');
  const [itemRecurringInterval, setItemRecurringInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [itemMaxParticipants, setItemMaxParticipants] = useState('');
  const [itemStartDate, setItemStartDate] = useState('');
  const [itemEndDate, setItemEndDate] = useState('');
  const [itemVenue, setItemVenue] = useState('');
  const [itemIsActive, setItemIsActive] = useState(true);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getCategoryIcon = (category: PaymentItem['category']) => {
    switch (category) {
      case 'tournament':
        return <Trophy className="w-4 h-4" />;
      case 'membership':
        return <User className="w-4 h-4" />;
      case 'equipment':
        return <Shield className="w-4 h-4" />;
      case 'training':
        return <Zap className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCreateItem = () => {
    if (!itemName || !itemDescription || !itemAmount) return;

    const newItem: Omit<PaymentItem, 'id'> = {
      name: itemName,
      description: itemDescription,
      amount: parseFloat(itemAmount),
      currency: itemCurrency,
      type: itemType,
      category: itemCategory,
      recurringInterval: itemType === 'recurring' ? itemRecurringInterval : undefined,
      maxParticipants: itemMaxParticipants ? parseInt(itemMaxParticipants) : undefined,
      startDate: itemStartDate ? new Date(itemStartDate) : undefined,
      endDate: itemEndDate ? new Date(itemEndDate) : undefined,
      venue: itemVenue || undefined,
      isActive: itemIsActive
    };

    onPaymentItemCreate(newItem);
    
    // Reset form
    setItemName('');
    setItemDescription('');
    setItemAmount('');
    setItemCurrency('USD');
    setItemType('one_time');
    setItemCategory('tournament');
    setItemRecurringInterval('monthly');
    setItemMaxParticipants('');
    setItemStartDate('');
    setItemEndDate('');
    setItemVenue('');
    setItemIsActive(true);
    setIsCreatingItem(false);
  };

  const handleEditItem = () => {
    if (!selectedItem || !itemName || !itemDescription || !itemAmount) return;

    const updates: Partial<PaymentItem> = {
      name: itemName,
      description: itemDescription,
      amount: parseFloat(itemAmount),
      currency: itemCurrency,
      type: itemType,
      category: itemCategory,
      recurringInterval: itemType === 'recurring' ? itemRecurringInterval : undefined,
      maxParticipants: itemMaxParticipants ? parseInt(itemMaxParticipants) : undefined,
      startDate: itemStartDate ? new Date(itemStartDate) : undefined,
      endDate: itemEndDate ? new Date(itemEndDate) : undefined,
      venue: itemVenue || undefined,
      isActive: itemIsActive
    };

    onPaymentItemUpdate(selectedItem.id, updates);
    setIsEditingItem(false);
    setSelectedItem(null);
  };

  const handleEditClick = (item: PaymentItem) => {
    setSelectedItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemAmount(item.amount.toString());
    setItemCurrency(item.currency);
    setItemType(item.type);
    setItemCategory(item.category);
    setItemRecurringInterval(item.recurringInterval || 'monthly');
    setItemMaxParticipants(item.maxParticipants?.toString() || '');
    setItemStartDate(item.startDate ? item.startDate.toISOString().split('T')[0] : '');
    setItemEndDate(item.endDate ? item.endDate.toISOString().split('T')[0] : '');
    setItemVenue(item.venue || '');
    setItemIsActive(item.isActive);
    setIsEditingItem(true);
  };

  const renderPaymentItem = (item: PaymentItem) => {
    const itemTransactions = transactions.filter(t => t.paymentItemId === item.id);
    const totalRevenue = itemTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getCategoryIcon(item.category)}
              <div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={item.isActive ? 'default' : 'secondary'}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">
                {item.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label className="text-sm text-gray-600">Price</Label>
              <p className="font-semibold">{formatCurrency(item.amount, item.currency)}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Revenue</Label>
              <p className="font-semibold text-green-600">{formatCurrency(totalRevenue, item.currency)}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Participants</Label>
              <p className="font-semibold">
                {item.currentParticipants || 0}
                {item.maxParticipants && ` / ${item.maxParticipants}`}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Transactions</Label>
              <p className="font-semibold">{itemTransactions.length}</p>
            </div>
          </div>

          {item.startDate && item.endDate && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(item.startDate).toLocaleDateString()}</span>
              </div>
              <span>to</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(item.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {item.venue && (
            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{item.venue}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(item)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPaymentItemDelete(item.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTransaction = (transaction: PaymentTransaction) => {
    const paymentItem = paymentItems.find(item => item.id === transaction.paymentItemId);

    return (
      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium">{paymentItem?.name || 'Unknown Item'}</p>
              <p className="text-sm text-gray-600">{transaction.userName}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold">{formatCurrency(transaction.amount, transaction.currency)}</p>
            <p className="text-sm text-gray-600">
              {new Date(transaction.createdAt).toLocaleDateString()}
            </p>
          </div>
          {getStatusBadge(transaction.status)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTransaction(transaction)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">Payment Management</h2>
            <p className="text-gray-600">Manage payment items and transactions</p>
          </div>
        </div>
        <Button onClick={() => setIsCreatingItem(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Payment Item
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Payment Items</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentItems.map(renderPaymentItem)}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              transactions.map(renderTransaction)
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Total Revenue</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(
                    transactions
                      .filter(t => t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0),
                    'USD'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Active Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {paymentItems.filter(item => item.isActive).length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Completed Payments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {transactions.filter(t => t.status === 'completed').length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Payment Item Dialog */}
      <Dialog open={isCreatingItem || isEditingItem} onOpenChange={() => {
        setIsCreatingItem(false);
        setIsEditingItem(false);
        setSelectedItem(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreatingItem ? 'Create Payment Item' : 'Edit Payment Item'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Tournament Registration"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={itemCategory} onValueChange={(value: PaymentItem['category']) => setItemCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Describe the payment item..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={itemAmount}
                  onChange={(e) => setItemAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={itemCurrency} onValueChange={setItemCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={itemType} onValueChange={(value: 'one_time' | 'recurring') => setItemType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {itemType === 'recurring' && (
              <div>
                <Label>Recurring Interval</Label>
                <Select value={itemRecurringInterval} onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setItemRecurringInterval(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Participants</Label>
                <Input
                  type="number"
                  value={itemMaxParticipants}
                  onChange={(e) => setItemMaxParticipants(e.target.value)}
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={itemIsActive}
                  onCheckedChange={setItemIsActive}
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={itemStartDate}
                  onChange={(e) => setItemStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={itemEndDate}
                  onChange={(e) => setItemEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Venue</Label>
              <Input
                value={itemVenue}
                onChange={(e) => setItemVenue(e.target.value)}
                placeholder="Event venue (optional)"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={isCreatingItem ? handleCreateItem : handleEditItem}
                className="flex-1"
              >
                {isCreatingItem ? 'Create Item' : 'Update Item'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreatingItem(false);
                  setIsEditingItem(false);
                  setSelectedItem(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <p className="font-semibold">
                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedTransaction.status)}</div>
                </div>
              </div>
              <div>
                <Label>Payment Method</Label>
                <p className="font-semibold capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p className="font-semibold">
                  {new Date(selectedTransaction.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedTransaction.stripePaymentIntentId && (
                <div>
                  <Label>Stripe Payment Intent</Label>
                  <p className="font-mono text-sm">{selectedTransaction.stripePaymentIntentId}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PaymentSystem;