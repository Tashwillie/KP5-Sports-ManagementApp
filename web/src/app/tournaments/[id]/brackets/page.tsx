'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Trophy, Users, Calendar, MapPin, Settings, BarChart3, Eye, Download } from 'lucide-react';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import { tournamentService } from '@/lib/services/tournamentService';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: 'knockout' | 'round_robin' | 'group_stage' | 'custom';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  maxTeams: number;
  currentTeams: number;
  rounds: number;
  teams: Array<{
    id: string;
    name: string;
    logo?: string;
    seed?: number;
    clubId?: string;
  }>;
  matches: Array<{
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    homeTeam?: { id: string; name: string };
    awayTeam?: { id: string; name: string };
    homeScore?: number;
    awayScore?: number;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    round: number;
    matchNumber: number;
    scheduledTime?: Date;
    venue?: string;
    winnerId?: string;
    nextMatchId?: string;
    matchType: 'knockout' | 'group' | 'final';
  }>;
  settings: {
    hasThirdPlace: boolean;
    hasSeeding: boolean;
    groupSize: number;
    knockoutRounds: number;
  };
}

export default function TournamentBracketsPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bracket' | 'standings' | 'schedule'>('bracket');

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      const tournamentData = await tournamentService.getTournament(tournamentId);
      
      if (tournamentData) {
        // Transform the data to match our TournamentBracket component interface
        const transformedTournament: Tournament = {
          id: tournamentData.id,
          name: tournamentData.name,
          description: tournamentData.description,
          format: tournamentData.format,
          status: tournamentData.status,
          startDate: new Date(tournamentData.startDate),
          endDate: new Date(tournamentData.endDate),
          maxTeams: tournamentData.maxTeams,
          currentTeams: tournamentData.currentTeams,
          rounds: tournamentData.rounds || 4,
          teams: tournamentData.teams || [],
          matches: tournamentData.matches || [],
          settings: {
            hasThirdPlace: true,
            hasSeeding: true,
            groupSize: 4,
            knockoutRounds: 4
          }
        };
        
        setTournament(transformedTournament);
      }
    } catch (err) {
      setError('Failed to load tournament data');
      console.error('Error loading tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchUpdate = (matchId: string, updates: any) => {
    console.log('Match updated:', matchId, updates);
    // Here you would typically call the API to update the match
    // and then refresh the tournament data
    loadTournamentData();
  };

  const handleTournamentUpdate = (tournamentId: string, updates: any) => {
    console.log('Tournament updated:', tournamentId, updates);
    // Here you would typically call the API to update the tournament
    // and then refresh the tournament data
    loadTournamentData();
  };

  const exportBracketData = () => {
    if (!tournament) return;
    
    const data = {
      tournament: tournament.name,
      format: tournament.format,
      teams: tournament.teams.length,
      matches: tournament.matches.length,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.name}-bracket-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading tournament brackets...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !tournament) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>Error Loading Tournament</Alert.Heading>
              <p>{error || 'Tournament not found'}</p>
              <Button variant="outline-danger" onClick={loadTournamentData}>
                Try Again
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-2">
                <Trophy className="me-2" />
                {tournament.name}
              </h1>
              <p className="text-muted mb-0">
                {tournament.description || 'Tournament brackets and standings'}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={exportBracketData}>
                <Download className="me-2" size={16} />
                Export
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tournament Info */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <Users className="mb-2" size={24} />
                    <h6 className="mb-1">{tournament.currentTeams}</h6>
                    <small className="text-muted">Teams</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <Calendar className="mb-2" size={24} />
                    <h6 className="mb-1">{tournament.rounds}</h6>
                    <small className="text-muted">Rounds</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <MapPin className="mb-2" size={24} />
                    <h6 className="mb-1">{tournament.format}</h6>
                    <small className="text-muted">Format</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <BarChart3 className="mb-2" size={24} />
                    <h6 className="mb-1">{tournament.matches.length}</h6>
                    <small className="text-muted">Matches</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* View Mode Tabs */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex gap-2">
            <Button
              variant={viewMode === 'bracket' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('bracket')}
            >
              <Eye className="me-2" size={16} />
              Bracket View
            </Button>
            <Button
              variant={viewMode === 'standings' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('standings')}
            >
              <BarChart3 className="me-2" size={16} />
              Standings
            </Button>
            <Button
              variant={viewMode === 'schedule' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('schedule')}
            >
              <Calendar className="me-2" size={16} />
              Schedule
            </Button>
          </div>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col>
          {viewMode === 'bracket' && (
            <Card>
              <Card.Body>
                <TournamentBracket
                  tournament={tournament}
                  isAdmin={true}
                  onMatchUpdate={handleMatchUpdate}
                  onTournamentUpdate={handleTournamentUpdate}
                />
              </Card.Body>
            </Card>
          )}

          {viewMode === 'standings' && (
            <Card>
              <Card.Body>
                <h5 className="mb-3">Tournament Standings</h5>
                <TournamentBracket
                  tournament={tournament}
                  isAdmin={true}
                  onMatchUpdate={handleMatchUpdate}
                  onTournamentUpdate={handleTournamentUpdate}
                />
              </Card.Body>
            </Card>
          )}

          {viewMode === 'schedule' && (
            <Card>
              <Card.Body>
                <h5 className="mb-3">Match Schedule</h5>
                <TournamentBracket
                  tournament={tournament}
                  isAdmin={true}
                  onMatchUpdate={handleMatchUpdate}
                  onTournamentUpdate={handleTournamentUpdate}
                />
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
} 