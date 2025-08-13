import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RefereeControlScreen from '../screens/RefereeControlScreen';
import RefereeDashboardScreen from '../screens/RefereeDashboardScreen';

export type RefereeStackParamList = {
  RefereeDashboard: undefined;
  RefereeControl: {
    matchId: string;
    homeTeam: {
      id: string;
      name: string;
      logo?: string;
      color?: string;
    };
    awayTeam: {
      id: string;
      name: string;
      logo?: string;
      color?: string;
    };
    userRole: string;
    userId: string;
  };
};

const Stack = createStackNavigator<RefereeStackParamList>();

export default function RefereeStack() {
  return (
    <Stack.Navigator
      initialRouteName="RefereeDashboard"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F3F4F6' },
      }}
    >
      <Stack.Screen name="RefereeDashboard" component={RefereeDashboardScreen} />
      <Stack.Screen name="RefereeControl" component={RefereeControlScreen} />
    </Stack.Navigator>
  );
}
