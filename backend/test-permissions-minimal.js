const express = require('express');
const cors = require('cors');

const app = express();
const port = 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Mock user data for testing
const mockUsers = {
  'user1': { id: 'user1', email: 'admin@test.com', role: 'SUPER_ADMIN' },
  'user2': { id: 'user2', email: 'coach@test.com', role: 'COACH' },
  'user3': { id: 'user3', email: 'player@test.com', role: 'PLAYER' }
};

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  // Simple token validation - in real app this would verify JWT
  const userId = token;
  const user = mockUsers[userId];
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  
  req.user = user;
  next();
};

// Permission checking functions (mirror the backend implementation)
const getRolePermissions = (userRole) => {
  const rolePermissionsMap = {
    SUPER_ADMIN: {
      level: 'system',
      description: 'Full system access with all permissions',
      permissions: [
        'users.view', 'users.create', 'users.edit', 'users.delete', 'users.assign_roles', 'users.manage_permissions',
        'clubs.view', 'clubs.create', 'clubs.edit', 'clubs.delete', 'clubs.approve', 'clubs.manage_members',
        'teams.view', 'teams.create', 'teams.edit', 'teams.delete', 'teams.manage_players', 'teams.manage_coaches', 'teams.view_stats',
        'players.view', 'players.create', 'players.edit', 'players.delete', 'players.manage_profile', 'players.view_medical', 'players.manage_documents',
        'events.view', 'events.create', 'events.edit', 'events.delete', 'events.manage_registrations', 'events.manage_schedules',
        'tournaments.view', 'tournaments.create', 'tournaments.edit', 'tournaments.delete', 'tournaments.manage_brackets', 'tournaments.manage_standings',
        'matches.view', 'matches.create', 'matches.edit', 'matches.delete', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
        'payments.view', 'payments.process', 'payments.refund', 'payments.manage_subscriptions', 'payments.view_reports',
        'analytics.view', 'analytics.export', 'analytics.configure', 'reports.view', 'reports.create', 'reports.export',
        'system.view', 'system.configure', 'system.backup', 'system.restore', 'system.logs', 'system.maintenance',
        'content.view', 'content.create', 'content.edit', 'content.delete', 'content.moderate', 'content.publish',
        'messages.send', 'messages.view', 'messages.manage', 'notifications.send', 'notifications.manage',
        'profile.view_own', 'profile.edit_own', 'profile.view_others', 'profile.edit_others'
      ]
    },
    CLUB_ADMIN: {
      level: 'club',
      description: 'Club-level administration with team and player management',
      permissions: [
        'users.view', 'users.create', 'users.edit',
        'clubs.view', 'clubs.edit', 'clubs.manage_members',
        'teams.view', 'teams.create', 'teams.edit', 'teams.delete', 'teams.manage_players', 'teams.manage_coaches', 'teams.view_stats',
        'players.view', 'players.create', 'players.edit', 'players.delete', 'players.manage_profile', 'players.view_medical', 'players.manage_documents',
        'events.view', 'events.create', 'events.edit', 'events.delete', 'events.manage_registrations', 'events.manage_schedules',
        'tournaments.view', 'tournaments.create', 'tournaments.edit', 'tournaments.delete', 'tournaments.manage_brackets', 'tournaments.manage_standings',
        'matches.view', 'matches.create', 'matches.edit', 'matches.delete', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
        'payments.view', 'payments.process', 'payments.refund', 'payments.manage_subscriptions', 'payments.view_reports',
        'analytics.view', 'analytics.export', 'reports.view', 'reports.create', 'reports.export',
        'content.view', 'content.create', 'content.edit', 'content.delete',
        'messages.send', 'messages.view', 'messages.manage', 'notifications.send', 'notifications.manage',
        'profile.view_own', 'profile.edit_own', 'profile.view_others', 'profile.edit_others'
      ]
    },
    COACH: {
      level: 'team',
      description: 'Team management with player oversight',
      permissions: [
        'teams.view', 'teams.edit', 'teams.manage_players', 'teams.view_stats',
        'players.view', 'players.edit', 'players.manage_profile', 'players.view_medical',
        'events.view', 'events.create', 'events.edit', 'events.manage_registrations', 'events.manage_schedules',
        'tournaments.view',
        'matches.view', 'matches.create', 'matches.edit', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
        'analytics.view', 'reports.view',
        'content.view', 'content.create', 'content.edit',
        'messages.send', 'messages.view', 'notifications.send',
        'profile.view_own', 'profile.edit_own', 'profile.view_others'
      ]
    },
    REFEREE: {
      level: 'individual',
      description: 'Match officiating and event management',
      permissions: [
        'events.view',
        'matches.view', 'matches.manage_scores', 'matches.manage_events', 'matches.live_tracking',
        'content.view',
        'messages.send', 'messages.view',
        'profile.view_own', 'profile.edit_own'
      ]
    },
    PLAYER: {
      level: 'individual',
      description: 'Individual player with limited access',
      permissions: [
        'teams.view', 'teams.view_stats',
        'players.view', 'players.manage_profile',
        'events.view',
        'tournaments.view',
        'matches.view',
        'analytics.view',
        'content.view',
        'messages.send', 'messages.view',
        'profile.view_own', 'profile.edit_own'
      ]
    },
    PARENT: {
      level: 'individual',
      description: 'Parent with child oversight',
      permissions: [
        'teams.view',
        'players.view', 'players.manage_profile',
        'events.view',
        'tournaments.view',
        'matches.view',
        'content.view',
        'messages.view',
        'profile.view_own', 'profile.edit_own'
      ]
    }
  };

  return rolePermissionsMap[userRole] || null;
};

