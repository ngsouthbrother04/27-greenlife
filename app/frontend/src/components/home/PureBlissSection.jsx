import { ArrowRight } from 'lucide-react';

// Import product images
import mouthwashImg from '@/assets/images/mouthwash_product_1770003186824.png';
import mintImg from '@/assets/images/mint_leaves_1770003240755.png';

const PureBlissSection = () => {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="relative bg-de-primary rounded-3xl overflow-hidden min-h-[400px] flex items-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-white" />
            <div className="absolute bottom-10 right-40 w-24 h-24 rounded-full border-2 border-white" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center w-full px-8 md:px-16 py-12">
            {/* Product Image */}
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Decorative mint leaves */}
                <div className="absolute -top-8 -right-8 w-16 h-16">
                  <img 
                    src={mintImg}
                    alt="mint" 
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12">
                  <img 
                    src={mintImg}
                    alt="clove" 
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
                
                {/* Main Product Image */}
                <img 
                  src={mouthwashImg}
                  alt="Pure Bliss Mouthwash"
                  className="w-64 h-auto drop-shadow-2xl rounded-lg"
                />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="text-white space-y-6">
              <h2 className="heading-2 leading-tight">
                Pure Bliss Mouthwash - 
                <br />
                Refresh Your Smile Naturally
              </h2>
              <p className="paragraph-1 opacity-90 max-w-md">
                Say goodbye to harsh chemicals and hello to a naturally invigorated smile. 
                Feel the difference of pure, organic oral care with every wash.
              </p>
              <button className="bg-white text-de-primary px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg hover:bg-gray-50">
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PureBlissSection;
