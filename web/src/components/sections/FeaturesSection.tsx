'use client';

import { motion } from 'framer-motion';

export function FeaturesSection() {
  const features = [
    {
      title: 'User Authentication & Role Management',
      description: 'Secure email/password, Google login, and OTP authentication with comprehensive role-based access control.',
      icon: '🔐',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Club & Team Management',
      description: 'Create and manage multiple clubs and teams with detailed member management and role assignments.',
      icon: '🏢',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Player Management',
      description: 'Comprehensive player profiles with stats tracking, jersey numbers, and performance analytics.',
      icon: '⚽',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Scheduling & Calendar',
      description: 'Smart scheduling for games, practices, and events with RSVP functionality and calendar sync.',
      icon: '📅',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Tournaments & Leagues',
      description: 'Automated tournament scheduling, bracket generation, live scoring, and standings management.',
      icon: '🏆',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Communication Tools',
      description: 'Real-time chat, announcements, and push notifications to keep everyone connected.',
      icon: '💬',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Online Registration Forms',
      description: 'Custom registration forms with waivers, age filters, and automated approval workflows.',
      icon: '📝',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Payment Processing',
      description: 'Secure Stripe integration for payments, subscriptions, and automated invoice generation.',
      icon: '💳',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Media & Files',
      description: 'Upload and manage images, documents, and match highlights with secure cloud storage.',
      icon: '📁',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Public Club/Team Pages',
      description: 'SEO-ready public pages showcasing schedules, rosters, and statistics.',
      icon: '🌐',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Sports Organization
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From player registration to tournament management, our comprehensive platform 
            provides all the tools you need to run a successful sports organization.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Sports Organization?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of sports organizations that trust KP5 Academy to manage their operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                Start Free Trial
                <span className="ml-2">→</span>
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl hover:border-gray-300 transform hover:-translate-y-1 transition-all duration-200">
                Schedule Demo
                <span className="ml-2">📞</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 