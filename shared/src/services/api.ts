import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  writeBatch,
  runTransaction,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { 
  httpsCallable, 
  HttpsCallableResult 
} from 'firebase/functions';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

import { 
  User, 
  Club, 
  Team, 
  Player, 
  Event, 
  Tournament, 
  Match,
  Message,
  Registration,
  Payment,
  Notification,
  ApiResponse,
  PaginatedResponse
} from '../types';

// Base API class with common functionality
export class BaseAPI {
  protected db: any;
  protected storage: any;
  protected functions: any;
  protected auth: any;

  constructor(db: any, storage: any, functions: any, auth: any) {
    this.db = db;
    this.storage = storage;
    this.functions = functions;
    this.auth = auth;
  }

  // Generic CRUD operations
  protected async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.convertFirestoreDoc<T>(docSnap);
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw new Error(`Failed to get ${collectionName} document`);
    }
  }

  protected async getDocuments<T>(
    collectionName: string, 
    constraints: Array<{ field: string; operator: any; value: any }> = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = collection(this.db, collectionName);
      
      // Apply where constraints
      constraints.forEach(constraint => {
        q = query(q, where(constraint.field, constraint.operator, constraint.value));
      });
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreDoc<T>(doc));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw new Error(`Failed to get ${collectionName} documents`);
    }
  }

  protected async addDocument<T>(collectionName: string, data: Partial<T>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw new Error(`Failed to add ${collectionName} document`);
    }
  }

  protected async updateDocument<T>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw new Error(`Failed to update ${collectionName} document`);
    }
  }

  protected async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw new Error(`Failed to delete ${collectionName} document`);
    }
  }

  // Real-time listeners
  protected subscribeToDocument<T>(
    collectionName: string, 
    docId: string, 
    callback: (data: T | null) => void
  ): () => void {
    const docRef = doc(this.db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(this.convertFirestoreDoc<T>(doc));
      } else {
        callback(null);
      }
    });
  }

  protected subscribeToCollection<T>(
    collectionName: string,
    constraints: Array<{ field: string; operator: any; value: any }> = [],
    callback: (data: T[]) => void
  ): () => void {
    let q = collection(this.db, collectionName);
    
    constraints.forEach(constraint => {
      q = query(q, where(constraint.field, constraint.operator, constraint.value));
    });
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => this.convertFirestoreDoc<T>(doc));
      callback(data);
    });
  }

  // File upload utilities
  protected async uploadFile(
    path: string, 
    file: File, 
    metadata?: any
  ): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  protected async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Cloud Functions utilities
  protected async callFunction<T = any>(
    functionName: string, 
    data?: any
  ): Promise<T> {
    try {
      const callable = httpsCallable(this.functions, functionName);
      const result: HttpsCallableResult<T> = await callable(data);
      return result.data;
    } catch (error) {
      console.error(`Error calling function ${functionName}:`, error);
      throw new Error(`Failed to call ${functionName}`);
    }
  }

  // Utility methods
  protected convertFirestoreDoc<T>(doc: DocumentSnapshot | any): T {
    const data = doc.data();
    if (!data) return data;
    
    // Convert Firestore timestamps to Date objects
    const converted = { ...data };
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      }
    });
    
    return converted as T;
  }

  protected convertToFirestore(data: any): any {
    const converted = { ...data };
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Date) {
        converted[key] = Timestamp.fromDate(converted[key]);
      }
    });
    return converted;
  }
}

// Authentication API
export class AuthAPI extends BaseAPI {
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Failed to sign in');
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Failed to sign up');
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async getCurrentUser(): Promise<FirebaseUser | null> {
    return this.auth.currentUser;
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return this.auth.onAuthStateChanged(callback);
  }
}

// User API
export class UserAPI extends BaseAPI {
  async getUser(userId: string): Promise<User | null> {
    return this.getDocument<User>('users', userId);
  }

  async getUsers(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<User[]> {
    return this.getDocuments<User>('users', constraints);
  }

  async createUser(userData: Partial<User>): Promise<string> {
    return this.addDocument<User>('users', userData);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    return this.updateDocument<User>('users', userId, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.deleteDocument('users', userId);
  }

  async subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
    return this.subscribeToDocument<User>('users', userId, callback);
  }

  async subscribeToUsers(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (users: User[]) => void): () => void {
    return this.subscribeToCollection<User>('users', constraints, callback);
  }
}

// Club API
export class ClubAPI extends BaseAPI {
  async getClub(clubId: string): Promise<Club | null> {
    return this.getDocument<Club>('clubs', clubId);
  }

