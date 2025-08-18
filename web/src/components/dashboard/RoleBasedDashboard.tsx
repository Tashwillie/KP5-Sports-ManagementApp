import React from 'react';
import { User } from '@/context/AuthContext';

interface RoleBasedDashboardProps {
  user: User;
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ user }) => {
  const renderSuperAdminDashboard = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">System Overview</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-primary mb-1">150</h3>
                  <small className="text-muted">Total Users</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-success mb-1">25</h3>
                  <small className="text-muted">Active Clubs</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-info mb-1">75</h3>
                  <small className="text-muted">Active Teams</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-warning mb-1">12</h3>
                  <small className="text-muted">Tournaments</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Recent System Activity</h6>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">New user registration</small>
                  <div>john.doe@example.com</div>
                </div>
                <small className="text-muted">2 min ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Club created</small>
                  <div>Elite Sports Club</div>
                </div>
                <small className="text-muted">15 min ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Payment processed</small>
                  <div>$150.00 - Premium Plan</div>
                </div>
                <small className="text-muted">1 hour ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-6">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Quick Actions</h6>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <button className="btn btn-outline-primary">Create New Club</button>
              <button className="btn btn-outline-success">Add Tournament</button>
              <button className="btn btn-outline-info">System Settings</button>
              <button className="btn btn-outline-warning">View Reports</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClubAdminDashboard = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Club Overview</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-success mb-1">8</h3>
                  <small className="text-muted">Active Teams</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-primary mb-1">120</h3>
                  <small className="text-muted">Total Players</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-info mb-1">15</h3>
                  <small className="text-muted">Coaches</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-warning mb-1">5</h3>
                  <small className="text-muted">Upcoming Events</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-8">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Recent Club Activity</h6>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">New player joined</small>
                  <div>Sarah Johnson - U16 Girls</div>
                </div>
                <small className="text-muted">1 hour ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Match scheduled</small>
                  <div>U18 Boys vs. City Rovers</div>
                </div>
                <small className="text-muted">3 hours ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Payment received</small>
                  <div>$75.00 - Monthly dues</div>
                </div>
                <small className="text-muted">1 day ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Quick Actions</h6>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <button className="btn btn-outline-success">Add Player</button>
              <button className="btn btn-outline-primary">Schedule Event</button>
              <button className="btn btn-outline-info">Team Management</button>
              <button className="btn btn-outline-warning">Club Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoachDashboard = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Team Overview</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-info mb-1">18</h3>
                  <small className="text-muted">Active Players</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-success mb-1">12</h3>
                  <small className="text-muted">Matches Won</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-warning mb-1">3</h3>
                  <small className="text-muted">Upcoming Games</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-primary mb-1">85%</h3>
                  <small className="text-muted">Attendance Rate</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-8">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Recent Team Activity</h6>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Practice session</small>
                  <div>Technical training completed</div>
                </div>
                <small className="text-muted">2 hours ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Match result</small>
                  <div>Won 3-1 vs. Thunder FC</div>
                </div>
                <small className="text-muted">1 day ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Player milestone</small>
                  <div>Mike scored his 10th goal</div>
                </div>
                <small className="text-muted">3 days ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Quick Actions</h6>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <button className="btn btn-outline-info">Schedule Practice</button>
              <button className="btn btn-outline-success">View Player Stats</button>
              <button className="btn btn-outline-primary">Team Chat</button>
              <button className="btn btn-outline-warning">Match Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlayerDashboard = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-warning text-white">
            <h5 className="mb-0">Player Overview</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-warning mb-1">15</h3>
                  <small className="text-muted">Matches Played</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-success mb-1">8</h3>
                  <small className="text-muted">Goals Scored</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-info mb-1">12</h3>
                  <small className="text-muted">Assists</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-primary mb-1">90%</h3>
                  <small className="text-muted">Fitness Level</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-8">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Recent Activity</h6>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Last match</small>
                  <div>Scored 2 goals vs. Thunder FC</div>
                </div>
                <small className="text-muted">1 day ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Practice session</small>
                  <div>Attended technical training</div>
                </div>
                <small className="text-muted">2 days ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Achievement</small>
                  <div>Player of the Month</div>
                </div>
                <small className="text-muted">1 week ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Quick Actions</h6>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <button className="btn btn-outline-warning">View Schedule</button>
              <button className="btn btn-outline-success">My Statistics</button>
              <button className="btn btn-outline-primary">Team Chat</button>
              <button className="btn btn-outline-info">Update Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRefereeDashboard = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0">Referee Overview</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-secondary mb-1">25</h3>
                  <small className="text-muted">Matches Officiated</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-success mb-1">3</h3>
                  <small className="text-muted">Upcoming Matches</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-info mb-1">4.8</h3>
                  <small className="text-muted">Rating</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-warning mb-1">15</h3>
                  <small className="text-muted">Cards Issued</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-8">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Recent Matches</h6>
          </div>
          <div className="card-body">
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Last match</small>
                  <div>Elite FC vs. City Rovers (3-1)</div>
                </div>
                <small className="text-muted">2 days ago</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Upcoming match</small>
                  <div>Thunder FC vs. Storm United</div>
                </div>
                <small className="text-muted">Tomorrow</small>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                <div>
                  <small className="text-muted">Match report</small>
                  <div>Submitted for Elite FC match</div>
                </div>
                <small className="text-muted">3 days ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h6 className="mb-0">Quick Actions</h6>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <button className="btn btn-outline-secondary">View Schedule</button>
              <button className="btn btn-outline-success">Match Reports</button>
              <button className="btn btn-outline-primary">Live Match</button>
              <button className="btn btn-outline-info">Referee Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return renderSuperAdminDashboard();
      case 'CLUB_ADMIN':
        return renderClubAdminDashboard();
      case 'COACH':
        return renderCoachDashboard();
      case 'PLAYER':
        return renderPlayerDashboard();
      case 'REFEREE':
        return renderRefereeDashboard();
      default:
        return renderPlayerDashboard(); // Default fallback
    }
  };

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};
