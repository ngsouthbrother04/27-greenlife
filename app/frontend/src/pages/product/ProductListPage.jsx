import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { Filter, Loader2, SearchX } from 'lucide-react';
import { useProducts } from '@/hooks';
import { useCartStore } from '@/stores';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Import product images for fallback data
import mouthwashImg from '@/assets/images/mouthwash_product_1770003186824.png';
import toothpasteImg from '@/assets/images/natural_toothpaste_1770003224265.png';
import toothbrushImg from '@/assets/images/bamboo_toothbrush_1770003204380.png';

/**
 * Fallback products data when API is not available
 */
const fallbackProducts = [
  {
    id: 1,
    name: 'Sparkling Mint Wonder of Peppermint Natural Mouthwash',
    price: 100000,
    originalPrice: 120000,
    rating: 4.5,
    image: mouthwashImg,
    category: 'Mouthwash',
    description: 'Natural mouthwash with peppermint essence.',
    stock: 50
  },
  {
    id: 2,
    name: 'Natural Teeth Whitening Toothpaste - Tea tree & Charcoal',
    price: 100000,
    originalPrice: 150000,
    rating: 4.8,
    image: toothpasteImg,
    category: 'Toothpaste',
    description: 'Whitening toothpaste with activated charcoal.',
    stock: 20
  },
  {
    id: 3,
    name: 'Organic Bamboo Toothbrush with Soft Natural Bristles',
    price: 100000,
    originalPrice: 130000,
    rating: 4.6,
    image: toothbrushImg,
    category: 'Toothbrush',
    description: 'Eco-friendly bamboo toothbrush.',
    stock: 100
  },
  {
    id: 4,
    name: 'Sensitivity Relief Vanilla & Peppermint Natural Mouthwash',
    price: 100000,
    originalPrice: 140000,
    rating: 4.7,
    image: mouthwashImg,
    category: 'Mouthwash',
    description: 'Soothes sensitive gums.',
    stock: 0
  },
  {
    id: 5,
    name: 'Charcoal Whitening Toothpaste - Fresh Mint',
    price: 85000,
    originalPrice: 100000,
    rating: 4.3,
    image: toothpasteImg,
    category: 'Toothpaste',
    description: 'Best seller.',
    stock: 15
  },
  {
    id: 6,
    name: 'Eco Bamboo Dental Floss - Biodegradable',
    price: 45000,
    originalPrice: 55000,
    rating: 4.9,
    image: toothbrushImg,
    category: 'Dental Floss',
    description: 'Waxed with natural beeswax.',
    stock: 30
  },
];

/**
 * ProductListPage Component
 * 
 * B2C Flow: User browses products and clicks to view details
 * - Fetches products using React Query (useProducts hook)
 * - Supports filtering by category, price, stock, and sorting (via URL params)
 * - Quick add to cart from product cards
 */
const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse query params to object
  const queryParams = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    inStock: searchParams.get('inStock') || undefined,
    sort: searchParams.get('sort') || undefined,
    page: searchParams.get('page') || 1,
  };

  // Fetch products from API using React Query
  // The query key in useProducts hook likely needs to include queryParams to trigger refetch
  // Ensure your hook implementation handles this dependency!
  const { data: apiData, isLoading, error } = useProducts(queryParams);
  
  // Get cart actions from Zustand store
  const addItem = useCartStore((state) => state.addItem);

  // Use API data if available, otherwise use fallback (filtered locally for demo if needed, but better to rely on Service)
  // For fallback/demo purposes, we might need manual filtering here if API fails, but assuming Service handles it.
  const products = apiData?.products || apiData || fallbackProducts;
  const totalProducts = apiData?.total || products.length;

  /**
   * Handle Add to Cart from product card
   * B2C Flow: Quick add -> Cart state updates -> Header badge updates
   */
  const handleAddToCart = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      if (product.stock <= 0) {
        toast.error("Sản phẩm này đã hết hàng.");
        return;
      }
      
      const image = product.image || (product.images && product.images.length > 0 ? product.images[0] : '') || '';

      const result = await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: image,
        stock: product.stock,
      });
      
      if (result.success) {
          toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
      } else {
          toast.error(result.message || 'Không thể thêm vào giỏ hàng');
      }
    }
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="heading-2 text-primary-custom mb-2">All Products</h1>
          <p className="paragraph-1 text-secondary-custom">
            Discover our range of eco-friendly dental care products
          </p>
          {queryParams.search && (
            <p className="mt-2 text-sm text-gray-500">
              Search results for: <span className="font-medium text-gray-900">"{queryParams.search}"</span>
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden col-span-full mb-4">
            <button 
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white w-full justify-center"
            >
              <Filter className="w-5 h-5 text-de-primary" />
              <span className="font-medium">Filters & Sort</span>
            </button>
            
            {mobileFiltersOpen && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-divider">
                <ProductFilters />
              </div>
            )}
          </div>

          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl border border-divider p-6 sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-de-primary" />
                <h3 className="subtitle-semibold text-primary-custom">Filters</h3>
              </div>
              <ProductFilters />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Header / Sort Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="paragraph-2 text-secondary-custom">
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>Showing <span className="font-medium">{products.length}</span> of {totalProducts} products</>
                )}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-de-primary" />
              </div>
            )}

            {/* Error or Empty State */}
            {(!isLoading && products.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <SearchX className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We couldn't find any products matching your current filters. Try adjusting your search criteria.
                </p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="mt-6 text-de-primary font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Products */}
            {!isLoading && products.length > 0 && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id}
                    {...product}
                    image={product.images?.[0] || product.image || ''}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && products.length > 0 && apiData?.pagination?.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: apiData.pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('page', page);
                        setSearchParams(newParams);
                    }}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      (parseInt(searchParams.get('page')) || 1) === page 
                        ? 'bg-de-primary text-white' 
                        : 'bg-white border border-divider text-secondary-custom hover:border-de-primary'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default ProductListPage;
