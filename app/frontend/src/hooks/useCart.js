import { useCartStore } from '@/stores';

/**
 * useCart - Custom hook for cart operations
 * Provides a clean interface to cart store with computed values
 * 
 * Usage:
 * const { items, addItem, removeItem, totalItems, totalPrice } = useCart();
 */
const useCart = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems: getTotalItems(),
    totalPrice: getTotalPrice(),
    isEmpty: items.length === 0,
  };
};

export default useCart;
