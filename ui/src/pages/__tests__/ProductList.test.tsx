import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import ProductList from '../ProductList';

// Mock the api service
vi.mock('../../services/api', () => ({
  getProducts: vi.fn(() => Promise.resolve([])),
  deleteProduct: vi.fn(() => Promise.resolve()),
}));

describe('ProductList', () => {
  it('renders the product list page', () => {
    render(
      <Router>
        <ProductList />
      </Router>
    );

    // Check for the main heading
    expect(screen.getByText(/Products/i)).toBeInTheDocument();

    // Check for the create product button
    expect(screen.getByRole('button', { name: /Create Product/i })).toBeInTheDocument();
  });
});