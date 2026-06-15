import axios from 'axios';
import { API_URL } from '../src/config';

const api = axios.create({
  baseURL: API_URL,
});

export const getJobs = (params: any) => api.get('/jobs', { params });
export const getJobById = (id: string) => api.get(`/jobs/${id}`);
export const getAnalytics = () => api.get('/analytics/stats');
export const getHomeData = () => api.get('/analytics/home');