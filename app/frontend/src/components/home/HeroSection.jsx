import { ArrowRight } from 'lucide-react';

// Import product images
import toothbrushImg from '@/assets/images/bamboo_toothbrush_1770003204380.png';

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden bg-gradient-to-br from-[#FDFBF7] via-white to-[#F5F8F5]">
      {/* Background Image */}
      <div 
        className="absolute right-0 top-0 w-2/3 h-full flex items-center justify-center"
      >
        <img 
          src={toothbrushImg}
          alt="Eco-friendly toothbrush"
          className="w-auto h-[80%] object-contain opacity-90 drop-shadow-2xl"
        />
      </div>
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
      
      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-xl">
          <h1 className="heading-2 md:heading-1 text-primary-custom mb-6">
            Echo - Friendly Smile
          </h1>
          <p className="paragraph-1 text-secondary-custom mb-8 max-w-md">
            Transform Your Dental Routine with Eco-Friendly Toothbrushes
          </p>
          <button className="btn-primary group">
            <span>SHOP NOW</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
        <span className="w-8 h-1 bg-de-primary rounded-full"></span>
        <span className="w-8 h-1 bg-gray-300 rounded-full"></span>
        <span className="w-8 h-1 bg-gray-300 rounded-full"></span>
      </div>
    </section>
  );
};

export default HeroSection;
