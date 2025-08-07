import * as React from "react"

export default function HomePage() {
  return (
    <div className="min-vh-100 bg-white">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
        <div className="container">
          {/* Logo */}
          <div className="navbar-brand d-flex align-items-center">
            <h1 className="mb-0">KP5 Academy</h1>
          </div>

          {/* Navigation */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link" href="#">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Teams</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Tournaments</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Calendar</a>
              </li>
            </ul>

            {/* Auth Buttons */}
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary">Sign In</button>
              <button className="btn btn-primary">Sign Up</button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="position-relative text-white" style={{background: 'linear-gradient(135deg, #0d6efd, #0a58ca, #084298)'}}>
        <div className="position-absolute w-100 h-100 bg-dark opacity-25"></div>
        <div className="position-relative container py-5">
          <div className="text-center py-5">
            <h1 className="display-3 fw-bold mb-4">
              Elite Sports Management
              <span className="d-block text-light">Platform</span>
            </h1>
            <p className="lead mb-4 mx-auto" style={{maxWidth: '600px'}}>
              Professional sports management for elite clubs, teams, and athletes. 
              Real-time tracking, comprehensive analytics, and seamless coordination.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button className="btn btn-light btn-lg px-4">
                Get Started
              </button>
              <button className="btn btn-outline-light btn-lg px-4">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              Comprehensive Sports Management
            </h2>
            <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
              Everything you need to manage your sports organization, from player registration 
              to tournament management and real-time match tracking.
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-primary mb-3" style={{fontSize: '2.5rem'}}>
                    🏆
                  </div>
                  <h3 className="h5 fw-bold text-dark mb-3">
                    Tournament Management
                  </h3>
                  <p className="text-muted mb-0">
                    Create and manage tournaments with automatic bracket generation and real-time standings.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-primary mb-3" style={{fontSize: '2.5rem'}}>
                    👥
                  </div>
                  <h3 className="h5 fw-bold text-dark mb-3">
                    Team & Club Management
                  </h3>
                  <p className="text-muted mb-0">
                    Manage teams, players, and clubs with comprehensive roster and statistics tracking.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="text-primary mb-3" style={{fontSize: '2.5rem'}}>
                    📅
                  </div>
                  <h3 className="h5 fw-bold text-dark mb-3">
                    Event Scheduling
                  </h3>
                  <p className="text-muted mb-0">
                    Schedule practices, games, and meetings with calendar integration and notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary">
        <div className="container text-center">
          <h2 className="display-5 fw-bold text-white mb-3">
            Ready to Transform Your Sports Organization?
          </h2>
          <p className="lead text-light mb-4 mx-auto" style={{maxWidth: '500px'}}>
            Join thousands of clubs and teams already using KP5 Academy to manage their sports operations.
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <button className="btn btn-light btn-lg px-4">
              Start Free Trial
            </button>
            <button className="btn btn-outline-light btn-lg px-4">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <h3 className="h6 fw-bold mb-3">KP5 Academy</h3>
              <p className="text-muted mb-0">
                Professional sports management platform for elite clubs, teams, and athletes.
              </p>
            </div>
            
            <div className="col-md-6">
              <h3 className="h6 fw-bold mb-3">Contact</h3>
              <p className="text-muted mb-0">
                Get in touch with our team for support and inquiries.
              </p>
            </div>
          </div>
          
          <div className="border-top border-secondary mt-4 pt-4 text-center text-muted">
            <p className="mb-0">&copy; 2024 KP5 Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 