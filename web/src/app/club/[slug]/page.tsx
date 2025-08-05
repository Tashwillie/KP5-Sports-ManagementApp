'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CalendarIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  UsersIcon,
  TrophyIcon,
  NewspaperIcon,
  PhotoIcon,
  ShareIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  YoutubeIcon 
} from 'lucide-react';
import { PublicClubProfile } from '@kp5-academy/shared';

export default function PublicClubProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [profile, setProfile] = useState<PublicClubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [slug]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      const mockProfile: PublicClubProfile = {
        id: '1',
        clubId: 'club1',
        slug: slug,
        name: 'Elite Soccer Academy',
        description: 'A premier soccer academy dedicated to developing young talent and fostering a love for the beautiful game. We provide comprehensive training programs for players of all skill levels.',
        shortDescription: 'Premier soccer academy for youth development',
        logo: {
          id: '1',
          url: '/api/placeholder/100/100',
          alt: 'Elite Soccer Academy Logo',
          type: 'image',
          size: 1024,
          uploadedAt: new Date(),
        },
        banner: {
          id: '2',
          url: '/api/placeholder/1200/400',
          alt: 'Elite Soccer Academy Banner',
          type: 'image',
          size: 2048,
          uploadedAt: new Date(),
        },
        founded: 2010,
        location: {
          address: {
            street: '123 Soccer Way',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            country: 'USA',
          },
          venue: 'Elite Soccer Complex',
          venueType: 'complex',
          facilities: ['3 Full-size Fields', 'Indoor Training Facility', 'Fitness Center', 'Pro Shop'],
          directions: 'Located off I-55, exit 100. Turn right onto Soccer Way.',
        },
        contact: {
          email: 'info@elitesocceracademy.com',
          phone: '(555) 123-4567',
          website: 'https://elitesocceracademy.com',
          emergencyContact: {
            name: 'John Smith',
            phone: '(555) 987-6543',
            email: 'emergency@elitesocceracademy.com',
          },
          officeHours: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            hours: '9:00 AM - 6:00 PM',
          },
        },
        social: {
          facebook: 'https://facebook.com/elitesocceracademy',
          twitter: 'https://twitter.com/elitesoccer',
          instagram: 'https://instagram.com/elitesocceracademy',
          youtube: 'https://youtube.com/elitesocceracademy',
        },
        stats: {
          totalTeams: 12,
          totalPlayers: 180,
          totalCoaches: 15,
          totalEvents: 45,
          totalTournaments: 8,
          championships: 25,
          seasonsActive: 14,
          averageAttendance: 150,
          socialMediaFollowers: 5000,
          websiteVisits: 15000,
          lastUpdated: new Date(),
        },
        teams: [
          {
            id: '1',
            name: 'U12 Boys Elite',
            slug: 'u12-boys-elite',
            season: '2024 Spring',
            ageGroup: 'U12',
            gender: 'male',
            level: 'elite',
            logo: {
              id: '3',
              url: '/api/placeholder/80/80',
              alt: 'U12 Boys Elite Logo',
              type: 'image',
              size: 512,
              uploadedAt: new Date(),
            },
            stats: { wins: 15, losses: 2, ties: 1, winPercentage: 83.3 },
            isActive: true,
          },
          {
            id: '2',
            name: 'U14 Girls Competitive',
            slug: 'u14-girls-competitive',
            season: '2024 Spring',
            ageGroup: 'U14',
            gender: 'female',
            level: 'competitive',
            logo: {
              id: '4',
              url: '/api/placeholder/80/80',
              alt: 'U14 Girls Competitive Logo',
              type: 'image',
              size: 512,
              uploadedAt: new Date(),
            },
            stats: { wins: 12, losses: 4, ties: 2, winPercentage: 66.7 },
            isActive: true,
          },
        ],
        achievements: [
          {
            id: '1',
            title: 'State Champions 2023',
            description: 'U16 Boys team won the state championship',
            type: 'championship',
            category: 'team',
            date: new Date('2023-06-15'),
            season: '2023 Spring',
            tournament: 'State Cup',
            isHighlighted: true,
          },
          {
            id: '2',
            title: 'Club of the Year 2022',
            description: 'Recognized as the best youth soccer club in the region',
            type: 'award',
            category: 'club',
            date: new Date('2022-12-01'),
            isHighlighted: true,
          },
        ],
        news: [
          {
            id: '1',
            title: 'New Indoor Training Facility Opens',
            content: 'We are excited to announce the opening of our new indoor training facility...',
            excerpt: 'State-of-the-art indoor facility now available for year-round training',
            author: 'Club Staff',
            publishedAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            tags: ['facility', 'training'],
            category: 'announcement',
            isPublished: true,
            isFeatured: true,
            viewCount: 1250,
            slug: 'new-indoor-training-facility',
          },
        ],
        events: [
          {
            id: '1',
            title: 'Spring Tryouts',
            description: 'Open tryouts for all age groups',
            type: 'other',
            startDate: new Date('2024-03-01T09:00:00'),
            endDate: new Date('2024-03-01T17:00:00'),
            location: {
              address: {
                street: '123 Soccer Way',
                city: 'Springfield',
                state: 'IL',
                zipCode: '62701',
                country: 'USA',
              },
              venue: 'Elite Soccer Complex',
              venueType: 'complex',
              facilities: [],
            },
            status: 'scheduled',
            isHome: true,
          },
        ],
        gallery: [
          {
            id: '1',
            url: '/api/placeholder/400/300',
            alt: 'Team celebration',
            type: 'image',
            size: 1024,
            uploadedAt: new Date(),
          },
        ],
        seo: {
          title: 'Elite Soccer Academy - Premier Youth Soccer Club',
          description: 'Join Elite Soccer Academy for premier youth soccer training and development programs.',
          keywords: ['soccer', 'youth soccer', 'academy', 'training', 'Springfield'],
        },
        settings: {
          isPublic: true,
          showRoster: true,
          showStats: true,
          showSchedule: true,
          showNews: true,
          showGallery: true,
          showContact: true,
          allowComments: true,
          allowSharing: true,
          requireAuth: false,
        },
        isActive: true,
        isVerified: true,
        createdAt: new Date('2010-01-01'),
        updatedAt: new Date(),
      };
      
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading club profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.name,
          text: profile?.shortDescription,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleContact = (method: 'email' | 'phone' | 'website') => {
    if (!profile) return;

    switch (method) {
      case 'email':
        window.location.href = `mailto:${profile.contact.email}`;
        break;
      case 'phone':
        window.location.href = `tel:${profile.contact.phone}`;
        break;
      case 'website':
        if (profile.contact.website) {
          window.open(profile.contact.website, '_blank');
        }
        break;
    }
  };

  const handleSocialLink = (platform: string, url?: string) => {
    if (!url) {
      alert(`${platform} link is not available`);
      return;
    }
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading club profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Club Not Found</h1>
          <p className="text-gray-600">The club profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative h-96">
        <Image
          src={profile.banner.url}
          alt={profile.banner.alt}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <button
              onClick={handleShare}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ShareIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Club Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end space-x-6">
            <div className="relative">
              <Image
                src={profile.logo.url}
                alt={profile.logo.alt}
                width={120}
                height={120}
                className="rounded-full border-4 border-white"
              />
              {profile.isVerified && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full">
                  <StarIcon className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
              <p className="text-xl mb-2">{profile.location.address.city}, {profile.location.address.state}</p>
              <p className="text-lg opacity-90">Founded {profile.founded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: 'home' },
              { key: 'teams', label: 'Teams', icon: 'users' },
              { key: 'achievements', label: 'Achievements', icon: 'trophy' },
              { key: 'news', label: 'News', icon: 'newspaper' },
              { key: 'events', label: 'Events', icon: 'calendar' },
              { key: 'gallery', label: 'Gallery', icon: 'photo' },
              { key: 'contact', label: 'Contact', icon: 'phone' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {profile.name}</h2>
              <p className="text-gray-700 leading-relaxed">{profile.description}</p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Club Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{profile.stats.totalTeams}</div>
                  <div className="text-sm text-gray-600">Teams</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{profile.stats.totalPlayers}</div>
                  <div className="text-sm text-gray-600">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{profile.stats.championships}</div>
                  <div className="text-sm text-gray-600">Championships</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{profile.stats.seasonsActive}</div>
                  <div className="text-sm text-gray-600">Seasons</div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location & Facilities</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{profile.location.venue}</h3>
                  <p className="text-gray-700 mb-2">
                    {profile.location.address.street}<br />
                    {profile.location.address.city}, {profile.location.address.state} {profile.location.address.zipCode}
                  </p>
                  {profile.location.directions && (
                    <p className="text-sm text-gray-600 italic">{profile.location.directions}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Facilities</h4>
                  <ul className="space-y-1">
                    {profile.location.facilities.map((facility, index) => (
                      <li key={index} className="text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {facility}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Teams</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team/${team.slug}`}
                  className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={team.logo.url}
                      alt={team.logo.alt}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.season}</p>
                      <p className="text-sm text-gray-600">{team.ageGroup} • {team.gender}</p>
                      <p className="text-sm text-blue-600 font-medium">{team.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {team.stats.wins}-{team.stats.losses}-{team.stats.ties}
                      </p>
                      <p className="text-xs text-gray-600">{team.stats.winPercentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
            <div className="space-y-4">
              {profile.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <TrophyIcon className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <p className="text-gray-700">{achievement.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(achievement.date).toLocaleDateString()}
                      {achievement.tournament && ` • ${achievement.tournament}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest News</h2>
            <div className="space-y-6">
              {profile.news.map((newsItem) => (
                <article key={newsItem.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{newsItem.title}</h3>
                  <p className="text-gray-700 mb-3">{newsItem.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>By {newsItem.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(newsItem.publishedAt).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {profile.events.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {new Date(event.startDate).getDate()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-gray-700">{event.location.venue}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.gallery.map((media) => (
                <div key={media.id} className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src={media.url}
                    alt={media.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <button
                    onClick={() => handleContact('email')}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                    <span>{profile.contact.email}</span>
                  </button>
                  {profile.contact.phone && (
                    <button
                      onClick={() => handleContact('phone')}
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      <span>{profile.contact.phone}</span>
                    </button>
                  )}
                  {profile.contact.website && (
                    <button
                      onClick={() => handleContact('website')}
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <GlobeAltIcon className="w-5 h-5" />
                      <span>{profile.contact.website}</span>
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
                  <p className="text-gray-700">
                    {profile.contact.officeHours?.days.join(', ')}<br />
                    {profile.contact.officeHours?.hours}
                  </p>
                </div>
              </div>
            </div>

            {profile.contact.emergencyContact && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Emergency Contact</h3>
                <p className="text-yellow-700">{profile.contact.emergencyContact.name}</p>
                <p className="text-yellow-700">{profile.contact.emergencyContact.phone}</p>
                {profile.contact.emergencyContact.email && (
                  <p className="text-yellow-700">{profile.contact.emergencyContact.email}</p>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {profile.social.facebook && (
                  <button
                    onClick={() => handleSocialLink('Facebook', profile.social.facebook)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FacebookIcon className="w-6 h-6" />
                  </button>
                )}
                {profile.social.twitter && (
                  <button
                    onClick={() => handleSocialLink('Twitter', profile.social.twitter)}
                    className="text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <TwitterIcon className="w-6 h-6" />
                  </button>
                )}
                {profile.social.instagram && (
                  <button
                    onClick={() => handleSocialLink('Instagram', profile.social.instagram)}
                    className="text-pink-600 hover:text-pink-800 transition-colors"
                  >
                    <InstagramIcon className="w-6 h-6" />
                  </button>
                )}
                {profile.social.youtube && (
                  <button
                    onClick={() => handleSocialLink('YouTube', profile.social.youtube)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <YoutubeIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 