  async getClubs(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Club[]> {
    return this.getDocuments<Club>('clubs', constraints);
  }

  async createClub(clubData: Partial<Club>): Promise<string> {
    return this.addDocument<Club>('clubs', clubData);
  }

  async updateClub(clubId: string, clubData: Partial<Club>): Promise<void> {
    return this.updateDocument<Club>('clubs', clubId, clubData);
  }

  async deleteClub(clubId: string): Promise<void> {
    return this.deleteDocument('clubs', clubId);
  }

  async uploadClubLogo(clubId: string, file: File): Promise<string> {
    const path = `clubs/${clubId}/logo/${file.name}`;
    return this.uploadFile(path, file);
  }

  async subscribeToClub(clubId: string, callback: (club: Club | null) => void): () => void {
    return this.subscribeToDocument<Club>('clubs', clubId, callback);
  }

  async subscribeToClubs(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (clubs: Club[]) => void): () => void {
    return this.subscribeToCollection<Club>('clubs', constraints, callback);
  }
}

// Team API
export class TeamAPI extends BaseAPI {
  async getTeam(teamId: string): Promise<Team | null> {
    return this.getDocument<Team>('teams', teamId);
  }

  async getTeams(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Team[]> {
    return this.getDocuments<Team>('teams', constraints);
  }

  async createTeam(teamData: Partial<Team>): Promise<string> {
    return this.addDocument<Team>('teams', teamData);
  }

  async updateTeam(teamId: string, teamData: Partial<Team>): Promise<void> {
    return this.updateDocument<Team>('teams', teamId, teamData);
  }

  async deleteTeam(teamId: string): Promise<void> {
    return this.deleteDocument('teams', teamId);
  }

  async addPlayerToTeam(teamId: string, playerId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    const updatedRoster = {
      ...team.roster,
      players: [...team.roster.players, playerId]
    };
    
    await this.updateTeam(teamId, { roster: updatedRoster });
  }

  async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    
    const updatedRoster = {
      ...team.roster,
      players: team.roster.players.filter(id => id !== playerId)
    };
    
    await this.updateTeam(teamId, { roster: updatedRoster });
  }

  async subscribeToTeam(teamId: string, callback: (team: Team | null) => void): () => void {
    return this.subscribeToDocument<Team>('teams', teamId, callback);
  }

  async subscribeToTeams(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (teams: Team[]) => void): () => void {
    return this.subscribeToCollection<Team>('teams', constraints, callback);
  }
}

// Event API
export class EventAPI extends BaseAPI {
  async getEvent(eventId: string): Promise<Event | null> {
    return this.getDocument<Event>('events', eventId);
  }

