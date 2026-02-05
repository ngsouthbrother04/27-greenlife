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

  return (
    <div className="bg-white border border-[#dcdfe4] rounded-[16px] p-[16px] flex flex-col gap-[16px] h-auto items-center relative group">
      <Link to={`/products/${id}`} className="block w-full flex-1 relative rounded-[16px] overflow-hidden aspect-square">
        <div className="absolute inset-0">
          <img 
            src={image} 
            alt={name} 
            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          />
        </div>
        
        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 rounded-[16px]">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

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
              ${price}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#8590a2] line-through">
                ${originalPrice}
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
