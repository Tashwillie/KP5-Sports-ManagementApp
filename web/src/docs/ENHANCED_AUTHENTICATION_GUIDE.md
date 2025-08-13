# 🔐 Enhanced Authentication System Guide

This document provides a comprehensive overview of the enhanced authentication system implemented for the KP5 Academy sports management platform, including role-based access control (RBAC), user management, and security features.

## 🚀 Overview

The enhanced authentication system provides:

- **Role-Based Access Control (RBAC)** with granular permissions
- **Enhanced User Management** with comprehensive admin tools
- **Multi-step Authentication Forms** with validation
- **Advanced User Profiles** with security settings
- **Permission Testing & Debugging** tools
- **Security Features** including 2FA and session management

## 🏗️ Architecture

### Core Components

1. **Permission System** (`/lib/permissions/rolePermissions.ts`)
2. **Permission Hooks** (`/hooks/usePermissions.ts`)
3. **User Management Dashboard** (`/components/admin/UserManagementDashboard.tsx`)
4. **Enhanced Auth Forms** (`/components/auth/EnhancedAuthForm.tsx`)
5. **Enhanced User Profile** (`/components/profile/EnhancedUserProfile.tsx`)
6. **Demo Page** (`/app/enhanced-auth-demo/page.tsx`)

### Permission Structure

The system uses a hierarchical permission structure:

```
Permission Format: category.action
Examples:
- users.view
- clubs.manage_members
- teams.manage_players
- analytics.view
- system.configure
```

## 👥 User Roles & Permissions

### Role Hierarchy

| Level | Roles | Description |
|-------|-------|-------------|
| **System** | SUPER_ADMIN, SYSTEM_ADMIN | Full system access |
| **Club** | CLUB_ADMIN | Club-level administration |
| **Team** | COACH | Team management |
| **Individual** | PLAYER, PARENT, REFEREE | Limited access |

### Role Definitions

#### SUPER_ADMIN
- **Level**: System
- **Description**: Full system access with all permissions
- **Permissions**: All permissions across all categories

#### CLUB_ADMIN
- **Level**: Club
- **Description**: Club-level administration with team and player management
- **Permissions**: Club management, team management, player management, events, tournaments

#### COACH
- **Level**: Team
- **Description**: Team management with player oversight
- **Permissions**: Team management, player management, events, match management

#### PLAYER
- **Level**: Individual
- **Description**: Individual player with limited access
- **Permissions**: View own team, manage own profile, view events

#### REFEREE
- **Level**: Individual
- **Description**: Match officiating and event management
- **Permissions**: Match management, event viewing, basic profile management

#### PARENT
- **Level**: Individual
- **Description**: Parent with child oversight
- **Permissions**: View child's team, manage child's profile, view events

#### MODERATOR
- **Level**: System
- **Description**: Content moderation and user support
- **Permissions**: User management, content moderation, messaging

#### SUPPORT
- **Level**: System
- **Description**: User support and basic assistance
- **Permissions**: User viewing, content viewing, messaging

## 🔧 Implementation

### 1. Permission System

```typescript
// Define permissions
export type Permission = 
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'clubs.manage_members'
  | 'teams.manage_players'
  // ... more permissions

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    level: 'system',
    description: 'Full system access with all permissions',
    permissions: [/* all permissions */]
  },
  // ... other roles
};
```

### 2. Permission Hooks

```typescript
// Main permission hook
const { can, canAny, canAll, userRole, roleDescription } = usePermissions();

// Specialized hooks
const userPermissions = useUserManagementPermissions();
const clubPermissions = useClubManagementPermissions();
const teamPermissions = useTeamManagementPermissions();

// Usage examples
if (can('users.create')) {
  // User can create users
}

if (canAny(['users.edit', 'users.delete'])) {
  // User can edit or delete users
}
```

### 3. User Management Dashboard

The dashboard provides:

