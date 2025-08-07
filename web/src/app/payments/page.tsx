'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Bell,
  Home,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Trophy as TrophyIcon,
  MapPin as MapPinIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  BarChart3,
  Target,
  User,
  Building,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  UserCheck,
  Activity,
  Trophy,
  Calendar,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle,
  Gavel,
  Shield,
  Zap,
  DollarSign,
  FileText,
  Clipboard,
  CheckSquare,
  XSquare,
  AlertCircle,
  Download,
  CreditCard,
  Receipt,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface Payment {
  id: string;
  transactionId: string;
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'mobile_money' | 'cash' | 'paypal';
  description: string;
  category: 'registration' | 'membership' | 'tournament' | 'equipment' | 'training' | 'other';
  relatedEntity: string;
  relatedEntityType: 'player' | 'team' | 'tournament' | 'league' | 'event' | 'club';
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  refundedAt?: string;
  notes?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Mock user data
  const userData = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  };

  // Mock payments data
  const mockPayments: Payment[] = [
    {
      id: '1',
      transactionId: 'TXN-001-2024',
      payerName: 'Ahmed Hassan',
      payerEmail: 'ahmed.hassan@email.com',
      payerPhone: '+234 801 234 5678',
      amount: 50,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'credit_card',
      description: 'Spring Football League Registration',
      category: 'registration',
      relatedEntity: 'Spring Football League',
      relatedEntityType: 'league',
      createdAt: '2024-01-18T14:30:00Z',
      updatedAt: '2024-01-18T14:35:00Z',
      processedAt: '2024-01-18T14:35:00Z',
      notes: 'Payment processed successfully'
    },
    {
      id: '2',
      transactionId: 'TXN-002-2024',
      payerName: 'Elite Basketball Team',
      payerEmail: 'coach@elitebasketball.com',
      payerPhone: '+254 700 123 456',
      amount: 100,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'bank_transfer',
      description: 'Basketball Tournament Entry Fee',
      category: 'tournament',
      relatedEntity: 'Basketball Tournament',
      relatedEntityType: 'tournament',
      createdAt: '2024-01-20T09:45:00Z',
      updatedAt: '2024-01-20T09:45:00Z',
      notes: 'Awaiting bank confirmation'
    },
    {
      id: '3',
      transactionId: 'TXN-003-2024',
      payerName: 'Sarah Muthoni',
      payerEmail: 'sarah.muthoni@email.com',
      payerPhone: '+254 701 234 567',
      amount: 200,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'mobile_money',
      description: 'Cricket Academy Enrollment',
      category: 'training',
      relatedEntity: 'Cricket Academy',
      relatedEntityType: 'club',
      createdAt: '2024-01-22T16:20:00Z',
      updatedAt: '2024-01-22T16:25:00Z',
      processedAt: '2024-01-22T16:25:00Z',
      notes: 'Mobile money payment confirmed'
    },
    {
      id: '4',
      transactionId: 'TXN-004-2024',
      payerName: 'Kwame Mensah',
      payerEmail: 'kwame.mensah@email.com',
      payerPhone: '+233 24 567 8901',
      amount: 50,
      currency: 'USD',
      status: 'refunded',
      paymentMethod: 'credit_card',
      description: 'Spring Football League Registration',
      category: 'registration',
      relatedEntity: 'Spring Football League',
      relatedEntityType: 'league',
      createdAt: '2024-01-19T12:15:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      processedAt: '2024-01-19T12:20:00Z',
      refundedAt: '2024-01-20T14:45:00Z',
      notes: 'Refunded due to application rejection'
    },
    {
      id: '5',
      transactionId: 'TXN-005-2024',
      payerName: 'Zara van der Merwe',
      payerEmail: 'zara.vandermerwe@email.com',
      payerPhone: '+27 21 123 4567',
      amount: 150,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'paypal',
      description: 'Tennis Club Annual Membership',
      category: 'membership',
      relatedEntity: 'Tennis Club',
      relatedEntityType: 'club',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:35:00Z',
      processedAt: '2024-01-15T10:35:00Z',
      notes: 'PayPal payment successful'
    },
    {
      id: '6',
      transactionId: 'TXN-006-2024',
      payerName: 'Juma Mkamba',
      payerEmail: 'juma.mkamba@email.com',
      payerPhone: '+255 22 987 6543',
      amount: 75,
      currency: 'USD',
      status: 'failed',
      paymentMethod: 'credit_card',
      description: 'Swimming Equipment Purchase',
      category: 'equipment',
      relatedEntity: 'Swimming Club',
      relatedEntityType: 'club',
      createdAt: '2024-01-25T11:20:00Z',
      updatedAt: '2024-01-25T11:25:00Z',
      notes: 'Card declined - insufficient funds'
    },
    {
      id: '7',
      transactionId: 'TXN-007-2024',
      payerName: 'Michael Okechukwu',
      payerEmail: 'michael.okechukwu@email.com',
      payerPhone: '+234 802 345 6789',
      amount: 300,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'bank_transfer',
      description: 'Professional Coaching Certification',
      category: 'training',
      relatedEntity: 'Coaching Academy',
      relatedEntityType: 'club',
      createdAt: '2024-01-23T08:15:00Z',
      updatedAt: '2024-01-23T14:30:00Z',
      processedAt: '2024-01-23T14:30:00Z',
      notes: 'Bank transfer confirmed'
    },
    {
      id: '8',
      transactionId: 'TXN-008-2024',
      payerName: 'Grace Wanjiku',
      payerEmail: 'grace.wanjiku@email.com',
      payerPhone: '+254 703 456 7890',
      amount: 25,
      currency: 'USD',
      status: 'cancelled',
      paymentMethod: 'mobile_money',
      description: 'Swimming Team Tryouts Fee',
      category: 'registration',
      relatedEntity: 'Swimming Team',
      relatedEntityType: 'team',
      createdAt: '2024-01-24T16:45:00Z',
      updatedAt: '2024-01-24T17:00:00Z',
      notes: 'Cancelled by user'
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'failed':
        return 'badge bg-danger';
      case 'refunded':
        return 'badge bg-info';
      case 'cancelled':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'refunded':
        return 'Refunded';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'registration':
        return 'badge bg-primary';
      case 'membership':
        return 'badge bg-success';
      case 'tournament':
        return 'badge bg-warning text-dark';
      case 'equipment':
        return 'badge bg-info';
      case 'training':
        return 'badge bg-secondary';
      case 'other':
        return 'badge bg-dark';
      default:
        return 'badge bg-secondary';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard size={16} />;
      case 'bank_transfer':
        return <Receipt size={16} />;
      case 'mobile_money':
        return <Zap size={16} />;
      case 'cash':
        return <DollarSign size={16} />;
      case 'paypal':
        return <Globe size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'mobile_money':
        return 'Mobile Money';
      case 'cash':
        return 'Cash';
      case 'paypal':
        return 'PayPal';
      default:
        return method;
    }
  };

  const handleViewPayment = (paymentId: string) => {
    router.push(`/payments/${paymentId}`);
  };

  const handleRefundPayment = (paymentId: string) => {
    router.push(`/payments/${paymentId}/refund`);
  };

  const handleExportPayments = () => {
    // Mock export functionality
    console.log('Exporting payments...');
  };

  // Filter payments based on search and filters
  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || payment.category === categoryFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || payment.paymentMethod === paymentMethodFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPaymentMethod;
  });

  // Calculate stats
  const totalPayments = mockPayments.length;
  const completedPayments = mockPayments.filter(payment => payment.status === 'completed').length;
  const totalRevenue = mockPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = mockPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar activeTab="payments" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Payments Management</h4>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                <Search size={16} className="me-1" />
                Search
              </button>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                <Bell size={16} className="me-1" />
                Notifications
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                onClick={handleExportPayments}
              >
                <Download size={16} className="me-1" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4">
          <div className="row g-4 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <DollarSign size={24} style={{color: '#4169E1'}} />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Payments</h6>
                      <h4 className="mb-0 fw-bold">{totalPayments}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <CheckCircle size={24} className="text-success" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Completed</h6>
                      <h4 className="mb-0 fw-bold">{completedPayments}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <TrendingUp size={24} className="text-info" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Total Revenue</h6>
                      <h4 className="mb-0 fw-bold">${totalRevenue}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <Clock size={24} className="text-warning" />
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="text-muted mb-1">Pending Amount</h6>
                      <h4 className="mb-0 fw-bold">${pendingAmount}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label htmlFor="search" className="form-label fw-medium">Search</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Search size={16} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      id="search"
                      className="form-control border-start-0"
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <label htmlFor="statusFilter" className="form-label fw-medium">Status</label>
                  <select
                    id="statusFilter"
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label htmlFor="categoryFilter" className="form-label fw-medium">Category</label>
                  <select
                    id="categoryFilter"
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="registration">Registration</option>
                    <option value="membership">Membership</option>
                    <option value="tournament">Tournament</option>
                    <option value="equipment">Equipment</option>
                    <option value="training">Training</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label htmlFor="paymentMethodFilter" className="form-label fw-medium">Payment Method</label>
                  <select
                    id="paymentMethodFilter"
                    className="form-select"
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  >
                    <option value="all">All Methods</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="cash">Cash</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3 fw-medium">Transaction</th>
                      <th className="border-0 px-4 py-3 fw-medium">Payer</th>
                      <th className="border-0 px-4 py-3 fw-medium">Amount</th>
                      <th className="border-0 px-4 py-3 fw-medium">Category</th>
                      <th className="border-0 px-4 py-3 fw-medium">Payment Method</th>
                      <th className="border-0 px-4 py-3 fw-medium">Status</th>
                      <th className="border-0 px-4 py-3 fw-medium">Date</th>
                      <th className="border-0 px-4 py-3 fw-medium text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3">
                          <div>
                            <div className="fw-medium">{payment.transactionId}</div>
                            <small className="text-muted">{payment.description}</small>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="fw-medium">{payment.payerName}</div>
                            <small className="text-muted">{payment.payerEmail}</small>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="fw-bold">
                            {payment.currency} {payment.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getCategoryBadgeClass(payment.category)}>
                            {payment.category.charAt(0).toUpperCase() + payment.category.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <span className="text-muted me-2">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                            </span>
                            <span className="small">
                              {getPaymentMethodLabel(payment.paymentMethod)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadgeClass(payment.status)}>
                            {getStatusLabel(payment.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="small">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleViewPayment(payment.id)}
                              title="View Payment"
                            >
                              <Eye size={14} />
                            </button>
                            {payment.status === 'completed' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleRefundPayment(payment.id)}
                                title="Refund Payment"
                              >
                                <RefreshCw size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPayments.length === 0 && (
                <div className="text-center py-5">
                  <DollarSign size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No payments found</h5>
                  <p className="text-muted">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 