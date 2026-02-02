import { Leaf, Droplets, Heart, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'No Artificial Colours',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-400',
  },
  {
    icon: Droplets,
    title: 'No Parabens',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-400',
  },
  {
    icon: Leaf,
    title: 'Vegan',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    icon: Heart,
    title: 'No Artificial Colours',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-500',
  },
];

const FeatureIcons = () => {
  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div 
                className={`w-20 h-20 rounded-full ${feature.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}
              >
                <feature.icon className={`w-10 h-10 ${feature.iconColor}`} />
              </div>
              <span className="paragraph-2-medium text-primary-custom text-center">
                {feature.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureIcons;
