import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import ProductList from '../ProductList';

// Mock the api service
vi.mock('../../services/api', () => ({
  getProducts: vi.fn(() => Promise.resolve([])),
  getCartItems: vi.fn(() => Promise.resolve([])),
  addProductToCart: vi.fn(() => Promise.resolve()),
  deleteProduct: vi.fn(() => Promise.resolve()),
}));

describe('ProductList', () => {
  it('renders the product list page', async () => {
    render(
      <Router>
        <ProductList />
      </Router>
    );

    // Check for the main heading
    expect(await screen.findByText(/Products/i)).toBeInTheDocument();

    // Check for the create product button
    expect(screen.getByRole('link', { name: /Create Product/i })).toBeInTheDocument();
  });
});
