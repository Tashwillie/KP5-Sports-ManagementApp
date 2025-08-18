# 🔐 Authentication System Migration Guide

## 📋 Overview

This guide will help you migrate from the old authentication system to the new **Enhanced Authentication System** that provides:

- ✅ **Robust token management** with automatic expiration checking
- ✅ **Automatic token refresh** with proper error handling
- ✅ **Better state management** with loading and initialization states
- ✅ **Enhanced security** with proper JWT validation
- ✅ **Improved error handling** with user-friendly messages
- ✅ **Role and permission checking** utilities

## 🚀 Quick Migration Steps

### 1. **Update Your Root Layout**

Replace the old `AuthProvider` with the new `EnhancedAuthProvider`:

```tsx
// Before (old system)
import { AuthProvider } from '@/contexts/AuthContext';

// After (new system)
import { EnhancedAuthProvider } from '@/contexts/EnhancedAuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EnhancedAuthProvider>
          {children}
        </EnhancedAuthProvider>
      </body>
    </html>
  );
}
```

### 2. **Update Your Components**

Replace the old `useAuth` hook with the new `useEnhancedAuthContext`:

```tsx
// Before (old system)
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  // ... rest of component
}

// After (new system)
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';

export function MyComponent() {
  const { user, login, logout, isAuthenticated, hasRole, hasPermission } = useEnhancedAuthContext();
  // ... rest of component
}
```

### 3. **Update Protected Routes**

Replace the old `ProtectedRoute` with the new one:

```tsx
// Before (old system)
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// After (new system)
import { ProtectedRoute, AdminRoute, CoachRoute } from '@/components/auth/ProtectedRoute';

// Use the new component
<ProtectedRoute requiredRole="SUPER_ADMIN">
  <AdminDashboard />
</ProtectedRoute>

// Or use convenience components
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

## 🔄 Detailed Migration Steps

### **Step 1: Install New Dependencies**

The new system is built with existing dependencies, so no new packages are needed.

### **Step 2: Update API Client Usage**

If you're using the old `apiClient` directly, update to use `enhancedApiClient`:

```tsx
// Before
import apiClient from '@/lib/apiClient';

// After
import enhancedApiClient from '@/lib/enhancedApiClient';

// The API methods remain the same, but with better error handling
const response = await enhancedApiClient.get('/users');
```

### **Step 3: Update Permission Services**

Replace the old permissions service with the enhanced one:

```tsx
// Before
import { PermissionsApiService } from '@/lib/services/permissionsApiService';

// After
import { enhancedPermissionsService } from '@/lib/services/enhancedPermissionsService';

// Usage remains the same
const permissions = await enhancedPermissionsService.getCurrentUserPermissions();
```

### **Step 4: Update Authentication Hooks**

Replace `useAuth` with `useEnhancedAuthContext` throughout your app:

```tsx
// Before
const { user, login, logout } = useAuth();

// After
const { user, login, logout, hasRole, hasPermission } = useEnhancedAuthContext();

// New features available:
if (hasRole(['SUPER_ADMIN', 'CLUB_ADMIN'])) {
  // User is an admin
}

if (hasPermission('manage_users')) {
  // User can manage users
}
```

## 🆕 New Features Available

### **1. Enhanced Token Management**

```tsx
const { token, tokenExpiry, timeUntilExpiry } = useEnhancedAuthContext();

// Check if token is about to expire
if (timeUntilExpiry < 300000) { // 5 minutes
  console.log('Token will expire soon');
}
```

### **2. Better Loading States**

```tsx
const { loading, isInitialized } = useEnhancedAuthContext();

// Show loading while initializing
if (!isInitialized) {
  return <LoadingSpinner />;
}

// Show loading during operations
if (loading) {
  return <OperationLoading />;
}
```

### **3. Role and Permission Checking**

```tsx
const { hasRole, hasPermission } = useEnhancedAuthContext();

// Check roles
if (hasRole('SUPER_ADMIN')) {
  // Super admin specific logic
}

if (hasRole(['COACH', 'CLUB_ADMIN'])) {
  // Coach or club admin logic
}

