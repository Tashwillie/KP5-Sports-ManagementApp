# 🔐 Backend Permissions Integration Guide

This document describes the complete integration between the frontend permission system and the PostgreSQL backend, providing real-time permission validation and synchronization.

## 🏗️ Architecture Overview

### **System Components**

1. **Frontend Permission System** (`usePermissions` hook)
   - Granular permission definitions
   - Role-based access control (RBAC)
   - Client-side permission checking

2. **Backend Permission Middleware** (`permissions.ts`)
   - API endpoint protection
   - Permission validation
   - Role-based access control

3. **Backend Permission Service** (`permissionService.ts`)
   - Centralized permission logic
   - User permission management
   - Role hierarchy management

4. **Frontend-Backend Bridge** (`permissionsApiService.ts`)
   - API communication layer
   - Permission synchronization
   - Real-time validation

5. **Enhanced Permission Hook** (`useEnhancedPermissions`)
   - Combined frontend/backend logic
   - Automatic synchronization
   - Fallback mechanisms

## 📡 Backend API Endpoints

### **Permissions API Routes**

```typescript
// Base path: /api/permissions

GET /me                           - Get current user's permissions
GET /users/:userId               - Get permissions for specific user
GET /check/:permission          - Check if user has specific permission
GET /roles/hierarchy            - Get role hierarchy information
GET /roles/available            - Get available roles for current user
POST /validate                  - Validate multiple permissions
GET /summary                    - Get permission summary for current user
```

### **Protected User Routes**

```typescript
// Base path: /api/users

GET /                           - List users (requires: users.view)
GET /:id                        - Get user (requires: users.view)
POST /                          - Create user (requires: users.create)
PUT /:id                        - Update user (requires: users.edit)
DELETE /:id                     - Delete user (requires: users.delete)
GET /:id/profile                - Get profile (requires: profile.view_own OR profile.view_others)
PUT /:id/profile                - Update profile (requires: profile.edit_own OR profile.edit_others)
```

## 🔧 Implementation Details

### **Backend Permission Middleware**

The backend uses middleware functions to protect API endpoints:

```typescript
// Single permission check
app.get('/users', requirePermission('users.view'), getUsers);

// Multiple permissions (any)
app.post('/clubs', requireAnyPermission(['clubs.create', 'clubs.approve']), createClub);

// Multiple permissions (all)
app.put('/system/config', requireAllPermissions(['system.view', 'system.configure']), updateConfig);

// Role-based access
app.delete('/users/:id', requireRole(['SUPER_ADMIN', 'SYSTEM_ADMIN']), deleteUser);
```

### **Permission Validation Flow**

1. **Request arrives** at protected endpoint
2. **Authentication middleware** validates JWT token
3. **Permission middleware** checks user permissions
4. **Permission service** validates against role definitions
5. **Access granted/denied** based on validation result

### **Frontend Integration**

The frontend automatically synchronizes with the backend:

```typescript
const enhancedPermissions = useEnhancedPermissions();

// Automatic backend validation
const canEditUsers = enhancedPermissions.can('users.edit');

// Manual validation
const isValid = await enhancedPermissions.validatePermission('users.delete');

// Synchronization
await enhancedPermissions.syncWithBackend();
```

## 🚀 Usage Examples

### **Basic Permission Checking**

```typescript
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';

function UserManagementComponent() {
  const { can, canAny, canAll } = useEnhancedPermissions();

  if (!can('users.view')) {
    return <AccessDenied />;
  }

  return (
    <div>
      {can('users.create') && <CreateUserButton />}
      {can('users.edit') && <EditUserButton />}
      {can('users.delete') && <DeleteUserButton />}
      
      {canAny(['users.create', 'users.edit']) && <UserActions />}
      {canAll(['users.view', 'users.edit', 'users.delete']) && <FullAccess />}
    </div>
  );
}
```

### **API Route Protection**

```typescript
// Backend route with permission check
router.get('/users', 
  authenticate, 
  requirePermission('users.view'), 
  getUsers
);

// Frontend component with same permission
function UsersList() {
  const { can } = useEnhancedPermissions();
  
  if (!can('users.view')) {
    return <AccessDenied />;
  }
  
  // Component logic here
}
```

### **Permission Synchronization**

```typescript
function PermissionSyncComponent() {
  const { syncStatus, syncWithBackend } = useEnhancedPermissions();

  return (
    <div>
      <div>Sync Status: {syncStatus.isSynced ? 'Synced' : 'Out of Sync'}</div>
      <div>Differences: {syncStatus.differences.length}</div>
      
      <button onClick={syncWithBackend}>
        Sync with Backend
      </button>
    </div>
  );
}
```

## 🔍 Testing and Debugging

### **Demo Page**

Visit `/backend-permissions-demo` to test the integration:

- **Overview**: System status and current permissions
- **Synchronization**: Sync status and manual sync
- **Permission Validation**: Test individual and multiple permissions
- **Permission Audit**: View permission summary and role hierarchy
- **Testing Tools**: Various testing utilities

### **Permission Testing**

```typescript
// Test individual permission
const canViewUsers = enhancedPermissions.can('users.view');

// Test multiple permissions
const canManageUsers = enhancedPermissions.canAll([
  'users.view',
  'users.create',
  'users.edit',
  'users.delete'
]);

// Validate with backend
const isValid = await enhancedPermissions.validatePermission('users.create');
```

### **Debugging Tools**

