import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Trophy, Calendar, MapPin } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo?: string;
  level: string;
  ageGroup: string;
  coach?: string;
  players: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  status: 'active' | 'inactive';
}

interface TeamManagementProps {
  teams: Team[];
  onAddTeam: () => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onViewTeam: (team: Team) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  teams,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
  onViewTeam,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.coach?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || team.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <span className="badge bg-success">Active</span>;
    }
    return <span className="badge bg-secondary">Inactive</span>;
  };

  const getLevelBadge = (level: string) => {
    const levelColors: { [key: string]: string } = {
      'recreational': 'bg-info',
      'competitive': 'bg-warning',
      'elite': 'bg-danger',
      'academy': 'bg-primary',
    };
    return <span className={`badge ${levelColors[level] || 'bg-secondary'}`}>{level}</span>;
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1">Team Management</h2>
          <p className="text-muted mb-0">Manage your teams, players, and performance</p>
        </div>
        <button 
          onClick={onAddTeam}
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <Plus size={20} />
          Add New Team
        </button>
      </div>

      {/* Filters and Search */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search teams or coaches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="recreational">Recreational</option>
            <option value="competitive">Competitive</option>
            <option value="elite">Elite</option>
            <option value="academy">Academy</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="col-md-2">
          <div className="text-end">
            <small className="text-muted">
              {filteredTeams.length} of {teams.length} teams
            </small>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="row g-4">
        {filteredTeams.map((team) => (
          <div key={team.id} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              {/* Team Header */}
              <div className="card-header bg-transparent border-0 pb-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center gap-3">
                    {team.logo ? (
                      <img 
                        src={team.logo} 
                        alt={`${team.name} logo`}
                        className="rounded-circle"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white"
                        style={{ width: '50px', height: '50px', backgroundColor: '#4169E1' }}
                      >
                        <Trophy size={24} />
                      </div>
                    )}
                    <div>
                      <h6 className="mb-1 fw-bold">{team.name}</h6>
                      <div className="d-flex gap-2">
                        {getLevelBadge(team.level)}
                        {getStatusBadge(team.status)}
                      </div>
                    </div>
                  </div>
                  <div className="dropdown">
                    <button 
                      className="btn btn-link text-muted p-0"
                      data-bs-toggle="dropdown"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      </svg>
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" onClick={() => onViewTeam(team)}>View Details</button></li>
                      <li><button className="dropdown-item" onClick={() => onEditTeam(team)}>Edit Team</button></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><button className="dropdown-item text-danger" onClick={() => onDeleteTeam(team.id)}>Delete Team</button></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Team Info */}
              <div className="card-body pt-2">
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <Users size={16} />
                      <small>{team.players} players</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 text-muted">
                      <Calendar size={16} />
                      <small>{team.ageGroup}</small>
                    </div>
                  </div>
                </div>

                {team.coach && (
                  <div className="mb-3">
                    <small className="text-muted">Coach:</small>
                    <div className="fw-medium">{team.coach}</div>
                  </div>
                )}

                {/* Performance Stats */}
                <div className="row g-2 mb-3">
                  <div className="col-4 text-center">
                    <div className="bg-success bg-opacity-10 rounded p-2">
                      <div className="fw-bold text-success">{team.wins}</div>
                      <small className="text-muted">Wins</small>
                    </div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="bg-warning bg-opacity-10 rounded p-2">
                      <div className="fw-bold text-warning">{team.draws}</div>
                      <small className="text-muted">Draws</small>
                    </div>
                  </div>
                  <div className="col-4 text-center">
                    <div className="bg-danger bg-opacity-10 rounded p-2">
                      <div className="fw-bold text-danger">{team.losses}</div>
                      <small className="text-muted">Losses</small>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-3">
                  <div className="h5 mb-1">{team.points}</div>
                  <small className="text-muted">Total Points</small>
                </div>
              </div>

              {/* Card Actions */}
              <div className="card-footer bg-transparent border-0 pt-0">
                <div className="d-grid gap-2">
                  <button 
                    onClick={() => onViewTeam(team)}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Team Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3">
            <Users size={64} className="text-muted" />
          </div>
          <h5 className="text-muted">No teams found</h5>
          <p className="text-muted mb-3">
            {searchTerm || filterLevel !== 'all' || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first team'
            }
          </p>
          {!searchTerm && filterLevel === 'all' && filterStatus === 'all' && (
            <button onClick={onAddTeam} className="btn btn-primary">
              <Plus size={20} className="me-2" />
              Create Your First Team
            </button>
          )}
        </div>
      )}
    </div>
  );
};
