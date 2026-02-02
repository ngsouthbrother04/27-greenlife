import { ShoppingCart, Star } from 'lucide-react';

const ProductCard = ({ 
  id,
  name, 
  price, 
  originalPrice, 
  image, 
  rating = 4.5,
  onAddToCart 
}) => {
  return (
    <div className="group bg-white rounded-2xl border border-divider overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square bg-surface-light overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Quick action overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="paragraph-1-medium text-primary-custom line-clamp-2 min-h-[48px]">
          {name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="paragraph-2 text-disabled-custom ml-1">
            ({rating})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="subtitle-semibold text-primary-custom">
            ${price}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="paragraph-2 text-disabled-custom line-through">
              ${originalPrice}
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button 
          onClick={() => onAddToCart?.(id)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-de-primary text-de-primary font-medium transition-all hover:bg-de-primary hover:text-white"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
