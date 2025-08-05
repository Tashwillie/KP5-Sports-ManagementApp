'use client';

import Link from 'next/link';

const newsItems = [
  {
    id: 1,
    title: "New Club Management Dashboard Released",
    description: "Enhanced analytics and reporting features for club administrators",
    category: "Product Update",
    image: "/api/placeholder/400/250",
    date: "2024-01-15"
  },
  {
    id: 2,
    title: "Live Match Scoring System Now Available",
    description: "Real-time match data entry and live score updates for referees",
    category: "Feature Launch",
    image: "/api/placeholder/400/250",
    date: "2024-01-14"
  },
  {
    id: 3,
    title: "KP5 Academy Partners with Major Sports Federation",
    description: "Strategic partnership to expand sports management capabilities",
    category: "Partnership",
    image: "/api/placeholder/400/250",
    date: "2024-01-13"
  },
  {
    id: 4,
    title: "Mobile App Update: Enhanced Offline Support",
    description: "Improved offline functionality and data synchronization",
    category: "Mobile Update",
    image: "/api/placeholder/400/250",
    date: "2024-01-12"
  },
  {
    id: 5,
    title: "Tournament Bracket Generator Launched",
    description: "Advanced tournament management with automatic bracket generation",
    category: "New Feature",
    image: "/api/placeholder/400/250",
    date: "2024-01-11"
  },
  {
    id: 6,
    title: "Security Enhancement: Multi-Factor Authentication",
    description: "Enhanced security with MFA for all user accounts",
    category: "Security",
    image: "/api/placeholder/400/250",
    date: "2024-01-10"
  }
];

export function NewsGrid() {
  return (
    <section className="py-20 bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-6">Latest News & Updates</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest features, announcements, and improvements to the KP5 Academy platform.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {newsItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200"
            >
              {/* Image */}
              <div className="relative h-56 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-full tracking-wider uppercase">
                    {item.category}
                  </span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl text-blue-300">📰</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">{item.date}</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                  {item.description}
                </p>
                <Link
                  href={`/news/${item.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 text-lg"
                >
                  Read More
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link
            href="/news"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-blue-500"
          >
            View All News
            <span className="ml-3">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
} 