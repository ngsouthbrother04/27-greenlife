import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import images from Figma design
import promoBannerBg from '@/assets/images/promo_banner_bg.png';
import mouthwashProduct from '@/assets/images/mouthwash_product.png';
import waterSplash from '@/assets/images/mouthwash_water_splash.png';
import mintImg from '@/assets/images/mint.png';
import cloveImg from '@/assets/images/clove.png';

/**
 * PureBlissSection - Promotional banner for mouthwash
 * Design from Figma node 30:2181
 * Features "Pure Bliss Mouthwash - Refresh Your Smile Naturally"
 */
const PureBlissSection = () => {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="relative overflow-hidden rounded-[24px] min-h-[380px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={promoBannerBg}
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Content Grid */}
          <div className="relative z-10 flex items-center h-full min-h-[380px]">
            {/* Left Side - Product Image with decorative elements */}
            <div className="flex-1 relative flex justify-center items-center py-12 px-8">
              {/* Water splash effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={waterSplash}
                  alt="Water splash"
                  className="w-[400px] h-auto object-contain opacity-80"
                />
              </div>
              
              {/* Main Product */}
              <div className="relative z-10">
                {/* Mouthwash Product */}
                <img 
                  src={mouthwashProduct}
                  alt="Eco Dental Mouthwash"
                  className="w-[200px] h-auto drop-shadow-2xl"
                />
                
                {/* Mint leaves decorative */}
                <img 
                  src={mintImg}
                  alt="Mint"
                  className="absolute -bottom-4 -left-8 w-[80px] h-auto"
                />
                
                {/* Clove decorative */}
                <img 
                  src={cloveImg}
                  alt="Clove"
                  className="absolute bottom-0 right-[-60px] w-[100px] h-auto"
                />
              </div>
            </div>
            
            {/* Right Side - Text Content */}
            <div className="flex-1 pr-12 py-12">
              <div className="flex flex-col gap-[32px] max-w-[559px]">
                {/* Text Content */}
                <div className="flex flex-col gap-[13px]">
                  {/* Heading */}
                  <h2 className="font-bold text-[36px] leading-[54px] text-black">
                    Pure Bliss Mouthwash - Refresh Your Smile Naturally
                  </h2>
                  
                  {/* Description */}
                  <p className="paragraph-1 text-[#494961]">
                    Say goodbye to harsh chemicals and hello to a naturally invigorated smile. Feel the difference of pure, organic oral care with every swish.
                  </p>
                </div>
                
                {/* CTA Button */}
                <div>
                  <Link 
                    to="/products?category=mouthwash"
                    className="inline-flex items-center justify-center gap-[8px] bg-de-primary text-white px-[16px] py-[10px] rounded-[8px] h-[44px] font-semibold text-[16px] leading-[24px] transition-all hover:shadow-lg hover:bg-[#2d3e2e]"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-[20px] h-[20px]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PureBlissSection;
