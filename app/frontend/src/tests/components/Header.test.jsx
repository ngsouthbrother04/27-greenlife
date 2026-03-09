import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../components/Header';
import { useCartStore, useAuthStore } from '@/stores';

// Mock the stores used by Header
vi.mock('@/stores', () => ({
  useCartStore: vi.fn(),
  useAuthStore: vi.fn()
}));

// Mock inner components using module mocking
vi.mock('../../components/SearchBar', () => ({
  default: () => <div data-testid="mock-search-bar">Search</div>
}));
vi.mock('../../components/CategoryMenu', () => ({
  default: () => <div data-testid="mock-category-menu">Categories</div>
}));


describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    useCartStore.mockImplementation((selector) => {
      const state = {
        getTotalItems: () => 0
      };
      return selector(state);
    });

    useAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: () => false,
      logout: vi.fn()
    });
  });

  const renderHeader = () => {
    return render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  };

  it('renders logo and default navigation items', () => {
    renderHeader();
    
    // Logo alt text
    expect(screen.getByAltText('Eco Dental')).toBeInTheDocument();
    
    // Navigation links in desktop mode
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('All Products')).toBeInTheDocument();
  });

  it('does not display cart badge when cart is empty', () => {
    renderHeader();
    
    // Check for cart badge using regular expression
    const badge = screen.queryByText(/^[0-9+]+$/);
    expect(badge).not.toBeInTheDocument();
  });

  it('displays correct cart badge number when items are in cart', () => {
    useCartStore.mockImplementation((selector) => {
      const state = {
        getTotalItems: () => 5
      };
      return selector(state);
    });

    renderHeader();
    
    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-de-primary');
  });

  it('displays 99+ when cart has more than 99 items', () => {
    useCartStore.mockImplementation((selector) => {
      const state = {
        getTotalItems: () => 150
      };
      return selector(state);
    });

    renderHeader();
    
    const badge = screen.getByText('99+');
    expect(badge).toBeInTheDocument();
  });
});