- **User Overview**: Total users, active users, pending verification
- **User Table**: Search, filter, and manage users
- **Role Management**: Assign and change user roles
- **Status Management**: Activate/deactivate users
- **Permission-based Access**: Only authorized users can access

### 4. Enhanced Authentication Forms

#### Sign In Form
- Email and password validation
- Remember me functionality
- Forgot password link
- Error handling and success messages

#### Sign Up Form (Multi-step)
1. **Account Information**: Email, display name, password
2. **Personal Details**: First/last name, phone, date of birth, address
3. **Role & Preferences**: Role selection, terms acceptance, marketing preferences

### 5. Enhanced User Profile

#### Profile Tab
- Basic information editing
- Avatar upload and management
- Real-time form validation

#### Preferences Tab
- Notification settings (email, push, SMS)
- Privacy controls (profile visibility, location, stats)
- Language and timezone preferences

#### Security Tab
- Two-factor authentication
- Password management
- Login history
- Session management

#### Activity Tab
- Recent activity tracking
- Data export functionality
- Account deletion options

## 🛡️ Security Features

### Authentication
- JWT-based authentication
- Secure password requirements
- Session management
- Automatic logout on inactivity

### Authorization
- Role-based access control
- Permission-based UI rendering
- Route protection
- API endpoint security

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- Rate limiting

### User Privacy
- Profile visibility controls
- Data export capabilities
- Account deletion options
- Privacy preference management

## 📱 Usage Examples

### 1. Checking Permissions in Components

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function UserList() {
  const { can, userRole } = usePermissions();
  
  return (
    <div>
      {can('users.view') && (
        <div>
          <h2>Users</h2>
          {/* User list content */}
        </div>
      )}
      
      {can('users.create') && (
        <button>Create User</button>
      )}
    </div>
  );
}
```

### 2. Role-based Component Rendering

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function Dashboard() {
  const { isSuperAdmin, isClubAdmin, isCoach } = usePermissions();
  
  return (
    <div>
      {isSuperAdmin && <SuperAdminPanel />}
      {isClubAdmin && <ClubAdminPanel />}
      {isCoach && <CoachPanel />}
    </div>
  );
}
```

### 3. Permission-based Actions

```typescript
import { useUserManagementPermissions } from '@/hooks/usePermissions';

function UserActions({ user }) {
  const { canEditUsers, canDeleteUsers, canAssignRoles } = useUserManagementPermissions();
  
  return (
    <div>
      {canEditUsers && (
        <button onClick={() => editUser(user.id)}>Edit</button>
      )}
      
      {canDeleteUsers && (
        <button onClick={() => deleteUser(user.id)}>Delete</button>
      )}
      
      {canAssignRoles && (
        <button onClick={() => changeRole(user.id)}>Change Role</button>
      )}
    </div>
  );
}
```

## 🧪 Testing & Debugging

### Demo Page Features

The enhanced authentication demo page (`/enhanced-auth-demo`) provides:

1. **Overview Tab**
   - Current user information
   - Role hierarchy display
   - Permission matrix

2. **Auth Forms Tab**
   - Sign in form demonstration
   - Sign up form with multi-step process

3. **User Management Tab**
   - Full user management dashboard (if authorized)
   - Access control demonstration

4. **User Profile Tab**
   - Enhanced profile management
   - All profile features demonstration

5. **Permissions Tab**
   - Permission testing with different roles
   - Visual permission matrix

6. **Settings Tab**
   - Security features demonstration
   - Account management options

### Permission Testing

```typescript
// Test specific permissions
const canViewUsers = can('users.view');
const canManageClubs = can('clubs.manage_members');

// Test multiple permissions
const canManageUsers = canAny(['users.create', 'users.edit', 'users.delete']);
const canFullAccess = canAll(['users.view', 'users.create', 'users.edit', 'users.delete']);
```

## 🔄 Integration

### With Existing Systems

The enhanced authentication system integrates with:

- **Existing Auth Context**: Extends current authentication
- **WebSocket System**: Role-based real-time access
- **API Client**: Permission-based API calls
- **Route Protection**: Automatic route security

