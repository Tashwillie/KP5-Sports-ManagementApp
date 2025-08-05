import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from '@shared/utils/firebase';
import {
  PublicClubProfile,
  PublicTeamProfile,
  PublicSearchFilters,
  PublicSearchResult,
  PublicAnalytics,
  PublicSubscription,
  PublicContactForm,
  PublicReview,
  PublicFAQ,
  PublicSponsor,
  PublicVolunteer,
  PublicSitemap,
  SEOMetadata,
  PublicProfileSettings,
} from '@shared/types/public';

export class PublicService {
  // Public Club Profile Management
  async createPublicClubProfile(
    clubId: string,
    profileData: Omit<PublicClubProfile, 'id' | 'clubId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const profileRef = await addDoc(collection(db, 'publicClubProfiles'), {
      ...profileData,
      clubId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return profileRef.id;
  }

  async getPublicClubProfile(slug: string): Promise<PublicClubProfile | null> {
    const q = query(
      collection(db, 'publicClubProfiles'),
      where('slug', '==', slug),
      where('isActive', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PublicClubProfile;
  }

  async getPublicClubProfileById(clubId: string): Promise<PublicClubProfile | null> {
    const q = query(
      collection(db, 'publicClubProfiles'),
      where('clubId', '==', clubId),
      where('isActive', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PublicClubProfile;
  }

  async updatePublicClubProfile(
    profileId: string,
    updates: Partial<PublicClubProfile>
  ): Promise<void> {
    await updateDoc(doc(db, 'publicClubProfiles', profileId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  // Public Team Profile Management
  async createPublicTeamProfile(
    teamId: string,
    profileData: Omit<PublicTeamProfile, 'id' | 'teamId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const profileRef = await addDoc(collection(db, 'publicTeamProfiles'), {
      ...profileData,
      teamId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return profileRef.id;
  }

  async getPublicTeamProfile(slug: string): Promise<PublicTeamProfile | null> {
    const q = query(
      collection(db, 'publicTeamProfiles'),
      where('slug', '==', slug),
      where('isActive', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PublicTeamProfile;
  }

  async getPublicTeamProfileById(teamId: string): Promise<PublicTeamProfile | null> {
    const q = query(
      collection(db, 'publicTeamProfiles'),
      where('teamId', '==', teamId),
      where('isActive', '==', true),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PublicTeamProfile;
  }

  async updatePublicTeamProfile(
    profileId: string,
    updates: Partial<PublicTeamProfile>
  ): Promise<void> {
    await updateDoc(doc(db, 'publicTeamProfiles', profileId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  // Search Functionality
  async searchPublicProfiles(filters: PublicSearchFilters): Promise<PublicSearchResult[]> {
    let q = query(collection(db, 'publicClubProfiles'), where('isActive', '==', true));

    // Apply filters
    if (filters.category === 'club') {
      q = query(collection(db, 'publicClubProfiles'), where('isActive', '==', true));
    } else if (filters.category === 'team') {
      q = query(collection(db, 'publicTeamProfiles'), where('isActive', '==', true));
    }

    if (filters.location?.city) {
      q = query(q, where('location.address.city', '==', filters.location.city));
    }

    if (filters.location?.state) {
      q = query(q, where('location.address.state', '==', filters.location.state));
    }

    if (filters.sport) {
      q = query(q, where('sport', '==', filters.sport));
    }

    if (filters.ageGroup) {
      q = query(q, where('ageGroup', '==', filters.ageGroup));
    }

    if (filters.gender) {
      q = query(q, where('gender', '==', filters.gender));
    }

    if (filters.level) {
      q = query(q, where('level', '==', filters.level));
    }

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({
      type: filters.category || 'club',
      id: doc.id,
      title: doc.data().name,
      description: doc.data().description,
      url: `/${filters.category || 'club'}/${doc.data().slug}`,
      image: doc.data().logo?.url,
      location: doc.data().location,
      stats: doc.data().stats,
      relevance: 1.0,
      highlights: [],
    })) as PublicSearchResult[];

    // Apply text search if query provided
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(result => 
        result.title.toLowerCase().includes(query) ||
        result.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'relevance':
            aValue = a.relevance;
            bValue = b.relevance;
            break;
          case 'date':
            aValue = new Date();
            bValue = new Date();
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    if (filters.limit) {
      results = results.slice(filters.offset || 0, (filters.offset || 0) + filters.limit);
    }

    return results;
  }

  // Analytics Tracking
  async trackPageView(
    profileId: string,
    profileType: 'club' | 'team',
    page: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analyticsRef = doc(db, 'publicAnalytics', `${profileId}_${today.toISOString().split('T')[0]}`);
    const analyticsDoc = await getDoc(analyticsRef);

    if (analyticsDoc.exists()) {
      await updateDoc(analyticsRef, {
        pageViews: increment(1),
        topPages: arrayUnion({ page, views: 1 }),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(analyticsRef, {
        profileId,
        profileType,
        date: today,
        pageViews: 1,
        uniqueVisitors: 0,
        returningVisitors: 0,
        averageTimeOnPage: 0,
        bounceRate: 0,
        topPages: [{ page, views: 1 }],
        trafficSources: [],
        deviceTypes: [],
        countries: [],
        searchTerms: [],
        socialShares: [],
        conversions: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  // Subscription Management
  async subscribeToProfile(
    email: string,
    profileId: string,
    profileType: 'club' | 'team',
    preferences: any
  ): Promise<string> {
    const subscriptionData: Omit<PublicSubscription, 'id' | 'subscribedAt'> = {
      email,
      profileId,
      profileType,
      preferences,
      isActive: true,
    };

    const subscriptionRef = await addDoc(collection(db, 'publicSubscriptions'), {
      ...subscriptionData,
      subscribedAt: serverTimestamp(),
    });

    return subscriptionRef.id;
  }

  async unsubscribeFromProfile(subscriptionId: string): Promise<void> {
    await updateDoc(doc(db, 'publicSubscriptions', subscriptionId), {
      isActive: false,
      unsubscribedAt: serverTimestamp(),
    });
  }

  // Contact Form Management
  async submitContactForm(
    profileId: string,
    profileType: 'club' | 'team',
    formData: Omit<PublicContactForm, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const contactFormData: Omit<PublicContactForm, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      profileId,
      profileType,
      status: 'new',
    };

    const contactFormRef = await addDoc(collection(db, 'publicContactForms'), {
      ...contactFormData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return contactFormRef.id;
  }

  // Review Management
  async submitReview(
    profileId: string,
    profileType: 'club' | 'team',
    reviewData: Omit<PublicReview, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const reviewRef = await addDoc(collection(db, 'publicReviews'), {
      ...reviewData,
      profileId,
      profileType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return reviewRef.id;
  }

  async getProfileReviews(
    profileId: string,
    profileType: 'club' | 'team',
    limit: number = 10
  ): Promise<PublicReview[]> {
    const q = query(
      collection(db, 'publicReviews'),
      where('profileId', '==', profileId),
      where('profileType', '==', profileType),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PublicReview[];
  }

  // FAQ Management
  async getProfileFAQs(
    profileId: string,
    profileType: 'club' | 'team'
  ): Promise<PublicFAQ[]> {
    const q = query(
      collection(db, 'publicFAQs'),
      where('profileId', '==', profileId),
      where('profileType', '==', profileType),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PublicFAQ[];
  }

  // Sponsor Management
  async getProfileSponsors(
    profileId: string,
    profileType: 'club' | 'team'
  ): Promise<PublicSponsor[]> {
    const q = query(
      collection(db, 'publicSponsors'),
      where('profileId', '==', profileId),
      where('profileType', '==', profileType),
      where('isActive', '==', true),
      orderBy('level', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
    })) as PublicSponsor[];
  }

  // Volunteer Management
  async getProfileVolunteers(
    profileId: string,
    profileType: 'club' | 'team'
  ): Promise<PublicVolunteer[]> {
    const q = query(
      collection(db, 'publicVolunteers'),
      where('profileId', '==', profileId),
      where('profileType', '==', profileType),
      where('isActive', '==', true),
      orderBy('joinedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate(),
    })) as PublicVolunteer[];
  }

  // SEO Management
  async generateSEOMetadata(
    profile: PublicClubProfile | PublicTeamProfile
  ): Promise<SEOMetadata> {
    const baseUrl = 'https://kp5-academy.com';
    const profileUrl = `${baseUrl}/${profile.slug}`;

    return {
      title: `${profile.name} - KP5 Academy`,
      description: profile.shortDescription || profile.description.substring(0, 160),
      keywords: [
        profile.name,
        'soccer',
        'football',
        'sports',
        'team',
        'club',
        'youth sports',
        'athletics',
      ],
      ogTitle: profile.name,
      ogDescription: profile.shortDescription || profile.description.substring(0, 160),
      ogImage: profile.logo?.url,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: profile.name,
      twitterDescription: profile.shortDescription || profile.description.substring(0, 160),
      twitterImage: profile.logo?.url,
      canonicalUrl: profileUrl,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'SportsOrganization',
        name: profile.name,
        description: profile.description,
        url: profileUrl,
        logo: profile.logo?.url,
        image: profile.banner?.url,
        address: {
          '@type': 'PostalAddress',
          streetAddress: profile.location.address.street,
          addressLocality: profile.location.address.city,
          addressRegion: profile.location.address.state,
          postalCode: profile.location.address.zipCode,
          addressCountry: profile.location.address.country,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: profile.contact.email,
          telephone: profile.contact.phone,
        },
      },
    };
  }

  // Sitemap Generation
  async generateSitemap(
    profileId: string,
    profileType: 'club' | 'team'
  ): Promise<PublicSitemap> {
    const pages = [
      {
        url: `/${profileType}/${profileId}`,
        title: 'Home',
        description: 'Main profile page',
        priority: 1.0,
        changeFreq: 'daily' as const,
        lastModified: new Date(),
      },
      {
        url: `/${profileType}/${profileId}/roster`,
        title: 'Roster',
        description: 'Team roster and player information',
        priority: 0.8,
        changeFreq: 'weekly' as const,
        lastModified: new Date(),
      },
      {
        url: `/${profileType}/${profileId}/schedule`,
        title: 'Schedule',
        description: 'Game schedule and events',
        priority: 0.9,
        changeFreq: 'daily' as const,
        lastModified: new Date(),
      },
      {
        url: `/${profileType}/${profileId}/stats`,
        title: 'Statistics',
        description: 'Team and player statistics',
        priority: 0.7,
        changeFreq: 'weekly' as const,
        lastModified: new Date(),
      },
      {
        url: `/${profileType}/${profileId}/news`,
        title: 'News',
        description: 'Latest news and updates',
        priority: 0.6,
        changeFreq: 'daily' as const,
        lastModified: new Date(),
      },
      {
        url: `/${profileType}/${profileId}/gallery`,
        title: 'Gallery',
        description: 'Photos and videos',
        priority: 0.5,
        changeFreq: 'weekly' as const,
        lastModified: new Date(),
      },
      {
        url: `/${profileType}/${profileId}/contact`,
        title: 'Contact',
        description: 'Contact information and form',
        priority: 0.4,
        changeFreq: 'monthly' as const,
        lastModified: new Date(),
      },
    ];

    const sitemapData: Omit<PublicSitemap, 'id'> = {
      profileId,
      profileType,
      pages,
      lastGenerated: new Date(),
      nextGeneration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };

    const sitemapRef = await addDoc(collection(db, 'publicSitemaps'), sitemapData);
    return {
      id: sitemapRef.id,
      ...sitemapData,
    };
  }

  // Utility Methods
  private async getCurrentUser() {
    // This would be implemented based on your auth provider
    // For now, returning null - implement based on your auth setup
    return null;
  }

  // Real-time Listeners
  subscribeToPublicClubProfile(
    slug: string,
    callback: (profile: PublicClubProfile | null) => void
  ): () => void {
    const q = query(
      collection(db, 'publicClubProfiles'),
      where('slug', '==', slug),
      where('isActive', '==', true),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const profile = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as PublicClubProfile;
      callback(profile);
    });
  }

  subscribeToPublicTeamProfile(
    slug: string,
    callback: (profile: PublicTeamProfile | null) => void
  ): () => void {
    const q = query(
      collection(db, 'publicTeamProfiles'),
      where('slug', '==', slug),
      where('isActive', '==', true),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const profile = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as PublicTeamProfile;
      callback(profile);
    });
  }
}

export const publicService = new PublicService(); 