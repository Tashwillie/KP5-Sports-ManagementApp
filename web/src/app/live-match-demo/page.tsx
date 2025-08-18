'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Minus, 
  Clock, 
  Users, 
  Target,
  ArrowLeft,
  Whistle
} from 'lucide-react';
import Link from 'next/link';

interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  minute: number;
  player: string;
  team: 'home' | 'away';
  description: string;
}

export default function LiveMatchDemo() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [minute, setMinute] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [period, setPeriod] = useState<'first_half' | 'second_half' | 'halftime'>('first_half');
  const [events, setEvents] = useState<MatchEvent[]>([]);

  // Demo teams
  const homeTeam = { name: 'Arsenal FC', color: '#DC2626' };
  const awayTeam = { name: 'Chelsea FC', color: '#2563EB' };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLive) {
      interval = setInterval(() => {
        setMinute(prev => {
          const newMinute = prev + 1;
          
          // Auto-pause at halftime
          if (newMinute === 45 && period === 'first_half') {
            setIsLive(false);
            setPeriod('halftime');
          }
          
          // Auto-pause at full time
          if (newMinute === 90 && period === 'second_half') {
            setIsLive(false);
          }
          
          return newMinute;
        });
      }, 1000); // 1 second = 1 minute for demo
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, period]);

  const handleStart = () => {
    setIsLive(true);
    if (period === 'halftime') {
      setPeriod('second_half');
      setMinute(45);
    }
  };

  const handlePause = () => {
    setIsLive(false);
  };

  const handleStop = () => {
    setIsLive(false);
    setMinute(0);
    setPeriod('first_half');
  };

  const addGoal = (team: 'home' | 'away') => {
    if (team === 'home') {
      setHomeScore(prev => prev + 1);
    } else {
      setAwayScore(prev => prev + 1);
    }

    const event: MatchEvent = {
      id: Date.now().toString(),
      type: 'goal',
      minute,
      player: team === 'home' ? 'Home Player' : 'Away Player',
      team,
      description: `Goal scored by ${team === 'home' ? homeTeam.name : awayTeam.name}`
    };

    setEvents(prev => [...prev, event]);
  };

  const addCard = (team: 'home' | 'away', type: 'yellow_card' | 'red_card') => {
    const event: MatchEvent = {
      id: Date.now().toString(),
      type,
      minute,
      player: team === 'home' ? 'Home Player' : 'Away Player',
      team,
      description: `${type === 'yellow_card' ? 'Yellow' : 'Red'} card for ${team === 'home' ? homeTeam.name : awayTeam.name}`
    };

    setEvents(prev => [...prev, event]);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'substitution': return '🔄';
      default: return '📝';
    }
  };

  const getPeriodText = () => {
    switch (period) {
      case 'first_half': return '1st Half';
      case 'second_half': return '2nd Half';
      case 'halftime': return 'Half Time';
      default: return 'Match';
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white border-bottom shadow-sm">
        <div className="container py-3">
          <div className="d-flex align-items-center">
            <Link href="/dashboard" className="btn btn-outline-secondary me-3">
              <ArrowLeft size={16} className="me-1" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="h4 mb-0">Live Match Control</h1>
              <small className="text-muted">Real-time match management demo</small>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Match Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="row align-items-center">
                  <div className="col-4">
                    <div className="d-flex flex-column align-items-center">
                      <div 
                        className="rounded-circle mb-2" 
                        style={{
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: homeTeam.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        AFC
                      </div>
                      <h5 className="mb-0">{homeTeam.name}</h5>
                    </div>
                  </div>
                  
                  <div className="col-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="text-center mx-3">
                        <div className="h1 mb-0">{homeScore}</div>
                      </div>
                      <div className="text-center mx-3">
                        <div className="text-muted">VS</div>
                      </div>
                      <div className="text-center mx-3">
                        <div className="h1 mb-0">{awayScore}</div>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center justify-content-center">
                      <Clock size={16} className="me-2" />
                      <span className="h5 mb-0">{minute}'</span>
                      <span className="badge bg-primary ms-2">{getPeriodText()}</span>
                      {isLive && (
                        <span className="badge bg-danger ms-2">
                          <div className="d-flex align-items-center">
                            <div className="bg-white rounded-circle me-1" style={{width: '6px', height: '6px'}}></div>
                            LIVE
                          </div>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-4">
                    <div className="d-flex flex-column align-items-center">
                      <div 
                        className="rounded-circle mb-2" 
                        style={{
                          width: '60px', 
                          height: '60px', 
                          backgroundColor: awayTeam.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        CFC
                      </div>
                      <h5 className="mb-0">{awayTeam.name}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Controls */}
          <div className="col-lg-8 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="mb-0">Match Controls</h5>
              </div>
              <div className="card-body">
                {/* Timer Controls */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="d-flex justify-content-center gap-3">
                      <button 
                        className="btn btn-success"
                        onClick={handleStart}
                        disabled={isLive}
                      >
                        <Play size={16} className="me-1" />
                        Start
                      </button>
                      <button 
                        className="btn btn-warning"
                        onClick={handlePause}
                        disabled={!isLive}
                      >
                        <Pause size={16} className="me-1" />
                        Pause
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={handleStop}
                      >
                        <Square size={16} className="me-1" />
                        Stop
                      </button>
                    </div>
                  </div>
                </div>

                {/* Score Controls */}
                <div className="row mb-4">
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted">{homeTeam.name} Goals</h6>
                      <div className="d-flex justify-content-center align-items-center gap-3">
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setHomeScore(prev => Math.max(0, prev - 1))}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="h4 mb-0">{homeScore}</span>
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => addGoal('home')}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted">{awayTeam.name} Goals</h6>
                      <div className="d-flex justify-content-center align-items-center gap-3">
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setAwayScore(prev => Math.max(0, prev - 1))}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="h4 mb-0">{awayScore}</span>
                        <button 
                          className="btn btn-outline-success btn-sm"
                          onClick={() => addGoal('away')}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Controls */}
                <div className="row">
                  <div className="col-6">
                    <h6 className="text-muted">{homeTeam.name} Events</h6>
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => addCard('home', 'yellow_card')}
                      >
                        🟨 Yellow Card
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => addCard('home', 'red_card')}
                      >
                        🟥 Red Card
                      </button>
                    </div>
                  </div>
                  <div className="col-6">
                    <h6 className="text-muted">{awayTeam.name} Events</h6>
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => addCard('away', 'yellow_card')}
                      >
                        🟨 Yellow Card
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => addCard('away', 'red_card')}
                      >
                        🟥 Red Card
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Events */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="mb-0">Match Events</h5>
              </div>
              <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {events.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <Whistle size={48} className="mb-2" />
                    <p>No events yet</p>
                  </div>
                ) : (
                  <div className="timeline">
                    {events.reverse().map((event) => (
                      <div key={event.id} className="d-flex align-items-start mb-3">
                        <div className="flex-shrink-0 me-3">
                          <span className="badge bg-primary">{event.minute}'</span>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center">
                            <span className="me-2 h5 mb-0">{getEventIcon(event.type)}</span>
                            <div>
                              <div className="fw-medium">{event.description}</div>
                              <small className="text-muted">{event.player}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm bg-info bg-opacity-10">
              <div className="card-body">
                <h6 className="text-info">Demo Instructions</h6>
                <p className="mb-0 small">
                  This is a live match control demo. Use the controls to simulate a real match:
                  Start the timer, add goals and cards, and watch events populate in real-time. 
                  The timer runs at 1 second = 1 minute for demonstration purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}