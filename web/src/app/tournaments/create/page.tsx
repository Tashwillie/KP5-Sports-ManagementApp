'use client';

import React from 'react';
import { TournamentForm } from '@/components/tournament/TournamentForm';

export default function CreateTournamentPage() {
  return (
    <div className="container-fluid">
      <TournamentForm mode="create" />
    </div>
  );
}
