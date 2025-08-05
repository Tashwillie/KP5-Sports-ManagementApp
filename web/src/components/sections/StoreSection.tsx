'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const featuredProducts = [
  {
    id: 1,
    name: "Premium Club Package",
    description: "Complete sports management solution for professional clubs",
    price: "$299/month",
    features: ["Unlimited Players", "Advanced Analytics", "Priority Support"],
    image: "/api/placeholder/400/500",
    category: "Premium"
  },
  {
    id: 2,
    name: "Tournament Pro",
    description: "Advanced tournament management with live scoring",
    price: "$199/month",
    features: ["Live Scoring", "Bracket Generation", "Real-time Updates"],
    image: "/api/placeholder/400/500",
    category: "Pro"
  },
  {
    id: 3,
    name: "Mobile App Access",
    description: "Full mobile app access for all team members",
    price: "$99/month",
    features: ["Offline Support", "Push Notifications", "Mobile Sync"],
    image: "/api/placeholder/400/500",
    category: "Mobile"
  },
  {
    id: 4,
    name: "Analytics Dashboard",
    description: "Comprehensive analytics and reporting tools",
    price: "$149/month",
    features: ["Performance Metrics", "Custom Reports", "Data Export"],
    image: "/api/placeholder/400/500",
    category: "Analytics"
  }
];

export function StoreSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Solutions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect sports management solution for your organization. 
            From small clubs to professional leagues, we have you covered.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-black/30 backdrop-blur-sm rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl text-white/20">📦</div>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {product.description}
                </p>
                
                {/* Price */}
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  {product.price}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {product.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Link
                  href={`/pricing/${product.id}`}
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Custom Solutions
              </h3>
              <p className="text-xl text-gray-600 mb-6">
                Need something specific? Our team can create custom solutions tailored to your unique requirements.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Custom API Integration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">White-label Solutions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Dedicated Support</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                <div className="text-6xl mb-4">🎯</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Ready</h4>
                <p className="text-gray-600 mb-6">
                  Scale with confidence. Our enterprise solutions support organizations of any size.
                </p>
                <Link
                  href="/enterprise"
                  className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Contact Sales
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            View All Solutions
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
} 