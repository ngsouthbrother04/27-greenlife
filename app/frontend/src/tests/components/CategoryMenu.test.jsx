import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoryMenu from '../../components/CategoryMenu';
import categoryService from '@/api/categoryService';

vi.mock('@/api/categoryService', () => ({
  default: {
    getCategories: vi.fn()
  }
}));

describe('CategoryMenu Component', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CategoryMenu {...props} />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('shows loading state initially', () => {
    categoryService.getCategories.mockReturnValue(new Promise(() => {})); // pending promise
    const { container } = renderComponent();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders nothing if no categories', async () => {
    categoryService.getCategories.mockResolvedValue([]);
    const { container } = renderComponent();
    await waitFor(() => expect(container.querySelector('.animate-spin')).not.toBeInTheDocument());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders categories in desktop mode', async () => {
    const mockCategories = [{ id: 1, name: 'Oral Care', slug: 'oral-care' }];
    categoryService.getCategories.mockResolvedValue(mockCategories);
    
    renderComponent();
    
    await waitFor(() => expect(screen.getByText('Products')).toBeInTheDocument());
    expect(screen.getByText('Oral Care')).toBeInTheDocument();
  });

  it('renders categories in mobile mode', async () => {
    const mockCategories = [{ id: 1, name: 'Oral Care', slug: 'oral-care' }];
    categoryService.getCategories.mockResolvedValue(mockCategories);
    
    renderComponent({ mobile: true });
    
    await waitFor(() => expect(screen.getByText('Oral Care')).toBeInTheDocument());
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('opens and closes dropdown on desktop', async () => {
    const mockCategories = [{ id: 1, name: 'Oral Care' }];
    categoryService.getCategories.mockResolvedValue(mockCategories);
    
    renderComponent();
    
    await waitFor(() => expect(screen.getByText('Products')).toBeInTheDocument());
    
    const dropdown = screen.getByText('Oral Care').closest('div');
    expect(dropdown).toHaveClass('opacity-0');

    // Click to open
    fireEvent.click(screen.getByText('Products'));
    expect(dropdown).toHaveClass('opacity-100');

    // Click Category, should close
    fireEvent.click(screen.getByText('Oral Care'));
    expect(dropdown).toHaveClass('opacity-0');
  });
});
