'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Lock,
  Unlock
} from 'lucide-react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import usePermissionsApi from '@/hooks/usePermissionsApi';
import { Permission } from '@/types/permissions';

export default function BackendPermissionsDemoPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPermission, setSelectedPermission] = useState<Permission>('users.view');
  const [testPermissions, setTestPermissions] = useState<Permission[]>([
    'users.view',
    'users.create',
    'clubs.view',
    'teams.edit'
  ]);

  const enhancedPermissions = useEnhancedPermissions();
  const {
    currentUserPermissions,
    permissionSummary,
    availableRoles,
    isLoading,
    error,
    refetch
  } = usePermissionsApi();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'sync', label: 'Synchronization', icon: Sync },
    { id: 'validation', label: 'Permission Validation', icon: UserCheck },
    { id: 'audit', label: 'Permission Audit', icon: Database },
    { id: 'testing', label: 'Testing Tools', icon: CheckCircle },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {enhancedPermissions.isBackendAvailable ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-sm text-gray-600">Backend Status</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {enhancedPermissions.syncStatus.isSynced ? 'Synced' : 'Out of Sync'}
              </div>
              <div className="text-sm text-gray-600">Sync Status</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {enhancedPermissions.syncStatus.differences.length}
              </div>
              <div className="text-sm text-gray-600">Permission Differences</div>
            </div>
          </div>

          {enhancedPermissions.syncStatus.differences.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {enhancedPermissions.syncStatus.differences.length} permission differences between frontend and backend.
                Consider syncing to resolve discrepancies.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current User Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUserPermissions ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Role:</span>
                <Badge variant="outline">{currentUserPermissions.userRole}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Level:</span>
                <Badge variant="secondary">{currentUserPermissions.roleLevel}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Permissions:</span>
                <Badge variant="default">{currentUserPermissions.permissions.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Can Manage Roles:</span>
                <div className="flex gap-1">
                  {currentUserPermissions.canManageRoles.map(role => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? 'Loading permissions...' : 'No permission data available'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSynchronization = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5" />
                          Permission Synchronization
                        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Sync Status</div>
              <div className="text-sm text-gray-600">
                {enhancedPermissions.syncStatus.isSynced 
                  ? 'Frontend and backend permissions are synchronized'
                  : 'Permissions are out of sync'
                }
              </div>
            </div>
            <Button
              onClick={enhancedPermissions.syncWithBackend}
              disabled={enhancedPermissions.syncStatus.isSyncing || !enhancedPermissions.isBackendAvailable}
              className="flex items-center gap-2"
            >
                                        {enhancedPermissions.syncStatus.isSyncing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
              {enhancedPermissions.syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          {enhancedPermissions.syncStatus.lastSync && (
            <div className="text-sm text-gray-600">
              Last synchronized: {enhancedPermissions.syncStatus.lastSync.toLocaleString()}
            </div>
          )}

          {enhancedPermissions.syncStatus.differences.length > 0 && (
            <div className="space-y-2">
              <div className="font-medium text-amber-600">Permission Differences:</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {enhancedPermissions.syncStatus.differences.map(permission => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backend Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {enhancedPermissions.isBackendAvailable ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {enhancedPermissions.isBackendAvailable ? 'Backend Available' : 'Backend Unavailable'}
              </span>
            </div>
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </div>

          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Connection error: {error.message || 'Unknown error'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPermissionValidation = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Individual Permission Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Permission to Test:</label>
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value as Permission)}
              className="w-full p-2 border rounded-md"
            >
              <option value="users.view">users.view</option>
              <option value="users.create">users.create</option>
              <option value="users.edit">users.edit</option>
              <option value="users.delete">users.delete</option>
              <option value="clubs.view">clubs.view</option>
              <option value="clubs.create">clubs.create</option>
              <option value="teams.view">teams.view</option>
              <option value="teams.create">teams.create</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Frontend Check</div>
              <div className="flex items-center gap-2">
                {enhancedPermissions.frontendPermissions.can(selectedPermission) ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span>
                  {enhancedPermissions.frontendPermissions.can(selectedPermission) ? 'Allowed' : 'Denied'}
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Backend Check</div>
              <div className="flex items-center gap-2">
                {enhancedPermissions.can(selectedPermission) ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span>
                  {enhancedPermissions.can(selectedPermission) ? 'Allowed' : 'Denied'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => enhancedPermissions.validatePermission(selectedPermission)}
              className="flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Validate with Backend
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Multiple Permission Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Permissions:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {testPermissions.map(permission => (
                <Badge
                  key={permission}
                  variant={enhancedPermissions.can(permission) ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (testPermissions.includes(permission)) {
                      setTestPermissions(prev => prev.filter(p => p !== permission));
                    } else {
                      setTestPermissions(prev => [...prev, permission]);
                    }
                  }}
                >
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {enhancedPermissions.canAny(testPermissions) ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-600">Can Any</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {enhancedPermissions.canAll(testPermissions) ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-600">Can All</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {testPermissions.filter(p => enhancedPermissions.can(p)).length}
              </div>
              <div className="text-sm text-gray-600">Total Allowed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPermissionAudit = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Permission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permissionSummary ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Role Information</div>
                  <div className="space-y-2 text-sm">
                    <div>Role: <Badge variant="outline">{permissionSummary.role}</Badge></div>
                    <div>Level: <Badge variant="secondary">{permissionSummary.level}</Badge></div>
                    <div>Total: <Badge variant="default">{permissionSummary.totalPermissions}</Badge></div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Permission Categories</div>
                  <div className="space-y-1">
                    {Object.entries(permissionSummary.permissionCategories).map(([category, count]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span className="capitalize">{category}:</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? 'Loading permission summary...' : 'No summary data available'}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {availableRoles ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Available roles for current user to manage: {availableRoles.length}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableRoles.map(role => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoading ? 'Loading role hierarchy...' : 'No hierarchy data available'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTestingTools = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Permission Testing Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => enhancedPermissions.getPermissionAudit()}
              disabled={!enhancedPermissions.isBackendAvailable}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Get Full Audit
            </Button>
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh All Data
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="font-medium">Quick Permission Tests</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['users.view', 'clubs.create', 'teams.edit', 'matches.delete'].map(permission => (
                <Button
                  key={permission}
                  variant={enhancedPermissions.can(permission as Permission) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPermission(permission as Permission)}
                >
                  {enhancedPermissions.can(permission as Permission) ? (
                    <Unlock className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {permission.split('.')[1]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Frontend Permission System:</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span>Backend Permission System:</span>
              <Badge variant={enhancedPermissions.isBackendAvailable ? 'default' : 'secondary'}>
                {enhancedPermissions.isBackendAvailable ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Permission Synchronization:</span>
              <Badge variant={enhancedPermissions.syncStatus.isSynced ? 'default' : 'secondary'}>
                {enhancedPermissions.syncStatus.isSynced ? 'Synchronized' : 'Out of Sync'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Last Sync Attempt:</span>
              <span className="text-gray-600">
                {enhancedPermissions.syncStatus.lastSync 
                  ? enhancedPermissions.syncStatus.lastSync.toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'sync':
        return renderSynchronization();
      case 'validation':
        return renderPermissionValidation();
      case 'audit':
        return renderPermissionAudit();
      case 'testing':
        return renderTestingTools();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backend Permissions Integration Demo</h1>
        <p className="text-gray-600">
          Test and explore the integration between frontend and backend permission systems
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
