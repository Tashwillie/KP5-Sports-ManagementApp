import {
  AdminDashboard,
  AdminAnalytics,
  AdminUser,
  AdminAuditLog,
  AdminSystemHealth,
  AdminReport,
  AdminNotification,
  AdminBackup,
  AdminMaintenance,
  AdminBilling,
  AdminSettingsConfig,
  AdminDashboardWidget,
  AdminDashboardLayout,
  AdminPermissions,
  AdminSettings,
} from '@shared/types/admin';

export class AdminService {
  // Admin Dashboard Management
  async getAdminDashboard(userId: string): Promise<AdminDashboard | null> {
    const q = query(
      null,
      where('userId', '==', userId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      lastAccessed: doc.data().lastAccessed?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as AdminDashboard;
  }

  async createAdminDashboard(
    userId: string,
    role: AdminDashboard['role'],
    permissions: AdminPermissions,
    settings: AdminSettings
  ): Promise<string> {
    const dashboardRef = await addDoc(null, {
      userId,
      role,
      permissions,
      settings,
      lastAccessed: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return dashboardRef.id;
  }

  async updateAdminDashboard(
    dashboardId: string,
    updates: Partial<AdminDashboard>
  ): Promise<void> {
    await updateDoc(doc(db, 'adminDashboards', dashboardId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async updateLastAccessed(dashboardId: string): Promise<void> {
    await updateDoc(doc(db, 'adminDashboards', dashboardId), {
      lastAccessed: serverTimestamp(),
    });
  }

  // Analytics Management
  async getAnalytics(
    period: AdminAnalytics['period'] = 'daily',
    date?: Date
  ): Promise<AdminAnalytics | null> {
    const targetDate = date || new Date();
    const dateString = targetDate.toISOString().split('T')[0];

    const q = query(
      null,
      where('period', '==', period),
      where('date', '==', dateString),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      generatedAt: doc.data().generatedAt?.toDate(),
    } as AdminAnalytics;
  }

  async generateAnalytics(
    period: AdminAnalytics['period'] = 'daily',
    date?: Date
  ): Promise<string> {
    const targetDate = date || new Date();
    
    try {
      // Collect real data from Firebase collections
      const [
        usersSnapshot,
        clubsSnapshot,
        teamsSnapshot,
        eventsSnapshot,
        paymentsSnapshot,
        systemHealthSnapshot
      ] = await Promise.all([
        getDocs(null),
        getDocs(null),
        getDocs(null),
        getDocs(null),
        getDocs(null),
        this.getSystemHealth()
      ]);

      // Process users data
      const users = usersSnapshot.docs.map(doc => doc.data());
      const userMetrics = this.calculateUserMetrics(users);

      // Process clubs data
      const clubs = clubsSnapshot.docs.map(doc => doc.data());
      const clubMetrics = this.calculateClubMetrics(clubs);

      // Process teams data
      const teams = teamsSnapshot.docs.map(doc => doc.data());
      const teamMetrics = this.calculateTeamMetrics(teams);

      // Process events data
      const events = eventsSnapshot.docs.map(doc => doc.data());
      const eventMetrics = this.calculateEventMetrics(events);

      // Process payments data
      const payments = paymentsSnapshot.docs.map(doc => doc.data());
      const paymentMetrics = this.calculatePaymentMetrics(payments);

      // Get system metrics
      const systemMetrics = systemHealthSnapshot ? this.calculateSystemMetrics(systemHealthSnapshot) : {
        uptime: 99.8,
        responseTime: 245,
        errorRate: 0.2,
        activeConnections: users.length,
        storageUsed: 50000000000,
        storageLimit: 100000000000,
        bandwidthUsed: 1000000000,
        bandwidthLimit: 5000000000,
      };

      // Calculate engagement metrics (mock for now, would need analytics integration)
      const engagementMetrics = this.calculateEngagementMetrics(users, events);

      // Generate insights based on real data
      const insights = this.generateInsights(userMetrics, clubMetrics, paymentMetrics, systemMetrics);

      const analytics: Omit<AdminAnalytics, 'id' | 'generatedAt'> = {
        date: targetDate,
        period,
        metrics: {
          users: userMetrics,
          clubs: clubMetrics,
          teams: teamMetrics,
          events: eventMetrics,
          payments: paymentMetrics,
          engagement: engagementMetrics,
          system: systemMetrics,
        },
        insights,
      };

      const analyticsRef = await addDoc(null, {
        ...analytics,
        generatedAt: serverTimestamp(),
      });

      return analyticsRef.id;
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  }

  // Sample Data Creation for Testing
  async createSampleData(): Promise<void> {
    try {
      console.log('Creating sample data for analytics testing...');
      
      // Create sample users
      const sampleUsers = [
        {
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'player',
          status: 'active',
          emailVerified: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          lastActivity: new Date(),
        },
        {
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'coach',
          status: 'active',
          emailVerified: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          lastActivity: new Date(),
        },
        {
          email: 'mike.wilson@example.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          role: 'admin',
          status: 'active',
          emailVerified: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          lastActivity: new Date(),
        },
        {
          email: 'sarah.jones@example.com',
          firstName: 'Sarah',
          lastName: 'Jones',
          role: 'parent',
          status: 'pending',
          emailVerified: false,
          createdAt: new Date(),
          lastActivity: null,
        },
      ];

      // Create sample clubs
      const sampleClubs = [
        {
          name: 'Springfield Soccer Club',
          location: 'Springfield',
          level: 'recreational',
          status: 'active',
          verified: true,
          teams: ['team1', 'team2'],
          members: ['user1', 'user2', 'user3'],
          founded: new Date('2020-01-01'),
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
        {
          name: 'Chicago Elite FC',
          location: 'Chicago',
          level: 'elite',
          status: 'active',
          verified: true,
          teams: ['team3', 'team4'],
          members: ['user4', 'user5'],
          founded: new Date('2018-06-01'),
          createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
        },
        {
          name: 'New Club Pending',
          location: 'Other',
          level: 'competitive',
          status: 'pending',
          verified: false,
          teams: [],
          members: ['user6'],
          founded: new Date(),
          createdAt: new Date(),
        },
      ];

      // Create sample teams
      const sampleTeams = [
        {
          name: 'U12 Boys',
          ageGroup: 'U12',
          gender: 'male',
          level: 'recreational',
          status: 'active',
          players: ['player1', 'player2', 'player3'],
          events: ['event1', 'event2'],
          createdAt: new Date(),
        },
        {
          name: 'U14 Girls',
          ageGroup: 'U14',
          gender: 'female',
          level: 'competitive',
          status: 'active',
          players: ['player4', 'player5', 'player6'],
          events: ['event3', 'event4'],
          createdAt: new Date(),
        },
        {
          name: 'Adult Coed',
          ageGroup: 'Adult',
          gender: 'coed',
          level: 'recreational',
          status: 'active',
          players: ['player7', 'player8'],
          events: ['event5'],
          createdAt: new Date(),
        },
      ];

      // Create sample events
      const sampleEvents = [
        {
          title: 'Practice Session',
          type: 'practice',
          status: 'completed',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          duration: 90,
          attendance: 15,
          createdAt: new Date(),
        },
        {
          title: 'League Game',
          type: 'game',
          status: 'completed',
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          duration: 120,
          attendance: 25,
          createdAt: new Date(),
        },
        {
          title: 'Upcoming Tournament',
          type: 'tournament',
          status: 'scheduled',
          startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          duration: 480,
          attendance: 0,
          createdAt: new Date(),
        },
        {
          title: 'Team Meeting',
          type: 'meeting',
          status: 'scheduled',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          duration: 60,
          attendance: 0,
          createdAt: new Date(),
        },
      ];

      // Create sample payments
      const samplePayments = [
        {
          amount: 50.00,
          currency: 'USD',
          status: 'succeeded',
          paymentMethod: 'stripe',
          createdAt: new Date(),
        },
        {
          amount: 75.00,
          currency: 'USD',
          status: 'succeeded',
          paymentMethod: 'paypal',
          createdAt: new Date(),
        },
        {
          amount: 100.00,
          currency: 'USD',
          status: 'pending',
          paymentMethod: 'bank',
          createdAt: new Date(),
        },
        {
          amount: 25.00,
          currency: 'USD',
          status: 'failed',
          paymentMethod: 'stripe',
          createdAt: new Date(),
        },
      ];

      // Add sample data to Firebase
      const batch = writeBatch(db);

      // Add users
      sampleUsers.forEach(user => {
        const userRef = doc(null);
        batch.set(userRef, user);
      });

      // Add clubs
      sampleClubs.forEach(club => {
        const clubRef = doc(null);
        batch.set(clubRef, club);
      });

      // Add teams
      sampleTeams.forEach(team => {
        const teamRef = doc(null);
        batch.set(teamRef, team);
      });

      // Add events
      sampleEvents.forEach(event => {
        const eventRef = doc(null);
        batch.set(eventRef, event);
      });

      // Add payments
      samplePayments.forEach(payment => {
        const paymentRef = doc(null);
        batch.set(paymentRef, payment);
      });

      await batch.commit();
      console.log('Sample data created successfully!');
    } catch (error) {
      console.error('Error creating sample data:', error);
      throw error;
    }
  }

  // Clear sample data for testing
  async clearSampleData(): Promise<void> {
    try {
      console.log('Clearing sample data...');
      
      const collections = ['users', 'clubs', 'teams', 'events', 'payments'];
      
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        const batch = writeBatch(db);
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
      }
      
      console.log('Sample data cleared successfully!');
    } catch (error) {
      console.error('Error clearing sample data:', error);
      throw error;
    }
  }

  private calculateUserMetrics(users: any[]): UserMetrics {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeUsers = users.filter(user => 
      user.lastActivity && new Date(user.lastActivity.toDate ? user.lastActivity.toDate() : user.lastActivity) > sevenDaysAgo
    );

    const newUsers = users.filter(user => 
      user.createdAt && new Date(user.createdAt.toDate ? user.createdAt.toDate() : user.createdAt) > thirtyDaysAgo
    );

    const verifiedUsers = users.filter(user => user.emailVerified || user.verified);

    const byRole = users.reduce((acc, user) => {
      const role = user.role || 'user';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = users.reduce((acc, user) => {
      const status = user.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth (mock calculation - would need historical data)
    const growth = users.length > 0 ? ((newUsers.length / users.length) * 100) : 0;
    const retention = users.length > 0 ? ((activeUsers.length / users.length) * 100) : 0;
    const churn = users.length > 0 ? (100 - retention) : 0;

    return {
      total: users.length,
      active: activeUsers.length,
      new: newUsers.length,
      verified: verifiedUsers.length,
      byRole,
      byStatus,
      growth: Math.round(growth * 10) / 10,
      retention: Math.round(retention * 10) / 10,
      churn: Math.round(churn * 10) / 10,
    };
  }

  private calculateClubMetrics(clubs: any[]): ClubMetrics {
    const activeClubs = clubs.filter(club => club.status === 'active');
    const pendingClubs = clubs.filter(club => club.status === 'pending');
    const verifiedClubs = clubs.filter(club => club.verified);

    const byLevel = clubs.reduce((acc, club) => {
      const level = club.level || 'recreational';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = clubs.reduce((acc, club) => {
      const location = club.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalTeams = clubs.reduce((acc, club) => acc + (club.teams?.length || 0), 0);
    const totalPlayers = clubs.reduce((acc, club) => acc + (club.members?.length || 0), 0);

    const growth = clubs.length > 0 ? ((pendingClubs.length / clubs.length) * 100) : 0;
    const averageTeams = clubs.length > 0 ? totalTeams / clubs.length : 0;
    const averagePlayers = clubs.length > 0 ? totalPlayers / clubs.length : 0;

    return {
      total: clubs.length,
      active: activeClubs.length,
      pending: pendingClubs.length,
      verified: verifiedClubs.length,
      byLevel,
      byLocation,
      growth: Math.round(growth * 10) / 10,
      averageTeams: Math.round(averageTeams * 10) / 10,
      averagePlayers: Math.round(averagePlayers * 10) / 10,
    };
  }

  private calculateTeamMetrics(teams: any[]): TeamMetrics {
    const activeTeams = teams.filter(team => team.status === 'active');

    const byAgeGroup = teams.reduce((acc, team) => {
      const ageGroup = team.ageGroup || 'Unknown';
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byGender = teams.reduce((acc, team) => {
      const gender = team.gender || 'coed';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLevel = teams.reduce((acc, team) => {
      const level = team.level || 'recreational';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPlayers = teams.reduce((acc, team) => acc + (team.players?.length || 0), 0);
    const totalEvents = teams.reduce((acc, team) => acc + (team.events?.length || 0), 0);

    const averagePlayers = teams.length > 0 ? totalPlayers / teams.length : 0;
    const averageEvents = teams.length > 0 ? totalEvents / teams.length : 0;

    return {
      total: teams.length,
      active: activeTeams.length,
      byAgeGroup,
      byGender,
      byLevel,
      averagePlayers: Math.round(averagePlayers * 10) / 10,
      averageEvents: Math.round(averageEvents * 10) / 10,
    };
  }

  private calculateEventMetrics(events: any[]): EventMetrics {
    const now = new Date();
    const upcomingEvents = events.filter(event => 
      event.startTime && new Date(event.startTime.toDate ? event.startTime.toDate() : event.startTime) > now
    );
    const completedEvents = events.filter(event => event.status === 'completed');
    const cancelledEvents = events.filter(event => event.status === 'cancelled');

    const byType = events.reduce((acc, event) => {
      const type = event.type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = events.reduce((acc, event) => {
      const status = event.status || 'scheduled';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalAttendance = events.reduce((acc, event) => acc + (event.attendance || 0), 0);
    const totalDuration = events.reduce((acc, event) => acc + (event.duration || 0), 0);

    const averageAttendance = events.length > 0 ? totalAttendance / events.length : 0;
    const averageDuration = events.length > 0 ? totalDuration / events.length : 0;

    return {
      total: events.length,
      upcoming: upcomingEvents.length,
      completed: completedEvents.length,
      cancelled: cancelledEvents.length,
      byType,
      byStatus,
      averageAttendance: Math.round(averageAttendance * 10) / 10,
      averageDuration: Math.round(averageDuration),
    };
  }

  private calculatePaymentMetrics(payments: any[]): PaymentMetrics {
    const successfulPayments = payments.filter(payment => payment.status === 'succeeded');
    const failedPayments = payments.filter(payment => payment.status === 'failed');
    const pendingPayments = payments.filter(payment => payment.status === 'pending');
    const refundedPayments = payments.filter(payment => payment.status === 'refunded');

    const totalAmount = payments.reduce((acc, payment) => acc + (payment.amount || 0), 0);
    const successfulAmount = successfulPayments.reduce((acc, payment) => acc + (payment.amount || 0), 0);

    const byMethod = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageAmount = payments.length > 0 ? totalAmount / payments.length : 0;
    const conversionRate = payments.length > 0 ? (successfulPayments.length / payments.length) * 100 : 0;

    return {
      total: payments.length,
      amount: totalAmount,
      currency: 'USD', // Default currency
      successful: successfulPayments.length,
      failed: failedPayments.length,
      pending: pendingPayments.length,
      refunded: refundedPayments.length,
      byMethod,
      averageAmount: Math.round(averageAmount * 100) / 100,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }

  private calculateSystemMetrics(systemHealth: AdminSystemHealth): SystemMetrics {
    return {
      uptime: systemHealth.services.database.uptime,
      responseTime: systemHealth.services.database.responseTime,
      errorRate: systemHealth.errors.length > 0 ? (systemHealth.errors.length / 100) * 100 : 0,
      activeConnections: systemHealth.performance.cpu * 100, // Mock calculation
      storageUsed: systemHealth.performance.disk * 100000000000, // Mock calculation
      storageLimit: 100000000000, // 100GB
      bandwidthUsed: systemHealth.performance.network,
      bandwidthLimit: 5000000000, // 5GB
    };
  }

  private calculateEngagementMetrics(users: any[], events: any[]): EngagementMetrics {
    // Mock engagement metrics - would need real analytics data
    const pageViews = users.length * 25; // Mock calculation
    const uniqueVisitors = users.length;
    const returningVisitors = Math.floor(users.length * 0.5);
    const averageSessionDuration = 180; // 3 minutes
    const bounceRate = 35.2;

    const topPages = [
      { page: '/dashboard', views: pageViews * 0.2, uniqueViews: uniqueVisitors * 0.35 },
      { page: '/clubs', views: pageViews * 0.14, uniqueViews: uniqueVisitors * 0.29 },
      { page: '/teams', views: pageViews * 0.12, uniqueViews: uniqueVisitors * 0.24 },
    ];

    const topReferrers = [
      { source: 'Direct', visits: uniqueVisitors * 0.47, percentage: 47.1 },
      { source: 'Google', visits: uniqueVisitors * 0.29, percentage: 29.4 },
      { source: 'Social', visits: uniqueVisitors * 0.24, percentage: 23.5 },
    ];

    const deviceTypes = [
      { device: 'Mobile', visits: uniqueVisitors * 0.6, percentage: 60.0 },
      { device: 'Desktop', visits: uniqueVisitors * 0.3, percentage: 30.0 },
      { device: 'Tablet', visits: uniqueVisitors * 0.1, percentage: 10.0 },
    ];

    return {
      pageViews,
      uniqueVisitors,
      returningVisitors,
      averageSessionDuration,
      bounceRate,
      topPages,
      topReferrers,
      deviceTypes,
    };
  }

  private generateInsights(
    userMetrics: UserMetrics,
    clubMetrics: ClubMetrics,
    paymentMetrics: PaymentMetrics,
    systemMetrics: SystemMetrics
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // User growth insight
    if (userMetrics.growth > 10) {
      insights.push({
        id: '1',
        type: 'trend',
        title: 'Strong User Growth',
        description: `User registrations have increased by ${userMetrics.growth}% this period`,
        severity: 'low',
        category: 'users',
        data: { growth: userMetrics.growth },
        actionable: true,
        actionUrl: '/admin/users',
        createdAt: new Date(),
      });
    }

    // Club growth insight
    if (clubMetrics.growth > 5) {
      insights.push({
        id: '2',
        type: 'trend',
        title: 'Club Growth Increasing',
        description: `New club registrations have increased by ${clubMetrics.growth}%`,
        severity: 'low',
        category: 'clubs',
        data: { growth: clubMetrics.growth },
        actionable: true,
        actionUrl: '/admin/clubs',
        createdAt: new Date(),
      });
    }

    // Payment conversion insight
    if (paymentMetrics.conversionRate < 90) {
      insights.push({
        id: '3',
        type: 'anomaly',
        title: 'Low Payment Conversion',
        description: `Payment conversion rate is ${paymentMetrics.conversionRate}%, below target`,
        severity: 'high',
        category: 'payments',
        data: { conversionRate: paymentMetrics.conversionRate },
        actionable: true,
        actionUrl: '/admin/payments',
        createdAt: new Date(),
      });
    }

    // System health insight
    if (systemMetrics.errorRate > 1) {
      insights.push({
        id: '4',
        type: 'anomaly',
        title: 'High Error Rate Detected',
        description: `System error rate is ${systemMetrics.errorRate}%`,
        severity: 'high',
        category: 'system',
        data: { errorRate: systemMetrics.errorRate },
        actionable: true,
        actionUrl: '/admin/system/health',
        createdAt: new Date(),
      });
    }

    return insights;
  }

  // Admin User Management
  async getAdminUsers(limit: number = 50): Promise<AdminUser[]> {
    const q = query(
      null,
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastLogin: doc.data().lastLogin?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      security: {
        ...doc.data().security,
        lastPasswordChange: doc.data().security?.lastPasswordChange?.toDate(),
        lockedUntil: doc.data().security?.lockedUntil?.toDate(),
      },
      activity: {
        ...doc.data().activity,
        lastActivity: doc.data().activity?.lastActivity?.toDate(),
      },
    })) as AdminUser[];
  }

  async getAdminUser(userId: string): Promise<AdminUser | null> {
    const doc = await getDoc(doc(db, 'adminUsers', userId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      lastLogin: doc.data().lastLogin?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      security: {
        ...doc.data().security,
        lastPasswordChange: doc.data().security?.lastPasswordChange?.toDate(),
        lockedUntil: doc.data().security?.lockedUntil?.toDate(),
      },
      activity: {
        ...doc.data().activity,
        lastActivity: doc.data().activity?.lastActivity?.toDate(),
      },
    } as AdminUser;
  }

  async createAdminUser(userData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userRef = await addDoc(null, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userRef.id;
  }

  async updateAdminUser(
    userId: string,
    updates: Partial<AdminUser>
  ): Promise<void> {
    await updateDoc(doc(db, 'adminUsers', userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteAdminUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, 'adminUsers', userId));
  }

  // Audit Log Management
  async logAuditEvent(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any>,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string
  ): Promise<string> {
    const auditRef = await addDoc(null, {
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      timestamp: serverTimestamp(),
      success,
      errorMessage,
    });

    return auditRef.id;
  }

  async getAuditLogs(
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      success?: boolean;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100
  ): Promise<AdminAuditLog[]> {
    let q = query(null, orderBy('timestamp', 'desc'));

    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters?.action) {
      q = query(q, where('action', '==', filters.action));
    }
    if (filters?.resource) {
      q = query(q, where('resource', '==', filters.resource));
    }
    if (filters?.success !== undefined) {
      q = query(q, where('success', '==', filters.success));
    }

    q = query(q, limit(limit));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    })) as AdminAuditLog[];
  }

  // System Health Monitoring
  async getSystemHealth(): Promise<AdminSystemHealth | null> {
    const q = query(
      null,
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
      services: {
        ...doc.data().services,
        database: {
          ...doc.data().services.database,
          lastCheck: doc.data().services.database?.lastCheck?.toDate(),
        },
        storage: {
          ...doc.data().services.storage,
          lastCheck: doc.data().services.storage?.lastCheck?.toDate(),
        },
        auth: {
          ...doc.data().services.auth,
          lastCheck: doc.data().services.auth?.lastCheck?.toDate(),
        },
        functions: {
          ...doc.data().services.functions,
          lastCheck: doc.data().services.functions?.lastCheck?.toDate(),
        },
        messaging: {
          ...doc.data().services.messaging,
          lastCheck: doc.data().services.messaging?.lastCheck?.toDate(),
        },
      },
      errors: doc.data().errors.map((error: any) => ({
        ...error,
        timestamp: error.timestamp?.toDate(),
        resolvedAt: error.resolvedAt?.toDate(),
      })),
      alerts: doc.data().alerts.map((alert: any) => ({
        ...alert,
        timestamp: alert.timestamp?.toDate(),
        acknowledgedAt: alert.acknowledgedAt?.toDate(),
        resolvedAt: alert.resolvedAt?.toDate(),
      })),
    } as AdminSystemHealth;
  }

  async updateSystemHealth(healthData: Partial<AdminSystemHealth>): Promise<string> {
    const healthRef = await addDoc(null, {
      ...healthData,
      timestamp: serverTimestamp(),
    });

    return healthRef.id;
  }

  // Report Management
  async getReports(limit: number = 50): Promise<AdminReport[]> {
    const q = query(
      null,
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastGenerated: doc.data().lastGenerated?.toDate(),
      nextGeneration: doc.data().nextGeneration?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AdminReport[];
  }

  async createReport(reportData: Omit<AdminReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const reportRef = await addDoc(null, {
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return reportRef.id;
  }

  async updateReport(
    reportId: string,
    updates: Partial<AdminReport>
  ): Promise<void> {
    await updateDoc(doc(db, 'adminReports', reportId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteReport(reportId: string): Promise<void> {
    await deleteDoc(doc(db, 'adminReports', reportId));
  }

  // Notification Management
  async getNotifications(
    userId: string,
    limit: number = 50
  ): Promise<AdminNotification[]> {
    const q = query(
      null,
      where('recipients', 'array-contains', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiresAt: doc.data().expiresAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AdminNotification[];
  }

  async createNotification(
    notificationData: Omit<AdminNotification, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const notificationRef = await addDoc(null, {
      ...notificationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return notificationRef.id;
  }

  async markNotificationAsRead(
    notificationId: string,
    userId: string
  ): Promise<void> {
    await updateDoc(doc(db, 'adminNotifications', notificationId), {
      readBy: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  }

  // Backup Management
  async getBackups(limit: number = 50): Promise<AdminBackup[]> {
    const q = query(
      null,
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
    })) as AdminBackup[];
  }

  async createBackup(
    backupData: Omit<AdminBackup, 'id' | 'createdAt' | 'completedAt' | 'expiresAt'>
  ): Promise<string> {
    const backupRef = await addDoc(null, {
      ...backupData,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + backupData.retentionDays * 24 * 60 * 60 * 1000),
    });

    return backupRef.id;
  }

  // Maintenance Management
  async getMaintenanceSchedules(limit: number = 50): Promise<AdminMaintenance[]> {
    const q = query(
      null,
      orderBy('startTime', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime?.toDate(),
      endTime: doc.data().endTime?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as AdminMaintenance[];
  }

  async createMaintenance(
    maintenanceData: Omit<AdminMaintenance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const maintenanceRef = await addDoc(null, {
      ...maintenanceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return maintenanceRef.id;
  }

  // Billing Management
  async getBillingHistory(limit: number = 50): Promise<AdminBilling[]> {
    const q = query(
      null,
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidAt: doc.data().paidAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AdminBilling[];
  }

  // Settings Management
  async getSettingsConfig(category?: string): Promise<AdminSettingsConfig[]> {
    let q = query(null, orderBy('category'));

    if (category) {
      q = query(q, where('category', '==', category));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AdminSettingsConfig[];
  }

  async updateSetting(
    settingId: string,
    value: any,
    updatedBy: string
  ): Promise<void> {
    await updateDoc(doc(db, 'adminSettingsConfig', settingId), {
      value,
      updatedBy,
      updatedAt: serverTimestamp(),
    });
  }

  // Dashboard Widgets
  async getDashboardWidgets(): Promise<AdminDashboardWidget[]> {
    const q = query(
      null,
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as AdminDashboardWidget[];
  }

  async createDashboardWidget(
    widgetData: Omit<AdminDashboardWidget, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const widgetRef = await addDoc(null, {
      ...widgetData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return widgetRef.id;
  }

  // Real-time Listeners
  subscribeToAnalytics(
    period: AdminAnalytics['period'],
    callback: (analytics: AdminAnalytics | null) => void
  ): () => void {
    const q = query(
      null,
      where('period', '==', period),
      orderBy('date', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const analytics = {
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        generatedAt: doc.data().generatedAt?.toDate(),
      } as AdminAnalytics;
      callback(analytics);
    });
  }

  subscribeToSystemHealth(
    callback: (health: AdminSystemHealth | null) => void
  ): () => void {
    const q = query(
      null,
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const health = {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      } as AdminSystemHealth;
      callback(health);
    });
  }

  subscribeToNotifications(
    userId: string,
    callback: (notifications: AdminNotification[]) => void
  ): () => void {
    const q = query(
      null,
      where('recipients', 'array-contains', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiresAt: doc.data().expiresAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as AdminNotification[];
      callback(notifications);
    });
  }
}

export const adminService = new AdminService(); 