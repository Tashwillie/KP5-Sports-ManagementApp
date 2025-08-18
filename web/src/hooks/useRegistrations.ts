import { useEffect, useState } from 'react';
import registrationsService, { RegistrationApplication, RegistrationFormTemplate } from '@/lib/services/registrationsService';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

export const useRegistrations = () => {
  const { user } = useEnhancedAuthContext();
  const [applications, setApplications] = useState<RegistrationApplication[]>([]);
  const [forms, setForms] = useState<RegistrationFormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [apps, tmpls] = await Promise.all([
        registrationsService.getApplications(),
        registrationsService.getFormTemplates(),
      ]);
      setApplications(apps);
      setForms(tmpls);
    } catch (e: any) {
      setError(e.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAll(); else { setApplications([]); setForms([]); setError(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { applications, forms, loading, error, refetch: fetchAll };
};

