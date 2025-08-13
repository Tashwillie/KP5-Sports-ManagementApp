import apiClient from '@/lib/apiClient';

export interface UiUser {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
}

class UsersService {
  async getUsers(params?: { role?: string; isActive?: boolean; search?: string }) {
    const resp: any = params ? await apiClient.getUsersFiltered(params as any) : await apiClient.getUsers();
    const arr = resp?.data?.users || [];
    return arr.map((u: any): UiUser => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
      firstName: u.firstName || undefined,
      lastName: u.lastName || undefined,
      role: (u.role || '').toString().toLowerCase(),
      isActive: !!u.isActive,
    }));
  }
}

export default new UsersService();

