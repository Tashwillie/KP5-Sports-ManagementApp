"use client";

import { useState } from "react";
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { registrationService } from '@/lib/services/registrationService';
import { FormFieldType } from '@shared/types';

interface FormBuilderField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  conditional?: {
    fieldId: string;
    value: string;
    operator: 'equals' | 'not_equals' | 'contains';
  };
}

export default function RegistrationCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    maxRegistrations: 0,
    registrationDeadline: '',
  });
  const [fields, setFields] = useState<FormBuilderField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const addField = () => {
    const newField: FormBuilderField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      options: [],
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormBuilderField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const getFieldTypeOptions = () => [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'file', label: 'File Upload' },
  ];

  const saveForm = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!formData.name.trim()) {
        setError('Form name is required');
        setLoading(false);
        return;
      }
      if (fields.length === 0) {
        setError('At least one field is required');
        setLoading(false);
        return;
      }
      const formPayload = {
        ...formData,
        fields: fields.map(field => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options,
          validation: field.validation,
          conditional: field.conditional,
        })),
        maxRegistrations: formData.maxRegistrations || null,
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline) : null,
      };
      await registrationService.createRegistrationForm(formPayload);
      setSuccess(true);
      setTimeout(() => router.push('/registration/forms'), 1200);
    } catch (err) {
      setError('Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab="registration" />
      <div className="flex-grow-1 bg-light" style={{ minWidth: 0, overflow: 'auto' }}>
        <div className="container py-5">
          <h2 className="mb-4">Create Registration Form</h2>
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">Form created successfully! Redirecting...</div>}
          <Card className="p-4 mb-4">
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label className="form-label">Form Name</label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter form name"
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Status</label>
                <div className="d-flex align-items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                  />
                  <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Max Registrations</label>
                <Input
                  type="number"
                  value={formData.maxRegistrations}
                  onChange={e => setFormData({ ...formData, maxRegistrations: parseInt(e.target.value) || 0 })}
                  placeholder="0 for unlimited"
                />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Registration Deadline</label>
                <Input
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter form description"
                rows={3}
              />
            </div>
          </Card>
          <Card className="p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Form Fields</h5>
              <Button onClick={addField} variant="outline">Add Field</Button>
            </div>
            {fields.length === 0 && <div className="text-muted mb-3">No fields added yet.</div>}
            <div className="row g-3">
              {fields.map((field, index) => (
                <div key={field.id} className="col-12 mb-3 border rounded p-3">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label">Field Label</label>
                      <Input
                        value={field.label}
                        onChange={e => updateField(index, { label: e.target.value })}
                        placeholder="Enter field label"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Field Type</label>
                      <select
                        className="form-select"
                        value={field.type}
                        onChange={e => updateField(index, { type: e.target.value as FormFieldType })}
                      >
                        {getFieldTypeOptions().map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Required</label>
                      <div>
                        <Switch
                          checked={field.required}
                          onCheckedChange={checked => updateField(index, { required: checked })}
                        />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <Button variant="outline" className="text-danger" onClick={() => removeField(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                  {(field.type === 'select' || field.type === 'radio') && (
                    <div className="mt-2">
                      <label className="form-label">Options (one per line)</label>
                      <Textarea
                        value={field.options?.join('\n') || ''}
                        onChange={e => updateField(index, { options: e.target.value.split('\n').filter(Boolean) })}
                        placeholder="Option 1\nOption 2\nOption 3"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
          <div className="d-flex justify-content-end gap-3">
            <Button variant="outline" onClick={() => router.push('/registration/forms')}>Cancel</Button>
            <Button onClick={saveForm} disabled={loading}>{loading ? 'Saving...' : 'Create Form'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
