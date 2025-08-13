import { useEffect, useState } from 'react';
import paymentsService, { UiPayment } from '@/lib/services/paymentsService';
import { useAuth } from '@/contexts/AuthContext';

export interface UsePaymentsReturn {
  payments: UiPayment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePayments = (): UsePaymentsReturn => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<UiPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await paymentsService.getPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayments();
    } else {
      setPayments([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { payments, loading, error, refetch: fetchPayments };
};

