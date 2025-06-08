import api from './axios';
import { Category } from '../models/category';

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>(`/api/categories`);
  return response.data;
}; 