export interface Player {
  id: string;
  userId: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  clubId: string;
  teamIds: string[];
  jerseyNumber: number;
  position: PlayerPosition;
  positions?: PlayerPosition[]; // Multiple positions
  dateOfBirth: Date;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  dominantFoot: 'left' | 'right' | 'both';
  preferredFoot?: 'left' | 'right' | 'both';
  emergencyContact: EmergencyContact;
  medicalInfo: MedicalInfo;
  stats: PlayerStats;
  performance: PlayerPerformance;
  availability: PlayerAvailability;
  preferences?: {
    notifications: { email: boolean; push: boolean; sms: boolean };
    language: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type PlayerPosition = 
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'forward'
  | 'striker'
  | 'winger'
  | 'fullback'
  | 'centerback'
  | 'defensive_midfielder'
  | 'attacking_midfielder'
  | 'utility';

export type PlayerRole = 'player' | 'coach' | 'manager' | 'captain' | 'vice_captain';

export interface PlayerStats {
  // Season Stats
  season?: string;
  gamesPlayed: number;
  gamesStarted: number;
  minutesPlayed: number;
  matchesPlayed: number;
  
  // Offensive Stats
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  
  // Defensive Stats
  tackles: number;
  interceptions: number;
  clearances: number;
  blocks: number;
  
  // Goalkeeper Stats
  saves: number;
  cleanSheets: number;
  goalsConceded: number;
  
  // Discipline Stats
  yellowCards: number;
  redCards: number;
  fouls: number;
  foulsSuffered: number;
  
  // Advanced Stats
  passAccuracy: number; // percentage
  possessionWon: number;
  possessionLost: number;
  duelsWon: number;
  duelsLost: number;
  
  // Calculated Stats
  goalsPerGame: number;
  assistsPerGame: number;
  minutesPerGoal: number;
  savePercentage?: number; // for goalkeepers
}

export interface PlayerPerformance {
  // Fitness Metrics
  fitnessLevel: number; // 1-10 scale
  stamina: number; // 1-10 scale
  speed: number; // 1-10 scale
  strength: number; // 1-10 scale
  agility: number; // 1-10 scale
  
  // Technical Skills
  passing: number; // 1-10 scale
  shooting: number; // 1-10 scale
  dribbling: number; // 1-10 scale
  defending: number; // 1-10 scale
  goalkeeping?: number; // 1-10 scale for goalkeepers
  
  // Mental Attributes
  leadership: number; // 1-10 scale
  teamwork: number; // 1-10 scale
  decisionMaking: number; // 1-10 scale
  concentration: number; // 1-10 scale
  
  // Overall Rating
  overallRating: number; // calculated average
  potentialRating: number; // 1-10 scale
}

export interface PlayerAvailability {
  status: 'available' | 'unavailable' | 'injured' | 'suspended' | 'on_leave';
  reason?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface MedicalInfo {
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyNotes?: string;
  bloodType?: string;
  insuranceInfo?: string;
  lastPhysicalExam?: Date;
  medicalClearance: boolean;
  clearanceExpiryDate?: Date;
}

export interface PlayerRegistration {
  id: string;
  playerId: string;
  teamId: string;
  season: string;
  status: RegistrationStatus;
  registrationDate: Date;
  approvedDate?: Date;
  approvedBy?: string;
  formData: Record<string, any>;
  waivers: Waiver[];
  paymentId?: string;
  notes?: string;
}

export type RegistrationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'waitlist'
  | 'cancelled';

export interface Waiver {
  id: string;
  name: string;
  content: string;
  signed: boolean;
  signedAt?: Date;
  signedBy?: string;
  version: string;
}

export interface PlayerNote {
  id: string;
  playerId: string;
  authorId: string;
  type: 'general' | 'performance' | 'behavior' | 'medical' | 'academic';
  title: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerGoal {
  id: string;
  playerId: string;
  matchId: string;
  minute: number;
  type: 'open_play' | 'penalty' | 'free_kick' | 'corner' | 'own_goal';
  assistId?: string;
  description?: string;
  videoURL?: string;
  createdAt: Date;
}

export interface PlayerInjury {
  id: string;
  playerId: string;
  type: string;
  severity: 'minor' | 'moderate' | 'severe';
  bodyPart: string;
  description: string;
  dateInjured: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  treatment: string;
  notes?: string;
  clearedBy?: string;
  clearedDate?: Date;
}

export interface PlayerAchievement {
  id: string;
  playerId: string;
  type: 'award' | 'milestone' | 'record' | 'recognition';
  title: string;
  description: string;
  date: Date;
  season?: string;
  teamId?: string;
  imageURL?: string;
}

export interface PlayerEvaluation {
  id: string;
  playerId: string;
  evaluatorId: string;
  evaluationDate: Date;
  season: string;
  teamId: string;
  
  // Technical Evaluation
  technicalSkills: {
    passing: number;
    shooting: number;
    dribbling: number;
    defending: number;
    goalkeeping?: number;
  };
  
  // Physical Evaluation
  physicalAttributes: {
    speed: number;
    strength: number;
    stamina: number;
    agility: number;
  };
  
  // Mental Evaluation
  mentalAttributes: {
    leadership: number;
    teamwork: number;
    decisionMaking: number;
    concentration: number;
  };
  
  // Overall Assessment
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  overallRating: number;
  comments: string;
} 