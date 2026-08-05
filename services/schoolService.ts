import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { School } from '../types';

export const schoolService = {
  async getSchools(): Promise<School[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data: schoolsData, error: schoolsError } = await supabase
      .from('schools')
      .select('*, students(count)')
      .order('created_at', { ascending: false });

    if (schoolsError) {
      console.error('Error fetching schools from Supabase:', schoolsError.message);
      throw new Error(schoolsError.message);
    }

    return (schoolsData || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      address: s.address || '',
      phone: s.phone || '',
      studentCount: s.students?.[0]?.count || 0,
      status: s.status || 'Aktif',
      logoUrl: s.logo_url || undefined,
    }));
  },

  async createSchool(school: Omit<School, 'id'>): Promise<School> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase belum dikonfigurasi di file .env');
    }

    const payload = {
      name: school.name,
      address: school.address,
      phone: school.phone,
      status: school.status || 'Aktif',
      logo_url: school.logoUrl || null,
    };

    const { data, error } = await supabase
      .from('schools')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error creating school in Supabase:', error.message);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      address: data.address || '',
      phone: data.phone || '',
      studentCount: 0,
      status: data.status || 'Aktif',
      logoUrl: data.logo_url || undefined,
    };
  },

  async updateSchool(id: string, data: Partial<School>): Promise<School> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase belum dikonfigurasi di file .env');
    }

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.address !== undefined) payload.address = data.address;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.status !== undefined) payload.status = data.status;
    if (data.logoUrl !== undefined) payload.logo_url = data.logoUrl;

    const { data: res, error } = await supabase
      .from('schools')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating school in Supabase:', error.message);
      throw new Error(error.message);
    }

    return {
      id: res.id,
      name: res.name,
      address: res.address || '',
      phone: res.phone || '',
      studentCount: 0,
      status: res.status || 'Aktif',
      logoUrl: res.logo_url || undefined,
    };
  },

  async deleteSchool(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase belum dikonfigurasi di file .env');
    }

    const { error } = await supabase.from('schools').delete().eq('id', id);

    if (error) {
      console.error('Error deleting school in Supabase:', error.message);
      throw new Error(error.message);
    }
  },

  async deleteAllSchools(): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase belum dikonfigurasi di file .env');
    }

    // Delete all rows in schools table
    const { error } = await supabase.from('schools').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error deleting all schools in Supabase:', error.message);
      throw new Error(error.message);
    }
  },
};
