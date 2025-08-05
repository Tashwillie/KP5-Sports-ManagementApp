import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/providers/AuthProvider';
import { ApiProvider } from './src/providers/ApiProvider';
import './src/styles/global.css';

// Auth Screens
import SplashScreen from './src/screens/SplashScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ClubListScreen from './src/screens/ClubListScreen';
import CreateClubScreen from './src/screens/CreateClubScreen';
import PlayerListScreen from './src/screens/PlayerListScreen';
import PlayerDetailsScreen from './src/screens/PlayerDetailsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import EventListScreen from './src/screens/EventListScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import TournamentListScreen from './src/screens/TournamentListScreen';
import TournamentDetailsScreen from './src/screens/TournamentDetailsScreen';
import LiveMatchScreen from './src/screens/LiveMatchScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import RegistrationFormsScreen from './src/screens/RegistrationFormsScreen';
import RegistrationFormScreen from './src/screens/RegistrationFormScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import SubscriptionsScreen from './src/screens/SubscriptionsScreen';
import MediaLibraryScreen from './src/screens/MediaLibraryScreen';
import MediaViewerScreen from './src/screens/MediaViewerScreen';

// New Screens
import TeamListScreen from './src/screens/TeamListScreen';
import MatchListScreen from './src/screens/MatchListScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Sub-screens
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import LinkedAccountsScreen from './src/screens/LinkedAccountsScreen';
import ProfileVisibilityScreen from './src/screens/ProfileVisibilityScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import AboutScreen from './src/screens/AboutScreen';
import CreateTeamScreen from './src/screens/CreateTeamScreen';
import CreateMatchScreen from './src/screens/CreateMatchScreen';
import TeamDetailsScreen from './src/screens/TeamDetailsScreen';
import MatchDetailsScreen from './src/screens/MatchDetailsScreen';
import EditTeamScreen from './src/screens/EditTeamScreen';
import PhotoUploadScreen from './src/screens/PhotoUploadScreen';
import PushNotificationSettingsScreen from './src/screens/PushNotificationSettingsScreen';

// Admin Screens
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import UserManagementScreen from './src/screens/UserManagementScreen';
import ClubManagementScreen from './src/screens/ClubManagementScreen';
import SystemSettingsScreen from './src/screens/SystemSettingsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import AuditLogsScreen from './src/screens/AuditLogsScreen';
import BackupsScreen from './src/screens/BackupsScreen';

// Public Screens
import PublicSearchScreen from './src/screens/PublicSearchScreen';
import PublicClubProfileScreen from './src/screens/PublicClubProfileScreen';
import PublicTeamProfileScreen from './src/screens/PublicTeamProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Teams') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'football' : 'football-outline';
          } else if (route.name === 'Clubs') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Tournaments') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Teams" component={TeamStack} />
      <Tab.Screen name="Matches" component={MatchStack} />
      <Tab.Screen name="Clubs" component={ClubStack} />
      <Tab.Screen name="Tournaments" component={TournamentStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

function TeamStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TeamList" 
        component={TeamListScreen} 
        options={{ title: 'Teams' }} 
      />
      <Stack.Screen 
        name="CreateTeam" 
        component={CreateTeamScreen} 
        options={{ 
          presentation: 'modal',
          title: 'Create Team' 
        }} 
      />
      <Stack.Screen 
        name="TeamDetails" 
        component={TeamDetailsScreen} 
        options={{ title: 'Team Details' }} 
      />
      <Stack.Screen 
        name="EditTeam" 
        component={EditTeamScreen} 
        options={{ title: 'Edit Team' }} 
      />
    </Stack.Navigator>
  );
}

function MatchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MatchList" 
        component={MatchListScreen} 
        options={{ title: 'Matches' }} 
      />
      <Stack.Screen 
        name="CreateMatch" 
        component={CreateMatchScreen} 
        options={{ 
          presentation: 'modal',
          title: 'Create Match' 
        }} 
      />
      <Stack.Screen 
        name="MatchDetails" 
        component={MatchDetailsScreen} 
        options={{ title: 'Match Details' }} 
      />
      <Stack.Screen 
        name="LiveMatch" 
        component={LiveMatchScreen} 
        options={{ title: 'Live Match' }} 
      />
    </Stack.Navigator>
  );
}

function ClubStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ClubList" 
        component={ClubListScreen} 
        options={{ title: 'Clubs' }} 
      />
      <Stack.Screen 
        name="CreateClub" 
        component={CreateClubScreen} 
        options={{ 
          presentation: 'modal',
          title: 'Create Club' 
        }} 
      />
    </Stack.Navigator>
  );
}

function TournamentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TournamentList" 
        component={TournamentListScreen} 
        options={{ title: 'Tournaments' }} 
      />
      <Stack.Screen 
        name="TournamentDetails" 
        component={TournamentDetailsScreen} 
        options={{ title: 'Tournament Details' }} 
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: 'Change Password' }} 
      />
      <Stack.Screen 
        name="LinkedAccounts" 
        component={LinkedAccountsScreen} 
        options={{ title: 'Linked Accounts' }} 
      />
      <Stack.Screen 
        name="ProfileVisibility" 
        component={ProfileVisibilityScreen} 
        options={{ title: 'Profile Visibility' }} 
      />
      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen} 
        options={{ title: 'Help & Support' }} 
      />
      <Stack.Screen 
        name="Feedback" 
        component={FeedbackScreen} 
        options={{ title: 'Send Feedback' }} 
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About' }} 
      />
      <Stack.Screen 
        name="PhotoUpload" 
        component={PhotoUploadScreen} 
        options={{ title: 'Photo Upload' }} 
      />
      <Stack.Screen 
        name="PushNotificationSettings" 
        component={PushNotificationSettingsScreen} 
        options={{ title: 'Push Notifications' }} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }} 
      />
      <Stack.Screen 
        name="PlayerList" 
        component={PlayerListScreen} 
        options={{ title: 'Players' }} 
      />
      <Stack.Screen 
        name="PlayerDetails" 
        component={PlayerDetailsScreen} 
        options={{ title: 'Player Details' }} 
      />
      <Stack.Screen 
        name="EventList" 
        component={EventListScreen} 
        options={{ title: 'Events' }} 
      />
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen} 
        options={{ 
          presentation: 'modal',
          title: 'Create Event' 
        }} 
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen} 
        options={{ title: 'Event Details' }} 
      />
      <Stack.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ title: 'Calendar' }} 
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ title: 'Admin Dashboard' }} 
      />
      <Stack.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{ title: 'User Management' }} 
      />
      <Stack.Screen 
        name="ClubManagement" 
        component={ClubManagementScreen} 
        options={{ title: 'Club Management' }} 
      />
      <Stack.Screen 
        name="SystemSettings" 
        component={SystemSettingsScreen} 
        options={{ title: 'System Settings' }} 
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ title: 'Reports' }} 
      />
      <Stack.Screen 
        name="AuditLogs" 
        component={AuditLogsScreen} 
        options={{ title: 'Audit Logs' }} 
      />
      <Stack.Screen 
        name="Backups" 
        component={BackupsScreen} 
        options={{ title: 'Backups' }} 
      />
      <Stack.Screen 
        name="CreateUser" 
        component={UserManagementScreen} 
        options={{ 
          presentation: 'modal',
          title: 'Create User' 
        }} 
      />
      <Stack.Screen 
        name="EditUser" 
        component={UserManagementScreen} 
        options={{ title: 'Edit User' }} 
      />
      <Stack.Screen 
        name="CreateClub" 
        component={ClubManagementScreen} 
        options={{ 
          presentation: 'modal',
          title: 'Create Club' 
        }} 
      />
      <Stack.Screen 
        name="EditClub" 
        component={ClubManagementScreen} 
        options={{ title: 'Edit Club' }} 
      />
      <Stack.Screen 
        name="EditReport" 
        component={ReportsScreen} 
        options={{ title: 'Edit Report' }} 
      />
      <Stack.Screen 
        name="AdminSettings" 
        component={SystemSettingsScreen} 
        options={{ title: 'Admin Settings' }} 
      />
      <Stack.Screen 
        name="SystemHealth" 
        component={AdminDashboardScreen} 
        options={{ title: 'System Health' }} 
      />
      <Stack.Screen 
        name="FinancialReports" 
        component={ReportsScreen} 
        options={{ title: 'Financial Reports' }} 
      />
    </Stack.Navigator>
  );
}

function CommunicationStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Announcements' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

function RegistrationStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RegistrationForms" component={RegistrationFormsScreen} options={{ title: 'Registration Forms' }} />
      <Stack.Screen name="RegistrationForm" component={RegistrationFormScreen} options={{ title: 'Registration' }} />
    </Stack.Navigator>
  );
}

function PaymentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'Invoices' }} />
      <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ title: 'Subscriptions' }} />
    </Stack.Navigator>
  );
}

function MediaStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MediaLibrary" component={MediaLibraryScreen} options={{ title: 'Media Library' }} />
      <Stack.Screen name="MediaViewer" component={MediaViewerScreen} options={{ title: 'Media Viewer' }} />
    </Stack.Navigator>
  );
}

function PublicStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PublicSearch" component={PublicSearchScreen} options={{ title: 'Search' }} />
      <Stack.Screen name="PublicClubProfile" component={PublicClubProfileScreen} options={{ title: 'Club Profile' }} />
      <Stack.Screen name="PublicTeamProfile" component={PublicTeamProfileScreen} options={{ title: 'Team Profile' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Public" component={PublicStack} />
            <Stack.Screen name="Admin" component={AdminStack} />
            <Stack.Screen name="Communication" component={CommunicationStack} />
            <Stack.Screen name="Registration" component={RegistrationStack} />
            <Stack.Screen name="Payments" component={PaymentsStack} />
            <Stack.Screen name="Media" component={MediaStack} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ApiProvider>
  );
} 