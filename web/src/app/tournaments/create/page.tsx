'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TournamentForm } from '@/components/tournament/TournamentForm';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ChevronLeft, Trophy, Plus } from 'lucide-react';

export default function CreateTournamentPage() {
  return (
    <ProtectedRoute>
      <CreateTournamentContent />
    </ProtectedRoute>
  );
}

function CreateTournamentContent() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/tournaments');
  };

  const handleCancel = () => {
    router.push('/tournaments');
  };

  return (
    <div className="d-flex">
      <Sidebar activeTab="tournaments" />
      <div className="flex-grow-1 bg-light">
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <button
                onClick={() => router.back()}
                className="btn btn-link text-decoration-none p-0 me-3"
                style={{ color: '#6c757d' }}
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <nav aria-label="breadcrumb" className="mb-1">
                  <ol className="breadcrumb mb-0" style={{ fontSize: '14px' }}>
                    <li className="breadcrumb-item">
                      <a href="/dashboard" className="text-decoration-none">Dashboard</a>
                    </li>
                    <li className="breadcrumb-item">
                      <a href="/tournaments" className="text-decoration-none">Tournaments</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">Create</li>
                  </ol>
                </nav>
                <h1 className="h3 mb-0 d-flex align-items-center">
                  <Trophy className="me-2 text-primary" size={24} />
                  Create New Tournament
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                  Set up a new tournament with teams, schedules, and prizes
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={handleCancel}
                className="btn btn-outline-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Form Container */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <TournamentForm 
                    mode="create" 
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
