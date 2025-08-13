import { useEffect, useState } from 'react';
import mediaService, { UiMediaItem } from '@/lib/services/mediaService';
import { useAuth } from '@/contexts/AuthContext';

export default function useMedia() {
  const { user } = useAuth();
  const [items, setItems] = useState<UiMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await mediaService.getMedia();
      setItems(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [user]);

  return { items, loading, error, refetch: fetchItems };
}

