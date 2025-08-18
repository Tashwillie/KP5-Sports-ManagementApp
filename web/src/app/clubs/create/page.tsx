'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ClubForm } from '@/components/club/ClubForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import { ChevronLeft, Building } from 'lucide-react';

export default function CreateClubPage() {
  return (
    <ProtectedRoute>
      <CreateClubContent />
    </ProtectedRoute>
  );
}

function CreateClubContent() {
  const router = useRouter();

  return (
    <div className="d-flex">
      <Sidebar activeTab="clubs" />
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
                      <a href="/clubs" className="text-decoration-none">Clubs</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">Create</li>
                  </ol>
                </nav>
                <h1 className="h3 mb-0 d-flex align-items-center">
                  <Building className="me-2 text-primary" size={24} />
                  Create New Club
                </h1>
                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                  Register a new sports club or organization
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => router.push('/clubs')}
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
                  <ClubForm mode="create" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
