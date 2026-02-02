import { ArrowRight } from 'lucide-react';

// Import product images
import mouthwashImg from '@/assets/images/mouthwash_product_1770003186824.png';
import toothbrushImg from '@/assets/images/bamboo_toothbrush_1770003204380.png';

const banners = [
  {
    id: 1,
    title: 'Mouth Wash',
    description: 'your go-to choice for a naturally clean and eco-friendly smile',
    bgGradient: 'from-[#E8F5E9] to-[#C8E6C9]',
    buttonBg: 'bg-de-primary hover:bg-de-primary/90',
    image: mouthwashImg,
  },
  {
    id: 2,
    title: 'Tooth Brush',
    description: 'your go-to choice for a naturally sleek and eco-friendly smile',
    bgGradient: 'from-[#F5F5F0] to-[#E8E8E0]',
    buttonBg: 'bg-de-primary hover:bg-de-primary/90',
    image: toothbrushImg,
  },
];

const PromoBanners = () => {
  return (
    <section className="py-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div 
              key={banner.id}
              className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${banner.bgGradient} p-8 min-h-[280px] flex flex-col justify-between`}
            >
              {/* Content */}
              <div className="relative z-10 max-w-[60%]">
                <h3 className="heading-3 text-primary-custom mb-2">
                  {banner.title}
                </h3>
                <p className="paragraph-2 text-secondary-custom mb-6">
                  {banner.description}
                </p>
                <button className={`${banner.buttonBg} text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg`}>
                  Buy Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Decorative circle */}
              <div className="absolute right-[-50px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-white/30" />
              
              {/* Product Image */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[40%] h-[80%]">
                <img 
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
