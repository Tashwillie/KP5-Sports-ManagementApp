"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  Archive, 
  X, 
  Download,
  Eye,
  Trash2,
  FolderOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLocalAuth } from '@/hooks/useLocalApi';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface FileCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  acceptedTypes: string[];
  maxSize: number; // in MB
}

export default function FileUploadSystem() {
  const { user } = useLocalAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileCategories: FileCategory[] = [
    {
      id: 'all',
      name: 'All Files',
      icon: <File className="h-5 w-5" />,
      acceptedTypes: ['*/*'],
      maxSize: 100
    },
    {
      id: 'images',
      name: 'Images',
      icon: <Image className="h-5 w-5" />,
      acceptedTypes: ['image/*'],
      maxSize: 50
    },
    {
      id: 'videos',
      name: 'Videos',
      icon: <Video className="h-5 w-5" />,
      acceptedTypes: ['video/*'],
      maxSize: 500
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: <File className="h-5 w-5" />,
      acceptedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ],
      maxSize: 25
    },
    {
      id: 'audio',
      name: 'Audio',
      icon: <Music className="h-5 w-5" />,
      acceptedTypes: ['audio/*'],
      maxSize: 100
    },
    {
      id: 'archives',
      name: 'Archives',
      icon: <Archive className="h-5 w-5" />,
      acceptedTypes: [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
      ],
      maxSize: 200
    }
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="h-8 w-8 text-red-500" />;
    if (fileType.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />;
    if (fileType.includes('pdf')) return <File className="h-8 w-8 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <File className="h-8 w-8 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <File className="h-8 w-8 text-green-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return <Archive className="h-8 w-8 text-orange-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const simulateFileUpload = async (file: File): Promise<UploadedFile> => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => [...prev, uploadedFile]);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: i, status: i === 100 ? 'completed' : 'uploading' }
            : f
        )
      );
    }

    return uploadedFile;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const category = fileCategories.find(cat => cat.id === selectedCategory);
      if (!category || category.id === 'all') return true;
      
      const isValidType = category.acceptedTypes.some(type => {
        if (type === '*/*') return true;
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      const isValidSize = file.size <= category.maxSize * 1024 * 1024;
      
      return isValidType && isValidSize;
    });

    for (const file of validFiles) {
      try {
        await simulateFileUpload(file);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name 
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
          )
        );
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const filteredFiles = uploadedFiles.filter(file => {
    if (selectedCategory === 'all') return true;
    const category = fileCategories.find(cat => cat.id === selectedCategory);
    if (!category) return true;
    
    return category.acceptedTypes.some(type => {
      if (type === '*/*') return true;
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>File Upload System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              {fileCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {fileCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drop files here or click to upload
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {category.id === 'all' 
                      ? 'All file types accepted'
                      : `Accepted: ${category.acceptedTypes.join(', ')}`
                    } • Max size: {category.maxSize}MB
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="space-x-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>Choose Files</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={category.acceptedTypes.join(',')}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* File List */}
                {filteredFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Uploaded Files</h4>
                    <div className="grid gap-3">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50"
                        >
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium truncate">{file.name}</h5>
                              <div className="flex items-center space-x-2">
                                {file.status === 'completed' && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {file.status === 'error' && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <Badge variant={file.status === 'error' ? 'destructive' : 'secondary'}>
                                  {file.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                            </p>
                            {file.status === 'uploading' && (
                              <Progress value={file.progress} className="mt-2" />
                            )}
                            {file.error && (
                              <p className="text-sm text-red-500 mt-1">{file.error}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.status === 'completed' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 