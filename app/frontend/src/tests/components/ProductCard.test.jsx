import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Eco Brush',
    price: 50000,
    originalPrice: 70000,
    image: 'http://localhost:3000/image.jpg',
    stock: 10,
  };

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <ProductCard {...mockProduct} />
      </MemoryRouter>
    );
    expect(screen.getByText('Eco Brush')).toBeInTheDocument();
    expect(screen.getByText('50.000₫')).toBeInTheDocument();
    expect(screen.getByText('70.000₫')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://localhost:3000/image.jpg');
  });

  it('triggers onAddToCart when add button is clicked', () => {
    const onAddToCart = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard {...mockProduct} onAddToCart={onAddToCart} />
      </MemoryRouter>
    );
    const btn = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(btn);
    expect(onAddToCart).toHaveBeenCalledWith(1);
  });

  it('shows out of stock badge and disables button when stock is 0', () => {
    const onAddToCart = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard {...mockProduct} stock={0} onAddToCart={onAddToCart} />
      </MemoryRouter>
    );
    
    // Using queryAllByText due to potentially multiple elements matching
    const outOfStockBadges = screen.queryAllByText(/out of stock/i);
    expect(outOfStockBadges.length).toBeGreaterThan(0);
    
    const btn = screen.getByRole('button', { name: /out of stock/i });
    expect(btn).toBeDisabled();
    
    fireEvent.click(btn);
    expect(onAddToCart).not.toHaveBeenCalled();
  });
  
  it('correctly cleans up bad image urls', () => {
    const corruptImageProduct = {
      ...mockProduct,
      image: 'http://localhost:8000http://localhost:3000/image.jpg'
    };
    render(
      <MemoryRouter>
        <ProductCard {...corruptImageProduct} />
      </MemoryRouter>
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://localhost:3000/image.jpg');
  });
});
