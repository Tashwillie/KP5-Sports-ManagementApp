'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TeamForm } from '@/components/team/TeamForm';

export default function EditTeamPage() {
  const params = useParams();
  const teamId = params.id as string;

  return (
    <div className="container-fluid">
      <TeamForm mode="edit" teamId={teamId} />
    </div>
  );
}
