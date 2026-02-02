import { useState } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Courtney Henry',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    text: 'Quite different! You can feel the difference between chemical-based and natural toothpaste. I feel better after using Tea tree & Charcoal tooth paste.',
  },
  {
    id: 2,
    name: 'Ronald Richards',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    text: 'Quite different! You can feel the difference between chemical-based and natural toothpaste. I feel better after using Tea tree & Charcoal tooth paste.',
  },
  {
    id: 3,
    name: 'Jenny Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
    text: 'Quite different! You can feel the difference between chemical-based and natural toothpaste. I feel better after using Tea tree & Charcoal tooth paste.',
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-20 bg-surface-light">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="heading-2 text-primary-custom mb-2">
            Testimonials
          </h2>
          <p className="paragraph-1 text-secondary-custom">
            Hear what our customers say
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Quote */}
              <p className="paragraph-1 text-secondary-custom mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="paragraph-1-medium text-primary-custom">
                    {testimonial.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-10 h-2 rounded-full transition-colors ${
                index === activeIndex ? 'bg-de-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
