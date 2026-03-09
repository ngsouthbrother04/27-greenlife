import { describe, it, expect, beforeEach, vi } from 'vitest';
import useCartStore from '../stores/cartStore.js';
import * as authStoreModule from '../stores/authStore.js';
import * as apiModule from '../api/index.js';

const mockIsAuthenticated = vi.fn();

// Mock dynamic imports internally
vi.mock('./authStore', () => ({
  default: {
    getState: () => ({
      isAuthenticated: mockIsAuthenticated,
    }),
  },
}));

const { mockCartService } = vi.hoisted(() => {
  return {
    mockCartService: {
      addToCart: vi.fn(),
      updateCartItem: vi.fn(),
      removeCartItem: vi.fn(),
      bulkAddToCart: vi.fn(),
      getCart: vi.fn(),
    }
  }
});

vi.mock('@/api', () => ({
  cartService: mockCartService,
}));

describe('cartStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useCartStore.setState({ items: [] });
    // Reset mocks
    vi.clearAllMocks();
    // Default mock returns
    mockIsAuthenticated.mockReturnValue(false);
  });

  describe('addItem', () => {
    it('should add a new item to cart', async () => {
      const product = { id: 1, name: 'Apple', price: 10, stock: 100, image: 'apple.png' };

      const result = await useCartStore.getState().addItem(product, 2);

      const items = useCartStore.getState().items;
      expect(result.success).toBe(true);
      expect(items.length).toBe(1);
      expect(items[0]).toEqual({ ...product, quantity: 2 });
    });

    it('should calculate total items properly after add', async () => {
      const product = { id: 1, name: 'Apple', price: 10, stock: 100 };
      await useCartStore.getState().addItem(product, 3);
      await useCartStore.getState().addItem(product, 2); // should add up to 5

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(5);
      expect(useCartStore.getState().getTotalItems()).toBe(5);
      expect(useCartStore.getState().getTotalPrice()).toBe(50);
    });

    /*
    it('should mock sync with backend if authenticated', async () => {
      const product = { id: 1, name: 'Apple', price: 10, stock: 100 };
      mockIsAuthenticated.mockReturnValue(true);

      await useCartStore.getState().addItem(product, 1);

      // We wait for the backend sync to be called
      await new Promise(resolve => setTimeout(resolve, 20)); 
      
      expect(mockCartService.addToCart).toHaveBeenCalledWith(1, 1);
    });
    */
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const product = { id: 1, name: 'Apple', price: 10, stock: 100 };
      await useCartStore.getState().addItem(product, 1);

      const result = await useCartStore.getState().updateQuantity(1, 5);

      expect(result.success).toBe(true);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('should not update quantity beyond stock limit', async () => {
      const product = { id: 1, name: 'Apple', price: 10, stock: 5 };
      await useCartStore.getState().addItem(product, 1);

      const result = await useCartStore.getState().updateQuantity(1, 10);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Chỉ còn 5 sản phẩm');
      expect(useCartStore.getState().items[0].quantity).toBe(1); // Unchanged
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const product = { id: 1, name: 'Apple', price: 10, stock: 5 };
      await useCartStore.getState().addItem(product, 1);

      await useCartStore.getState().removeItem(1);

      expect(useCartStore.getState().items.length).toBe(0);
      expect(useCartStore.getState().getTotalItems()).toBe(0);
    });
  });
});
