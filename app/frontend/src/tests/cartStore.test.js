import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock persist
vi.mock('zustand/middleware', () => ({
  persist: (config) => config,
}));

const { mockIsAuthenticated, mockCartService } = vi.hoisted(() => ({
  mockIsAuthenticated: vi.fn(),
  mockCartService: {
    addToCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeCartItem: vi.fn(),
    bulkAddToCart: vi.fn(),
    getCart: vi.fn()
  }
}));

// Mock dependencies
vi.mock('../stores/authStore.js', () => ({
  default: {
    getState: () => ({ isAuthenticated: mockIsAuthenticated })
  }
}));

vi.mock('@/api', () => ({
  cartService: mockCartService
}));

import useCartStore from '../stores/cartStore.js';

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    vi.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(false);
  });

  it('should add item properly', async () => {
    const product = { id: 1, name: 'A', stock: 10, image: 'a.png' };
    const res = await useCartStore.getState().addItem(product, 2);
    expect(res.success).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('should add item and sync with backend if authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    const product = { id: 1, name: 'A', stock: 10 };
    await useCartStore.getState().addItem(product, 2);
    
    // allow async import and promise resolution
    await new Promise(r => setTimeout(r, 10));
    expect(mockCartService.addToCart).toHaveBeenCalledWith(1, 2);
  });

  it('should not add beyond stock', async () => {
    const product = { id: 1, stock: 5 };
    useCartStore.setState({ items: [{ id: 1, quantity: 4, stock: 5 }] });
    
    const res = await useCartStore.getState().addItem(product, 2);
    expect(res.success).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(5); // max stock
    
    const res2 = await useCartStore.getState().addItem(product, 1);
    expect(res2.success).toBe(false);
  });

  it('should remove item and sync', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    useCartStore.setState({ items: [{ id: 1 }] });
    
    await useCartStore.getState().removeItem(1);
    expect(useCartStore.getState().items.length).toBe(0);
    
    await new Promise(r => setTimeout(r, 10));
    expect(mockCartService.removeCartItem).toHaveBeenCalledWith(1);
  });

  it('should update quantity and sync', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    useCartStore.setState({ items: [{ id: 1, quantity: 1, stock: 10 }] });
    
    const res = await useCartStore.getState().updateQuantity(1, 5);
    expect(res.success).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    
    await new Promise(r => setTimeout(r, 10));
    expect(mockCartService.updateCartItem).toHaveBeenCalledWith(1, 5);
  });

  it('should remove item when updating quantity to 0', async () => {
    useCartStore.setState({ items: [{ id: 1, quantity: 2 }] });
    await useCartStore.getState().updateQuantity(1, 0);
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('should fail update if beyond stock', async () => {
    useCartStore.setState({ items: [{ id: 1, quantity: 2, stock: 5 }] });
    const res = await useCartStore.getState().updateQuantity(1, 10);
    expect(res.success).toBe(false);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('should calculate totals correctly', () => {
    useCartStore.setState({ 
      items: [
        { id: 1, quantity: 2, price: 100 },
        { id: 2, quantity: 1, price: 50 }
      ] 
    });
    
    expect(useCartStore.getState().getTotalItems()).toBe(3);
    expect(useCartStore.getState().getTotalPrice()).toBe(250);
    expect(useCartStore.getState().getItemQuantity(1)).toBe(2);
    expect(useCartStore.getState().getItemQuantity(3)).toBe(0);
  });

  it('should clear cart', () => {
    useCartStore.setState({ items: [{ id: 1 }] });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('should sync with backend (merge)', async () => {
    useCartStore.setState({ items: [{ id: 1, quantity: 2 }] });
    
    mockCartService.getCart.mockResolvedValue({
      data: {
        cart: {
          items: [{ product: { id: 1, price: 100 }, quantity: 5 }]
        }
      }
    });

    await useCartStore.getState().syncWithBackend();
    
    expect(mockCartService.bulkAddToCart).toHaveBeenCalledWith([{ productId: 1, quantity: 2 }]);
    expect(mockCartService.getCart).toHaveBeenCalled();
    
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(5);
    expect(items[0].price).toBe(100);
  });
});
