import apiClient from '@/lib/apiClient';

export interface SearchFilters {
  category?: 'club' | 'team' | 'player' | 'event' | 'tournament' | 'all';
  city?: string;
  state?: string;
  sport?: string;
  ageGroup?: string;
  gender?: string;
  level?: string;
}

export interface SearchResultItem {
  type: 'club' | 'team' | 'player' | 'event' | 'tournament';
  id: string;
  title: string;
  description?: string;
  url: string;
  image?: string;
  location?: string;
}

class SearchService {
  async search(query: string, filters: SearchFilters = {}): Promise<SearchResultItem[]> {
    const q = (query || '').toLowerCase();
    const want = (k: string) => !filters.category || filters.category === 'all' || filters.category === k;

    const [clubsResp, teamsResp, usersResp, eventsResp, tournamentsResp] = await Promise.all([
      want('club') ? apiClient.getClubs().catch(() => ({ data: { clubs: [] } })) : Promise.resolve({ data: { clubs: [] } }),
      want('team') ? apiClient.getTeams().catch(() => ({ data: { teams: [] } })) : Promise.resolve({ data: { teams: [] } }),
      want('player') ? apiClient.getUsersFiltered({ role: 'PLAYER' }).catch(() => ({ data: { users: [] } })) : Promise.resolve({ data: { users: [] } }),
      want('event') ? apiClient.getEvents().catch(() => ({ data: { events: [] } })) : Promise.resolve({ data: { events: [] } }),
      want('tournament') ? apiClient.getTournaments().catch(() => ({ data: { tournaments: [] } })) : Promise.resolve({ data: { tournaments: [] } }),
    ] as const);

    const clubs = (clubsResp.data?.clubs || []).filter((c: any) => this.matches(q, [c.name, c.description, c.city, c.state]))
      .map((c: any) => ({
        type: 'club',
        id: c.id,
        title: c.name,
        description: c.description || '',
        url: `/clubs`,
        image: c.logo,
        location: [c.city, c.state].filter(Boolean).join(', '),
      } as SearchResultItem));

    const teams = (teamsResp.data?.teams || []).filter((t: any) => this.matches(q, [t.name, t.description, t.ageGroup, t.gender]))
      .map((t: any) => ({
        type: 'team',
        id: t.id,
        title: t.name,
        description: t.description || '',
        url: `/teams/${t.id}`,
        image: t.logo,
        location: t.club?.name,
      } as SearchResultItem));

    const players = (usersResp.data?.users || []).filter((u: any) => this.matches(q, [u.displayName, u.firstName, u.lastName, u.email]))
      .map((u: any) => ({
        type: 'player',
        id: u.id,
        title: u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        description: u.profile?.position || 'Player',
        url: `/players`,
        image: u.avatar,
        location: u.clubs?.[0]?.club?.name,
      } as SearchResultItem));

    const events = (eventsResp.data?.events || []).filter((e: any) => this.matches(q, [e.title, e.description, e.location]))
      .map((e: any) => ({
        type: 'event',
        id: e.id,
        title: e.title,
        description: e.description || '',
        url: `/events`,
        image: undefined,
        location: e.location,
      } as SearchResultItem));

    const tournaments = (tournamentsResp.data?.tournaments || []).filter((t: any) => this.matches(q, [t.name, t.description, t.location]))
      .map((t: any) => ({
        type: 'tournament',
        id: t.id,
        title: t.name,
        description: t.description || '',
        url: `/tournaments/${t.id}`,
        image: undefined,
        location: t.location,
      } as SearchResultItem));

    return [...clubs, ...teams, ...players, ...events, ...tournaments];
  }

  private matches(q: string, fields: Array<string | undefined>) {
    if (!q) return true;
    return fields.some((f) => (f || '').toLowerCase().includes(q));
  }
}

export default new SearchService();


