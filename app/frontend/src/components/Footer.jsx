import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Send } from 'lucide-react';
import logo from '@/assets/logo.png';

/**
 * Footer Component
 * Refactored to match Figma Design:
 * - Light background bg-[#F1F2F4]/30
 * - 3 Column Layout
 * - Specific typography and spacing
 */
const Footer = () => {
  return (
    <footer className="bg-[#F1F2F4] bg-opacity-30 pt-10 pb-6 w-full">
      <div className="container-custom flex flex-col gap-[77px]">
        
        {/* Top Section: 3 Columns */}
        <div className="flex flex-col md:flex-row gap-[88px] items-start">
          
          {/* Column 1: Brand & Socials */}
          <div className="flex flex-col gap-4 w-full md:w-[490px]">
             {/* Logo Placeholder - Matches Figma Image Area */}
             {/* Logo - Matches Figma Image Area */}
            <div className="h-[74px] w-[227px] relative shrink-0">
                 <img src={logo} alt="Eco Dental" className="object-contain w-full h-full" />
            </div>
            
            {/* Description */}
            <p className="font-['Poppins'] text-[16px] text-[#091E42] opacity-80 leading-normal whitespace-pre-wrap">
              Eco Dental is your go-to destination for premium natural oral care products. We are dedicated to providing you with a holistic approach to dental hygiene, harnessing the power of nature to promote a healthy smile.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              <a href="#" className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#091E42] bg-opacity-10 hover:bg-opacity-20 transition-colors">
                <Facebook className="w-5 h-5 text-[#091E42]" />
              </a>
              <a href="#" className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#091E42] bg-opacity-10 hover:bg-opacity-20 transition-colors">
                 <Twitter className="w-5 h-5 text-[#091E42]" />
              </a>
              <a href="#" className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#091E42] bg-opacity-10 hover:bg-opacity-20 transition-colors">
                 <Instagram className="w-5 h-5 text-[#091E42]" />
              </a>
              <a href="#" className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-[#091E42] bg-opacity-10 hover:bg-opacity-20 transition-colors">
                 <Youtube className="w-5 h-5 text-[#091E42]" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-['Poppins'] font-bold text-[18px] text-[#091E42]">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="font-['Poppins'] text-[16px] text-[#091E42] opacity-80 hover:opacity-100 transition-opacity">
                Our Story
              </Link>
              <Link to="/contact" className="font-['Poppins'] text-[16px] text-[#091E42] opacity-80 hover:opacity-100 transition-opacity">
                Contact Us
              </Link>
              <Link to="/shipping" className="font-['Poppins'] text-[16px] text-[#091E42] opacity-80 hover:opacity-100 transition-opacity">
                Shipping & Delivery
              </Link>
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div className="flex flex-col gap-6 w-full md:w-[347px]">
             <h4 className="font-['Poppins'] font-bold text-[18px] text-[#091E42]">Receive offers & discounts via e-mail</h4>
             <div className="flex h-[56px] w-full">
               <div className="flex-1 border border-[#DCDFE4] rounded-l-lg bg-transparent flex items-center px-4 gap-2">
                 <Mail className="w-6 h-6 text-[#8590A2]" />
                 <input 
                    type="email" 
                    placeholder="Enter Email" 
                    className="w-full bg-transparent border-none outline-none text-[#091E42] placeholder-[#8590A2]"
                 />
               </div>
               <button className="bg-[#405741] text-white font-semibold px-6 rounded-r-lg hover:bg-[#344635] transition-colors">
                 Subscribe
               </button>
             </div>
          </div>

        </div>

        {/* Bottom Section: Divider & Copyright */}
        <div className="flex flex-col gap-5 items-center w-full">
           <div className="h-[1px] w-full bg-[#091E42] opacity-10"></div>
           
           <div className="flex flex-col md:flex-row justify-between items-center w-full text-[#091E42] opacity-70 text-[14px] font-['Poppins']">
             <p className="order-2 md:order-1">© 2024, Eco Dental - All rights reserved.</p>
             
             <div className="flex gap-6 order-1 md:order-2 mb-4 md:mb-0 font-medium">
               <Link to="/terms" className="hover:text-de-primary transition-colors">Terms & Conditions</Link>
               <Link to="/privacy" className="hover:text-de-primary transition-colors">Privacy Policy</Link>
               <Link to="/refund" className="hover:text-de-primary transition-colors">Refund Policy</Link>
             </div>
           </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
