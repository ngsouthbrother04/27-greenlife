import bannerMouthwashImg from '@/assets/images/banner_mouthwash.png';
import bannerToothbrushImg from '@/assets/images/banner_toothbrush.png';
import bannerHighlight from '@/assets/images/banner_highlight.svg';
import bannerSparkle from '@/assets/images/banner_sparkle.svg';
import bannerLogoMark from '@/assets/images/banner_logo_mark.png';

const PromoBanners = () => {
  return (
    <section className="py-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Banner 1: Mouth Wash */}
          <div 
            className="relative rounded-[16px] overflow-hidden h-[273px] flex flex-col justify-between p-8"
            style={{ 
              background: 'linear-gradient(110.102deg, rgb(12, 220, 218) 12.584%, rgb(1, 106, 105) 92.94%), linear-gradient(90deg, rgb(144, 209, 245) 0%, rgb(144, 209, 245) 100%)',
              backgroundBlendMode: 'normal' 
            }}
          >
            {/* Highlight Decoration */}
            <div className="absolute left-[249px] top-[-35px] w-[366px] h-[366px] pointer-events-none">
              <img src={bannerHighlight} alt="" className="w-full h-full object-contain opacity-50" /> 
            </div>

            {/* Sparkle Decoration */}
             <div className="absolute left-[419px] top-[101px] w-[48px] h-[38px] pointer-events-none z-10">
              <img src={bannerSparkle} alt="" className="w-full h-full object-contain" /> 
            </div>

            {/* Logo Watermark Decoration */}
            <div className="absolute left-[429px] top-[106px] w-[82px] h-[29px] pointer-events-none z-10 opacity-50 mix-blend-overlay">
               <img src={bannerLogoMark} alt="" className="w-full h-full object-contain" /> 
            </div>


            {/* Content */}
            <div className="relative z-20 w-[60%]">
              <h3 className="font-['Poppins'] font-semibold text-[44px] leading-[66px] text-white whitespace-nowrap">
                Mouth Wash
              </h3>
              <p className="font-['Poppins'] font-medium text-[16px] leading-[27px] text-white my-2">
                your go-to choice for a naturally clean and eco-friendly smile
              </p>
              
              {/* Button */}
              <button className="mt-4 bg-[#9acb6b] text-white font-['Poppins'] font-semibold text-[16px] leading-[24px] py-[10px] px-[16px] rounded-[8px] h-[44px] flex items-center justify-center w-fit transition-transform hover:scale-105">
                Buy Now
              </button>
            </div>

            {/* Image */}
             <div className="absolute right-0 top-[7px] w-[278px] h-[247px] drop-shadow-[0px_7px_4px_rgba(50,51,52,0.5)]">
              <img 
                src={bannerMouthwashImg} 
                alt="Mouth Wash" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Banner 2: Tooth Brush */}
          <div 
            className="relative rounded-[16px] overflow-hidden h-[273px] flex flex-col justify-between p-8"
            style={{ 
              background: 'linear-gradient(105.573deg, rgb(25, 185, 254) 20.466%, rgb(125, 212, 254) 46.962%, rgb(148, 219, 255) 61.143%, rgb(184, 230, 255) 95.102%)' 
            }}
          >
            {/* Content */}
            <div className="relative z-10 w-[60%]">
              <h3 className="font-['Poppins'] font-semibold text-[44px] leading-[66px] text-[#121216] whitespace-nowrap">
                Tooth Brush
              </h3>
              <p className="font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#121216] my-2">
                your go-to choice for a naturally clean and eco-friendly smile
              </p>
              
              {/* Button */}
              <button className="mt-4 bg-[#405741] text-white font-['Poppins'] font-semibold text-[16px] leading-[24px] py-[10px] px-[16px] rounded-[8px] h-[44px] flex items-center justify-center w-fit transition-transform hover:scale-105">
                Buy Now
              </button>
            </div>

            {/* Image */}
            <div className="absolute right-0 top-[7px] h-[260px] w-auto drop-shadow-[0px_7px_4px_rgba(50,51,52,0.5)]">
              <img 
                src={bannerToothbrushImg} 
                alt="Tooth Brush" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
