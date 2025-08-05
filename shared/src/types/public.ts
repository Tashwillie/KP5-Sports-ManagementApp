export interface PublicClubProfile {
  id: string;
  clubId: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  logo: PublicMedia;
  banner: PublicMedia;
  founded: number;
  location: PublicLocation;
  contact: PublicContact;
  social: PublicSocial;
  stats: PublicClubStats;
  teams: PublicTeamSummary[];
  achievements: PublicAchievement[];
  news: PublicNewsItem[];
  events: PublicEvent[];
  gallery: PublicMedia[];
  seo: SEOMetadata;
  settings: PublicProfileSettings;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicTeamProfile {
  id: string;
  teamId: string;
  clubId: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  logo: PublicMedia;
  banner: PublicMedia;
  season: string;
  ageGroup: string;
  gender: 'male' | 'female' | 'coed';
  level: 'recreational' | 'competitive' | 'elite';
  division: string;
  league: string;
  location: PublicLocation;
  contact: PublicContact;
  stats: PublicTeamStats;
  roster: PublicPlayer[];
  schedule: PublicEvent[];
  achievements: PublicAchievement[];
  news: PublicNewsItem[];
  gallery: PublicMedia[];
  seo: SEOMetadata;
  settings: PublicProfileSettings;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicLocation {
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  venue: string;
  venueType: 'field' | 'gym' | 'stadium' | 'complex' | 'other';
  facilities: string[];
  directions?: string;
}

export interface PublicContact {
  email: string;
  phone?: string;
  website?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    email?: string;
  };
  officeHours?: {
    days: string[];
    hours: string;
  };
}

export interface PublicSocial {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  tiktok?: string;
  website?: string;
}

export interface PublicMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt: string;
  caption?: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: Date;
}

export interface PublicClubStats {
  totalTeams: number;
  totalPlayers: number;
  totalCoaches: number;
  totalEvents: number;
  totalTournaments: number;
  championships: number;
  seasonsActive: number;
  averageAttendance: number;
  socialMediaFollowers: number;
  websiteVisits: number;
  lastUpdated: Date;
}

export interface PublicTeamStats {
  season: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
  streak: string;
  homeRecord: string;
  awayRecord: string;
  lastGame: PublicGameResult;
  nextGame: PublicEvent;
  achievements: PublicAchievement[];
  lastUpdated: Date;
}

export interface PublicTeamSummary {
  id: string;
  name: string;
  slug: string;
  season: string;
  ageGroup: string;
  gender: 'male' | 'female' | 'coed';
  level: 'recreational' | 'competitive' | 'elite';
  logo: PublicMedia;
  stats: {
    wins: number;
    losses: number;
    ties: number;
    winPercentage: number;
  };
  isActive: boolean;
}

export interface PublicPlayer {
  id: string;
  name: string;
  number: string;
  position: string;
  age: number;
  height?: string;
  weight?: string;
  photo: PublicMedia;
  stats: PublicPlayerStats;
  achievements: PublicAchievement[];
  bio?: string;
  isActive: boolean;
  joinedAt: Date;
}

export interface PublicPlayerStats {
  season: string;
  gamesPlayed: number;
  gamesStarted: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  shots: number;
  shotsOnGoal: number;
  shotPercentage: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  foulsSuffered: number;
  saves?: number; // for goalkeepers
  cleanSheets?: number; // for goalkeepers
  goalsAgainst?: number; // for goalkeepers
  savePercentage?: number; // for goalkeepers
  lastUpdated: Date;
}

export interface PublicEvent {
  id: string;
  title: string;
  description?: string;
  type: 'game' | 'practice' | 'tournament' | 'meeting' | 'other';
  startDate: Date;
  endDate: Date;
  location: PublicLocation;
  opponent?: string;
  opponentLogo?: PublicMedia;
  result?: PublicGameResult;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  isHome: boolean;
  tickets?: {
    available: boolean;
    price?: number;
    url?: string;
  };
  streamUrl?: string;
  highlights?: PublicMedia[];
  photos?: PublicMedia[];
  attendance?: number;
}

export interface PublicGameResult {
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  period: 'full_time' | 'extra_time' | 'penalties';
  highlights?: string[];
  keyMoments: GameMoment[];
  stats: GameStats;
  date: Date;
}

export interface GameMoment {
  minute: number;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'injury';
  player: string;
  description: string;
  team: 'home' | 'away';
}

export interface GameStats {
  possession: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
  yellowCards: {
    home: number;
    away: number;
  };
  redCards: {
    home: number;
    away: number;
  };
}

