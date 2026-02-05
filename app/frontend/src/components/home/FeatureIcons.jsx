import noArtificialColoursImg from '@/assets/images/no_artificial_colours.png';
import noParabenImg from '@/assets/images/no_paraben.png';
import veganImg from '@/assets/images/vegan.png';

const features = [
  {
    image: noArtificialColoursImg,
    title: 'No Artificial Colours',
    bgColor: 'bg-[#ffeef4]',
  },
  {
    image: noParabenImg,
    title: 'No Paraben',
    bgColor: 'bg-[#e8fbff]',
  },
  {
    image: veganImg,
    title: 'Vegan',
    bgColor: 'bg-[#e5fff1]',
  },
  {
    image: noArtificialColoursImg,
    title: 'No Artificial Colours',
    bgColor: 'bg-[#efeffe]',
  },
];

const FeatureIcons = () => {
  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex-1 h-[160px] ${feature.bgColor} rounded-[8px] flex flex-col items-center justify-center gap-2 p-4 transition-transform hover:-translate-y-1 duration-300`}
            >
              <div className="w-[78px] h-[78px] relative shrink-0">
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <p className="font-['Poppins'] font-semibold text-[16px] leading-normal text-black text-center whitespace-pre-wrap">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureIcons;
