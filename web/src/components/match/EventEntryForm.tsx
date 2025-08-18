import React, { useState, useEffect, useCallback } from 'react';
import { useRealTimeService } from '@web/hooks/useRealTimeService';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@web/components/ui/select';
import { Textarea } from '@web/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Badge } from '@web/components/ui/badge';
import { Alert, AlertDescription } from '@web/components/ui/alert';
import { Separator } from '@web/components/ui/separator';
import { Clock, User, Users, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface EventEntryFormData {
  matchId: string;
  eventType: string;
  minute: number;
  teamId: string;
  playerId?: string;
  secondaryPlayerId?: string;
  description?: string;
  location?: string;
  severity?: string;
  cardType?: string;
  substitutionType?: string;
  goalType?: string;
  shotType?: string;
  saveType?: string;
  additionalData?: Record<string, any>;
}

interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

interface EventEntryFormConfig {
  eventTypes: Array<{
    value: string;
    label: string;
    requiresPlayer: boolean;
    requiresSecondary: boolean;
  }>;
  locations: Array<{ value: string; label: string }>;
  severities: Array<{ value: string; label: string }>;
  cardTypes: Array<{ value: string; label: string }>;
  substitutionTypes: Array<{ value: string; label: string }>;
  goalTypes: Array<{ value: string; label: string }>;
  shotTypes: Array<{ value: string; label: string }>;
  saveTypes: Array<{ value: string; label: string }>;
}

interface EventEntryFormProps {
  matchId: string;
  teamId: string;
  currentMinute: number;
  onEventSubmitted?: (event: any) => void;
  className?: string;
}

export const EventEntryForm: React.FC<EventEntryFormProps> = ({
  matchId,
  teamId,
  currentMinute,
  onEventSubmitted,
  className = ''
}) => {
  const { socket, isConnected } = useRealTimeService();
  
  const [formData, setFormData] = useState<EventEntryFormData>({
    matchId,
    eventType: '',
    minute: currentMinute,
    teamId
  });
  
  const [validation, setValidation] = useState<EventValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({ eventsEntered: 0, startTime: null as Date | null });
  const [formConfig, setFormConfig] = useState<EventEntryFormConfig | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Fetch form configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/event-entry/config');
        if (response.ok) {
          const config = await response.json();
          setFormConfig(config);
        }
      } catch (error) {
        console.error('Failed to fetch form config:', error);
      }
    };

    fetchConfig();
  }, []);

  // Start event entry session
  useEffect(() => {
    if (isConnected && socket && !sessionId) {
      socket.emit('start-event-entry', { matchId });
      
      socket.on('event-entry-started', (data: { sessionId: string; matchId: string }) => {
        setSessionId(data.sessionId);
        setSessionStats(prev => ({ ...prev, startTime: new Date() }));
      });

      socket.on('event-entry-submitted', (data: { success: boolean; eventId?: string; message: string }) => {
        if (data.success) {
          setSessionStats(prev => ({ ...prev, eventsEntered: prev.eventsEntered + 1 }));
          onEventSubmitted?.(data);
          resetForm();
        }
        setIsSubmitting(false);
      });

      socket.on('event-entry-validation', (data: EventValidationResult) => {
        setValidation(data);
      });

      return () => {
        socket.off('event-entry-started');
        socket.off('event-entry-submitted');
        socket.off('event-entry-validation');
      };
    }
  }, [isConnected, socket, matchId, sessionId, onEventSubmitted]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (sessionId && socket) {
        socket.emit('end-event-entry', { sessionId });
      }
    };
  }, [sessionId, socket]);

  const resetForm = useCallback(() => {
    setFormData({
      matchId,
      eventType: '',
      minute: currentMinute,
      teamId
    });
    setValidation(null);
    setShowAdvancedFields(false);
  }, [matchId, currentMinute, teamId]);

  const handleInputChange = useCallback((field: keyof EventEntryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-validate on change
    if (field === 'eventType' || field === 'minute' || field === 'teamId') {
      const updatedData = { ...formData, [field]: value };
      if (updatedData.eventType && updatedData.minute && updatedData.teamId) {
        socket?.emit('validate-event-entry', updatedData);
      }
    }
  }, [formData, socket]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !socket) {
      console.error('WebSocket not connected');
      return;
    }

    setIsSubmitting(true);
    
    // Submit event via WebSocket
    socket.emit('submit-event-entry', formData);
  }, [formData, isConnected, socket]);

  const getEventTypeConfig = useCallback(() => {
    if (!formConfig) return null;
    return formConfig.eventTypes.find(type => type.value === formData.eventType);
  }, [formConfig, formData.eventType]);

  const eventTypeConfig = getEventTypeConfig();

  if (!formConfig) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Event Entry Form
            </CardTitle>
            <CardDescription>
              Record match events in real-time
            </CardDescription>
          </div>
          {sessionId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Session Active
            </Badge>
          )}
        </div>
        
        {sessionStats.startTime && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Started: {sessionStats.startTime.toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Events: {sessionStats.eventsEntered}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Event Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => handleInputChange('eventType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {formConfig.eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minute">Minute *</Label>
              <Input
                id="minute"
                type="number"
                min="0"
                max="120"
                value={formData.minute}
                onChange={(e) => handleInputChange('minute', parseInt(e.target.value) || 0)}
                className="text-center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamId">Team *</Label>
              <Input
                id="teamId"
                value={formData.teamId}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Player Information */}
          {eventTypeConfig?.requiresPlayer && (
            <div className="space-y-2">
              <Label htmlFor="playerId">Player *</Label>
              <Input
                id="playerId"
                placeholder="Enter player ID or name"
                value={formData.playerId || ''}
                onChange={(e) => handleInputChange('playerId', e.target.value)}
              />
            </div>
          )}

          {/* Secondary Player Information */}
          {eventTypeConfig?.requiresSecondary && (
            <div className="space-y-2">
              <Label htmlFor="secondaryPlayerId">Secondary Player *</Label>
              <Input
                id="secondaryPlayerId"
                placeholder="Enter secondary player ID or name"
                value={formData.secondaryPlayerId || ''}
                onChange={(e) => handleInputChange('secondaryPlayerId', e.target.value)}
              />
            </div>
          )}

          {/* Advanced Fields Toggle */}
          <div className="flex items-center justify-between">
            <Separator className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="mx-4"
            >
              {showAdvancedFields ? 'Hide' : 'Show'} Advanced Fields
            </Button>
            <Separator className="flex-1" />
          </div>

          {/* Advanced Fields */}
          {showAdvancedFields && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              {/* Event-specific fields */}
              {formData.eventType === 'goal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalType">Goal Type</Label>
                    <Select
                      value={formData.goalType || ''}
                      onValueChange={(value) => handleInputChange('goalType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        {formConfig.goalTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={formData.location || ''}
                      onValueChange={(value) => handleInputChange('location', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {formConfig.locations.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {['yellow_card', 'red_card'].includes(formData.eventType) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardType">Card Type</Label>
                    <Select
                      value={formData.cardType || ''}
                      onValueChange={(value) => handleInputChange('cardType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                      <SelectContent>
                        {formConfig.cardTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={formData.severity || ''}
                      onValueChange={(value) => handleInputChange('severity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {formConfig.severities.map((severity) => (
                          <SelectItem key={severity.value} value={severity.value}>
                            {severity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.eventType === 'substitution' && (
                <div className="space-y-2">
                  <Label htmlFor="substitutionType">Substitution Type</Label>
                  <Select
                    value={formData.substitutionType || ''}
                    onValueChange={(value) => handleInputChange('substitutionType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select substitution type" />
                    </SelectTrigger>
                    <SelectContent>
                      {formConfig.substitutionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.eventType === 'shot' && (
                <div className="space-y-2">
                  <Label htmlFor="shotType">Shot Type</Label>
                  <Select
                    value={formData.shotType || ''}
                    onValueChange={(value) => handleInputChange('shotType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shot type" />
                    </SelectTrigger>
                    <SelectContent>
                      {formConfig.shotTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.eventType === 'save' && (
                <div className="space-y-2">
                  <Label htmlFor="saveType">Save Type</Label>
                  <Select
                    value={formData.saveType || ''}
                    onValueChange={(value) => handleInputChange('saveType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select save type" />
                    </SelectTrigger>
                    <SelectContent>
                      {formConfig.saveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Description field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about the event..."
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Validation Messages */}
          {validation && (
            <div className="space-y-2">
              {validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation.warnings.length > 0 && (
                <Alert variant="default" className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <ul className="list-disc list-inside">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validation.suggestions && validation.suggestions.length > 0 && (
                <Alert variant="default" className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <ul className="list-disc list-inside">
                      {validation.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={!isConnected || isSubmitting || !formData.eventType}
            >
              {isSubmitting ? 'Recording...' : 'Record Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
