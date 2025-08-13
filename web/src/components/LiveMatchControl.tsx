'use client';

import React, { useState, useEffect } from 'react';
// import { useLiveMatch } from '@/hooks/useLiveMatch';
// import { LiveMatchEventType, LiveMatchStatus } from '@/types';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Play, Pause, Square, Plus, Users, Trophy, Target } from 'lucide-react';

interface LiveMatchControlProps {
  matchId: string;
  enableRealTime?: boolean;
}

export function LiveMatchControl({ matchId, enableRealTime = true }: LiveMatchControlProps) {
  // Temporarily disabled due to missing dependencies
  return (
    <div className="p-6 text-center">
      <p>LiveMatchControl component is temporarily disabled.</p>
      <p>Please use the LiveMatchTracker component instead.</p>
    </div>
  );
} 