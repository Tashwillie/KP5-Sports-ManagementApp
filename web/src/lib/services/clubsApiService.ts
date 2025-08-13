import { apiService, ApiResponse } from './apiService';

// Club interfaces
export interface Club {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  foundedYear?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  facilities?: string[];
  membershipTypes?: ClubMembershipType[];
  teams?: ClubTeam[];
  stats?: ClubStats;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMembershipType {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in months
  benefits: string[];
  isActive: boolean;
}

export interface ClubTeam {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  foundedYear?: number;
  homeGround?: string;
  playersCount: number;
  coachesCount: number;
  stats?: TeamStats;
}

export interface TeamStats {
  id: string;
  teamId: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  season?: string;
  updatedAt: string;
}

export interface CreateClubRequest {
  name: string;
  description?: string;
  logo?: File;
  foundedYear?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  facilities?: string[];
}

export interface UpdateClubRequest extends Partial<CreateClubRequest> {
  id: string;
}

export interface ClubFilters {
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  hasAvailableSpots?: boolean;
  page?: number;
  limit?: number;
}

export interface ClubListResponse {
  clubs: Club[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Clubs API Service
export class ClubsApiService {
  private baseEndpoint = '/clubs';

  // Get all clubs with filters and pagination
  async getClubs(filters?: ClubFilters): Promise<ApiResponse<ClubListResponse>> {
    return apiService.get<ClubListResponse>(this.baseEndpoint, filters);
  }

  // Get club by ID
  async getClub(id: string): Promise<ApiResponse<Club>> {
    return apiService.get<Club>(`${this.baseEndpoint}/${id}`);
  }

  // Create new club
  async createClub(data: CreateClubRequest): Promise<ApiResponse<Club>> {
    if (data.logo) {
      // Handle file upload first
      const uploadResponse = await apiService.upload<{ url: string }>('/upload/club-logo', data.logo);
      if (!uploadResponse.success) {
        return uploadResponse;
      }
      
      // Replace file with uploaded URL
      const clubData = { ...data, logo: uploadResponse.data?.url };
      return apiService.post<Club>(this.baseEndpoint, clubData);
    }
    
    return apiService.post<Club>(this.baseEndpoint, data);
  }

  // Update club
  async updateClub(id: string, data: UpdateClubRequest): Promise<ApiResponse<Club>> {
    if (data.logo && data.logo instanceof File) {
      // Handle file upload first
      const uploadResponse = await apiService.upload<{ url: string }>('/upload/club-logo', data.logo);
      if (!uploadResponse.success) {
        return uploadResponse;
      }
      
      // Replace file with uploaded URL
      const clubData = { ...data, logo: uploadResponse.data?.url };
      return apiService.put<Club>(`${this.baseEndpoint}/${id}`, clubData);
    }
    
    return apiService.put<Club>(`${this.baseEndpoint}/${id}`, data);
  }

  // Delete club
  async deleteClub(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get club teams
  async getClubTeams(clubId: string): Promise<ApiResponse<ClubTeam[]>> {
    return apiService.get<ClubTeam[]>(`${this.baseEndpoint}/${clubId}/teams`);
  }

  // Get club membership types
  async getClubMembershipTypes(clubId: string): Promise<ApiResponse<ClubMembershipType[]>> {
    return apiService.get<ClubMembershipType[]>(`${this.baseEndpoint}/${clubId}/membership-types`);
  }

  // Create membership type
  async createMembershipType(clubId: string, data: Omit<ClubMembershipType, 'id'>): Promise<ApiResponse<ClubMembershipType>> {
    return apiService.post<ClubMembershipType>(`${this.baseEndpoint}/${clubId}/membership-types`, data);
  }

  // Update membership type
  async updateMembershipType(clubId: string, membershipTypeId: string, data: Partial<ClubMembershipType>): Promise<ApiResponse<ClubMembershipType>> {
    return apiService.put<ClubMembershipType>(`${this.baseEndpoint}/${clubId}/membership-types/${membershipTypeId}`, data);
  }

  // Delete membership type
  async deleteMembershipType(clubId: string, membershipTypeId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${clubId}/membership-types/${membershipTypeId}`);
  }

  // Get club facilities
  async getClubFacilities(clubId: string): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`${this.baseEndpoint}/${clubId}/facilities`);
  }

  // Update club facilities
  async updateClubFacilities(clubId: string, facilities: string[]): Promise<ApiResponse<string[]>> {
    return apiService.put<string[]>(`${this.baseEndpoint}/${clubId}/facilities`, { facilities });
  }

  // Get club statistics
  async getClubStats(clubId: string): Promise<ApiResponse<ClubStats>> {
    return apiService.get<ClubStats>(`${this.baseEndpoint}/${clubId}/stats`);
  }

  // Search clubs
  async searchClubs(query: string, filters?: Omit<ClubFilters, 'search'>): Promise<ApiResponse<ClubListResponse>> {
    return apiService.get<ClubListResponse>(`${this.baseEndpoint}/search`, { search: query, ...filters });
  }

  // Get clubs by location
  async getClubsByLocation(filters: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number; // in kilometers
    latitude?: number;
    longitude?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ClubListResponse>> {
    return apiService.get<ClubListResponse>(`${this.baseEndpoint}/location`, filters);
  }

  // Get popular clubs
  async getPopularClubs(limit: number = 10): Promise<ApiResponse<Club[]>> {
    return apiService.get<Club[]>(`${this.baseEndpoint}/popular`, { limit });
  }

  // Get clubs with available spots
  async getClubsWithAvailableSpots(filters?: Omit<ClubFilters, 'hasAvailableSpots'>): Promise<ApiResponse<ClubListResponse>> {
    return apiService.get<ClubListResponse>(`${this.baseEndpoint}/available-spots`, { ...filters, hasAvailableSpots: true });
  }

  // Get club events
  async getClubEvents(clubId: string, filters?: {
    type?: 'TOURNAMENT' | 'TRAINING' | 'MEETING' | 'SOCIAL';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    events: Array<{
      id: string;
      title: string;
      description?: string;
      type: string;
      startDate: string;
      endDate: string;
      venue?: string;
      isPublic: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${clubId}/events`, filters);
  }

  // Get club members
  async getClubMembers(clubId: string, filters?: {
    role?: 'ADMIN' | 'MEMBER' | 'PLAYER' | 'COACH';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    members: Array<{
      id: string;
      userId: string;
      role: string;
      joinedAt: string;
      user: {
        id: string;
        displayName: string;
        email: string;
        profilePhoto?: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${clubId}/members`, filters);
  }

  // Add member to club
  async addMemberToClub(clubId: string, memberData: {
    userId: string;
    role: 'ADMIN' | 'MEMBER' | 'PLAYER' | 'COACH';
  }): Promise<ApiResponse<{
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
  }>> {
    return apiService.post(`${this.baseEndpoint}/${clubId}/members`, memberData);
  }

  // Remove member from club
  async removeMemberFromClub(clubId: string, memberId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${clubId}/members/${memberId}`);
  }

  // Update member role
  async updateMemberRole(clubId: string, memberId: string, role: 'ADMIN' | 'MEMBER' | 'PLAYER' | 'COACH'): Promise<ApiResponse<{
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
  }>> {
    return apiService.patch(`${this.baseEndpoint}/${clubId}/members/${memberId}`, { role });
  }

  // Get club news/announcements
  async getClubNews(clubId: string, filters?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    news: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      publishedAt: string;
      author: {
        id: string;
        displayName: string;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    return apiService.get(`${this.baseEndpoint}/${clubId}/news`, filters);
  }

  // Create club news
  async createClubNews(clubId: string, data: {
    title: string;
    content: string;
    category: string;
  }): Promise<ApiResponse<{
    id: string;
    title: string;
    content: string;
    category: string;
    publishedAt: string;
  }>> {
    return apiService.post(`${this.baseEndpoint}/${clubId}/news`, data);
  }
}

// Export singleton instance
export const clubsApiService = new ClubsApiService();
