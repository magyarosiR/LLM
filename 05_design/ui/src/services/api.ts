import axios from 'axios';
import { Product, ProductDTO, ProductUpdateDTO } from '../models/Product';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get('/products/');
  return response.data;
};

export const createProduct = async (product: ProductDTO): Promise<Product> => {
  const response = await apiClient.post('/products/', product);
  return response.data;
};

export const updateProduct = async (id: number, product: ProductUpdateDTO): Promise<Product> => {
  const response = await apiClient.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

export const getProduct = async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
};
