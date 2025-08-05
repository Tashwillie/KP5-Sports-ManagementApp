'use client';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Sports Organization?
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of sports organizations that trust KP5 Academy to streamline their operations, 
            enhance communication, and grow their communities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Free Trial</h3>
              <p className="text-blue-100">No credit card required. Get started in minutes.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-semibold text-white mb-2">Schedule Demo</h3>
              <p className="text-blue-100">See KP5 Academy in action with a personalized demo.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-2">Contact Sales</h3>
              <p className="text-blue-100">Talk to our team about enterprise solutions.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
              Start Free Trial
              <span className="ml-2">→</span>
            </button>
            
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-200">
              Schedule Demo
              <span className="ml-2">📅</span>
            </button>
            
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-200">
              Contact Sales
              <span className="ml-2">📧</span>
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              What's Included in Your Free Trial?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Full Feature Access</h4>
                  <p className="text-blue-100 text-sm">All features available for 14 days</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Unlimited Users</h4>
                  <p className="text-blue-100 text-sm">Add as many team members as you need</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">Data Migration</h4>
                  <p className="text-blue-100 text-sm">Free help importing your existing data</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <div>
                  <h4 className="font-semibold text-white mb-1">24/7 Support</h4>
                  <p className="text-blue-100 text-sm">Get help whenever you need it</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-blue-100 mb-4">
              Trusted by sports organizations worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-white font-semibold">⚽ Elite Soccer Academy</div>
              <div className="text-white font-semibold">🏀 Champions Basketball</div>
              <div className="text-white font-semibold">🏈 Premier Athletics</div>
              <div className="text-white font-semibold">⚾ Future Stars FC</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 