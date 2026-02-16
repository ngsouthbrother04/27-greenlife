import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Heart, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { wishlistService } from '@/api';
import { useCartStore } from '@/stores';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await wishlistService.getWishlist();
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      toast.success('Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error("Sản phẩm này đã hết hàng.");
      return;
    }

    // Determine accurate image URL logic similar to ProductCard
    let imageUrl = '';
    if (product.image) {
        imageUrl = product.image;
    } else if (product.images && product.images.length > 0) {
        imageUrl = product.images[0];
    }
    
    // Fix corrupted URLs
    if (imageUrl && imageUrl.includes('http') && imageUrl.includes('localhost')) {
         const parts = imageUrl.split('http');
         if (parts.length > 2) {
             imageUrl = 'http' + parts[parts.length - 1];
         }
    }

    const result = addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-de-primary" />
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 paragraph-2 text-secondary-custom mb-8">
          <Link to="/" className="hover:text-de-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-custom font-medium">My Wishlist</span>
        </nav>

        <h1 className="heading-2 text-primary-custom mb-8 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Create your personal collection of eco-friendly favorites by clicking the heart icon on any product.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center px-8 py-3 bg-de-primary text-white rounded-lg font-medium hover:bg-de-primary/90 transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
               // Logic to handle image display
               const product = item.product;
               let displayImage = product.images?.[0] || product.image || 'https://placehold.co/300x300?text=No+Image';
               
               // Fix corrupted URLs
               if (displayImage.includes('http') && displayImage.includes('localhost')) {
                   const parts = displayImage.split('http');
                   if (parts.length > 2) {
                       displayImage = 'http' + parts[parts.length - 1];
                   }
               }

               return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden bg-[#F4F4F4]">
                    <Link to={`/products/${product.id}`}>
                      <img 
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/300x300?text=No+Image';
                        }}
                      />
                    </Link>
                    <button 
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 hover:text-de-primary transition-colors min-h-[48px]">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-semibold text-de-primary">
                        {Number(product.price).toLocaleString('vi-VN')}₫
                      </span>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.stock > 0 
                            ? 'bg-de-primary/10 text-de-primary hover:bg-de-primary hover:text-white' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={product.stock <= 0}
                        title={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
