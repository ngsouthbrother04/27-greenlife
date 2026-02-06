import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Minus, Plus, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useProduct } from '@/hooks';
import { useCartStore } from '@/stores';

// Import product images for fallback
import mouthwashImg from '@/assets/images/mouthwash_product_1770003186824.png';
import toothpasteImg from '@/assets/images/natural_toothpaste_1770003224265.png';
import toothbrushImg from '@/assets/images/bamboo_toothbrush_1770003204380.png';

/**
 * ProductDetailPage Component
 * 
 * B2C Flow: User views product details and adds to cart
 * - Fetches product data using React Query (useProduct hook)
 * - Adds to cart using Zustand store (useCartStore)
 * - Validates quantity against available stock
 * 
 * Flow: ProductDetail -> cartStore.addItem -> Cart
 */
const ProductDetailPage = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product data from API using React Query
  const { data: apiProduct, isLoading, error } = useProduct(id);
  
  // Get cart actions from Zustand store
  const { addItem, getItemQuantity } = useCartStore();

  // Mock product data as fallback (when API not available)
  const fallbackProduct = {
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
    stock: 10, // Mock stock
  };

  // Use API data if available, otherwise use fallback
  const product = apiProduct || fallbackProduct;
  
  // Calculate available stock considering what's already in cart
  const cartQuantity = getItemQuantity(Number(product.id)) || 0;
  // Default stock to 0 if undefined to be safe
  const totalStock = product.stock !== undefined ? product.stock : 0;
  const availableStock = Math.max(0, totalStock - cartQuantity);
  
  // Reset quantity if it exceeds available
  useEffect(() => {
    if (quantity > availableStock && availableStock > 0) {
      setQuantity(availableStock);
    } else if (availableStock === 0) {
      setQuantity(0);
    } else if (quantity === 0 && availableStock > 0) {
      setQuantity(1);
    }
  }, [availableStock, quantity]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > availableStock) return availableStock;
      return next;
    });
  };

  /**
   * Handle Add to Cart
   * B2C Flow: When user clicks "Add to Cart":
   * 1. Product is added to Zustand cart store
   * 2. Cart state persists to localStorage
   * 3. Header cart badge updates automatically
   */
  const handleAddToCart = () => {
    if (quantity > availableStock) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      maxStock: product.stock, // Store max stock info if needed
    }, quantity);
    
    // Reset quantity after adding (or keep it? Usually reset to 1 or remaining)
    setQuantity(1);
    
    // Show success feedback (could be a toast notification)
    console.log(`Added ${quantity} x ${product.name} to cart`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-de-primary" />
      </div>
    );
  }

  // Error state
  if (error && !fallbackProduct) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-red-500">Không thể tải thông tin sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 paragraph-2 text-secondary-custom mb-8">
          <Link to="/" className="hover:text-de-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-de-primary transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-custom font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-surface-light rounded-3xl overflow-hidden relative">
              <img 
                src={product.images?.[0] || product.image}
                alt={product.name}
                className={`w-full h-full object-contain p-8 ${totalStock === 0 ? 'opacity-50 grayscale' : ''}`}
              />
              {totalStock === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="bg-red-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg">
                    Sold Out
                  </span>
                 </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
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
            )}
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
                      className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="paragraph-2 text-secondary-custom">
                  {product.rating} ({product.reviews || 0} reviews)
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
              
              {/* Stock Status */}
              <div className="mt-2">
                {totalStock === 0 ? (
                   <span className="text-red-500 font-medium flex items-center gap-1">
                     <AlertCircle className="w-4 h-4" /> Out of Stock
                   </span>
                ) : availableStock === 0 ? (
                  <span className="text-orange-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> You have reached the max limit ({totalStock})
                  </span>
                ) : availableStock < 5 ? (
                  <span className="text-orange-500 font-medium">
                    Only {availableStock} left in stock!
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="paragraph-1 text-secondary-custom leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            {product.features && (
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
            )}

            {/* Quantity & Actions */}
            <div className="flex items-center gap-4 pt-4">
              {/* Quantity Selector */}
              <div className={`flex items-center border border-divider rounded-lg ${availableStock === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3 hover:bg-surface-light transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 text-secondary-custom" />
                </button>
                <span className="w-12 text-center paragraph-1-medium text-primary-custom">
                  {quantity}
                </span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="p-3 hover:bg-surface-light transition-colors"
                  disabled={quantity >= availableStock}
                >
                  <Plus className="w-4 h-4 text-secondary-custom" />
                </button>
              </div>

              {/* Add to Cart - Now connected to Zustand store */}
              <button 
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg font-medium transition-all ${
                  availableStock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-de-primary text-white hover:bg-de-primary/90'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
