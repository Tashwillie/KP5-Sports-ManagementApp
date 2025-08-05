'use client';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Club Director',
      organization: 'Elite Soccer Academy',
      content: 'KP5 Academy has transformed how we manage our soccer club. The scheduling features alone have saved us hours every week, and our parents love the real-time updates.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Mike Rodriguez',
      role: 'Head Coach',
      organization: 'Champions Basketball',
      content: 'The player management system is incredible. I can track stats, manage rosters, and communicate with parents all in one place. It\'s made my job so much easier.',
      avatar: '👨‍💼',
      rating: 5
    },
    {
      name: 'Jennifer Chen',
      role: 'League Administrator',
      organization: 'Youth Sports League',
      content: 'Running tournaments used to be a nightmare. Now with KP5 Academy, everything is automated from registration to bracket generation. Our league has grown 40% since switching.',
      avatar: '👩‍💻',
      rating: 5
    },
    {
      name: 'David Thompson',
      role: 'Club President',
      organization: 'Premier Athletics',
      content: 'The payment processing and registration forms have streamlined our entire operation. We\'ve reduced administrative overhead by 60% while improving parent satisfaction.',
      avatar: '👨‍💼',
      rating: 5
    },
    {
      name: 'Lisa Martinez',
      role: 'Team Manager',
      organization: 'Future Stars FC',
      content: 'Communication between coaches, players, and parents has never been better. The messaging system and announcements keep everyone informed and engaged.',
      avatar: '👩‍💼',
      rating: 5
    },
    {
      name: 'Robert Kim',
      role: 'Sports Director',
      organization: 'Community Recreation Center',
      content: 'We manage multiple sports programs and KP5 Academy handles everything seamlessly. The role-based access control ensures everyone has the right permissions.',
      avatar: '👨‍💼',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Sports Organizations Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what coaches, administrators, and sports directors are saying about KP5 Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-blue-600">{testimonial.organization}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>

              <blockquote className="text-gray-700 leading-relaxed italic">
                "{testimonial.content}"
              </blockquote>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join the Success Stories
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Start your free trial today and see how KP5 Academy can transform your sports organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                Start Free Trial
                <span className="ml-2">→</span>
              </button>
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl hover:border-gray-300 transform hover:-translate-y-1 transition-all duration-200">
                View More Reviews
                <span className="ml-2">📝</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 