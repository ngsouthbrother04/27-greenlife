import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock persist middleware
vi.mock('zustand/middleware', () => ({
  persist: (config) => config,
}));

vi.mock('@/api', () => ({
  cartService: { addToCart: vi.fn(), getCart: vi.fn() }
}));

import useCart from '../../hooks/useCart';
import useCartStore from '../../stores/cartStore';

describe('useCart hook', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should reflect store updates', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      useCartStore.setState({ items: [{ id: 1, price: 100, quantity: 2 }] });
    });

    expect(result.current.items.length).toBe(1);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(200);
  });

  it('should provide cart actions', () => {
    const { result } = renderHook(() => useCart());
    
    expect(typeof result.current.addItem).toBe('function');
    expect(typeof result.current.removeItem).toBe('function');
    expect(typeof result.current.updateQuantity).toBe('function');
    expect(typeof result.current.clearCart).toBe('function');
  });
  
  it('should execute actions like addItem', async () => {
    const { result } = renderHook(() => useCart());
    
    await act(async () => {
      await result.current.addItem({ id: 1, price: 50, stock: 10 }, 1);
    });
    
    expect(result.current.items.length).toBe(1);
    expect(result.current.totalItems).toBe(1);
  });
});
