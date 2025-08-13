'use client';

import React from 'react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  Building, 
  Trophy, 
  Target, 
  BarChart3, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface PermissionBasedUIProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionBasedUI: React.FC<PermissionBasedUIProps> = ({ 
  children, 
  fallback 
}) => {
  const { 
    can,
    canAny,
    canAll,
    isSuperAdmin,
    isClubAdmin,
    isCoach,
    isPlayer,
    isReferee,
    isParent,
    backendPermissions,
    isLoading,
    error,
    userRole,
    roleDescription
  } = useEnhancedPermissions();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Failed to load permissions</p>
        </div>
      </div>
    );
  }

  // Show fallback if no permissions
  if (!can('profile.view_own')) {
    return fallback || (
      <div className="text-center p-8">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No permissions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Status Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permission Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-semibold">{userRole}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Level</p>
              <p className="font-semibold">{roleDescription}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Backend Sync</p>
              <div className="flex items-center justify-center">
                {backendPermissions ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {can('users.view') && (
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-xs">Users</span>
              </Button>
            )}
            
            {can('clubs.view') && (
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Building className="w-5 h-5" />
                <span className="text-xs">Clubs</span>
              </Button>
            )}
            
            {can('tournaments.view') && (
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="text-xs">Tournaments</span>
              </Button>
            )}
            
            {can('analytics.view') && (
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs">Analytics</span>
              </Button>
            )}
            
            {can('system.view') && (
              <Button variant="outline" className="h-auto p-3 flex flex-col items-center gap-2">
                <Settings className="w-5 h-5" />
                <span className="text-xs">System</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Permission Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Multiple permission check */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">User Management</p>
                <p className="text-sm text-gray-600">Create, edit, and delete users</p>
              </div>
              <div className="flex gap-2">
                {canAll(['users.view', 'users.create', 'users.edit']) && (
                  <Badge variant="default">Full Access</Badge>
                )}
                {canAny(['users.view', 'users.create', 'users.edit']) && !canAll(['users.view', 'users.create', 'users.edit']) && (
                  <Badge variant="secondary">Partial Access</Badge>
                )}
                {!canAny(['users.view', 'users.create', 'users.edit']) && (
                  <Badge variant="destructive">No Access</Badge>
                )}
              </div>
            </div>

            {/* Club management permissions */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Club Management</p>
                <p className="text-sm text-gray-600">Manage clubs and members</p>
              </div>
              <div className="flex gap-2">
                {can('clubs.manage_members') && (
                  <Badge variant="default">Manage Members</Badge>
                )}
                {can('clubs.edit') && (
                  <Badge variant="secondary">Edit Club</Badge>
                )}
                {can('clubs.view') && (
                  <Badge variant="outline">View Only</Badge>
                )}
              </div>
            </div>

            {/* Match management permissions */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Match Management</p>
                <p className="text-sm text-gray-600">Live tracking and event management</p>
              </div>
              <div className="flex gap-2">
                {can('matches.live_tracking') && (
                  <Badge variant="default">Live Tracking</Badge>
                )}
                {can('matches.manage_events') && (
                  <Badge variant="secondary">Manage Events</Badge>
                )}
                {can('matches.view') && (
                  <Badge variant="outline">View Only</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Features */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Specific Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isSuperAdmin && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Shield className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Super Admin Access</p>
                  <p className="text-sm text-red-700">Full system access with all permissions</p>
                </div>
              </div>
            )}

            {isClubAdmin && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Club Admin Access</p>
                  <p className="text-sm text-blue-700">Manage clubs, teams, and members</p>
                </div>
              </div>
            )}

            {isCoach && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Coach Access</p>
                  <p className="text-sm text-green-700">Manage teams and player development</p>
                </div>
              </div>
            )}

            {isPlayer && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Player Access</p>
                  <p className="text-sm text-gray-700">View team info and personal stats</p>
                </div>
              </div>
            )}

            {isReferee && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Shield className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Referee Access</p>
                  <p className="text-sm text-orange-700">Match officiating and event management</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Children content */}
      {children && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Content</CardTitle>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Higher-order component for permission-based rendering
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    const { can, isLoading, error } = useEnhancedPermissions();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Permission check failed</p>
        </div>
      );
    }

    if (!can(requiredPermission)) {
      return fallback || (
        <div className="text-center p-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Access denied</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
