import { 
  Player, 
  PlayerStats, 
  PlayerPerformance, 
  PlayerAvailability,
  PlayerRegistration,
  PlayerNote,
  PlayerInjury,
  PlayerAchievement,
  PlayerEvaluation,
  PlayerPosition,
  RegistrationStatus
} from '@kp5-academy/shared';

export class PlayerService {
  private static playersCollection = firestore().collection('players');
  private static registrationsCollection = firestore().collection('player_registrations');
  private static notesCollection = firestore().collection('player_notes');
  private static injuriesCollection = firestore().collection('player_injuries');
  private static achievementsCollection = firestore().collection('player_achievements');
  private static evaluationsCollection = firestore().collection('player_evaluations');

  // Player Management
  static async createPlayer(playerData: Partial<Player>): Promise<string> {
    try {
      const player: Player = {
        id: '',
        userId: playerData.userId || '',
        clubId: playerData.clubId || '',
        teamIds: playerData.teamIds || [],
        jerseyNumber: playerData.jerseyNumber || 0,
        position: playerData.position || 'utility',
        dateOfBirth: playerData.dateOfBirth || new Date(),
        height: playerData.height,
        weight: playerData.weight,
        dominantFoot: playerData.dominantFoot || 'right',
        emergencyContact: playerData.emergencyContact || {
          name: '',
          relationship: '',
          phone: '',
        },
        medicalInfo: playerData.medicalInfo || {
          allergies: [],
          medications: [],
          conditions: [],
          medicalClearance: false,
        },
        stats: this.initializePlayerStats(playerData.stats?.season || '2024'),
        performance: this.initializePlayerPerformance(),
        availability: {
          status: 'available',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const docRef = await this.playersCollection.add(player);
      const playerId = docRef.id;
      
      await this.playersCollection.doc(playerId).update({ id: playerId });
      
      return playerId;
    } catch (error) {
      console.error('Error creating player:', error);
      throw new Error('Failed to create player');
    }
  }

  static async getPlayer(playerId: string): Promise<Player | null> {
    try {
      const doc = await this.playersCollection.doc(playerId).get();
      if (doc.exists) {
        return doc.data() as Player;
      }
      return null;
    } catch (error) {
      console.error('Error fetching player:', error);
      throw new Error('Failed to fetch player');
    }
  }

  static async getPlayerByUserId(userId: string): Promise<Player | null> {
    try {
      const snapshot = await this.playersCollection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        return snapshot.docs[0].data() as Player;
      }
      return null;
    } catch (error) {
      console.error('Error fetching player by user ID:', error);
      throw new Error('Failed to fetch player by user ID');
    }
  }

  static async updatePlayer(playerId: string, updates: Partial<Player>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      await this.playersCollection.doc(playerId).update(updateData);
    } catch (error) {
      console.error('Error updating player:', error);
      throw new Error('Failed to update player');
    }
  }

