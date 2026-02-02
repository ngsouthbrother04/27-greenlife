import ProductCard from '@/components/products/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';

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
    name: 'Charcoal Whitening Toothpaste - Fresh Mint',
    price: 85,
    originalPrice: 100,
    rating: 4.3,
    image: toothpasteImg,
  },
  {
    id: 6,
    name: 'Eco Bamboo Dental Floss - Biodegradable',
    price: 45,
    originalPrice: 55,
    rating: 4.9,
    image: toothbrushImg,
  },
];

const categories = [
  'All Products',
  'Toothbrush',
  'Toothpaste',
  'Mouthwash',
  'Dental Floss',
  'Whitening',
];

const ProductListPage = () => {
  const handleAddToCart = (productId) => {
    console.log('Add to cart:', productId);
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
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-divider p-6 sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-de-primary" />
                <h3 className="subtitle-semibold text-primary-custom">Filters</h3>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="paragraph-1-medium text-primary-custom mb-4">Categories</h4>
                <ul className="space-y-3">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-de-primary focus:ring-de-primary"
                          defaultChecked={index === 0}
                        />
                        <span className="paragraph-2 text-secondary-custom group-hover:text-de-primary transition-colors">
                          {category}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="paragraph-1-medium text-primary-custom mb-4">Price Range</h4>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full px-3 py-2 rounded-lg border border-divider text-sm focus:outline-none focus:border-de-primary"
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full px-3 py-2 rounded-lg border border-divider text-sm focus:outline-none focus:border-de-primary"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="paragraph-1-medium text-primary-custom mb-4">Rating</h4>
                <select className="w-full px-3 py-2 rounded-lg border border-divider text-sm focus:outline-none focus:border-de-primary">
                  <option>All Ratings</option>
                  <option>4 stars & above</option>
                  <option>3 stars & above</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="paragraph-2 text-secondary-custom">
                Showing <span className="font-medium">{products.length}</span> products
              </p>
              <div className="flex items-center gap-2">
                <span className="paragraph-2 text-secondary-custom">Sort by:</span>
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg border border-divider hover:border-de-primary transition-colors">
                  <span className="paragraph-2-medium">Popular</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id}
                  {...product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-12">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    page === 1 
                      ? 'bg-de-primary text-white' 
                      : 'bg-white border border-divider text-secondary-custom hover:border-de-primary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default ProductListPage;
