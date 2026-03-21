import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText('Search products...');
    fireEvent.change(input, { target: { value: 'toothbrush' } });
    expect(input.value).toBe('toothbrush');
  });

  it('navigates to products with search query on submit', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText('Search products...');
    fireEvent.change(input, { target: { value: 'toothpaste' } });
    
    // the parent is a form, submitting it
    const form = input.closest('form');
    fireEvent.submit(form);
    
    expect(mockNavigate).toHaveBeenCalledWith('/products?search=toothpaste');
  });

  it('navigates to products without query if input is empty space', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText('Search products...');
    fireEvent.change(input, { target: { value: '   ' } });
    
    const form = input.closest('form');
    fireEvent.submit(form);
    
    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  it('initializes input with searchParam query', () => {
    render(
      <MemoryRouter initialEntries={['/products?search=bamboo']}>
        <Routes>
          <Route path="/products" element={<SearchBar />} />
        </Routes>
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText('Search products...');
    expect(input.value).toBe('bamboo');
  });
});
