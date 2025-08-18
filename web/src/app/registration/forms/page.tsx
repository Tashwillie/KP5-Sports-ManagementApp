'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RegistrationForm, FormField, FormFieldType } from '@shared/types';
import { registrationService } from '@/lib/services/registrationService';

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

export default function RegistrationFormsPage() {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    maxRegistrations: 0,
    registrationDeadline: '',
  });
  const [fields, setFields] = useState<FormBuilderField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const formsData = await registrationService.getRegistrationForms();
      setForms(formsData);
    } catch (err) {
      setError('Failed to load registration forms');
      console.error('Error loading forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    setIsCreating(true);
    setSelectedForm(null);
    setFormData({
      name: '',
      description: '',
      isActive: true,
      maxRegistrations: 0,
      registrationDeadline: '',
    });
    setFields([]);
  };

  const handleEditForm = (form: RegistrationForm) => {
    setSelectedForm(form);
    setIsCreating(false);
    setFormData({
      name: form.name,
      description: form.description,
      isActive: form.isActive,
      maxRegistrations: form.maxRegistrations,
      registrationDeadline: form.registrationDeadline?.toISOString().split('T')[0] || '',
    });
    setFields(form.fields || []);
  };

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

  const saveForm = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Form name is required');
        return;
      }

      if (fields.length === 0) {
        setError('At least one field is required');
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

      if (selectedForm) {
        await registrationService.updateRegistrationForm(selectedForm.id, formPayload);
      } else {
        await registrationService.createRegistrationForm(formPayload);
      }

      await loadForms();
      setIsCreating(false);
      setSelectedForm(null);
      setError(null);
    } catch (err) {
      setError('Failed to save form');
      console.error('Error saving form:', err);
    }
  };

  const deleteForm = async (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      try {
        await registrationService.deleteRegistrationForm(formId);
        await loadForms();
      } catch (err) {
        setError('Failed to delete form');
        console.error('Error deleting form:', err);
      }
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registration Forms</h1>
              <p className="text-gray-600 mt-1">Create and manage custom registration forms</p>
            </div>
            <Button onClick={handleCreateForm}>
              Create New Form
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isCreating || selectedForm ? (
          <div className="space-y-6">
            {/* Form Builder */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedForm ? 'Edit Form' : 'Create New Form'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter form name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <span className="text-sm text-gray-600">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Registrations</label>
                  <Input
                    type="number"
                    value={formData.maxRegistrations}
                    onChange={(e) => setFormData({ ...formData, maxRegistrations: parseInt(e.target.value) || 0 })}
                    placeholder="0 for unlimited"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                  <Input
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </Card>

            {/* Fields Builder */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Form Fields</h3>
                <Button onClick={addField} variant="outline">
                  Add Field
                </Button>
              </div>
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          placeholder="Enter field label"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(index, { type: value as FormFieldType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getFieldTypeOptions().map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(index, { required: checked })}
                        />
                        <span className="text-sm text-gray-600">Required</span>
                      </div>
                    </div>
                    
                    {(field.type === 'select' || field.type === 'radio') && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options (one per line)</label>
                        <Textarea
                          value={field.options?.join('\n') || ''}
                          onChange={(e) => updateField(index, { options: e.target.value.split('\n').filter(Boolean) })}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                          rows={3}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={() => removeField(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove Field
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => {
                  setIsCreating(false);
                  setSelectedForm(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={saveForm}>
                {selectedForm ? 'Update Form' : 'Create Form'}
              </Button>
            </div>
          </div>
        ) : (
          /* Forms List */
          <Card className="overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">All Forms</h2>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Max Registrations</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{form.name}</div>
                          <div className="text-sm text-gray-500">{form.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={form.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {form.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{form.fields?.length || 0} fields</TableCell>
                      <TableCell>
                        {form.maxRegistrations ? form.maxRegistrations : 'Unlimited'}
                      </TableCell>
                      <TableCell>
                        {form.registrationDeadline ? 
                          new Date(form.registrationDeadline).toLocaleDateString() : 
                          'No deadline'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditForm(form)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteForm(form.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 