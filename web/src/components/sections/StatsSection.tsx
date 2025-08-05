'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const stats = {
  football: [
    { label: "Active Clubs", value: "500+", icon: "🏟️" },
    { label: "Registered Players", value: "10,000+", icon: "⚽" },
    { label: "Tournaments Hosted", value: "1,200+", icon: "🏆" },
    { label: "Matches Played", value: "25,000+", icon: "⚽" },
    { label: "Countries Served", value: "50+", icon: "🌍" },
    { label: "Success Rate", value: "99.9%", icon: "📈" }
  ],
  basketball: [
    { label: "Basketball Clubs", value: "200+", icon: "🏀" },
    { label: "Basketball Players", value: "5,000+", icon: "🏀" },
    { label: "Basketball Tournaments", value: "800+", icon: "🏆" },
    { label: "Basketball Matches", value: "12,000+", icon: "🏀" },
    { label: "Basketball Leagues", value: "25+", icon: "🏆" },
    { label: "Basketball Success Rate", value: "99.8%", icon: "📈" }
  ],
  general: [
    { label: "Total Users", value: "50,000+", icon: "👥" },
    { label: "Sports Supported", value: "15+", icon: "🎯" },
    { label: "Data Processed", value: "1TB+", icon: "💾" },
    { label: "API Calls/Day", value: "1M+", icon: "🔌" },
    { label: "Uptime", value: "99.99%", icon: "⚡" },
    { label: "Customer Satisfaction", value: "98%", icon: "😊" }
  ]
};

export function StatsSection() {
  const [activeTab, setActiveTab] = useState('football');

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/10">
              <div className="text-center">
                <div className="text-8xl mb-6">🏆</div>
                <h3 className="text-3xl font-bold mb-4">A Legendary Track Record</h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  KP5 Academy has revolutionized sports management across the globe. 
                  Our platform has been trusted by thousands of clubs, players, and organizations.
                </p>
              </div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">2024</div>
                <div className="text-sm text-gray-300">Current Year</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4">Platform Statistics</h2>
              <p className="text-xl text-gray-300">
                Impressive numbers that showcase our commitment to excellence in sports management.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={() => setActiveTab('football')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  activeTab === 'football'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Football
              </button>
              <button
                onClick={() => setActiveTab('basketball')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  activeTab === 'basketball'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Basketball
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                  activeTab === 'general'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                General
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats[activeTab as keyof typeof stats].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{stat.icon}</div>
                    <div>
                      <div className="text-2xl font-bold text-blue-300">{stat.value}</div>
                      <div className="text-gray-300">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Year Slider */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-300">Timeline</span>
                <span className="text-blue-300 font-semibold">2024</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-full"></div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                Explore More Statistics
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 