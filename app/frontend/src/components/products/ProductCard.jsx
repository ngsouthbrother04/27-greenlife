import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCard = ({ 
  id,
  name, 
  price, 
  originalPrice, 
  image, 
  stock = 1, // Default to available if not specified
  onAddToCart 
}) => {
  const isOutOfStock = stock <= 0;

  // Determine accurate image URL and fix corrupted URLs
  let displayImage = image;
  if (image && image.includes('http') && image.includes('localhost')) {
       const parts = image.split('http');
       if (parts.length > 2) {
           displayImage = 'http' + parts[parts.length - 1];
       }
  }

  return (
    <div className="bg-white border border-[#dcdfe4] rounded-[16px] p-[16px] flex flex-col gap-[16px] h-auto items-center relative group">
      <div className="relative group overflow-hidden bg-[#F4F4F4] rounded-[20px] mb-4 w-full flex-1 aspect-square">
        <Link to={`/products/${id}`} className="block w-full h-full">
            <img 
              src={displayImage || 'https://placehold.co/300x300?text=No+Image'} 
              alt={name} 
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/300x300?text=No+Image';
              }}
            />
        </Link>
        
        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 rounded-[20px] pointer-events-none">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[24px] w-full">
        <div className="flex flex-col gap-[16px]">
          {/* Product Name */}
          <Link to={`/products/${id}`}>
            <h3 className="font-['Poppins'] font-medium text-[14px] leading-[21px] text-[#121216] line-clamp-2 hover:text-primary-custom transition-colors min-h-[42px]">
              {name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-['Poppins'] font-semibold text-[20px] leading-[30px] text-[#121216]">
              {Number(price).toLocaleString('vi-VN')}₫
            </span>
            {originalPrice && originalPrice > price && (
              <span className="font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#8590a2] line-through">
                {Number(originalPrice).toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            !isOutOfStock && onAddToCart?.(id);
          }}
          disabled={isOutOfStock}
          className={`
            w-full h-[44px] rounded-[8px] flex items-center justify-center gap-2 px-[16px] py-[10px]
            font-['Poppins'] font-semibold text-[16px] leading-[24px] transition-all duration-300
            ${isOutOfStock 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-[#405741] text-white hover:bg-[#2d3e2e] active:scale-[0.98] shadow-sm hover:shadow'
            }
          `}
        >
          <ShoppingCart className="w-[24px] h-[24px]" />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
