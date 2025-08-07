'use client';

import { useState } from 'react';
import { Mail, Lock, User, Search, Calendar as CalendarIcon, Trophy, Users, Settings, Plus, Edit, Trash, MoreHorizontal, CircleDot } from 'lucide-react';

export default function ComponentsDemoPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [progress, setProgress] = useState(65);
  const [checked, setChecked] = useState(false);

  const players = [
    { id: 1, name: 'Lionel Messi', position: 'Forward', team: 'Inter Miami', goals: 15, assists: 8, sport: 'soccer' },
    { id: 2, name: 'Cristiano Ronaldo', position: 'Forward', team: 'Al Nassr', goals: 12, assists: 6, sport: 'soccer' },
    { id: 3, name: 'LeBron James', position: 'Forward', team: 'Lakers', points: 28, rebounds: 8, sport: 'basketball' },
    { id: 4, name: 'Stephen Curry', position: 'Guard', team: 'Warriors', points: 25, assists: 6, sport: 'basketball' },
  ];

  const handleToast = () => {
    // Bootstrap toast implementation would go here
    console.log('Toast notification');
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">
        <div className="mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">
            KP5 Academy - Bootstrap Component Library
          </h1>
          <p className="lead text-muted">
            A comprehensive showcase of our Bootstrap components for sports management
          </p>
        </div>

        {/* Buttons Section */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-header bg-white">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <Trophy className="h-5 w-5" />
              Buttons
            </h5>
            <p className="text-muted mb-0">Various button styles and variants</p>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-3 mb-3">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-outline-primary">Outline</button>
              <button className="btn btn-outline-secondary">Ghost</button>
              <button className="btn btn-danger">Danger</button>
              <button className="btn btn-success">Success</button>
              <button className="btn btn-warning">Warning</button>
              <button className="btn btn-info">Info</button>
            </div>
            <div className="d-flex flex-wrap gap-3 mb-3">
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary">Medium</button>
              <button className="btn btn-primary btn-lg">Large</button>
            </div>
            <div className="d-flex flex-wrap gap-3">
              <button className="btn btn-primary">
                <Mail className="h-4 w-4 me-2" />
                With Left Icon
              </button>
              <button className="btn btn-outline-primary">
                With Right Icon
                <Settings className="h-4 w-4 ms-2" />
              </button>
              <button className="btn btn-primary" disabled>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Loading
              </button>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-header bg-white">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <Users className="h-5 w-5" />
              Cards
            </h5>
            <p className="text-muted mb-0">Card components with different variants</p>
          </div>
          <div className="card-body">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="mb-0">Default Card</h6>
                    <small className="text-muted">Standard card variant</small>
                  </div>
                  <div className="card-body">
                    <p>This is a default card with standard styling.</p>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-primary btn-sm">Action</button>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card h-100 shadow">
                  <div className="card-header">
                    <h6 className="mb-0">Elevated Card</h6>
                    <small className="text-muted">Card with enhanced shadow</small>
                  </div>
                  <div className="card-body">
                    <p>This card has an elevated appearance.</p>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-outline-primary btn-sm">Action</button>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card h-100 border-primary">
                  <div className="card-header">
                    <h6 className="mb-0 d-flex align-items-center gap-2">
                      <CircleDot className="h-4 w-4" />
                      Sports Card
                    </h6>
                    <small className="text-muted">Sports-themed card variant</small>
                  </div>
                  <div className="card-body">
                    <p>This card has sports-themed styling.</p>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-primary btn-sm">View Stats</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Elements Section */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-header bg-white">
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <User className="h-5 w-5" />
              Form Elements
            </h5>
            <p className="text-muted mb-0">Input fields and form components</p>
          </div>
          <div className="card-body">
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label">Search Players</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or team"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Select Sport</label>
                <select className="form-select">
                  <option value="">Choose a sport</option>
                  <option value="soccer">Soccer</option>
                  <option value="basketball">Basketball</option>
                  <option value="football">Football</option>
                  <option value="baseball">Baseball</option>
                </select>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label">Match Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date?.toISOString().split('T')[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                />
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Progress: {progress}%</label>
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      style={{width: `${progress}%`}}
                    ></div>
                  </div>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                  <label className="form-check-label">Enable notifications</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-header bg-white">
            <h5 className="mb-0">Badges</h5>
            <p className="text-muted mb-0">Status indicators and labels</p>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-primary">Primary</span>
              <span className="badge bg-secondary">Secondary</span>
              <span className="badge bg-danger">Danger</span>
              <span className="badge bg-success">Success</span>
              <span className="badge bg-warning">Warning</span>
              <span className="badge bg-info">Info</span>
              <span className="badge bg-light text-dark">Light</span>
            </div>
            <div>
              <h6 className="mb-2">Sports Badges</h6>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success">Soccer</span>
                <span className="badge bg-primary">Basketball</span>
                <span className="badge bg-warning">Football</span>
                <span className="badge bg-info">Baseball</span>
                <span className="badge bg-secondary">Volleyball</span>
                <span className="badge bg-danger">Tennis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-header bg-white">
            <h5 className="mb-0">Player Statistics Table</h5>
            <p className="text-muted mb-0">Data table with player information</p>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Position</th>
                    <th>Team</th>
                    <th>Sport</th>
                    <th>Stats</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td className="fw-medium">{player.name}</td>
                      <td>{player.position}</td>
                      <td>{player.team}</td>
                      <td>
                        <span className={`badge ${player.sport === 'soccer' ? 'bg-success' : 'bg-primary'}`}>
                          {player.sport}
                        </span>
                      </td>
                      <td>
                        {player.sport === 'soccer' 
                          ? `${player.goals}G ${player.assists}A`
                          : `${player.points}P ${player.rebounds || player.assists}R`
                        }
                      </td>
                      <td>
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#">
                              <Edit className="h-4 w-4 me-2" />
                              Edit
                            </a></li>
                            <li><a className="dropdown-item" href="#">
                              <Trash className="h-4 w-4 me-2" />
                              Delete
                            </a></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Interactive Components Section */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-header bg-white">
            <h5 className="mb-0">Interactive Components</h5>
            <p className="text-muted mb-0">Modals, toasts, and other interactive elements</p>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-3">
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#playerModal">
                Open Modal
              </button>
              <button className="btn btn-outline-primary" onClick={handleToast}>
                Show Toast
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-header bg-white">
            <h5 className="mb-0">Tabs</h5>
            <p className="text-muted mb-0">Organized content with tabs</p>
          </div>
          <div className="card-body">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab">
                  Overview
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="stats-tab" data-bs-toggle="tab" data-bs-target="#stats" type="button" role="tab">
                  Stats
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="matches-tab" data-bs-toggle="tab" data-bs-target="#matches" type="button" role="tab">
                  Matches
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings" type="button" role="tab">
                  Settings
                </button>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade show active" id="overview" role="tabpanel">
                <div className="row g-4 mt-3">
                  <div className="col-md-4">
                    <div className="card text-center">
                      <div className="card-body">
                        <h3 className="fw-bold">24</h3>
                        <p className="small text-muted">Total Players</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card text-center">
                      <div className="card-body">
                        <h3 className="fw-bold">8</h3>
                        <p className="small text-muted">Active Teams</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card text-center">
                      <div className="card-body">
                        <h3 className="fw-bold">156</h3>
                        <p className="small text-muted">Matches Played</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="stats" role="tabpanel">
                <p className="mt-3">Detailed statistics and analytics will be displayed here.</p>
              </div>
              <div className="tab-pane fade" id="matches" role="tabpanel">
                <p className="mt-3">Recent and upcoming matches will be listed here.</p>
              </div>
              <div className="tab-pane fade" id="settings" role="tabpanel">
                <p className="mt-3">Configuration and settings options will be available here.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion Section */}
        <div className="card border-0 shadow-sm mb-5">
          <div className="card-header bg-white">
            <h5 className="mb-0">Accordion</h5>
            <p className="text-muted mb-0">Collapsible content sections</p>
          </div>
          <div className="card-body">
            <div className="accordion" id="accordionExample">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                    Team Information
                  </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <p><strong>Founded:</strong> 2020</p>
                    <p><strong>Home Stadium:</strong> Central Arena</p>
                    <p><strong>Head Coach:</strong> Mike Johnson</p>
                    <p><strong>League:</strong> Premier Division</p>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                    Recent Performance
                  </button>
                </h2>
                <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <p><strong>Last 5 Matches:</strong> W-W-L-W-D</p>
                    <p><strong>Goals Scored:</strong> 12</p>
                    <p><strong>Goals Conceded:</strong> 6</p>
                    <p><strong>Current Position:</strong> 3rd</p>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                    Upcoming Matches
                  </button>
                </h2>
                <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    <p><strong>vs Team Alpha:</strong> March 15, 2024</p>
                    <p><strong>vs Team Beta:</strong> March 22, 2024</p>
                    <p><strong>vs Team Gamma:</strong> March 29, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Modal */}
      <div className="modal fade" id="playerModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Player Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{width: '48px', height: '48px'}}>
                  <User className="h-4 w-4 text-muted" />
                </div>
                <div>
                  <h6 className="mb-0">John Doe</h6>
                  <p className="small text-muted mb-0">Forward • Team Alpha</p>
                </div>
              </div>
              <div className="row text-center">
                <div className="col-6">
                  <p className="small text-muted mb-1">Goals</p>
                  <h4 className="fw-bold">15</h4>
                </div>
                <div className="col-6">
                  <p className="small text-muted mb-1">Assists</p>
                  <h4 className="fw-bold">8</h4>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Edit Player</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 