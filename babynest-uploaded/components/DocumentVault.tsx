'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Search, 
  Folder, 
  Share2, 
  Download, 
  Trash2, 
  Star,
  MoreVertical,
  Eye,
  Clock,
  Shield,
  Image,
  File,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const folders = [
  { id: 'all', name: 'All Documents', icon: FileText },
  { id: 'insurance', name: 'Insurance', icon: Shield },
  { id: 'medical', name: 'Medical Records', icon: FileText },
  { id: 'legal', name: 'Legal', icon: FileText },
  { id: 'personal', name: 'Personal', icon: Folder },
  { id: 'receipts', name: 'Receipts', icon: FileText },
];

const documentTypes = [
  { id: 'insurance_card', name: 'Insurance Card', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'birth_certificate', name: 'Birth Certificate', color: 'bg-blue-100 text-blue-700' },
  { id: 'ssn_card', name: 'SSN Card', color: 'bg-amber-100 text-amber-700' },
  { id: 'medical_record', name: 'Medical Record', color: 'bg-rose-100 text-rose-700' },
  { id: 'will', name: 'Will/Trust', color: 'bg-purple-100 text-purple-700' },
  { id: 'receipt', name: 'Receipt', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'other', name: 'Other', color: 'bg-warm-100 text-warm-700' },
];

interface Document {
  id: string;
  name: string;
  type: string;
  folder: string;
  size: number;
  uploadedAt: string;
  tags: string[];
  isFavorite: boolean;
  expirationDate?: string;
  shared?: boolean;
  thumbnail?: string;
}

export function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'BlueCross_Insurance_Card.pdf', type: 'insurance_card', folder: 'insurance', size: 245000, uploadedAt: '2026-05-01', tags: ['primary', 'medical'], isFavorite: true },
    { id: '2', name: 'Birth_Certificate_Scan.pdf', type: 'birth_certificate', folder: 'personal', size: 1800000, uploadedAt: '2026-04-15', tags: ['legal', 'important'], isFavorite: true },
    { id: '3', name: 'SSN_Application.pdf', type: 'ssn_card', folder: 'personal', size: 450000, uploadedAt: '2026-04-20', tags: ['pending'], isFavorite: false },
    { id: '4', name: 'Ultrasound_20weeks.jpg', type: 'medical_record', folder: 'medical', size: 3200000, uploadedAt: '2026-04-10', tags: ['photos'], isFavorite: true, thumbnail: '📷' },
    { id: '5', name: 'Stroller_Receipt.pdf', type: 'receipt', folder: 'receipts', size: 180000, uploadedAt: '2026-03-28', tags: ['gear', 'warranty'], isFavorite: false },
  ]);
  
  const [activeFolder, setActiveFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle file upload
    console.log('Files:', acceptedFiles);
    setShowUpload(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const filteredDocs = documents.filter(doc => {
    const matchesFolder = activeFolder === 'all' || doc.folder === activeFolder;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setDocuments(docs => docs.map(doc => 
      doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
    ));
  };

  const deleteDoc = (id: string) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocTypeLabel = (type: string) => {
    return documentTypes.find(t => t.id === type)?.name || 'Document';
  };

  const getDocTypeColor = (type: string) => {
    return documentTypes.find(t => t.id === type)?.color || 'bg-warm-100 text-warm-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-96"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </Button>
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Folders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {folders.map(folder => {
                const count = documents.filter(d => folder.id === 'all' || d.folder === folder.id).length;
                const Icon = folder.icon;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                      activeFolder === folder.id 
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' 
                        : 'text-warm-600 hover:bg-warm-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{folder.name}</span>
                    </div>
                    <span className="text-sm text-warm-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="lg:col-span-3">
          {showUpload ? (
            <Card>
              <CardContent className="p-8">
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer',
                    isDragActive 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-warm-300 hover:border-primary-300'
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-warm-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-warm-900 mb-2">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </p>
                  <p className="text-sm text-warm-500 mb-4">or click to browse</p>
                  <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
            )}>
              {filteredDocs.map(doc => (
                <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        getDocTypeColor(doc.type)
                      )}
                      >
                        {doc.thumbnail ? (
                          <span className="text-2xl">{doc.thumbnail}</span>
                        ) : (
                          <FileText className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-warm-900 truncate">{doc.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getDocTypeLabel(doc.type)}
                          </Badge>
                          <span className="text-xs text-warm-400">{formatFileSize(doc.size)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-warm-500">
                          <Clock className="w-3 h-3" />
                          {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                        </div>
                        
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {doc.expirationDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                            <Clock className="w-3 h-3" />
                            Expires {format(new Date(doc.expirationDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleFavorite(doc.id)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            doc.isFavorite ? 'text-amber-500' : 'text-warm-400 hover:text-amber-500'
                          )}
                        >
                          <Star className={cn('w-4 h-4', doc.isFavorite && 'fill-current')} />
                        </button>
                        
                        <button
                          onClick={() => setShowShareModal(true)}
                          className="p-2 text-warm-400 hover:text-primary-500 rounded-lg transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteDoc(doc.id)}
                          className="p-2 text-warm-400 hover:text-accent-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredDocs.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FileText className="w-12 h-12 text-warm-300 mx-auto mb-4" />
                  <p className="text-warm-500">No documents found</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowUpload(true)}>
                    Upload your first document
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Share Document
                <button onClick={() => setShowShareModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-warm-50 rounded-lg">
                <p className="text-sm text-warm-600 mb-2">Secure share link:</p>
                <code className="text-xs bg-white p-2 rounded block break-all">
                  https://babynest.app/share/abc123xyz
                </code>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1">Copy Link</Button>
                <Button variant="outline" className="flex-1">Email</Button>
              </div>
              
              <div className="text-sm text-warm-500">
                <Shield className="w-4 h-4 inline mr-1" />
                Link expires in 7 days
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
