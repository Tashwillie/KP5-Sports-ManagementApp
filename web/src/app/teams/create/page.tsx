'use client';

import React from 'react';
import { TeamForm } from '@/components/team/TeamForm';

export default function CreateTeamPage() {
  return (
    <div className="container-fluid">
      <TeamForm mode="create" />
    </div>
  );
}
