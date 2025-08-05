import React from 'react';
import { View, Text, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { tw } from '../utils/tailwind';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useMobileAuth } from '../hooks/useMobileApi';
import { useMobileEvents, useMobileTournaments } from '../hooks/useMobileApi';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, loading: authLoading } = useMobileAuth();
  
  // Fetch today's events
  const { data: todayEvents, loading: eventsLoading, refetch: refetchEvents } = useMobileEvents([
    { field: 'startDate', operator: '>=', value: new Date() },
    { field: 'startDate', operator: '<=', value: new Date(Date.now() + 24 * 60 * 60 * 1000) }
  ]);

  // Fetch active tournaments
  const { data: activeTournaments, loading: tournamentsLoading, refetch: refetchTournaments } = useMobileTournaments([
    { field: 'status', operator: '==', value: 'in_progress' }
  ]);

  const isLoading = authLoading || eventsLoading || tournamentsLoading;

  const handleRefresh = () => {
    refetchEvents();
    refetchTournaments();
  };

  const getActiveMatchesCount = () => {
    if (!todayEvents) return 0;
    return todayEvents.filter(event => event.type === 'game' && event.status === 'in_progress').length;
  };

  const getTeamsPlayingCount = () => {
    if (!todayEvents) return 0;
    const gameEvents = todayEvents.filter(event => event.type === 'game');
    const uniqueTeams = new Set();
    gameEvents.forEach(event => {
      event.teamIds?.forEach(teamId => uniqueTeams.add(teamId));
    });
    return uniqueTeams.size;
  };

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-50')}>
      <ScrollView 
        style={tw('flex-1')} 
        contentContainerStyle={tw('p-4')}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-3xl font-bold text-gray-900 mb-2')}>
            Welcome back, {user?.displayName || 'User'}!
          </Text>
          <Text style={tw('text-gray-600')}>
            Your comprehensive sports management platform
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-xl font-semibold text-gray-900 mb-4')}>
            Quick Actions
          </Text>
          <View style={tw('flex-row flex-wrap gap-3')}>
            <Button
              title="View Matches"
              onPress={() => navigation.navigate('Tournaments' as never)}
              variant="primary"
              size="md"
            />
            <Button
              title="Create Event"
              onPress={() => navigation.navigate('CreateEvent' as never)}
              variant="secondary"
              size="md"
            />
            <Button
              title="Manage Team"
              onPress={() => navigation.navigate('Clubs' as never)}
              variant="outline"
              size="md"
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-xl font-semibold text-gray-900 mb-4')}>
            Today's Overview
          </Text>
          <View style={tw('flex-row gap-3')}>
            <Card style={tw('flex-1')}>
              <Text style={tw('text-2xl font-bold text-primary-600')}>
                {getActiveMatchesCount()}
              </Text>
              <Text style={tw('text-sm text-gray-600')}>Active Matches</Text>
            </Card>
            <Card style={tw('flex-1')}>
              <Text style={tw('text-2xl font-bold text-success-600')}>
                {getTeamsPlayingCount()}
              </Text>
              <Text style={tw('text-sm text-gray-600')}>Teams Playing</Text>
            </Card>
          </View>
        </View>

        {/* Today's Events */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-xl font-semibold text-gray-900 mb-4')}>
            Today's Events
          </Text>
          {todayEvents && todayEvents.length > 0 ? (
            todayEvents.slice(0, 3).map((event, index) => (
              <Card key={event.id || index} style={tw('mb-3')}>
                <View style={tw('flex-row items-center justify-between mb-2')}>
                  <Text style={tw('font-semibold text-gray-900')}>
                    {event.title}
                  </Text>
                  <Badge 
                    variant={event.status === 'completed' ? 'success' : event.status === 'in_progress' ? 'warning' : 'default'} 
                    size="sm"
                  >
                    {event.status}
                  </Badge>
                </View>
                <Text style={tw('text-gray-600 mb-2')}>
                  {event.description || `${event.type} event`}
                </Text>
                <Text style={tw('text-xs text-gray-500')}>
                  {new Date(event.startDate).toLocaleTimeString()}
                </Text>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={tw('text-gray-600 text-center py-4')}>
                No events scheduled for today
              </Text>
            </Card>
          )}
        </View>

        {/* Active Tournaments */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-xl font-semibold text-gray-900 mb-4')}>
            Active Tournaments
          </Text>
          {activeTournaments && activeTournaments.length > 0 ? (
            activeTournaments.slice(0, 2).map((tournament, index) => (
              <Card key={tournament.id || index} style={tw('mb-3')}>
                <View style={tw('flex-row items-center justify-between mb-2')}>
                  <Text style={tw('font-semibold text-gray-900')}>
                    {tournament.name}
                  </Text>
                  <Badge variant="warning" size="sm">
                    Active
                  </Badge>
                </View>
                <Text style={tw('text-gray-600 mb-2')}>
                  {tournament.description || 'Tournament in progress'}
                </Text>
                <Text style={tw('text-xs text-gray-500')}>
                  {tournament.teams?.length || 0} teams participating
                </Text>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={tw('text-gray-600 text-center py-4')}>
                No active tournaments
              </Text>
            </Card>
          )}
        </View>

        {/* Sports Categories */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-xl font-semibold text-gray-900 mb-4')}>
            Sports Categories
          </Text>
          <View style={tw('flex-row flex-wrap gap-2')}>
            <Badge variant="default" size="lg">Soccer</Badge>
            <Badge variant="secondary" size="lg">Basketball</Badge>
            <Badge variant="success" size="lg">Tennis</Badge>
            <Badge variant="warning" size="lg">Swimming</Badge>
            <Badge variant="error" size="lg">Track</Badge>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 