  static async getPlayersByTeam(teamId: string): Promise<Player[]> {
    try {
      const snapshot = await this.playersCollection
        .where('teamIds', 'array-contains', teamId)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as Player);
    } catch (error) {
      console.error('Error fetching team players:', error);
      throw new Error('Failed to fetch team players');
    }
  }

  static async getPlayersByClub(clubId: string): Promise<Player[]> {
    try {
      const snapshot = await this.playersCollection
        .where('clubId', '==', clubId)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as Player);
    } catch (error) {
      console.error('Error fetching club players:', error);
      throw new Error('Failed to fetch club players');
    }
  }

  static async getPlayersByPosition(clubId: string, position: PlayerPosition): Promise<Player[]> {
    try {
      const snapshot = await this.playersCollection
        .where('clubId', '==', clubId)
        .where('position', '==', position)
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as Player);
    } catch (error) {
      console.error('Error fetching players by position:', error);
      throw new Error('Failed to fetch players by position');
    }
  }

  // Statistics Management
  static async updatePlayerStats(playerId: string, stats: Partial<PlayerStats>): Promise<void> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      const updatedStats = {
        ...player.stats,
        ...stats,
        // Recalculate derived stats
        goalsPerGame: (stats.goals || player.stats.goals) / Math.max((stats.gamesPlayed || player.stats.gamesPlayed), 1),
        assistsPerGame: (stats.assists || player.stats.assists) / Math.max((stats.gamesPlayed || player.stats.gamesPlayed), 1),
        minutesPerGoal: (stats.minutesPlayed || player.stats.minutesPlayed) / Math.max((stats.goals || player.stats.goals), 1),
        savePercentage: player.position === 'goalkeeper' && (stats.saves || player.stats.saves) > 0 
          ? ((stats.saves || player.stats.saves) / ((stats.saves || player.stats.saves) + (stats.goalsConceded || player.stats.goalsConceded))) * 100
          : undefined,
      };

      await this.playersCollection.doc(playerId).update({
        stats: updatedStats,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw new Error('Failed to update player stats');
    }
  }

  static async getPlayerStats(playerId: string, season?: string): Promise<PlayerStats | null> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) return null;

      if (season && player.stats.season !== season) {
        // Return empty stats for different season
        return this.initializePlayerStats(season);
      }

      return player.stats;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw new Error('Failed to fetch player stats');
    }
  }

  // Performance Management
  static async updatePlayerPerformance(playerId: string, performance: Partial<PlayerPerformance>): Promise<void> {
    try {
      const player = await this.getPlayer(playerId);
      if (!player) {
        throw new Error('Player not found');
      }

      const updatedPerformance = {
        ...player.performance,
        ...performance,
        overallRating: this.calculateOverallRating({
          ...player.performance,
          ...performance,
        }),
      };

      await this.playersCollection.doc(playerId).update({
        performance: updatedPerformance,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating player performance:', error);
      throw new Error('Failed to update player performance');
    }
  }

  // Availability Management
  static async updatePlayerAvailability(playerId: string, availability: PlayerAvailability): Promise<void> {
    try {
      await this.playersCollection.doc(playerId).update({
        availability,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating player availability:', error);
      throw new Error('Failed to update player availability');
    }
  }

  // Registration Management
  static async registerPlayer(registrationData: Partial<PlayerRegistration>): Promise<string> {
    try {
      const registration: PlayerRegistration = {
        id: '',
        playerId: registrationData.playerId || '',
        teamId: registrationData.teamId || '',
        season: registrationData.season || '2024',
        status: 'pending',
        registrationDate: new Date(),
        formData: registrationData.formData || {},
        waivers: registrationData.waivers || [],
      };

      const docRef = await this.registrationsCollection.add(registration);
      const registrationId = docRef.id;
      
      await this.registrationsCollection.doc(registrationId).update({ id: registrationId });
      
      return registrationId;
    } catch (error) {
      console.error('Error registering player:', error);
      throw new Error('Failed to register player');
    }
  }

  static async updateRegistrationStatus(registrationId: string, status: RegistrationStatus, approvedBy?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'approved' && approvedBy) {
        updateData.approvedDate = new Date();
        updateData.approvedBy = approvedBy;
      }

      await this.registrationsCollection.doc(registrationId).update(updateData);
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw new Error('Failed to update registration status');
    }
  }

  static async getPlayerRegistrations(playerId: string): Promise<PlayerRegistration[]> {
    try {
      const snapshot = await this.registrationsCollection
        .where('playerId', '==', playerId)
        .orderBy('registrationDate', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as PlayerRegistration);
    } catch (error) {
      console.error('Error fetching player registrations:', error);
      throw new Error('Failed to fetch player registrations');
    }
  }

  // Notes Management
  static async addPlayerNote(noteData: Partial<PlayerNote>): Promise<string> {
    try {
      const note: PlayerNote = {
        id: '',
        playerId: noteData.playerId || '',
        authorId: noteData.authorId || '',
        type: noteData.type || 'general',
        title: noteData.title || '',
        content: noteData.content || '',
        isPrivate: noteData.isPrivate || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await this.notesCollection.add(note);
      const noteId = docRef.id;
      
      await this.notesCollection.doc(noteId).update({ id: noteId });
      
      return noteId;
    } catch (error) {
      console.error('Error adding player note:', error);
      throw new Error('Failed to add player note');
    }
  }

  static async getPlayerNotes(playerId: string, includePrivate: boolean = false): Promise<PlayerNote[]> {
    try {
      let query = this.notesCollection
        .where('playerId', '==', playerId)
        .orderBy('createdAt', 'desc');

      if (!includePrivate) {
        query = query.where('isPrivate', '==', false);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc: any) => doc.data() as PlayerNote);
    } catch (error) {
      console.error('Error fetching player notes:', error);
      throw new Error('Failed to fetch player notes');
    }
  }

  // Injury Management
  static async addPlayerInjury(injuryData: Partial<PlayerInjury>): Promise<string> {
    try {
      const injury: PlayerInjury = {
        id: '',
        playerId: injuryData.playerId || '',
        type: injuryData.type || '',
        severity: injuryData.severity || 'minor',
        bodyPart: injuryData.bodyPart || '',
        description: injuryData.description || '',
        dateInjured: injuryData.dateInjured || new Date(),
        treatment: injuryData.treatment || '',
        notes: injuryData.notes,
      };

      const docRef = await this.injuriesCollection.add(injury);
      const injuryId = docRef.id;
      
      await this.injuriesCollection.doc(injuryId).update({ id: injuryId });
      
      // Update player availability
      await this.updatePlayerAvailability(injury.playerId, {
        status: 'injured',
        reason: injury.type,
        startDate: injury.dateInjured,
        notes: injury.description,
      });
      
      return injuryId;
    } catch (error) {
      console.error('Error adding player injury:', error);
      throw new Error('Failed to add player injury');
    }
  }

  static async getPlayerInjuries(playerId: string): Promise<PlayerInjury[]> {
    try {
      const snapshot = await this.injuriesCollection
        .where('playerId', '==', playerId)
        .orderBy('dateInjured', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as PlayerInjury);
    } catch (error) {
      console.error('Error fetching player injuries:', error);
      throw new Error('Failed to fetch player injuries');
    }
  }

  // Achievement Management
  static async addPlayerAchievement(achievementData: Partial<PlayerAchievement>): Promise<string> {
    try {
      const achievement: PlayerAchievement = {
        id: '',
        playerId: achievementData.playerId || '',
        type: achievementData.type || 'award',
        title: achievementData.title || '',
        description: achievementData.description || '',
        date: achievementData.date || new Date(),
        season: achievementData.season,
        teamId: achievementData.teamId,
        imageURL: achievementData.imageURL,
      };

      const docRef = await this.achievementsCollection.add(achievement);
      const achievementId = docRef.id;
      
      await this.achievementsCollection.doc(achievementId).update({ id: achievementId });
      
      return achievementId;
    } catch (error) {
      console.error('Error adding player achievement:', error);
      throw new Error('Failed to add player achievement');
    }
  }

  static async getPlayerAchievements(playerId: string): Promise<PlayerAchievement[]> {
    try {
      const snapshot = await this.achievementsCollection
        .where('playerId', '==', playerId)
        .orderBy('date', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => doc.data() as PlayerAchievement);
    } catch (error) {
      console.error('Error fetching player achievements:', error);
      throw new Error('Failed to fetch player achievements');
    }
  }

  // Evaluation Management
  static async addPlayerEvaluation(evaluationData: Partial<PlayerEvaluation>): Promise<string> {
    try {
      const evaluation: PlayerEvaluation = {
        id: '',
        playerId: evaluationData.playerId || '',
        evaluatorId: evaluationData.evaluatorId || '',
        evaluationDate: evaluationData.evaluationDate || new Date(),
        season: evaluationData.season || '2024',
        teamId: evaluationData.teamId || '',
        technicalSkills: evaluationData.technicalSkills || {
          passing: 5,
          shooting: 5,
          dribbling: 5,
          defending: 5,
        },
        physicalAttributes: evaluationData.physicalAttributes || {
          speed: 5,
          strength: 5,
          stamina: 5,
          agility: 5,
        },
        mentalAttributes: evaluationData.mentalAttributes || {
          leadership: 5,
          teamwork: 5,
          decisionMaking: 5,
          concentration: 5,
        },
        strengths: evaluationData.strengths || [],
        areasForImprovement: evaluationData.areasForImprovement || [],
        recommendations: evaluationData.recommendations || [],
        overallRating: evaluationData.overallRating || 5,
        comments: evaluationData.comments || '',
      };

      const docRef = await this.evaluationsCollection.add(evaluation);
      const evaluationId = docRef.id;
      
      await this.evaluationsCollection.doc(evaluationId).update({ id: evaluationId });
      
      return evaluationId;
    } catch (error) {
      console.error('Error adding player evaluation:', error);
      throw new Error('Failed to add player evaluation');
    }
  }

  static async getPlayerEvaluations(playerId: string, season?: string): Promise<PlayerEvaluation[]> {
    try {
      let query = this.evaluationsCollection
        .where('playerId', '==', playerId)
        .orderBy('evaluationDate', 'desc');

      if (season) {
        query = query.where('season', '==', season);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc: any) => doc.data() as PlayerEvaluation);
    } catch (error) {
      console.error('Error fetching player evaluations:', error);
      throw new Error('Failed to fetch player evaluations');
    }
  }

  // Helper Methods
  private static initializePlayerStats(season: string): PlayerStats {
    return {
      season,
      gamesPlayed: 0,
      gamesStarted: 0,
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      tackles: 0,
      interceptions: 0,
      clearances: 0,
      blocks: 0,
      saves: 0,
      cleanSheets: 0,
      goalsConceded: 0,
      yellowCards: 0,
      redCards: 0,
      fouls: 0,
      foulsSuffered: 0,
      passAccuracy: 0,
      possessionWon: 0,
      possessionLost: 0,
      duelsWon: 0,
      duelsLost: 0,
      goalsPerGame: 0,
      assistsPerGame: 0,
      minutesPerGoal: 0,
    };
  }

  private static initializePlayerPerformance(): PlayerPerformance {
    return {
      fitnessLevel: 5,
      stamina: 5,
      speed: 5,
      strength: 5,
      agility: 5,
      passing: 5,
      shooting: 5,
      dribbling: 5,
      defending: 5,
      leadership: 5,
      teamwork: 5,
      decisionMaking: 5,
      concentration: 5,
      overallRating: 5,
      potentialRating: 5,
    };
  }

  private static calculateOverallRating(performance: PlayerPerformance): number {
    const attributes = [
      performance.fitnessLevel,
      performance.stamina,
      performance.speed,
      performance.strength,
      performance.agility,
      performance.passing,
      performance.shooting,
      performance.dribbling,
      performance.defending,
      performance.leadership,
      performance.teamwork,
      performance.decisionMaking,
      performance.concentration,
    ];

    if (performance.goalkeeping) {
      attributes.push(performance.goalkeeping);
    }

    return attributes.reduce((sum, attr) => sum + attr, 0) / attributes.length;
  }
} 