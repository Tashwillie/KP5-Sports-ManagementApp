'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export function HeroBanner() {
  return (
    <section className="relative bg-white text-black">
      {/* Navigation Bar - Now at the top */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>

            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center space-x-10">
              <Link href="/clubs" className="text-gray-700 hover:text-primary-500 transition-colors duration-200 font-medium">
                Clubs
              </Link>
              <Link href="/tournaments" className="text-gray-700 hover:text-primary-500 transition-colors duration-200 font-medium">
                Tournaments
              </Link>
              <Link href="/schedules" className="text-gray-700 hover:text-primary-500 transition-colors duration-200 font-medium">
                Schedules
              </Link>
              <Link href="/analytics" className="text-gray-700 hover:text-primary-500 transition-colors duration-200 font-medium">
                Analytics
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-500 transition-colors duration-200 font-medium">
                Pricing
              </Link>
            </div>

            {/* Mobile Menu Icon */}
            <div className="md:hidden flex items-center">
              <button className="flex flex-col space-y-1 p-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </button>
            </div>

            {/* Right Side - Sign In Button */}
            <div className="flex items-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-primary-500 text-primary-500 bg-white rounded-lg hover:bg-primary-50 transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative h-[700px] overflow-hidden bg-white">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="absolute inset-0 bg-white bg-opacity-90"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Main Content */}
              <div className="text-black">
                <div className="text-sm font-semibold text-blue-600 mb-4 tracking-wider uppercase">
                  Welcome to
                </div>
                <h1 className="text-6xl lg:text-8xl font-bold mb-6 leading-tight text-black">
                  KP5 Academy
                </h1>
                <h2 className="text-2xl lg:text-3xl font-light mb-8 text-gray-700 leading-relaxed">
                  Sports Management System
                </h2>
                <p className="text-lg lg:text-xl mb-10 text-gray-600 leading-relaxed max-w-lg">
                  Revolutionizing sports management with cutting-edge technology. 
                  Manage clubs, teams, tournaments, and players with unprecedented ease.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-blue-500"
                  >
                    Get Started Free
                    <span className="ml-3">→</span>
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
                  >
                    Watch Demo
                    <span className="ml-3">▶</span>
                  </Link>
                </div>
              </div>

              {/* Right Side - Announcement */}
              <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
                <div className="text-black">
                  <div className="text-sm font-semibold text-blue-600 mb-3 tracking-wider uppercase">Official Announcement</div>
                  <h3 className="text-3xl font-bold mb-4 text-black">New Tournament Management Features</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Introducing advanced tournament brackets, live scoring, and real-time match data entry. 
                    Experience the future of sports management.
                  </p>
                  <Link
                    href="/features/tournaments"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 font-semibold"
                  >
                    Learn More
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 