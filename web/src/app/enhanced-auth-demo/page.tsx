'use client';

import React, { useState } from 'react';
import { EnhancedAuthForm } from '@/components/auth/EnhancedAuthForm';
import { UserManagementDashboard } from '@/components/admin/UserManagementDashboard';
import { EnhancedUserProfile } from '@/components/profile/EnhancedUserProfile';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole, ROLE_PERMISSIONS } from '@/lib/permissions/rolePermissions';
import { 
  Shield, 
  Users, 
  User, 
  Lock, 
  Settings, 
  Eye,
  EyeOff,
  Key,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function EnhancedAuthDemoPage() {
  const { userRole, roleDescription, can, isSuperAdmin, isClubAdmin, isCoach } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PLAYER');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'auth-forms', label: 'Auth Forms', icon: Lock },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'user-profile', label: 'User Profile', icon: User },
    { id: 'permissions', label: 'Permissions', icon: Key },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      'SUPER_ADMIN': 'bg-red-100 text-red-800',
      'SYSTEM_ADMIN': 'bg-purple-100 text-purple-800',
      'CLUB_ADMIN': 'bg-blue-100 text-blue-800',
      'COACH': 'bg-green-100 text-green-800',
      'REFEREE': 'bg-orange-100 text-orange-800',
      'PLAYER': 'bg-gray-100 text-gray-800',
      'PARENT': 'bg-pink-100 text-pink-800',
      'MODERATOR': 'bg-yellow-100 text-yellow-800',
      'SUPPORT': 'bg-indigo-100 text-indigo-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Current User Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Current User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Role:</span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(userRole || 'PLAYER')}`}>
                  {userRole || 'Not Assigned'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Role Level:</span>
                <span className="font-medium text-gray-900">
                  {ROLE_PERMISSIONS[userRole as UserRole]?.level || 'individual'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="text-sm text-gray-700 max-w-xs text-right">
                  {roleDescription}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Permissions</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-4 h-4 ${can('users.view') ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm">View Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-4 h-4 ${can('clubs.manage_members') ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm">Manage Club Members</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-4 h-4 ${can('teams.manage_players') ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm">Manage Team Players</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className={`w-4 h-4 ${can('analytics.view') ? 'text-green-500' : 'text-gray-300'}`} />
                <span className="text-sm">View Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Hierarchy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Role Hierarchy & Permissions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(ROLE_PERMISSIONS).map(([role, details]) => (
            <div key={role} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(role as UserRole)}`}>
                  {role.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500 capitalize">{details.level}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{details.description}</p>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Permissions:</span> {details.permissions.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Permission Matrix</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                {Object.keys(ROLE_PERMISSIONS).map(role => (
                  <th key={role} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {role.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                'users.view',
                'users.create',
                'users.edit',
                'clubs.manage_members',
                'teams.manage_players',
                'analytics.view',
                'system.configure'
              ].map(permission => (
                <tr key={permission}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {permission}
                  </td>
                  {Object.keys(ROLE_PERMISSIONS).map(role => (
                    <td key={role} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ROLE_PERMISSIONS[role as UserRole].permissions.includes(permission as any) ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAuthForms = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Authentication Forms</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sign In Form</h3>
            <EnhancedAuthForm mode="signin" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sign Up Form</h3>
            <EnhancedAuthForm mode="signup" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-8">
      {isSuperAdmin || isClubAdmin ? (
        <UserManagementDashboard />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You need Super Admin or Club Admin permissions to access user management.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Current role: {userRole || 'Not assigned'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderUserProfile = () => (
    <div className="space-y-8">
      <EnhancedUserProfile />
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Permission Testing</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test with Different Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.keys(ROLE_PERMISSIONS).map(role => (
              <option key={role} value={role}>{role.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Management Permissions</h3>
            <div className="space-y-3">
              {[
                'users.view',
                'users.create',
                'users.edit',
                'users.delete',
                'users.assign_roles'
              ].map(permission => (
                <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{permission}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ROLE_PERMISSIONS[selectedRole].permissions.includes(permission as any)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ROLE_PERMISSIONS[selectedRole].permissions.includes(permission as any) ? 'Allowed' : 'Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Club Management Permissions</h3>
            <div className="space-y-3">
              {[
                'clubs.view',
                'clubs.create',
                'clubs.edit',
                'clubs.delete',
                'clubs.manage_members'
              ].map(permission => (
                <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{permission}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ROLE_PERMISSIONS[selectedRole].permissions.includes(permission as any)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ROLE_PERMISSIONS[selectedRole].permissions.includes(permission as any) ? 'Allowed' : 'Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Role Information</h4>
          <p className="text-sm text-blue-800">
            <strong>Level:</strong> {ROLE_PERMISSIONS[selectedRole].level} | 
            <strong> Description:</strong> {ROLE_PERMISSIONS[selectedRole].description}
          </p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mb-3">
              Add an extra layer of security to your account
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Enable 2FA
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Password Management</h3>
            <p className="text-sm text-gray-600 mb-3">
              Change your password and manage security settings
            </p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Change Password
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Session Management</h3>
            <p className="text-sm text-gray-600 mb-3">
              View and manage active sessions
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              View Sessions
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Data Export</h3>
            <p className="text-sm text-gray-600 mb-3">
              Download your personal data
            </p>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'auth-forms':
        return renderAuthForms();
      case 'user-management':
        return renderUserManagement();
      case 'user-profile':
        return renderUserProfile();
      case 'permissions':
        return renderPermissions();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Authentication Demo</h1>
            <p className="text-gray-600 mt-2">
              Explore role-based access control, user management, and enhanced security features
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
