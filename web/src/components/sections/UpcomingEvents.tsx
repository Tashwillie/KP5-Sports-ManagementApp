'use client';

import Link from 'next/link';
import { useState } from 'react';

const upcomingEvents = [
  {
    id: 1,
    title: "Spring Championship 2024",
    type: "Tournament",
    date: "March 15, 2024",
    time: "9:00 AM",
    venue: "Central Sports Complex",
    status: "Registration Open",
    teams: "16 Teams"
  },
  {
    id: 2,
    title: "Youth League Finals",
    type: "Championship",
    date: "March 22, 2024",
    time: "2:00 PM",
    venue: "Regional Stadium",
    status: "Registration Open",
    teams: "8 Teams"
  },
  {
    id: 3,
    title: "Summer Cup Qualifiers",
    type: "Qualifier",
    date: "April 5, 2024",
    time: "10:00 AM",
    venue: "Community Center",
    status: "Registration Open",
    teams: "32 Teams"
  },
  {
    id: 4,
    title: "Elite Division Playoffs",
    type: "Playoff",
    date: "April 12, 2024",
    time: "7:00 PM",
    venue: "National Arena",
    status: "Registration Open",
    teams: "4 Teams"
  },
  {
    id: 5,
    title: "International Friendly",
    type: "Friendly",
    date: "April 20, 2024",
    time: "3:00 PM",
    venue: "International Stadium",
    status: "Registration Open",
    teams: "2 Teams"
  },
  {
    id: 6,
    title: "Championship Series",
    type: "Series",
    date: "May 1, 2024",
    time: "6:00 PM",
    venue: "Championship Arena",
    status: "Registration Open",
    teams: "12 Teams"
  }
];

export function UpcomingEvents() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <section className="py-20 bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-16">
          <div>
            <h2 className="text-5xl font-bold text-black mb-6">Upcoming Events</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join exciting tournaments and championships. Register your team today!
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center space-x-4 mt-8 lg:mt-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                activeTab === 'tournaments'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tournaments
            </button>
            <button
              onClick={() => setActiveTab('championships')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                activeTab === 'championships'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Championships
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {upcomingEvents.map((event, index) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Event Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold bg-white/20 px-4 py-2 rounded-full tracking-wider uppercase">
                    {event.type}
                  </span>
                  <span className="text-sm font-semibold bg-green-500 px-4 py-2 rounded-full">
                    {event.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3 leading-tight">{event.title}</h3>
                <p className="text-blue-100 text-lg">{event.teams}</p>
              </div>

              {/* Event Details */}
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 font-medium">{event.venue}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex space-x-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/events/${event.id}/register`}
                    className="flex-1 bg-green-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Events Button */}
        <div className="text-center mt-16">
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-blue-500"
          >
            View All Events
            <span className="ml-3">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
} 