const hasPermission = (userRole, permission) => {
  const rolePermissions = getRolePermissions(userRole);
  if (!rolePermissions) return false;
  
  return rolePermissions.permissions.includes(permission);
};

// Permission middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      console.log('Permission denied:', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermission: permission,
        endpoint: req.originalUrl,
        method: req.method,
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredPermission: permission,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KP5 Academy Permission Test Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Test protected routes with different permissions
app.get('/api/users', mockAuth, requirePermission('users.view'), (req, res) => {
  res.json({
    success: true,
    message: 'Users endpoint accessed successfully',
    user: req.user
  });
});

app.get('/api/clubs', mockAuth, requirePermission('clubs.view'), (req, res) => {
  res.json({
    success: true,
    message: 'Clubs endpoint accessed successfully',
    user: req.user
  });
});

app.get('/api/teams', mockAuth, requirePermission('teams.view'), (req, res) => {
  res.json({
    success: true,
    message: 'Teams endpoint accessed successfully',
    user: req.user
  });
});

app.get('/api/tournaments', mockAuth, requirePermission('tournaments.view'), (req, res) => {
  res.json({
    success: true,
    message: 'Tournaments endpoint accessed successfully',
    user: req.user
  });
});

app.get('/api/matches', mockAuth, requirePermission('matches.view'), (req, res) => {
  res.json({
    success: true,
    message: 'Matches endpoint accessed successfully',
    user: req.user
  });
});

app.get('/api/events', mockAuth, requirePermission('events.view'), (req, res) => {
  res.json({
    success: true,
    message: 'Events endpoint accessed successfully',
    user: req.user
  });
});

app.get('/api/analytics', mockAuth, requirePermission('analytics.view'), (req, res) => {
  res.json({
    success: true,
    message: 'Analytics endpoint accessed successfully',
    user: req.user
  });
});

app.get('/api/system', mockAuth, requirePermission('system.view'), (req, res) => {
  res.json({
    success: true,
    message: 'System endpoint accessed successfully',
    user: req.user
  });
});

// Permission routes
app.get('/api/permissions/me', mockAuth, (req, res) => {
  try {
    const userPermissions = getRolePermissions(req.user.role);
    const canManageRoles = ['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH', 'PLAYER', 'PARENT', 'REFEREE'].filter(role => {
      const managerLevel = getRolePermissions(req.user.role)?.level || 'individual';
      const targetLevel = getRolePermissions(role)?.level || 'individual';
      
      const levelHierarchy = {
        'system': 3,
        'club': 2,
        'team': 1,
        'individual': 0
      };
      
      return levelHierarchy[managerLevel] >= levelHierarchy[targetLevel];
    });

    res.json({
      success: true,
      data: {
        userId: req.user.id,
        userRole: req.user.role,
        permissions: userPermissions?.permissions || [],
        roleLevel: userPermissions?.level || 'individual',
        roleDescription: userPermissions?.description || 'No description available',
        canManageRoles,
      },
    });
  } catch (error) {
    console.error('Get current user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user permissions.',
    });
  }
});

// Test route to show available users
app.get('/test-users', (req, res) => {
  res.json({
    success: true,
    message: 'Use these user IDs as Bearer tokens to test permissions:',
    users: Object.keys(mockUsers).map(id => ({
      id,
      email: mockUsers[id].email,
      role: mockUsers[id].role
    }))
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 KP5 Academy Permission Test Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Test users: http://localhost:${port}/test-users`);
  console.log(`Permissions endpoint: http://localhost:${port}/api/permissions/me`);
  console.log(`\nTo test permissions, use one of these as Bearer token:`);
  Object.keys(mockUsers).forEach(id => {
    console.log(`  ${id} (${mockUsers[id].role})`);
  });
  console.log(`\nTest protected endpoints:`);
  console.log(`  GET /api/users (requires users.view)`);
  console.log(`  GET /api/clubs (requires clubs.view)`);
  console.log(`  GET /api/teams (requires teams.view)`);
  console.log(`  GET /api/tournaments (requires tournaments.view)`);
  console.log(`  GET /api/matches (requires matches.view)`);
  console.log(`  GET /api/events (requires events.view)`);
  console.log(`  GET /api/analytics (requires analytics.view)`);
  console.log(`  GET /api/system (requires system.view)`);
});
