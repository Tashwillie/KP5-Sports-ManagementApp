'use client';

import React from 'react';
import { PermissionBasedUI, withPermission } from '@/components/ui/PermissionBasedUI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  Trophy, 
  Target, 
  BarChart3, 
  Settings,
  Shield,
  AlertTriangle
} from 'lucide-react';

// Example components that will be wrapped with permissions
const UserManagementSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        User Management
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">
        This section is only visible to users with user management permissions.
      </p>
      <div className="space-y-3">
        <Button variant="outline" className="w-full">
          View All Users
        </Button>
        <Button variant="outline" className="w-full">
          Create New User
        </Button>
        <Button variant="outline" className="w-full">
          Manage Roles
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ClubManagementSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Building className="w-5 h-5" />
        Club Management
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">
        This section is only visible to users with club management permissions.
      </p>
      <div className="space-y-3">
        <Button variant="outline" className="w-full">
          View Clubs
        </Button>
        <Button variant="outline" className="w-full">
          Manage Members
        </Button>
        <Button variant="outline" className="w-full">
          Club Settings
        </Button>
      </div>
    </CardContent>
  </Card>
);

const TournamentSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        Tournament Management
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">
        This section is only visible to users with tournament permissions.
      </p>
      <div className="space-y-3">
        <Button variant="outline" className="w-full">
          View Tournaments
        </Button>
        <Button variant="outline" className="w-full">
          Create Tournament
        </Button>
        <Button variant="outline" className="w-full">
          Manage Brackets
        </Button>
      </div>
    </CardContent>
  </Card>
);

const AnalyticsSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Analytics Dashboard
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">
        This section is only visible to users with analytics permissions.
      </p>
      <div className="space-y-3">
        <Button variant="outline" className="w-full">
          View Reports
        </Button>
        <Button variant="outline" className="w-full">
          Export Data
        </Button>
        <Button variant="outline" className="w-full">
          Performance Metrics
        </Button>
      </div>
    </CardContent>
  </Card>
);

const SystemSection = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        System Administration
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">
        This section is only visible to users with system permissions.
      </p>
      <div className="space-y-3">
        <Button variant="outline" className="w-full">
          System Health
        </Button>
        <Button variant="outline" className="w-full">
          Backup & Restore
        </Button>
        <Button variant="outline" className="w-full">
          Logs & Monitoring
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Wrap components with permission requirements
const ProtectedUserManagement = withPermission(UserManagementSection, 'users.view');
const ProtectedClubManagement = withPermission(ClubManagementSection, 'clubs.view');
const ProtectedTournamentSection = withPermission(TournamentSection, 'tournaments.view');
const ProtectedAnalyticsSection = withPermission(AnalyticsSection, 'analytics.view');
const ProtectedSystemSection = withPermission(SystemSection, 'system.view');

export default function PermissionUIDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Permission-Based UI Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This page demonstrates advanced permission-based UI rendering using the{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">useEnhancedPermissions</code> hook.
            Components are conditionally rendered based on user permissions and roles.
          </p>
        </div>

        {/* Permission Status Overview */}
        <div className="mb-8">
          <PermissionBasedUI />
        </div>

        {/* Permission-Protected Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProtectedUserManagement />
          <ProtectedClubManagement />
          <ProtectedTournamentSection />
          <ProtectedAnalyticsSection />
        </div>

        {/* System Section - Full Width */}
        <div className="mb-8">
          <ProtectedSystemSection />
        </div>

        {/* Advanced Permission Examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Advanced Permission Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conditional Content Based on Multiple Permissions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Multi-Permission Content</h3>
                <div className="space-y-3">
                  <PermissionBasedUI>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Advanced User Management</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        This content is only visible to users with multiple permissions.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="default">Full Access</Badge>
                        <Badge variant="secondary">Multi-Permission</Badge>
                      </div>
                    </div>
                  </PermissionBasedUI>
                </div>
              </div>

              {/* Role-Specific Content */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Role-Specific Features</h3>
                <div className="space-y-3">
                  <PermissionBasedUI>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">Role-Based Dashboard</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Content tailored to your specific role and permissions.
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline">Role-Based</Badge>
                        <Badge variant="outline">Dynamic</Badge>
                      </div>
                    </div>
                  </PermissionBasedUI>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Implementation Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3>How to Use Permission-Based UI</h3>
              
              <h4>1. Basic Permission Checks</h4>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`const { can, isLoading, error } = useEnhancedPermissions();

if (can('users.view')) {
  return <UserManagementComponent />;
}`}
              </pre>

              <h4>2. Higher-Order Component Pattern</h4>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`const ProtectedComponent = withPermission(
  MyComponent, 
  'users.edit',
  <AccessDeniedFallback />
);

// Usage
<ProtectedComponent />`}
              </pre>

              <h4>3. Role-Based Rendering</h4>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`const { isSuperAdmin, isClubAdmin, isCoach } = useEnhancedPermissions();

{isSuperAdmin && <SuperAdminPanel />}
{isClubAdmin && <ClubAdminPanel />}
{isCoach && <CoachPanel />}`}
              </pre>

              <h4>4. Advanced Permission Combinations</h4>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`const { canAll, canAny } = useEnhancedPermissions();

// Check if user has ALL permissions
if (canAll(['users.view', 'users.edit', 'users.delete'])) {
  return <FullAccessComponent />;
}

// Check if user has ANY of the permissions
if (canAny(['users.view', 'clubs.view'])) {
  return <PartialAccessComponent />;
}`}
              </pre>

              <h4>5. Backend Integration</h4>
              <p>
                The <code>useEnhancedPermissions</code> hook automatically syncs with your backend
                permission system and falls back to frontend logic if the backend is unavailable.
                This ensures your UI always has the most up-to-date permission information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
