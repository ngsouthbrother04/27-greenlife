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
        const currentQty = existingItem ? existingItem.quantity : 0;
        const maxStock = product.stock || 0;

        if (currentQty + quantity > maxStock) {
          const remaining = maxStock - currentQty;
          if (remaining > 0) {
            // Add only what's left
            if (existingItem) {
              set({
                items: items.map((item) =>
                  item.id === product.id
                    ? { ...item, quantity: maxStock } // Set to max
                    : item
                ),
              });
            } else {
              set({
                items: [...items, { ...product, quantity: remaining }],
              });
            }
            return { success: true, message: `Đã thêm ${remaining} sản phẩm còn lại vào giỏ (kho hết hàng)` };
          }
          return { success: false, message: `Sản phẩm đã hết hàng trong kho` };
        }

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
        return { success: true };
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
          return { success: true };
        }

        const items = get().items;
        const item = items.find(i => i.id === productId);
        if (!item) return { success: false, message: 'Sản phẩm không tồn tại trong giỏ' };

        // Note: item.stock might be stale if we don't refresh it, 
        // but for now we rely on the product object stored in cart having the stock. 
        // Ideally we should sync with backend, but per rules we use store state.
        // If product object in cart has stock:
        if (quantity > (item.stock || 0)) {
          return { success: false, message: `Chỉ còn ${item.stock} sản phẩm trong kho` };
        }

        set({
          items: items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
        return { success: true };
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

      // Get quantity of a specific item
      getItemQuantity: (id) => {
        const item = get().items.find((item) => item.id === id);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'greenlife-cart', // localStorage key
    }
  )
);

export default useCartStore;
