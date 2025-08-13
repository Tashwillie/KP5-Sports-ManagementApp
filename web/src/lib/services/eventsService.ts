import apiClient from '@/lib/apiClient';

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: string;
  clubId?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
  participantsCount?: number;
}

export interface EventWithRelations extends EventItem {
  club?: { id: string; name: string; logo?: string | null } | null;
  team?: { id: string; name: string; logo?: string | null } | null;
  participants?: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      avatar?: string | null;
    };
  }>
}

class EventsService {
  async getEvents(): Promise<EventWithRelations[]> {
    const response: any = await apiClient.getEvents();
    const data = Array.isArray(response.data) ? response.data : response.data?.events || [];
    return data.map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      type: (e.type || 'OTHER').toString().toUpperCase(),
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location || '',
      clubId: e.clubId,
      teamId: e.teamId,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      participantsCount: e.participants?.length || 0,
      club: e.club || null,
      team: e.team || null,
      participants: e.participants || [],
    }));
  }
}

export default new EventsService();

