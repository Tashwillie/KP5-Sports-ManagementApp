import apiClient from '@/lib/apiClient';

export interface RegistrationApplication {
  id: string;
  type: string;
  status: string;
  waiverSigned: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  payment?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
  } | null;
}

export interface RegistrationFormTemplate {
  key: 'PLAYER' | 'TEAM' | 'TOURNAMENT' | 'EVENT';
  title: string;
  fields: Array<{ name: string; label: string; type: string; required: boolean; options?: string[] }>
  waiver?: { required: boolean; text: string }
}

class RegistrationsService {
  async getApplications(): Promise<RegistrationApplication[]> {
    const resp: any = await apiClient.getRegistrations();
    const arr = Array.isArray(resp.data) ? resp.data : resp.data?.registrations || resp.data || [];
    return arr.map((r: any) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      waiverSigned: !!r.waiverSigned,
      createdAt: r.createdAt,
      user: {
        id: r.user?.id,
        email: r.user?.email,
        firstName: r.user?.firstName,
        lastName: r.user?.lastName,
      },
      payment: r.payment ? {
        id: r.payment.id,
        amount: r.payment.amount,
        currency: r.payment.currency,
        status: r.payment.status,
        method: r.payment.method,
      } : null,
    }));
  }

  async getFormTemplates(): Promise<RegistrationFormTemplate[]> {
    const resp: any = await apiClient.request('/registrations/forms/templates');
    const data = resp.data || resp;
    const out: RegistrationFormTemplate[] = [];
    for (const key of Object.keys(data)) {
      const tpl = data[key];
      out.push({ key: key as any, title: tpl.title, fields: tpl.fields, waiver: tpl.waiver });
    }
    return out;
  }
}

export default new RegistrationsService();

