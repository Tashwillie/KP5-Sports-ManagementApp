import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../shared/src/utils/firebase';
import {
  Tournament,
  League,
  TournamentMatch,
  TournamentParticipant,
  TournamentStanding,
  LeagueTeam,
  LeagueStanding,
  TournamentRegistration,
  LeagueRegistration,
  TournamentType,
  TournamentStatus,
  LeagueStatus,
  MatchStatus,
  ParticipantStatus,
  PaymentStatus,
} from '../../shared/src/types';

export class TournamentService {
  private static instance: TournamentService;

  static getInstance(): TournamentService {
    if (!TournamentService.instance) {
      TournamentService.instance = new TournamentService();
    }
    return TournamentService.instance;
  }

  // Tournament Management
  async createTournament(tournamentData: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const tournamentRef = await addDoc(collection(db, 'tournaments'), {
        ...tournamentData,
        startDate: Timestamp.fromDate(tournamentData.startDate),
        endDate: Timestamp.fromDate(tournamentData.endDate),
        registrationDeadline: Timestamp.fromDate(tournamentData.registrationDeadline),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return tournamentRef.id;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament');
    }
  }

  async getTournament(tournamentId: string): Promise<Tournament | null> {
    try {
      const tournamentDoc = await getDoc(doc(db, 'tournaments', tournamentId));
      if (tournamentDoc.exists()) {
        const data = tournamentDoc.data();
        return {
          ...data,
          id: tournamentDoc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          registrationDeadline: data.registrationDeadline.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Tournament;
      }
      return null;
    } catch (error) {
      console.error('Error getting tournament:', error);
      throw new Error('Failed to get tournament');
    }
  }

  async updateTournament(tournamentId: string, updates: Partial<Tournament>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      if (updates.registrationDeadline) {
        updateData.registrationDeadline = Timestamp.fromDate(updates.registrationDeadline);
      }

      await updateDoc(doc(db, 'tournaments', tournamentId), updateData);
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw new Error('Failed to update tournament');
    }
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'tournaments', tournamentId));
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw new Error('Failed to delete tournament');
    }
  }

  async getTournamentsByClub(clubId: string, filters?: {
    status?: TournamentStatus;
    type?: TournamentType;
  }): Promise<Tournament[]> {
    try {
      let q = query(
        collection(db, 'tournaments'),
        where('clubId', '==', clubId),
        where('isActive', '==', true),
        orderBy('startDate', 'desc')
      );

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          registrationDeadline: data.registrationDeadline.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Tournament;
      });
    } catch (error) {
      console.error('Error getting tournaments by club:', error);
      throw new Error('Failed to get tournaments');
    }
  }

  // League Management
  async createLeague(leagueData: Omit<League, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const leagueRef = await addDoc(collection(db, 'leagues'), {
        ...leagueData,
        startDate: Timestamp.fromDate(leagueData.startDate),
        endDate: Timestamp.fromDate(leagueData.endDate),
        registrationDeadline: Timestamp.fromDate(leagueData.registrationDeadline),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return leagueRef.id;
    } catch (error) {
      console.error('Error creating league:', error);
      throw new Error('Failed to create league');
    }
  }

  async getLeague(leagueId: string): Promise<League | null> {
    try {
      const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
      if (leagueDoc.exists()) {
        const data = leagueDoc.data();
        return {
          ...data,
          id: leagueDoc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          registrationDeadline: data.registrationDeadline.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as League;
      }
      return null;
    } catch (error) {
      console.error('Error getting league:', error);
      throw new Error('Failed to get league');
    }
  }

  async updateLeague(leagueId: string, updates: Partial<League>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(updates.endDate);
      }
      if (updates.registrationDeadline) {
        updateData.registrationDeadline = Timestamp.fromDate(updates.registrationDeadline);
      }

      await updateDoc(doc(db, 'leagues', leagueId), updateData);
    } catch (error) {
      console.error('Error updating league:', error);
      throw new Error('Failed to update league');
    }
  }

  async getLeaguesByClub(clubId: string, filters?: {
    status?: LeagueStatus;
    season?: string;
  }): Promise<League[]> {
    try {
      let q = query(
        collection(db, 'leagues'),
        where('clubId', '==', clubId),
        where('isActive', '==', true),
        orderBy('startDate', 'desc')
      );

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.season) {
        q = query(q, where('season', '==', filters.season));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          registrationDeadline: data.registrationDeadline.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as League;
      });
    } catch (error) {
      console.error('Error getting leagues by club:', error);
      throw new Error('Failed to get leagues');
    }
  }

  // Match Management
  async createMatch(matchData: Omit<TournamentMatch, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const matchRef = await addDoc(collection(db, 'matches'), {
        ...matchData,
        scheduledDate: Timestamp.fromDate(matchData.scheduledDate),
        actualStartDate: matchData.actualStartDate ? Timestamp.fromDate(matchData.actualStartDate) : null,
        actualEndDate: matchData.actualEndDate ? Timestamp.fromDate(matchData.actualEndDate) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return matchRef.id;
    } catch (error) {
      console.error('Error creating match:', error);
      throw new Error('Failed to create match');
    }
  }

  async getMatch(matchId: string): Promise<TournamentMatch | null> {
    try {
      const matchDoc = await getDoc(doc(db, 'matches', matchId));
      if (matchDoc.exists()) {
        const data = matchDoc.data();
        return {
          ...data,
          id: matchDoc.id,
          scheduledDate: data.scheduledDate.toDate(),
          actualStartDate: data.actualStartDate?.toDate(),
          actualEndDate: data.actualEndDate?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as TournamentMatch;
      }
      return null;
    } catch (error) {
      console.error('Error getting match:', error);
      throw new Error('Failed to get match');
    }
  }

  async updateMatch(matchId: string, updates: Partial<TournamentMatch>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      if (updates.scheduledDate) {
        updateData.scheduledDate = Timestamp.fromDate(updates.scheduledDate);
      }
      if (updates.actualStartDate) {
        updateData.actualStartDate = Timestamp.fromDate(updates.actualStartDate);
      }
      if (updates.actualEndDate) {
        updateData.actualEndDate = Timestamp.fromDate(updates.actualEndDate);
      }

      await updateDoc(doc(db, 'matches', matchId), updateData);
    } catch (error) {
      console.error('Error updating match:', error);
      throw new Error('Failed to update match');
    }
  }

  async getMatchesByTournament(tournamentId: string, filters?: {
    status?: MatchStatus;
    bracketId?: string;
  }): Promise<TournamentMatch[]> {
    try {
      let q = query(
        collection(db, 'matches'),
        where('tournamentId', '==', tournamentId),
        orderBy('scheduledDate', 'asc')
      );

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.bracketId) {
        q = query(q, where('bracketId', '==', filters.bracketId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          scheduledDate: data.scheduledDate.toDate(),
          actualStartDate: data.actualStartDate?.toDate(),
          actualEndDate: data.actualEndDate?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as TournamentMatch;
      });
    } catch (error) {
      console.error('Error getting matches by tournament:', error);
      throw new Error('Failed to get matches');
    }
  }

  // Live Scoring
  async updateMatchScore(matchId: string, homeScore: number, awayScore: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        homeScore,
        awayScore,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating match score:', error);
      throw new Error('Failed to update match score');
    }
  }

  async addMatchEvent(matchId: string, event: {
    type: string;
    timestamp: Date;
    periodNumber: number;
    playerId?: string;
    teamId?: string;
    description: string;
    data: Record<string, any>;
  }): Promise<void> {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        throw new Error('Match not found');
      }

      const match = matchDoc.data() as TournamentMatch;
      const newEvent = {
        id: Date.now().toString(),
        ...event,
        timestamp: Timestamp.fromDate(event.timestamp),
        isReversed: false,
      };

      await updateDoc(matchRef, {
        events: arrayUnion(newEvent),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding match event:', error);
      throw new Error('Failed to add match event');
    }
  }

  // Tournament Registration
  async registerForTournament(registrationData: Omit<TournamentRegistration, 'id'>): Promise<string> {
    try {
      const registrationRef = await addDoc(collection(db, 'tournamentRegistrations'), {
        ...registrationData,
        registrationDate: serverTimestamp(),
      });

      // Update tournament participant count
      await updateDoc(doc(db, 'tournaments', registrationData.tournamentId), {
        currentTeams: increment(1),
        updatedAt: serverTimestamp(),
      });

      return registrationRef.id;
    } catch (error) {
      console.error('Error registering for tournament:', error);
      throw new Error('Failed to register for tournament');
    }
  }

  async getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
    try {
      const q = query(
        collection(db, 'tournamentRegistrations'),
        where('tournamentId', '==', tournamentId),
        orderBy('registrationDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          registrationDate: data.registrationDate.toDate(),
          paymentDate: data.paymentDate?.toDate(),
          waiverSignedAt: data.waiverSignedAt?.toDate(),
          reviewedAt: data.reviewedAt?.toDate(),
        } as TournamentRegistration;
      });
    } catch (error) {
      console.error('Error getting tournament registrations:', error);
      throw new Error('Failed to get registrations');
    }
  }

  // League Registration
  async registerForLeague(registrationData: Omit<LeagueRegistration, 'id'>): Promise<string> {
    try {
      const registrationRef = await addDoc(collection(db, 'leagueRegistrations'), {
        ...registrationData,
        registrationDate: serverTimestamp(),
      });

      // Update league team count
      await updateDoc(doc(db, 'leagues', registrationData.leagueId), {
        currentTeams: increment(1),
        updatedAt: serverTimestamp(),
      });

      return registrationRef.id;
    } catch (error) {
      console.error('Error registering for league:', error);
      throw new Error('Failed to register for league');
    }
  }

  // Standings Management
  async updateTournamentStandings(tournamentId: string, standings: TournamentStanding[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      standings.forEach(standing => {
        const standingRef = doc(db, 'tournamentStandings', standing.id);
        batch.set(standingRef, {
          ...standing,
          lastUpdated: serverTimestamp(),
        }, { merge: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating tournament standings:', error);
      throw new Error('Failed to update standings');
    }
  }

  async getTournamentStandings(tournamentId: string, divisionId?: string): Promise<TournamentStanding[]> {
    try {
      let q = query(
        collection(db, 'tournamentStandings'),
        where('tournamentId', '==', tournamentId),
        orderBy('position', 'asc')
      );

      if (divisionId) {
        q = query(q, where('divisionId', '==', divisionId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          lastUpdated: data.lastUpdated.toDate(),
        } as TournamentStanding;
      });
    } catch (error) {
      console.error('Error getting tournament standings:', error);
      throw new Error('Failed to get standings');
    }
  }

  async updateLeagueStandings(leagueId: string, standings: LeagueStanding[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      standings.forEach(standing => {
        const standingRef = doc(db, 'leagueStandings', standing.id);
        batch.set(standingRef, {
          ...standing,
          lastUpdated: serverTimestamp(),
        }, { merge: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating league standings:', error);
      throw new Error('Failed to update standings');
    }
  }

  async getLeagueStandings(leagueId: string, divisionId?: string): Promise<LeagueStanding[]> {
    try {
      let q = query(
        collection(db, 'leagueStandings'),
        where('leagueId', '==', leagueId),
        orderBy('position', 'asc')
      );

      if (divisionId) {
        q = query(q, where('divisionId', '==', divisionId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          lastUpdated: data.lastUpdated.toDate(),
        } as LeagueStanding;
      });
    } catch (error) {
      console.error('Error getting league standings:', error);
      throw new Error('Failed to get standings');
    }
  }

  // Bracket Management
  async generateBrackets(tournamentId: string, divisionId: string, teams: string[]): Promise<void> {
    try {
      // This is a simplified bracket generation
      // In a real implementation, you would have more sophisticated logic
      const bracketData = {
        id: Date.now().toString(),
        name: `${divisionId} Bracket`,
        type: 'single_elimination',
        divisionId,
        rounds: [],
        matches: [],
        isActive: true,
      };

      await addDoc(collection(db, 'tournamentBrackets'), {
        ...bracketData,
        tournamentId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error generating brackets:', error);
      throw new Error('Failed to generate brackets');
    }
  }

  // Real-time Listeners
  subscribeToTournamentsByClub(clubId: string, callback: (tournaments: Tournament[]) => void): () => void {
    const q = query(
      collection(db, 'tournaments'),
      where('clubId', '==', clubId),
      where('isActive', '==', true),
      orderBy('startDate', 'desc')
    );

    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const tournaments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          registrationDeadline: data.registrationDeadline.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Tournament;
      });
      callback(tournaments);
    });
  }

  subscribeToMatchesByTournament(tournamentId: string, callback: (matches: TournamentMatch[]) => void): () => void {
    const q = query(
      collection(db, 'matches'),
      where('tournamentId', '==', tournamentId),
      orderBy('scheduledDate', 'asc')
    );

    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const matches = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          scheduledDate: data.scheduledDate.toDate(),
          actualStartDate: data.actualStartDate?.toDate(),
          actualEndDate: data.actualEndDate?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as TournamentMatch;
      });
      callback(matches);
    });
  }

  // File Upload for Tournament Media
  async uploadTournamentMedia(tournamentId: string, file: File, uploadedBy: string, mediaData: {
    title: string;
    description?: string;
    type: 'photo' | 'video' | 'document';
    tags: string[];
    isPublic: boolean;
  }): Promise<{
    id: string;
    url: string;
    thumbnailUrl?: string;
  }> {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${tournamentId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `tournament-media/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const media = {
        id: Date.now().toString(),
        ...mediaData,
        url: downloadURL,
        uploadedBy,
        uploadedAt: new Date(),
      };

      // Add media to tournament
      await updateDoc(doc(db, 'tournaments', tournamentId), {
        media: arrayUnion(media),
        updatedAt: serverTimestamp(),
      });

      return media;
    } catch (error) {
      console.error('Error uploading tournament media:', error);
      throw new Error('Failed to upload media');
    }
  }
}

export default TournamentService.getInstance(); 