  async getEvents(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Event[]> {
    return this.getDocuments<Event>('events', constraints);
  }

  async createEvent(eventData: Partial<Event>): Promise<string> {
    return this.addDocument<Event>('events', eventData);
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<void> {
    return this.updateDocument<Event>('events', eventId, eventData);
  }

  async deleteEvent(eventId: string): Promise<void> {
    return this.deleteDocument('events', eventId);
  }

  async subscribeToEvent(eventId: string, callback: (event: Event | null) => void): () => void {
    return this.subscribeToDocument<Event>('events', eventId, callback);
  }

  async subscribeToEvents(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (events: Event[]) => void): () => void {
    return this.subscribeToCollection<Event>('events', constraints, callback);
  }
}

// Match API
export class MatchAPI extends BaseAPI {
  async getMatch(matchId: string): Promise<Match | null> {
    return this.getDocument<Match>('matches', matchId);
  }

  async getMatches(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Match[]> {
    return this.getDocuments<Match>('matches', constraints);
  }

  async createMatch(matchData: Partial<Match>): Promise<string> {
    return this.addDocument<Match>('matches', matchData);
  }

  async updateMatch(matchId: string, matchData: Partial<Match>): Promise<void> {
    return this.updateDocument<Match>('matches', matchId, matchData);
  }

  async deleteMatch(matchId: string): Promise<void> {
    return this.deleteDocument('matches', matchId);
  }

  async addMatchEvent(matchId: string, eventData: any): Promise<void> {
    // This will trigger the Cloud Function to update stats
    await this.callFunction('onMatchEventAdded', { matchId, eventData });
  }

  async subscribeToMatch(matchId: string, callback: (match: Match | null) => void): () => void {
    return this.subscribeToDocument<Match>('matches', matchId, callback);
  }

  async subscribeToMatches(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (matches: Match[]) => void): () => void {
    return this.subscribeToCollection<Match>('matches', constraints, callback);
  }
}

// Tournament API
export class TournamentAPI extends BaseAPI {
  async getTournament(tournamentId: string): Promise<Tournament | null> {
    return this.getDocument<Tournament>('tournaments', tournamentId);
  }

  async getTournaments(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Tournament[]> {
    return this.getDocuments<Tournament>('tournaments', constraints);
  }

  async createTournament(tournamentData: Partial<Tournament>): Promise<string> {
    return this.addDocument<Tournament>('tournaments', tournamentData);
  }

  async updateTournament(tournamentId: string, tournamentData: Partial<Tournament>): Promise<void> {
    return this.updateDocument<Tournament>('tournaments', tournamentId, tournamentData);
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    return this.deleteDocument('tournaments', tournamentId);
  }

  async generateBrackets(tournamentId: string): Promise<void> {
    await this.callFunction('generateTournamentBrackets', { tournamentId });
  }

  async subscribeToTournament(tournamentId: string, callback: (tournament: Tournament | null) => void): () => void {
    return this.subscribeToDocument<Tournament>('tournaments', tournamentId, callback);
  }

  async subscribeToTournaments(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (tournaments: Tournament[]) => void): () => void {
    return this.subscribeToCollection<Tournament>('tournaments', constraints, callback);
  }
}

// Message API
export class MessageAPI extends BaseAPI {
  async getMessage(messageId: string): Promise<Message | null> {
    return this.getDocument<Message>('messages', messageId);
  }

  async getMessages(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Message[]> {
    return this.getDocuments<Message>('messages', constraints);
  }

  async sendMessage(messageData: Partial<Message>): Promise<string> {
    return this.addDocument<Message>('messages', messageData);
  }

  async updateMessage(messageId: string, messageData: Partial<Message>): Promise<void> {
    return this.updateDocument<Message>('messages', messageId, messageData);
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.deleteDocument('messages', messageId);
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.getMessage(messageId);
    if (!message) throw new Error('Message not found');
    
    const updatedReadBy = [...message.readBy, userId];
    await this.updateMessage(messageId, { readBy: updatedReadBy });
  }

  async subscribeToMessages(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (messages: Message[]) => void): () => void {
    return this.subscribeToCollection<Message>('messages', constraints, callback);
  }
}

// Payment API
export class PaymentAPI extends BaseAPI {
  async getPayment(paymentId: string): Promise<Payment | null> {
    return this.getDocument<Payment>('payments', paymentId);
  }

  async getPayments(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Payment[]> {
    return this.getDocuments<Payment>('payments', constraints);
  }

  async createPayment(paymentData: Partial<Payment>): Promise<string> {
    return this.addDocument<Payment>('payments', paymentData);
  }

  async updatePayment(paymentId: string, paymentData: Partial<Payment>): Promise<void> {
    return this.updateDocument<Payment>('payments', paymentId, paymentData);
  }

  async createPaymentIntent(amount: number, currency: string, description: string): Promise<any> {
    return this.callFunction('createPaymentIntent', { amount, currency, description });
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    return this.callFunction('confirmPayment', { paymentIntentId });
  }

  async subscribeToPayments(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (payments: Payment[]) => void): () => void {
    return this.subscribeToCollection<Payment>('payments', constraints, callback);
  }
}

// Notification API
export class NotificationAPI extends BaseAPI {
  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.getDocument<Notification>('notifications', notificationId);
  }

  async getNotifications(constraints: Array<{ field: string; operator: any; value: any }> = []): Promise<Notification[]> {
    return this.getDocuments<Notification>('notifications', constraints);
  }

  async createNotification(notificationData: Partial<Notification>): Promise<string> {
    return this.addDocument<Notification>('notifications', notificationData);
  }

  async updateNotification(notificationId: string, notificationData: Partial<Notification>): Promise<void> {
    return this.updateDocument<Notification>('notifications', notificationId, notificationData);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.updateNotification(notificationId, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.callFunction('markAllNotificationsAsRead', { userId });
  }

  async subscribeToNotifications(constraints: Array<{ field: string; operator: any; value: any }> = [], callback: (notifications: Notification[]) => void): () => void {
    return this.subscribeToCollection<Notification>('notifications', constraints, callback);
  }
}

// Main API class that combines all services
export class API {
  public auth: AuthAPI;
  public users: UserAPI;
  public clubs: ClubAPI;
  public teams: TeamAPI;
  public events: EventAPI;
  public matches: MatchAPI;
  public tournaments: TournamentAPI;
  public messages: MessageAPI;
  public payments: PaymentAPI;
  public notifications: NotificationAPI;

  constructor(db: any, storage: any, functions: any, auth: any) {
    this.auth = new AuthAPI(db, storage, functions, auth);
    this.users = new UserAPI(db, storage, functions, auth);
    this.clubs = new ClubAPI(db, storage, functions, auth);
    this.teams = new TeamAPI(db, storage, functions, auth);
    this.events = new EventAPI(db, storage, functions, auth);
    this.matches = new MatchAPI(db, storage, functions, auth);
    this.tournaments = new TournamentAPI(db, storage, functions, auth);
    this.messages = new MessageAPI(db, storage, functions, auth);
    this.payments = new PaymentAPI(db, storage, functions, auth);
    this.notifications = new NotificationAPI(db, storage, functions, auth);
  }
}

// Export the main API class
export default API; 