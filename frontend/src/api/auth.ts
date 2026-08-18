import client from './client';
import type { User } from '../types';

export const authApi = {
  register: async (data: {
    full_name?: string;
    name?: string;
    email: string;
    password: string;
    confirm_password?: string;
  }) => {
    const payload = {
      full_name: data.full_name || data.name || '',
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password || data.password,
    };
    const res = await client.post('/auth/register', payload);
    return res.data;
  },

  login: async (data: { email: string; password: string; remember_me?: boolean }) => {
    const res = await client.post('/auth/login', data);
    return res.data as { access_token: string; token_type: string; expires_in: number };
  },

  logout: async () => {
    const res = await client.post('/auth/logout');
    return res.data;
  },

  me: async () => {
    const res = await client.get('/auth/me');
    const u = res.data as User;
    return {
      ...u,
      fullName: u.full_name,
      profileImageUrl: u.profile_image,
      createdAt: u.created_at,
    };
  },

  forgotPassword: async (email: string) => {
    const res = await client.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; new_password: string; confirm_password: string }) => {
    const res = await client.post('/auth/reset-password', data);
    return res.data;
  },

  updateProfile: async (data: {
    full_name?: string;
    fullName?: string;
    profile_image?: string;
    profileImageUrl?: string;
  }) => {
    const payload = {
      full_name: data.full_name || data.fullName,
      profile_image: data.profile_image || data.profileImageUrl,
    };
    const res = await client.patch('/users/profile', payload);
    return res.data as User;
  },

  updatePassword: async (data: {
    currentPassword?: string;
    current_password?: string;
    newPassword?: string;
    new_password?: string;
    confirmPassword?: string;
    confirm_password?: string;
  }) => {
    const payload = {
      current_password: data.current_password || data.currentPassword || '',
      new_password: data.new_password || data.newPassword || '',
      confirm_password: data.confirm_password || data.confirmPassword || data.new_password || data.newPassword || '',
    };
    const res = await client.post('/users/change-password', payload);
    return res.data;
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => {
    const res = await client.post('/users/change-password', data);
    return res.data;
  },
};

export default authApi;