```typescript
// Check sync status
console.log('Sync Status:', enhancedPermissions.syncStatus);

// Check backend availability
console.log('Backend Available:', enhancedPermissions.isBackendAvailable);

// Get permission audit
const audit = await enhancedPermissions.getPermissionAudit();
console.log('Permission Audit:', audit);
```

## 🛡️ Security Features

### **Backend Protection**

- **JWT Authentication**: All permission endpoints require valid tokens
- **Role Validation**: User roles are validated against database
- **Permission Granularity**: Fine-grained permission checking
- **Audit Logging**: All permission checks are logged

### **Frontend Security**

- **Automatic Validation**: Frontend permissions validated against backend
- **Fallback Protection**: Frontend permissions when backend unavailable
- **Real-time Sync**: Automatic permission synchronization
- **Error Handling**: Graceful degradation on permission failures

### **Permission Hierarchy**

```typescript
const levelHierarchy = {
  'system': 3,    // SUPER_ADMIN, SYSTEM_ADMIN
  'club': 2,      // CLUB_ADMIN
  'team': 1,      // COACH
  'individual': 0  // PLAYER, PARENT, REFEREE
};
```

## 📊 Performance Considerations

### **Caching Strategy**

- **Frontend Caching**: React Query caches permission data
- **Backend Caching**: Permission checks cached in memory
- **Stale Time**: Permissions cached for 5 minutes
- **Background Updates**: Automatic refresh in background

### **Optimization Tips**

1. **Batch Permission Checks**: Use `canAll` or `canAny` for multiple permissions
2. **Lazy Loading**: Load permissions only when needed
3. **Memoization**: Use `useMemo` for expensive permission calculations
4. **Selective Sync**: Sync only changed permissions

## 🔧 Configuration

### **Environment Variables**

```bash
# Backend
JWT_SECRET=your-secret-key
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PERMISSION_SYNC_INTERVAL=300000
```

### **Permission Definitions**

Permissions are defined in `shared/src/types/index.ts`:

```typescript
export type Permission = 
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'clubs.view'
  | 'clubs.create'
  // ... more permissions
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Permission Mismatch**
   - Check if frontend and backend are synced
   - Verify user role in database
   - Check permission definitions match

2. **Backend Unavailable**
   - Verify backend server is running
   - Check network connectivity
   - Verify API endpoint configuration

3. **Sync Failures**
   - Check authentication token validity
   - Verify user permissions in database
   - Check backend logs for errors

### **Debug Commands**

```typescript
// Check permission system status
console.log('Enhanced Permissions:', enhancedPermissions);

// Test backend connection
const testConnection = await fetch('/api/permissions/me');

// Validate specific permission
const result = await enhancedPermissions.validatePermission('users.view');
console.log('Validation Result:', result);
```

### **Log Analysis**

Backend logs include detailed permission information:

```typescript
// Permission denied log
logger.warn('Permission denied', {
  userId: req.user.id,
  userRole: req.user.role,
  requiredPermission: permission,
  endpoint: req.originalUrl,
  method: req.method,
});
```

## 🔮 Future Enhancements

### **Planned Features**

1. **Dynamic Permissions**: Runtime permission updates
2. **Permission Groups**: Batch permission management
3. **Advanced Auditing**: Detailed permission usage tracking
4. **Performance Monitoring**: Permission check performance metrics
5. **Multi-tenant Support**: Organization-level permission isolation

### **Integration Opportunities**

1. **Real-time Updates**: WebSocket-based permission changes
2. **External Systems**: LDAP/Active Directory integration
3. **Permission Templates**: Predefined permission sets
4. **Workflow Integration**: Permission-based approval workflows

## 📚 API Reference

### **Backend Permission Service**

```typescript
class PermissionService {
  static checkPermission(userRole: string, permission: Permission): PermissionCheck
  static getUserPermissionsInfo(userId: string, userRole: string): UserPermissions
  static canManageUserRole(managerRole: string, targetRole: string): boolean
  static getAvailableRolesForUser(userRole: string): string[]
  static validatePermissions(userRole: string, permissions: Permission[]): ValidationResult
  static getPermissionSummary(userRole: string): PermissionSummary
  static canAccessResource(userRole: string, resource: string, action: string): boolean
}
```

### **Frontend Enhanced Permissions Hook**

```typescript
interface UseEnhancedPermissionsReturn {
  frontendPermissions: UsePermissionsReturn
  backendPermissions: BackendPermissionData
  syncStatus: SyncStatus
  can: (permission: Permission) => boolean
  canAny: (permissions: Permission[]) => boolean
  canAll: (permissions: Permission[]) => boolean
  validatePermission: (permission: Permission) => Promise<boolean>
  syncWithBackend: () => Promise<void>
  isBackendAvailable: boolean
}
```

## 🎯 Best Practices

### **Development**

1. **Always use permission checks** for sensitive operations
2. **Test both frontend and backend** permission logic
3. **Use appropriate permission granularity** for your use case
4. **Implement fallback mechanisms** for offline scenarios

### **Security**

1. **Never trust frontend-only** permission checks
2. **Validate permissions on every request** to protected endpoints
3. **Log all permission decisions** for audit purposes
4. **Regularly review** permission assignments and role hierarchies

### **Performance**

1. **Cache permission results** appropriately
2. **Batch permission checks** when possible
3. **Monitor permission check** performance
4. **Optimize permission queries** for frequently accessed data

This integration provides a robust, secure, and performant permission system that bridges frontend and backend, ensuring consistent access control across your entire application.
