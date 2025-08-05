'use client';

export default function AboutPage() {
  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '500+', label: 'Sports Organizations' },
    { number: '50+', label: 'Countries' },
    { number: '99.9%', label: 'Uptime' },
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We continuously push the boundaries of what\'s possible in sports management technology.',
      icon: '🚀',
    },
    {
      title: 'Community',
      description: 'We believe in the power of sports to bring people together and build stronger communities.',
      icon: '🤝',
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from our product to our customer support.',
      icon: '⭐',
    },
    {
      title: 'Accessibility',
      description: 'We make powerful sports management tools accessible to organizations of all sizes.',
      icon: '♿',
    },
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Former collegiate athlete and sports management professional with 15+ years of experience.',
      image: '/api/placeholder/150/150',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Tech leader with expertise in scalable cloud platforms and mobile applications.',
      image: '/api/placeholder/150/150',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'Product strategist passionate about creating intuitive user experiences for sports organizations.',
      image: '/api/placeholder/150/150',
    },
    {
      name: 'David Thompson',
      role: 'Head of Customer Success',
      bio: 'Former coach who understands the challenges sports organizations face daily.',
      image: '/api/placeholder/150/150',
    },
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Founded',
      description: 'KP5 Academy was founded with a mission to revolutionize sports management.',
    },
    {
      year: '2021',
      title: 'First 100 Users',
      description: 'Reached our first milestone with 100 active sports organizations.',
    },
    {
      year: '2022',
      title: 'Mobile App Launch',
      description: 'Launched our mobile app to provide on-the-go access for coaches and players.',
    },
    {
      year: '2023',
      title: 'International Expansion',
      description: 'Expanded to serve sports organizations in over 50 countries worldwide.',
    },
    {
      year: '2024',
      title: 'AI Integration',
      description: 'Introduced AI-powered features for smarter scheduling and analytics.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About KP5 Academy
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to empower sports organizations with the tools they need to succeed, 
              grow, and create lasting impact in their communities.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Story
            </h2>
          </div>
          
          <div className="prose prose-lg mx-auto text-gray-600">
            <p className="text-xl leading-relaxed mb-6">
              KP5 Academy was born from a simple observation: sports organizations were struggling with 
              outdated, fragmented systems that made it difficult to manage teams, communicate with players 
              and parents, and focus on what matters most - developing athletes and building community.
            </p>
            
            <p className="text-xl leading-relaxed mb-6">
              Our founder, Sarah Johnson, experienced this firsthand as both a collegiate athlete and 
              later as a sports management professional. She saw coaches spending countless hours on 
              administrative tasks instead of coaching, parents missing important updates, and organizations 
              struggling to grow due to inefficient processes.
            </p>
            
            <p className="text-xl leading-relaxed">
              Today, KP5 Academy serves thousands of sports organizations worldwide, helping them streamline 
              operations, improve communication, and focus on their core mission of developing athletes 
              and building stronger communities through sports.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To empower sports organizations with innovative technology that simplifies management, 
                enhances communication, and enables them to focus on developing athletes and building 
                stronger communities through sports.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the global standard for sports management technology, connecting millions of 
                athletes, coaches, and organizations in a unified platform that celebrates the power 
                of sports to transform lives.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
          </div>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {item.year}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              The passionate people behind KP5 Academy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join Us in Revolutionizing Sports Management
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of the future of sports organization management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 