import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import background image from Figma design
import heroBannerBg from '@/assets/images/hero_banner_bg.png';

/**
 * HeroSection - Main banner on homepage
 * Design from Figma node 30:2010
 * Features eco-friendly toothbrushes with "Echo - Friendly Smile" tagline
 */
const HeroSection = () => {
  return (
    <section className="relative h-[540px] w-full overflow-hidden">
      {/* Background Image - Full width banner */}
      <div className="absolute inset-0">
        <img 
          src={heroBannerBg}
          alt="Eco-friendly toothbrushes"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="container-custom relative z-10 h-full flex items-center">
        <div className="pt-[135px] pb-[135px]">
          <div className="flex flex-col gap-[8px] max-w-[689px]">
            {/* Heading */}
            <h1 className="heading-1 text-[#121216]">
              Echo - Friendy Smile
            </h1>
            
            {/* Subtitle */}
            <p className="subtitle-regular text-[#494961]">
              Transform Your Dental Routine with Eco-Friendly Toothbrushes
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="mt-[56px]">
            <Link 
              to="/products"
              className="inline-flex items-center justify-center gap-[8px] bg-de-primary text-white px-[16px] py-[10px] rounded-[8px] h-[48px] min-w-[220px] font-semibold text-[16px] leading-[24px] transition-all hover:shadow-lg hover:bg-[#2d3e2e]"
            >
              <span>SHOP NOW</span>
              <ArrowRight className="w-[24px] h-[24px]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
