import apiClient from '@/lib/apiClient';

export interface UiPayment {
  id: string;
  transactionId: string;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'credit_card' | 'bank_transfer' | 'mobile_money' | 'cash' | 'paypal';
  description: string;
  category: 'registration' | 'membership' | 'tournament' | 'equipment' | 'training' | 'other';
  relatedEntity: string;
  relatedEntityType: 'player' | 'team' | 'tournament' | 'league' | 'event' | 'club' | 'other';
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  refundedAt?: string;
}

const mapStatus = (s: string): UiPayment['status'] => {
  const m: any = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled',
  };
  return m[s] || 'pending';
};

const mapMethod = (mth: string): UiPayment['paymentMethod'] => {
  const m: any = {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'credit_card',
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash',
    CHECK: 'cash',
  };
  return m[mth] || 'credit_card';
};

class PaymentsService {
  async getPayments(): Promise<UiPayment[]> {
    const response: any = await apiClient.getPayments();
    const data = Array.isArray(response.data) ? response.data : response.data?.payments || response.data || [];
    return data.map((p: any) => {
      const payerName = [p.user?.firstName, p.user?.lastName].filter(Boolean).join(' ') || p.user?.email || 'User';
      // Derive category from related registrations if available
      const category = (p.registrations?.[0]?.type || 'OTHER').toString();
      const categoryMap: any = {
        PLAYER: 'registration',
        TEAM: 'registration',
        TOURNAMENT: 'tournament',
        EVENT: 'event',
      };
      const uiCategory: UiPayment['category'] = categoryMap[category] || 'other';

      const relatedEntity = p.registrations?.[0]?.type || 'other';
      const relatedEntityType: UiPayment['relatedEntityType'] = ((): any => {
        switch (p.registrations?.[0]?.type) {
          case 'PLAYER':
            return 'player';
          case 'TEAM':
            return 'team';
          case 'TOURNAMENT':
            return 'tournament';
          case 'EVENT':
            return 'event';
          default:
            return 'other';
        }
      })();

      return {
        id: p.id,
        transactionId: p.stripePaymentId || p.id,
        payerName,
        payerEmail: p.user?.email || '',
        payerPhone: p.user?.phone || '',
        amount: Number(p.amount) || 0,
        currency: p.currency || 'USD',
        status: mapStatus(p.status || 'PENDING'),
        paymentMethod: mapMethod(p.method || 'CREDIT_CARD'),
        description: p.description || '',
        category: uiCategory,
        relatedEntity: relatedEntity.toString(),
        relatedEntityType,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        processedAt: p.metadata?.processedAt,
        refundedAt: p.metadata?.refundedAt,
      };
    });
  }
}

export default new PaymentsService();

