import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  CreditCard,
  Shield,
  Truck,
  Headphones,
  ArrowRight,
  Star,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'All Products', path: '/products' },
        { name: 'Featured Items', path: '/products?featured=true' },
        { name: 'New Arrivals', path: '/products?new=true' },
        { name: 'Special Offers', path: '/offers' },
        { name: 'Best Sellers', path: '/products?sort=popular' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Contact Us', path: '/contact' },
        { name: 'Shipping Info', path: '/shipping' },
        { name: 'Returns & Exchanges', path: '/returns' },
        { name: 'Size Guide', path: '/size-guide' },
        { name: 'FAQ', path: '/faq' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Press Kit', path: '/press' }
      ]
    },
    {
      title: 'Features',
      links: [
        { name: 'AI Recommendations', path: '/ai' },
        { name: 'Secure Payments', path: '/security' },
        { name: 'Fast Delivery', path: '/delivery' },
        { name: '24/7 Support', path: '/support' },
        { name: 'Gift Cards', path: '/gift-cards' }
      ]
    }
  ];

  const paymentMethods = [
    { name: 'Khalti', icon: '📱' },
    { name: 'eSewa', icon: '📱' },
    { name: 'Stripe', icon: '💸' }
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Payment',
      description: '100% protected transactions'
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Fast Delivery',
      description: 'FAst and reliable shipping'
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Always here to help'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Easy Returns',
      description: '30-day return policy'
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-t border-cyan-500/20">
      {/* Feature Highlights */}
      <section className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    NEXUS
                  </h2>
                  <p className="text-gray-400 text-sm">Premium Shopping Experience</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Discover the future of e-commerce with AI-powered recommendations, 
                secure payments, and nationwide delivery. Your trusted partner for 
                premium shopping.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4 mb-6">
                {[
                  { icon: <Facebook className="w-5 h-5" />, name: 'Facebook' },
                  { icon: <Twitter className="w-5 h-5" />, name: 'Twitter' },
                  { icon: <Instagram className="w-5 h-5" />, name: 'Instagram' },
                  { icon: <Youtube className="w-5 h-5" />, name: 'YouTube' }
                ].map((social) => (
                  <motion.a
                    key={social.name}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Navigation Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-cyan-300 transition-all duration-300 flex items-center gap-2 group text-sm"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pt-12 border-t border-white/10">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span>+977 9812345678</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>support@nexusstore.com</span>
              </div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get exclusive offers and product updates delivered to your inbox.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <h4 className="text-sm font-semibold text-gray-300 mb-4 text-center">
            We Accept
          </h4>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10"
              >
                <span className="text-lg">{method.icon}</span>
                <span className="text-gray-300 text-sm font-medium">{method.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>
                © {currentYear} Nexus Store. Made with <Heart className="w-4 h-4 text-red-400 inline" /> in Nepal.
              </p>
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-cyan-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-cyan-300 transition-colors">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-cyan-300 transition-colors">
                Sitemap
              </Link>
              <div className="flex items-center gap-2 text-gray-400">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-t border-cyan-500/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center items-center gap-8 text-xs text-gray-400 flex-wrap">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>SSL Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Free Shipping Nationwide</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-purple-400" />
              <span>24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;