export interface PublicAchievement {
  id: string;
  title: string;
  description: string;
  type: 'championship' | 'tournament' | 'award' | 'milestone' | 'record';
  category: 'team' | 'individual' | 'club';
  date: Date;
  season?: string;
  tournament?: string;
  league?: string;
  trophy?: PublicMedia;
  certificate?: PublicMedia;
  isHighlighted: boolean;
}

export interface PublicNewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  featuredImage?: PublicMedia;
  tags: string[];
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  slug: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

export interface PublicProfileSettings {
  isPublic: boolean;
  showRoster: boolean;
  showStats: boolean;
  showSchedule: boolean;
  showNews: boolean;
  showGallery: boolean;
  showContact: boolean;
  allowComments: boolean;
  allowSharing: boolean;
  requireAuth: boolean;
  customCss?: string;
  customJs?: string;
  analytics: {
    googleAnalytics?: string;
    facebookPixel?: string;
    customTracking?: string;
  };
}

export interface PublicSearchFilters {
  query?: string;
  category?: 'club' | 'team' | 'player' | 'event';
  location?: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number;
  };
  sport?: string;
  ageGroup?: string;
  gender?: 'male' | 'female' | 'coed';
  level?: 'recreational' | 'competitive' | 'elite';
  season?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  sortBy?: 'name' | 'distance' | 'rating' | 'relevance' | 'date';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PublicSearchResult {
  type: 'club' | 'team' | 'player' | 'event';
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  location?: PublicLocation;
  stats?: Record<string, any>;
  relevance: number;
  highlights: string[];
}

export interface PublicAnalytics {
  id: string;
  profileId: string;
  profileType: 'club' | 'team';
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  returningVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  topPages: {
    page: string;
    views: number;
  }[];
  trafficSources: {
    source: string;
    visits: number;
    percentage: number;
  }[];
  deviceTypes: {
    device: string;
    visits: number;
    percentage: number;
  }[];
  countries: {
    country: string;
    visits: number;
    percentage: number;
  }[];
  searchTerms: {
    term: string;
    searches: number;
  }[];
  socialShares: {
    platform: string;
    shares: number;
  }[];
  conversions: {
    type: string;
    count: number;
    value: number;
  }[];
}

export interface PublicSubscription {
  id: string;
  email: string;
  profileId: string;
  profileType: 'club' | 'team';
  preferences: {
    news: boolean;
    events: boolean;
    results: boolean;
    announcements: boolean;
  };
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  lastEmailSent?: Date;
}

export interface PublicContactForm {
  id: string;
  profileId: string;
  profileType: 'club' | 'team';
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: 'general' | 'registration' | 'coaching' | 'sponsorship' | 'other';
  status: 'new' | 'read' | 'replied' | 'closed';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  repliedAt?: Date;
  replyMessage?: string;
}

export interface PublicReview {
  id: string;
  profileId: string;
  profileType: 'club' | 'team';
  reviewerName: string;
  reviewerEmail?: string;
  rating: number; // 1-5
  title: string;
  content: string;
  category: 'overall' | 'coaching' | 'facilities' | 'organization' | 'value';
  isVerified: boolean;
  isPublic: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
  response?: {
    author: string;
    content: string;
    createdAt: Date;
  };
}

export interface PublicFAQ {
  id: string;
  profileId: string;
  profileType: 'club' | 'team';
  question: string;
  answer: string;
  category: string;
  tags: string[];
  order: number;
  isActive: boolean;
  viewCount: number;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicSponsor {
  id: string;
  profileId: string;
  profileType: 'club' | 'team';
  name: string;
  logo: PublicMedia;
  website?: string;
  description?: string;
  level: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  benefits: string[];
  contribution?: string;
}

export interface PublicVolunteer {
  id: string;
  profileId: string;
  profileType: 'club' | 'team';
  name: string;
  photo?: PublicMedia;
  role: string;
  description?: string;
  email?: string;
  phone?: string;
  social?: PublicSocial;
  bio?: string;
  isActive: boolean;
  joinedAt: Date;
  achievements: PublicAchievement[];
}

export interface PublicSitemap {
  id: string;
  profileId: string;
  profileType: 'club' | 'team';
  pages: SitemapPage[];
  lastGenerated: Date;
  nextGeneration: Date;
}

export interface SitemapPage {
  url: string;
  title: string;
  description?: string;
  priority: number; // 0.0 - 1.0
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified: Date;
  images?: {
    url: string;
    title?: string;
    caption?: string;
  }[];
} 