// Check permissions
if (hasPermission('manage_users')) {
  // User can manage users
}
```

### **4. Automatic Token Refresh**

The new system automatically:
- ✅ Detects when tokens are about to expire
- ✅ Refreshes tokens in the background
- ✅ Retries failed requests with new tokens
- ✅ Handles refresh failures gracefully

## 🧪 Testing the Migration

### **1. Test Authentication Flow**

```tsx
// Test login
const { login } = useEnhancedAuthContext();
try {
  await login({ email: 'test@example.com', password: 'password' });
  console.log('Login successful');
} catch (error) {
  console.error('Login failed:', error);
}
```

### **2. Test Protected Routes**

```tsx
// Test role-based access
<ProtectedRoute requiredRole="SUPER_ADMIN">
  <div>Only super admins can see this</div>
</ProtectedRoute>

// Test permission-based access
<ProtectedRoute requiredPermission="manage_users">
  <div>Only users with manage_users permission can see this</div>
</ProtectedRoute>
```

### **3. Test Token Management**

```tsx
// Check token status
const { token, isAuthenticated } = useEnhancedAuthContext();

if (isAuthenticated && token) {
  console.log('User has valid token');
} else {
  console.log('User needs to authenticate');
}
```

## 🚨 Breaking Changes

### **1. Hook Return Values**

The new `useEnhancedAuthContext` returns slightly different values:

```tsx
// Old system
const { user, loading, error, isAuthenticated } = useAuth();

// New system
const { 
  user, 
  loading, 
  error, 
  isAuthenticated, 
  isInitialized,  // NEW
  hasRole,        // NEW
  hasPermission,  // NEW
  token,          // NEW
  tokenExpiry,    // NEW
  timeUntilExpiry // NEW
} = useEnhancedAuthContext();
```

### **2. API Response Format**

The new API client returns responses in a consistent format:

```tsx
// Old system - inconsistent response formats
const response = await apiClient.get('/users');
// Could be: { users: [...] } or { data: { users: [...] } }

// New system - consistent format
const response = await enhancedApiClient.get('/users');
// Always: { success: boolean, message: string, data?: any, error?: string }
```

## 🔧 Troubleshooting

### **Common Issues**

1. **"useEnhancedAuthContext must be used within an EnhancedAuthProvider"**
   - Make sure you've wrapped your app with `EnhancedAuthProvider`

2. **"Token validation failed"**
   - Check if your JWT tokens are properly formatted
   - Ensure backend is sending valid JWT tokens

3. **"Permission check failed"**
   - Verify that your backend permissions endpoints are working
   - Check if the user has the required permissions

### **Debug Mode**

Enable debug logging by checking the browser console for detailed information about:
- Token loading and validation
- API requests and responses
- Authentication state changes
- Permission checks

## 📚 Additional Resources

- **Token Manager**: `@/lib/tokenManager.ts`
- **Enhanced API Client**: `@/lib/enhancedApiClient.ts`
- **Enhanced Auth Hook**: `@/hooks/enhancedUseAuth.ts`
- **Enhanced Auth Context**: `@/contexts/EnhancedAuthContext.tsx`
- **Protected Route Component**: `@/components/auth/ProtectedRoute.tsx`

## 🎯 Migration Checklist

- [ ] Replace `AuthProvider` with `EnhancedAuthProvider`
- [ ] Update all `useAuth()` calls to `useEnhancedAuthContext()`
- [ ] Replace old `ProtectedRoute` with new one
- [ ] Update API client imports to use `enhancedApiClient`
- [ ] Update permissions service imports
- [ ] Test authentication flow (login, logout, token refresh)
- [ ] Test protected routes with different roles
- [ ] Test permission-based access control
- [ ] Verify error handling works correctly
- [ ] Check that loading states display properly

## 🚀 Benefits After Migration

- ✅ **More reliable authentication** with automatic token refresh
- ✅ **Better user experience** with proper loading states
- ✅ **Enhanced security** with proper token validation
- ✅ **Cleaner code** with consistent API responses
- ✅ **Better debugging** with detailed logging
- ✅ **Role-based access control** with permission checking
- ✅ **Automatic error handling** with user-friendly messages

---

**Need help?** Check the console for detailed error messages and refer to the component source files for implementation details.
