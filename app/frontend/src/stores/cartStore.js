import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart Store - Zustand store for shopping cart management
 * Uses persist middleware to save cart to localStorage
 * 
 * B2C E-commerce flow:
 * - User adds product to cart → addItem()
 * - User updates quantity → updateQuantity()
 * - User removes item → removeItem()
 * - Checkout → clearCart()
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      // Cart items array: [{ id, name, price, quantity, image, ... }]
      items: [],

      // Add item to cart or increase quantity if exists
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { ...product, quantity }],
          });
        }
      },

      // Remove item from cart
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      // Update item quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      // Clear all items (after successful checkout)
      clearCart: () => {
        set({ items: [] });
      },

      // Calculate total items count
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Calculate total price
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'greenlife-cart', // localStorage key
    }
  )
);

export default useCartStore;
