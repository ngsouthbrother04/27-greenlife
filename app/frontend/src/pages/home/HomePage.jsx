import HeroSection from '@/components/home/HeroSection';
import FeatureIcons from '@/components/home/FeatureIcons';
import PromoBanners from '@/components/home/PromoBanners';
import TrendingProducts from '@/components/home/TrendingProducts';
import PureBlissSection from '@/components/home/PureBlissSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Feature Icons */}
      <FeatureIcons />
      
      {/* Promotional Banners */}
      <PromoBanners />
      
      {/* Trending Products */}
      <TrendingProducts />
      
      {/* Pure Bliss Promotional Section */}
      <PureBlissSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
    </div>
  );
};

export default HomePage;
