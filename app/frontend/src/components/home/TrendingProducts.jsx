import { useState } from 'react';
import ProductCard from '../products/ProductCard';

// Import icons
import arrowLeft from '@/assets/images/arrow_left.svg';
import arrowRight from '@/assets/images/arrow_right.svg';

// Import product images
import mouthwashImg from '@/assets/images/mouthwash_product_1770003186824.png';
import toothpasteImg from '@/assets/images/natural_toothpaste_1770003224265.png';
import toothbrushImg from '@/assets/images/bamboo_toothbrush_1770003204380.png';

const products = [
  {
    id: 1,
    name: 'Sparkling Mint Wonder of Peppermint Natural Mouthwash',
    price: 100,
    originalPrice: 120,
    rating: 4.5,
    image: mouthwashImg,
  },
  {
    id: 2,
    name: 'Natural Teeth Whitening Toothpaste - Tea tree & Charcoal',
    price: 100,
    originalPrice: 150,
    rating: 4.8,
    image: toothpasteImg,
  },
  {
    id: 3,
    name: 'Organic Bamboo Toothbrush with Soft Natural Bristles',
    price: 100,
    originalPrice: 130,
    rating: 4.6,
    image: toothbrushImg,
  },
  {
    id: 4,
    name: 'Sensitivity Relief Vanilla & Peppermint Natural Mouthwash',
    price: 100,
    originalPrice: 140,
    rating: 4.7,
    image: mouthwashImg,
  },
  {
    id: 5,
    name: 'Sparkling Mint Wonder of Peppermint Natural Mouthwash',
    price: 100,
    originalPrice: 120,
    rating: 4.5,
    image: mouthwashImg,
  },
  {
    id: 6,
    name: 'Natural Teeth Whitening Toothpaste - Tea tree & Charcoal',
    price: 100,
    originalPrice: 150,
    rating: 4.8,
    image: toothpasteImg,
  },
  {
    id: 7,
    name: 'Organic Bamboo Toothbrush with Soft Natural Bristles',
    price: 100,
    originalPrice: 130,
    rating: 4.6,
    image: toothbrushImg,
  },
  {
    id: 8,
    name: 'Sensitivity Relief Vanilla & Peppermint Natural Mouthwash',
    price: 100,
    originalPrice: 140,
    rating: 4.7,
    image: mouthwashImg,
  },
];

const TrendingProducts = () => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleProducts = 4;

  const handlePrev = () => {
    setStartIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex(prev => Math.min(products.length - visibleProducts, prev + 1));
  };

  const handleAddToCart = (productId) => {
    console.log('Add to cart:', productId);
    // TODO: Implement cart functionality
  };

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
           <button 
             onClick={handlePrev}
             disabled={startIndex === 0}
             className="absolute top-1/2 -left-4 xl:-left-16 -translate-y-1/2 z-10 flex items-center justify-center w-[32px] h-[32px] rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
           >
             <img src={arrowLeft} alt="Previous" className="w-full h-full" />
           </button>
           
           <button 
             onClick={handleNext}
             disabled={startIndex >= products.length - visibleProducts}
             className="absolute top-1/2 -right-4 xl:-right-16 -translate-y-1/2 z-10 flex items-center justify-center w-[32px] h-[32px] rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
           >
             <img src={arrowRight} alt="Next" className="w-full h-full" />
           </button>

          {/* Products Grid */}
          <div className="flex gap-6 overflow-hidden">
            {products.slice(startIndex, startIndex + visibleProducts).map((product) => (
              <div key={product.id} className="min-w-[280px] w-full flex-1">
                 <ProductCard 
                    {...product}
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