### Backend Integration

```typescript
// API calls with role validation
const createUser = async (userData) => {
  if (!can('users.create')) {
    throw new Error('Insufficient permissions');
  }
  
  return await apiClient.post('/users', userData);
};
```

## 🚀 Future Enhancements

### Planned Features

1. **Advanced Security**
   - Biometric authentication
   - Hardware security keys
   - Advanced session management

2. **Permission Management**
   - Custom permission creation
   - Dynamic role assignment
   - Permission inheritance

3. **Audit & Compliance**
   - Comprehensive audit logs
   - GDPR compliance tools
   - Data retention policies

4. **Integration**
   - SSO providers (SAML, OAuth)
   - LDAP integration
   - Active Directory sync

### Customization

The system is designed for easy customization:

```typescript
// Add new permissions
export type Permission = 
  | 'custom.new_feature'
  | 'custom.advanced_analytics'
  // ... existing permissions

// Add new roles
export const CUSTOM_ROLE: RolePermissions = {
  role: 'CUSTOM_ROLE',
  level: 'custom',
  description: 'Custom role description',
  permissions: ['custom.new_feature', 'custom.advanced_analytics']
};
```

## 📚 Best Practices

### Security
1. Always check permissions before rendering sensitive content
2. Use specialized permission hooks for common operations
3. Implement proper error handling for unauthorized access
4. Regular security audits and updates

### Performance
1. Use React.memo for permission-heavy components
2. Implement permission caching where appropriate
3. Lazy load permission-dependent components
4. Optimize permission checks in loops

### User Experience
1. Provide clear feedback for permission denials
2. Use consistent permission patterns across the app
3. Implement progressive disclosure based on permissions
4. Offer alternative actions when permissions are insufficient

## 🐛 Troubleshooting

### Common Issues

1. **Permission Not Working**
   - Check if user role is properly set
   - Verify permission string matches exactly
   - Ensure permission hook is properly imported

2. **Role Not Displaying**
   - Check user authentication state
   - Verify role mapping in backend
   - Check role transformation logic

3. **Access Denied Errors**
   - Verify user permissions
   - Check route protection
   - Ensure proper error handling

### Debug Tools

```typescript
// Enable permission debugging
const { can, userRole, roleDescription } = usePermissions();

console.log('User Role:', userRole);
console.log('Role Description:', roleDescription);
console.log('Can view users:', can('users.view'));
```

## 📖 API Reference

### Permission Hooks

#### `usePermissions()`
Returns the main permission hook with all functionality.

#### `useUserManagementPermissions()`
Returns specialized permissions for user management.

#### `useClubManagementPermissions()`
Returns specialized permissions for club management.

#### `useTeamManagementPermissions()`
Returns specialized permissions for team management.

#### `useMatchManagementPermissions()`
Returns specialized permissions for match management.

#### `useAnalyticsPermissions()`
Returns specialized permissions for analytics and reporting.

### Permission Functions

#### `hasPermission(userRole, permission)`
Check if a specific role has a specific permission.

#### `hasAnyPermission(userRole, permissions)`
Check if a role has any of the specified permissions.

#### `hasAllPermissions(userRole, permissions)`
Check if a role has all of the specified permissions.

#### `canManageRole(managerRole, targetRole)`
Check if a manager role can manage a target role.

#### `getAvailableRoles(managerRole)`
Get all roles that a manager role can manage.

## 🤝 Contributing

When contributing to the authentication system:

1. **Follow the permission naming convention**: `category.action`
2. **Add comprehensive tests** for new permissions
3. **Update documentation** for new features
4. **Maintain backward compatibility**
5. **Follow security best practices**

## 📞 Support

For questions or issues with the enhanced authentication system:

1. Check this documentation first
2. Review the demo page for examples
3. Check the console for error messages
4. Verify permission configurations
5. Contact the development team

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: KP5 Academy Development Team
