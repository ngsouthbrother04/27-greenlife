import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/stores';
import { productService } from '@/api';
import ProductCard from '../products/ProductCard';
import { Loader2 } from 'lucide-react';

// Import icons
import arrowLeft from '@/assets/images/arrow_left.svg';
import arrowRight from '@/assets/images/arrow_right.svg';

const TrendingProducts = () => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleProducts = 4;

  // Fetch trending products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: () => productService.getTrendingProducts(6),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handlePrev = () => {
    setStartIndex(prev => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setStartIndex(prev => (prev + 1) % products.length);
  };

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stock <= 0) {
      toast.error("Sản phẩm này đã hết hàng.");
      return;
    }

    const result = await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      // Handle image array from backend or fallback
      image: product.image || (product.images && product.images[0]) || '',
      stock: product.stock,
    });

    if (result.success) {
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } else {
      toast.error(result.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  if (isLoading) {
    return (
      <section className="py-[80px] bg-white flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-de-primary" />
      </section>
    );
  }

  // If no products, hide section or show fallback? hiding for now logic wise, or empty
  if (products.length === 0) return null; 

  // Calculate visible items for infinite loop
  const getVisibleProducts = () => {
    if (products.length <= visibleProducts) return products;
    
    const visibleItems = [];
    for (let i = 0; i < visibleProducts; i++) {
        const index = (startIndex + i) % products.length;
        visibleItems.push(products[index]);
    }
    return visibleItems;
  };

  const currentVisibleProducts = getVisibleProducts();

  return (
    <section className="py-[80px] relative bg-white">
      <div className="container-custom flex flex-col gap-[80px]">
        {/* Header */}
        <div className="flex flex-col gap-1 items-center justify-center text-center w-full">
          <h2 className="font-['Poppins'] font-semibold text-[44px] leading-[66px] text-[#091e42] whitespace-pre-wrap">
            Trending Products
          </h2>
          <p className="font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#172b4d] whitespace-pre-wrap">
            Top Picks for Sustainable Dental Care
          </p>
        </div>

        {/* Products Carousel */}
        <div className="relative">
           {/* Navigation Buttons */}
           {products.length > visibleProducts && (
             <>
               <button 
                 onClick={handlePrev}
                 className="absolute top-1/2 -left-4 xl:-left-16 -translate-y-1/2 z-10 flex items-center justify-center w-[32px] h-[32px] rounded-full transition-all hover:scale-110"
               >
                 <img src={arrowLeft} alt="Previous" className="w-full h-full" />
               </button>
               
               <button 
                 onClick={handleNext}
                 className="absolute top-1/2 -right-4 xl:-right-16 -translate-y-1/2 z-10 flex items-center justify-center w-[32px] h-[32px] rounded-full transition-all hover:scale-110"
               >
                 <img src={arrowRight} alt="Next" className="w-full h-full" />
               </button>
             </>
           )}

          {/* Products Grid */}
          <div className="flex gap-6 overflow-hidden">
            {currentVisibleProducts.map((product, index) => (
              // Add index to key to ensure uniqueness when wrapping (though product.id is usually unique, logic requires unique key for React list)
              // Actually, using product.id is fine unless we show duplicates *simultaneously* which we don't for N < Length.
              // But if Length < Visible, we just show all.
              // If Length > Visible, we show slice.
              // Wait, if Products = [A, B, C, D, E, F], Visible = 4.
              // Start = 4 (E). Indices: 4(E), 5(F), 0(A), 1(B).
              // Ensure keys are unique if A appears twice? No, slice is distinct sets here unless items duplicated in data.
              <div key={`${product.id}-${index}`} className="min-w-[280px] w-full flex-1">
                 <ProductCard 
                    {...product}
                    image={product.image || (product.images && product.images[0]) || ''}
                    onAddToCart={handleAddToCart}
                 />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
