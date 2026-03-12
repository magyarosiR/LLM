import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import ProductList from '../ProductList';
import * as api from '../../services/api';
import type { Product } from '../../models/Product';

// Mock the api service
vi.mock('../../services/api', () => ({
  getProducts: vi.fn(() => Promise.resolve([])),
  deleteProduct: vi.fn(() => Promise.resolve()),
  updateProduct: vi.fn(),
}));

describe('ProductList', () => {
  const getProductsMock = vi.mocked(api.getProducts);
  const updateProductMock = vi.mocked(api.updateProduct);

  beforeEach(() => {
    vi.clearAllMocks();
    getProductsMock.mockResolvedValue([]);
    updateProductMock.mockReset();
  });

  it('renders the product list page and empty cart state', async () => {
    render(
      <Router>
        <ProductList />
      </Router>
    );

    // Check for the main heading
    expect(await screen.findByText(/Products/i)).toBeInTheDocument();

    // Check for the create product button
    expect(screen.getByRole('link', { name: /Create Product/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Cart$/i })).toBeInTheDocument();
    expect(screen.getByText(/Your cart is empty./i)).toBeInTheDocument();
  });

  it('adds a product to cart and updates stock on backend', async () => {
    const testProduct: Product = {
      id: 1,
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      stock: 3,
    };
    getProductsMock.mockResolvedValue([testProduct]);
    updateProductMock.mockResolvedValue({ ...testProduct, stock: 2 });

    render(
      <Router>
        <ProductList />
      </Router>
    );

    const addButton = await screen.findByRole('button', {
      name: /add Test Product to cart/i,
    });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(updateProductMock).toHaveBeenCalledWith(1, { stock: 2 });
    });
    expect(await screen.findByText(/Items: 1/i)).toBeInTheDocument();
  });
});
