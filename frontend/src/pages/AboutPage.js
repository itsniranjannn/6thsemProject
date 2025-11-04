import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  Award, 
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Headphones,
  Truck,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Cpu,
  Network,
  Sparkles,
  Target,
  Smartphone,
  Laptop,
  Shirt,
  Home,
  BookOpen,
  Heart,
  Gamepad2,
  Search,
  CheckCircle
} from 'lucide-react';

const AboutPage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  // Store Statistics
  const stats = [
    { number: '100+', label: 'Digital Shoppers', icon: Users, color: 'from-cyan-500 to-blue-500' },
    { number: '1000+', label: 'Products Available', icon: ShoppingBag, color: 'from-purple-500 to-pink-500' },
    { number: '98%', label: 'Satisfaction Rate', icon: Star, color: 'from-amber-500 to-orange-500' },
    { number: '24/7', label: 'AI Support', icon: Cpu, color: 'from-green-500 to-emerald-500' }
  ];

  // Product Categories Showcase
  const categories = [
    {
      icon: Smartphone,
      name: 'Electronics & Tech',
      description: 'Latest gadgets, smartphones, laptops & cutting-edge technology',
      count: '25K+ Products',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Shirt,
      name: 'Fashion & Style',
      description: 'Trending apparel, footwear & accessories for the modern lifestyle',
      count: '35K+ Products',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Home,
      name: 'Home & Living',
      description: 'Smart home devices, furniture & premium living essentials',
      count: '30K+ Products',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: BookOpen,
      name: 'Books & Education',
      description: 'Educational materials, tech books & learning resources',
      count: '40K+ Products',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Heart,
      name: 'Health & Wellness',
      description: 'Fitness tech, wellness products & health monitoring devices',
      count: '15K+ Products',
      gradient: 'from-rose-500 to-red-500'
    },
    {
      icon: Gamepad2,
      name: 'Gaming & Entertainment',
      description: 'Gaming gear, consoles & immersive entertainment systems',
      count: '12K+ Products',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  // Enhanced "Why We're Different" Features
  const features = [
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Multiple payment gateways with bank-level security and encryption. Your transactions are protected with military-grade security.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with instant search and quick checkout. Experience blazing-fast page loads and seamless navigation.',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: Truck,
      title: 'Nationwide Delivery',
      description: 'Fast shipping across the country with real-time tracking. Get your orders delivered quickly with live package monitoring.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Rigorous quality checks and authentic product guarantee. Every item is verified for authenticity and excellence.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Cpu,
      title: 'AI Recommendations',
      description: 'Smart product suggestions based on your preferences. Our advanced algorithms learn your style to show perfect matches.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: CreditCard,
      title: 'Flexible Payments',
      description: 'Stripe, Khalti, eSewa, and Cash on Delivery options. Choose your preferred payment method with complete flexibility.',
      gradient: 'from-rose-500 to-red-500'
    }
  ];

  // Team Members
  const team = [
    {
      name: 'Niranjan Katwal',
      role: 'CEO & Founder',
      image: '../images/n.jpg',
      expertise: 'Mastermind of Vision & Strategy'
    },
    {
      name: 'Prithivi Narayan Shah',
      role: 'Shree Pach Sarkar',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgqwPibPcn1C8P-nF2kjk3NO0GuggPFba8aaVOHfEoUOGl-jLkC8BJ7LbvhD5arjsmsGmH06hq9uL3T0YfFp8df4lGpVTxYoX6B8ssUlD7',
      expertise: 'King of Nation'
    }, 
    {
      name: 'Janga Bahadur Rana',
      role: 'Shree Teen ',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Jang_Bahadur_Ranaji.jpg/500px-Jang_Bahadur_Ranaji.jpg',
      expertise: 'Deadly Reformer'
    },
    {
      name: 'Bhimsen Thapa',
      role: 'Mukhtiyar',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bhimsen-thapa-painting.jpg/338px-Bhimsen-thapa-painting.jpg' ,
      expertise: 'Architect of Modern Nepal'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Enhanced Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
          <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
        >
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25"
            >
              <Network className="text-white" size={40} />
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 leading-tight">
              NEXUS
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              Where <span className="text-cyan-300 font-semibold">Technology</span> Meets{' '}
              <span className="text-purple-300 font-semibold">Extraordinary Shopping</span>
            </p>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-400 max-w-2xl mx-auto mt-6 leading-relaxed"
            >
              Nepal's premier multi-category e-commerce platform powered by AI, 
              featuring electronics, fashion, home essentials, and much more.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="text-center p-8 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 hover:border-cyan-400/50 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Animated background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 relative`}>
                    <Icon className="text-white" size={32} />
                    <Sparkles className="absolute -top-1 -right-1 text-yellow-300" size={16} />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">{stat.number}</div>
                  <div className="text-gray-300 font-semibold tracking-wide">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Enhanced Mission Section */}
      <section className="py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={slideInLeft}>
              <div className="flex items-center space-x-4 mb-8">
                <Target className="text-cyan-400" size={32} />
                <h2 className="text-5xl font-black text-white">Our Vision</h2>
              </div>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
                To revolutionize online shopping in Nepal by combining cutting-edge technology 
                with an unparalleled product selection, creating the ultimate digital marketplace.
              </p>
              <div className="space-y-6">
                {[
                  'Leveraging AI for personalized shopping experiences',
                  'Building trust with secure, transparent transactions',
                  'Offering nationwide delivery with real-time tracking',
                  'Providing 24/7 AI-powered customer support'
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 text-gray-300"
                  >
                    <div className="w-3 h-3 bg-cyan-400 rounded-full flex-shrink-0" />
                    <span className="text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={slideInRight} className="relative">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="text-cyan-300" size={28} />
                  <h3 className="text-3xl font-bold text-white">The Nexus Advantage</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: Cpu, text: 'AI-Powered Personalization', desc: 'Smart recommendations that learn from your behavior' },
                    { icon: Shield, text: 'Bank-Level Security', desc: 'Military-grade encryption for all transactions' },
                    { icon: Zap, text: 'Instant Performance', desc: 'Lightning-fast search and checkout experience' },
                    { icon: Truck, text: 'Smart Delivery Network', desc: 'Nationwide shipping with live tracking' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-white" size={20} />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">{item.text}</h4>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Categories Showcase */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">Explore Our Universe</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From cutting-edge technology to lifestyle essentials - everything you need in one digital ecosystem
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.name}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 hover:border-cyan-400/50 transition-all duration-500 group relative overflow-hidden"
                >
                  {/* Animated gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative`}>
                    <Icon className="text-white" size={28} />
                    <div className="absolute -inset-1 bg-gradient-to-r from-white to-transparent opacity-20 rounded-2xl blur-sm group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-light mb-4">
                    {category.description}
                  </p>
                  <div className="text-cyan-300 font-semibold">{category.count}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Enhanced "Why We're Different" Section */}
      <section className="py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">Why We're Different</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Innovative features that set us apart in the e-commerce landscape
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 hover:border-cyan-400/50 transition-all duration-500 group relative overflow-hidden"
                >
                  {/* Animated gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative`}>
                    <Icon className="text-white" size={28} />
                    <div className="absolute -inset-1 bg-gradient-to-r from-white to-transparent opacity-20 rounded-2xl blur-sm group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Enhanced Team Section */}
      <section className="py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-4">The Architects of Nexus</h2>
            <p className="text-xl text-gray-400">Visionary leaders building the future of digital commerce</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                whileHover={{ 
                  y: -15,
                  transition: { duration: 0.3 }
                }}
                className="text-center group"
              >
                <div className="relative mb-8">
                  <div className="w-40 h-40 mx-auto rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-500 p-1.5 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {member.expertise}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-cyan-400 font-semibold text-lg">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Enhanced Contact & Location */}
      <section className="py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div variants={slideInLeft}>
              <h2 className="text-5xl font-black text-white mb-12">Connect With Nexus</h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: MapPin,
                    title: 'Nexus Headquarters',
                    details: ['Tech Innovation District', 'Digital Commerce Hub', 'Kathmandu, Nepal'],
                    color: 'from-cyan-500 to-blue-500'
                  },
                  {
                    icon: Phone,
                    title: 'Digital Hotline',
                    details: ['+977 1-TECH-NEX', '24/7 AI Assistant Available'],
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    icon: Mail,
                    title: 'Quantum Communication',
                    details: ['connect@nexusstore.com', 'support@nexusstore.com'],
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: Clock,
                    title: 'Always Active',
                    details: ['24/7 Digital Operations', 'Global Support Network'],
                    color: 'from-amber-500 to-orange-500'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-6 p-6 rounded-2xl bg-gray-800 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      {item.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-400 font-light">{detail}</p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={slideInRight} className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-3xl p-8 h-full">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 h-96 flex flex-col items-center justify-center text-center border border-cyan-400/20">
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <MapPin className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Global Nexus Network</h3>
                  <p className="text-gray-400 mb-6">Our digital presence spans across continents</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-3 text-cyan-300">
                      <Globe size={20} />
                      <span className="font-semibold">Worldwide Operations</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      Connecting customers and innovators globally
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-300/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black text-white mb-8"
          >
            JOIN THE
            <span className="block bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
              NEXUS REVOLUTION
            </span>
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-cyan-100 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Experience the future of shopping with AI-powered recommendations, 
            secure payments, and nationwide delivery.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-white text-cyan-600 rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-white"
            >
              EXPLORE NEXUS
            </motion.button>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-black text-lg hover:shadow-2xl transition-all duration-300"
            >
              VIEW FEATURES
            </motion.button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;