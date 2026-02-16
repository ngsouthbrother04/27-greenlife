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
      addItem: async (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        const maxStock = product.stock || 0;

        // Image handling: Use provided image or fallback
        const productImage = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '') || '';

        // Optimistic UI Update first
        if (currentQty + quantity > maxStock) {
          const remaining = maxStock - currentQty;
          if (remaining > 0) {
            const newItems = existingItem
              ? items.map(item => item.id === product.id ? { ...item, quantity: maxStock, image: productImage || item.image } : item)
              : [...items, { ...product, quantity: remaining, image: productImage }];

            set({ items: newItems });

            // Sync with backend
            try {
              const { default: authStore } = await import('./authStore');
              if (authStore.getState().isAuthenticated()) {
                const { cartService } = await import('@/api');
                await cartService.addToCart(product.id, remaining);
              }
            } catch (e) {
              console.error("Failed to sync add item (partial):", e);
              // Note: We might want to rollback here if strict, but for now log error
            }
            return { success: true, message: `Đã thêm ${remaining} sản phẩm còn lại vào giỏ (kho hết hàng)` };
          }
          return { success: false, message: `Sản phẩm đã hết hàng trong kho` };
        }

        const newItems = existingItem
          ? items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity, image: productImage || item.image } : item)
          : [...items, { ...product, quantity, image: productImage }];

        set({ items: newItems });

        // Sync with backend
        try {
          const { default: authStore } = await import('./authStore');
          if (authStore.getState().isAuthenticated()) {
            const { cartService } = await import('@/api');
            // Ensure we wait for the result to catch errors
            await cartService.addToCart(product.id, quantity);
          }
        } catch (e) {
          console.error("Failed to sync add item:", e);
          // If backend fails, we might want to alert/rollback, but keep optimistic for now
          // Return success true because local add worked, checking network tab for potential 500s
        }
        return { success: true };
      },

      // Remove item from cart
      removeItem: async (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });

        // Sync with backend
        try {
          const { default: authStore } = await import('./authStore');
          if (authStore.getState().isAuthenticated()) {
            const { cartService } = await import('@/api');
            await cartService.removeCartItem(productId);
          }
        } catch (e) {
          console.error("Failed to sync remove item:", e);
        }
      },

      // Update item quantity
      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return { success: true };
        }

        const items = get().items;
        const item = items.find(i => i.id === productId);
        if (!item) return { success: false, message: 'Sản phẩm không tồn tại trong giỏ' };

        if (quantity > (item.stock || 0)) {
          return { success: false, message: `Chỉ còn ${item.stock} sản phẩm trong kho` };
        }

        set({
          items: items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });

        // Sync with backend
        try {
          const { default: authStore } = await import('./authStore');
          if (authStore.getState().isAuthenticated()) {
            const { cartService } = await import('@/api');
            await cartService.updateCartItem(productId, quantity);
          }
        } catch (e) {
          console.error("Failed to sync update quantity:", e);
        }
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
      // Sync with backend on login
      syncWithBackend: async () => {
        try {
          const { cartService } = await import('@/api');
          const localItems = get().items;

          if (localItems.length > 0) {
            console.log('DEBUG: Syncing local items to backend:', localItems.length);
            try {
              // Push local items to backend (merge)
              const payload = localItems.map(item => ({
                productId: Number(item.id),
                quantity: Number(item.quantity)
              }));
              await cartService.bulkAddToCart(payload);
              console.log('DEBUG: Bulk add success');
            } catch (syncError) {
              console.error("DEBUG: Bulk add failed, continuing to fetch cart:", syncError);
            }
          }

          // Fetch final merged state
          const response = await cartService.getCart();
          const backendCart = response.data?.cart;
          console.log("DEBUG: Backend Cart Response:", backendCart);

          if (backendCart && backendCart.items) {
            // Transform backend items (OrderItem/CartItem structure) to frontend structure
            const mergedItems = backendCart.items.map(backendItem => {
              const product = backendItem.product;
              // Simplified Image Logic matching TrendingProducts
              const backendImage = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '') || '';

              // Try to find image in local items if backend image is missing
              const localItem = localItems.find(li => li.id === product.id);
              const finalImage = backendImage || localItem?.image || '';

              return {
                id: product.id,
                name: product.name,
                price: Number(product.price) || 0,
                image: finalImage,
                stock: product.stock,
                quantity: backendItem.quantity
              };
            });

            console.log('DEBUG: Merged Items count:', mergedItems.length);
            set({ items: mergedItems });
          }
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      },
    }),
    {
      name: 'greenlife-cart', // localStorage key
    }
  )
);

export default useCartStore;
