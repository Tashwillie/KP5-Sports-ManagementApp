'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TournamentForm } from '@/components/tournament/TournamentForm';

export default function EditTournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  return (
    <div className="container-fluid">
      <TournamentForm mode="edit" tournamentId={tournamentId} />
    </div>
  );
}
