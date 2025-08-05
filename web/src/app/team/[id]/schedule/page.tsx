'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventCard } from '@/components/schedule/EventCard';
import { CreateEventForm } from '@/components/schedule/CreateEventForm';
import { Calendar } from '@/components/calendar/Calendar';
import { EventService } from '@/lib/services/eventService';
import { TeamService } from '@/lib/services/teamService';
import { Event, Team } from '../../../../../shared/src/types';
import { useLocalAuth } from '@/hooks/useLocalApi';

export default function TeamSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useLocalAuth();
  const teamId = params.id as string;
  
  const [team, setTeam] = useState<Team | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load team data
      const teamData = await TeamService.getTeam(teamId);
      if (!teamData) {
        setError('Team not found');
        return;
      }
      setTeam(teamData);

      // Load events
      const teamEvents = await EventService.getEventsByTeam(teamId);
      setEvents(teamEvents);
    } catch (error) {
      console.error('Error loading team schedule:', error);
      setError('Failed to load team schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventId: string) => {
    setShowCreateForm(false);
    await loadData(); // Refresh events
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await EventService.deleteEvent(eventId);
      await loadData(); // Refresh events
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleRSVP = async (eventId: string, response: 'accepted' | 'declined' | 'maybe') => {
    if (!user) {
      alert('You must be logged in to RSVP');
      return;
    }

    try {
      await EventService.updateEventParticipant(eventId, user.id, {
        response,
        status: response === 'accepted' ? 'confirmed' : response === 'declined' ? 'declined' : 'maybe',
      });
      // Optionally refresh events or show success message
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to update RSVP');
    }
  };

  const handleEventClick = (event: Event) => {
    // Navigate to event details or open event modal
    console.log('Event clicked:', event);
  };

  const handleDateClick = (date: Date) => {
    // Create new event for selected date
    setShowCreateForm(true);
  };

  const handleTimeSlotClick = (date: Date, hour: number, minute?: number) => {
    // Create new event for selected time slot
    setShowCreateForm(true);
  };

  const handleEventReschedule = async (result: { success: boolean; event: Event; error?: string }) => {
    if (result.success) {
      // Refresh events after successful reschedule
      await loadData();
      
      // Show success message
      console.log('Event rescheduled successfully');
      // You could add a toast notification here
    } else {
      // Show error message
      console.error('Failed to reschedule event:', result.error);
      // You could add a toast notification here
    }
  };

  const canManageEvents = user && (
    user.id === team?.createdBy || 
    user.role === 'super_admin' || 
    team?.roster.managers.includes(user.id)
  );

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || event.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.startDate) > new Date()
  ).slice(0, 5);

  const pastEvents = filteredEvents.filter(event => 
    new Date(event.startDate) <= new Date()
  ).slice(0, 5);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading team schedule...</span>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested team could not be found.'}</p>
          <Button onClick={() => router.push('/teams')}>
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="text-sm"
              >
                ← Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">{team.name} - Schedule</h1>
            </div>
            <p className="text-gray-600">
              Manage your team's events, practices, and games
            </p>
          </div>
          
          <div className="flex gap-2">
            {canManageEvents && (
              <Button onClick={() => setShowCreateForm(true)}>
                Create Event
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push(`/team/${team.id}`)}
            >
              Team Overview
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/team/${team.id}/roster`)}
            >
              Roster
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-blue-100">Total Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {events.filter(e => e.type === 'practice').length}
            </div>
            <div className="text-blue-100">Practices</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {events.filter(e => e.type === 'game').length}
            </div>
            <div className="text-blue-100">Games</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {upcomingEvents.length}
            </div>
            <div className="text-blue-100">Upcoming</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List View
            </button>
          </div>

          {/* Filters for List View */}
          {viewMode === 'list' && (
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="practice">Practice</option>
                <option value="game">Game</option>
                <option value="tournament">Tournament</option>
                <option value="meeting">Meeting</option>
                <option value="tryout">Tryout</option>
                <option value="training">Training</option>
                <option value="scrimmage">Scrimmage</option>
                <option value="team_building">Team Building</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Calendar
          events={filteredEvents}
          defaultView="month"
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onTimeSlotClick={handleTimeSlotClick}
          onEventReschedule={handleEventReschedule}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showActions={canManageEvents}
                    onDelete={canManageEvents ? handleDeleteEvent : undefined}
                    onRSVP={event.requiresRSVP ? handleRSVP : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showActions={canManageEvents}
                    onDelete={canManageEvents ? handleDeleteEvent : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'No events match your search criteria.'
                  : 'This team has no events scheduled yet.'}
              </p>
              {canManageEvents && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Your First Event
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreateEventForm
              teamId={team.id}
              clubId={team.clubId}
              onSuccess={handleCreateEvent}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 