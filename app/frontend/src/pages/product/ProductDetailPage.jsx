import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Minus, Plus, ChevronRight } from 'lucide-react';
import { useState } from 'react';

// Import product images
import mouthwashImg from '@/assets/images/mouthwash_product_1770003186824.png';
import toothpasteImg from '@/assets/images/natural_toothpaste_1770003224265.png';
import toothbrushImg from '@/assets/images/bamboo_toothbrush_1770003204380.png';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  // Mock product data
  const product = {
    id,
    name: 'Natural Teeth Whitening Toothpaste - Tea tree & Charcoal',
    price: 100,
    originalPrice: 150,
    rating: 4.8,
    reviews: 128,
    description: 'Experience the power of natural teeth whitening with our Tea Tree & Charcoal toothpaste. Made with organic ingredients, this toothpaste gently removes stains while protecting your enamel. The refreshing tea tree oil provides antibacterial protection, while activated charcoal naturally absorbs impurities.',
    features: [
      'Made with organic tea tree oil',
      'Activated charcoal for natural whitening',
      'No artificial colors or flavors',
      'Vegan and cruelty-free',
      'Recyclable packaging',
    ],
    images: [
      toothpasteImg,
      mouthwashImg,
      toothbrushImg,
    ],
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 paragraph-2 text-secondary-custom mb-8">
          <Link to="/" className="hover:text-de-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-de-primary transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-custom font-medium">Toothpaste</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-surface-light rounded-3xl overflow-hidden">
              <img 
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button 
                  key={index}
                  className={`aspect-square bg-surface-light rounded-xl overflow-hidden border-2 transition-colors ${
                    index === 0 ? 'border-de-primary' : 'border-transparent hover:border-de-primary/50'
                  }`}
                >
                  <img 
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain p-4"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="heading-3 text-primary-custom mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="paragraph-2 text-secondary-custom">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="heading-3 text-de-primary">${product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="subtitle-regular text-disabled-custom line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="paragraph-1 text-secondary-custom leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div>
              <h4 className="paragraph-1-medium text-primary-custom mb-3">Key Features:</h4>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 paragraph-2 text-secondary-custom">
                    <span className="w-1.5 h-1.5 bg-de-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity & Actions */}
            <div className="flex items-center gap-4 pt-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-divider rounded-lg">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3 hover:bg-surface-light transition-colors"
                >
                  <Minus className="w-4 h-4 text-secondary-custom" />
                </button>
                <span className="w-12 text-center paragraph-1-medium text-primary-custom">
                  {quantity}
                </span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="p-3 hover:bg-surface-light transition-colors"
                >
                  <Plus className="w-4 h-4 text-secondary-custom" />
                </button>
              </div>

              {/* Add to Cart */}
              <button className="flex-1 btn-primary py-4">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>

              {/* Wishlist */}
              <button className="p-4 border border-divider rounded-lg hover:border-de-primary hover:text-de-primary transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default ProductDetailPage;
