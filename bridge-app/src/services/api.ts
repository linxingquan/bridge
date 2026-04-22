import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PORT = process.env.EXPO_PUBLIC_API_PORT || '3000';
const HOST = process.env.EXPO_PUBLIC_API_HOST || `localhost`;
const API_URL = `http://${HOST}:${PORT}/api`;
console.info(`API URL: ${API_URL}`);

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          AsyncStorage.removeItem('token');
        }
        return Promise.reject(error);
      }
    );
  }

  async register(email: string, password: string) {
    const { data } = await this.client.post('/auth/register', { email, password });
    return data;
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }

  async getMe() {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  async updateProfile(updates: Record<string, unknown>) {
    const { data } = await this.client.put('/users/profile', updates);
    return data;
  }

  async getProfile(userId: string) {
    const { data } = await this.client.get(`/users/profile/${userId}`);
    return data;
  }

  async getDiscoveryFeed() {
    const { data } = await this.client.get('/discovery/feed');
    return data;
  }

  async swipeUser(toUserId: string, type: 'like' | 'pass' | 'superlike') {
    const { data } = await this.client.post('/discovery/swipe', { toUserId, type });
    return data;
  }

  async updateFilters(filters: Record<string, unknown>) {
    const { data } = await this.client.put('/discovery/filters', filters);
    return data;
  }

  async getMatches() {
    const { data } = await this.client.get('/matches');
    return data;
  }

  async getMatch(matchId: string) {
    const { data } = await this.client.get(`/matches/${matchId}`);
    return data;
  }

  async unmatch(matchId: string) {
    const { data } = await this.client.delete(`/matches/${matchId}`);
    return data;
  }

  async getMessages(matchId: string) {
    const { data } = await this.client.get(`/messages/${matchId}`);
    return data;
  }

  async sendMessage(matchId: string, text: string, photo?: string) {
    const { data } = await this.client.post(`/messages/${matchId}`, { text, photo });
    return data;
  }

  async reportUser(userId: string, reason: string) {
    const { data } = await this.client.post('/reports', { userId, reason });
    return data;
  }

  async blockUser(userId: string) {
    const { data } = await this.client.post(`/reports/block/${userId}`);
    return data;
  }

  async deactivateAccount() {
    const { data } = await this.client.post('/users/deactivate');
    return data;
  }

  async deleteAccount() {
    const { data } = await this.client.delete('/users/account');
    return data;
  }

  async uploadPhoto(uri: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    const { data } = await this.client.post('/users/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  async deletePhoto(url: string) {
    const { data } = await this.client.delete('/users/photos', { data: { url } });
    return data;
  }

  async getSingles(page: number = 1, limit: number = 10) {
    const { data } = await this.client.get(`/users/singles?page=${page}&limit=${limit}`);
    return data;
  }

  async forgotPassword(email: string) {
    const { data } = await this.client.post('/auth/forgot-password', { email });
    return data;
  }

  async resetPassword(token: string, newPassword: string) {
    const { data } = await this.client.post('/auth/reset-password', { token, newPassword });
    return data;
  }
}

export const api = new ApiService();