'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Shield,
  Baby,
  Heart,
  DollarSign,
  Clock,
  AlertTriangle,
  Lightbulb,
  FileImage,
  ChevronDown,
  ChevronUp,
  File,
  Camera,
  Type,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase, BenefitDocument, ActionItem } from '@/lib/supabase';

interface InsuranceDocument {
  id: string;
  name: string;
  type: 'medical' | 'hospital_indemnity' | 'life' | 'disability' | 'dental' | 'vision' | 'fsa' | 'hsa' | 'dependent_care' | 'other';
  uploadDate: Date;
  status: 'analyzing' | 'complete' | 'error';
  analysis?: InsuranceAnalysis;
  dbId?: string;
}

interface InsuranceAnalysis {
  summary: string;
  keyBenefits: string[];
  pregnancyCoverage: string[];
  newbornCoverage: string[];
  deductibles: string[];
  copays: string[];
  limitations: string[];
  actionItems: string[];
  deadlines: string[];
  estimatedSavings: string;
  hiddenGems: string[];
  warnings: string[];
}

interface Props {
  userId?: string;
}

const documentTypes = [
  { id: 'medical', label: 'Medical Insurance', icon: Heart, color: 'text-rose-500' },
  { id: 'hospital_indemnity', label: 'Hospital Indemnity', icon: Shield, color: 'text-blue-500' },
  { id: 'life', label: 'Life Insurance', icon: Heart, color: 'text-pink-500' },
  { id: 'disability', label: 'Disability Insurance', icon: Shield, color: 'text-purple-500' },
  { id: 'dental', label: 'Dental Insurance', icon: Shield, color: 'text-cyan-500' },
  { id: 'vision', label: 'Vision Insurance', icon: Shield, color: 'text-indigo-500' },
  { id: 'fsa', label: 'Health Care FSA', icon: DollarSign, color: 'text-green-500' },
  { id: 'hsa', label: 'Health Savings Account', icon: DollarSign, color: 'text-emerald-500' },
  { id: 'dependent_care', label: 'Dependent Care FSA', icon: Baby, color: 'text-amber-500' },
  { id: 'other', label: 'Other Benefit Document', icon: FileText, color: 'text-warm-500' },
];

export function InsuranceDocumentAnalyzer({ userId }: Props) {
  const [documents, setDocuments] = useState<InsuranceDocument[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('medical');
  const [uploading, setUploading] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [showActionItems, setShowActionItems] = useState(true);

  // Load saved documents on mount and when tab becomes visible
  useEffect(() => {
    if (userId) {
      loadDocuments();
      loadActionItems();
    }
  }, [userId]);

  // Also reload when component becomes visible (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId) {
        loadDocuments();
        loadActionItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId]);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('benefit_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('uploaded_at', { ascending: false });
    
    if (data && !error) {
      const loadedDocs: InsuranceDocument[] = data.map((doc: BenefitDocument) => ({
        id: doc.id,
        name: doc.file_name,
        type: doc.document_type as InsuranceDocument['type'],
        uploadDate: new Date(doc.uploaded_at),
        status: 'complete',
        analysis: doc.analysis as InsuranceAnalysis,
        dbId: doc.id
      }));
      setDocuments(loadedDocs);
    }
  };

  const loadActionItems = async () => {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setActionItems(data);
    }
  };

  const createActionItemsFromAnalysis = async (documentId: string, analysis: InsuranceAnalysis) => {
    const items: string[] = [];
    
    // Add action items from analysis
    if (analysis.actionItems) {
      items.push(...analysis.actionItems);
    }
    
    // Add deadlines as action items
    if (analysis.deadlines) {
      analysis.deadlines.forEach(deadline => {
        items.push(`DEADLINE: ${deadline}`);
      });
    }
    
    // Add warnings as action items
    if (analysis.warnings) {
      analysis.warnings.forEach(warning => {
        items.push(`⚠️ ${warning}`);
      });
    }

    // Create action items in database
    for (const itemText of items) {
      await supabase.from('action_items').insert({
        user_id: userId,
        document_id: documentId,
        task_text: itemText,
        category: 'insurance',
        priority: itemText.includes('DEADLINE') || itemText.includes('⚠️') ? 'high' : 'medium',
        status: 'pending'
      });
    }
    
    // Refresh action items
    await loadActionItems();
  };

  const toggleActionItemComplete = async (itemId: string) => {
    const item = actionItems.find(i => i.id === itemId);
    if (!item) return;
    
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    
    const { error } = await supabase
      .from('action_items')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', itemId);
    
    if (!error) {
      await loadActionItems();
    }
  };

  const deleteActionItem = async (itemId: string) => {
    const { error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', itemId);
    
    if (!error) {
      await loadActionItems();
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum size is 10MB. For large PDFs, try pasting text or uploading specific pages.');
        return;
      }

      const newDoc: InsuranceDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: selectedDocType as InsuranceDocument['type'],
        uploadDate: new Date(),
        status: 'analyzing',
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', selectedDocType);

        const response = await fetch('/api/analyze-insurance-doc', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, status: 'complete', analysis: data }
              : doc
          ));
        } else {
          throw new Error(data.error || 'Analysis failed');
        }
      } catch (err) {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id 
            ? { ...doc, status: 'error' }
            : doc
        ));
      } finally {
        setUploading(false);
      }
    },
    [selectedDocType]
  );

  const analyzePastedText = async () => {
    if (!pastedText.trim()) return;

    const newDoc: InsuranceDocument = {
      id: Date.now().toString(),
      name: `Pasted ${getDocumentLabel(selectedDocType)} Text`,
      type: selectedDocType as InsuranceDocument['type'],
      uploadDate: new Date(),
      status: 'analyzing',
    };
    
    setDocuments(prev => [newDoc, ...prev]);
    setUploading(true);

    try {
      const response = await fetch('/api/analyze-insurance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText,
          docType: selectedDocType
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id 
            ? { ...doc, status: 'complete', analysis: data }
            : doc
        ));
        setPastedText('');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err) {
      setDocuments(prev => prev.map(doc => 
        doc.id === newDoc.id 
          ? { ...doc, status: 'error' }
          : doc
      ));
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getDocumentIcon = (type: string) => {
    const docType = documentTypes.find(d => d.id === type);
    return docType ? docType.icon : FileText;
  };

  const getDocumentColor = (type: string) => {
    const docType = documentTypes.find(d => d.id === type);
    return docType ? docType.color : 'text-warm-500';
  };

  const getDocumentLabel = (type: string) => {
    const docType = documentTypes.find(d => d.id === type);
    return docType ? docType.label : 'Document';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-soft">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-warm-900">Insurance & Benefits Analyzer</div>
              <div className="text-xs font-normal text-warm-500">Upload documents or paste text for AI analysis</div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Document Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-warm-700 mb-3">
              What type of document are you analyzing?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {documentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedDocType(type.id)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-center transition-all",
                    selectedDocType === type.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-warm-100 hover:border-emerald-200 bg-white'
                  )}
                >
                  <type.icon className={cn("w-5 h-5 mx-auto mb-1", type.color)} />
                  <span className="text-xs font-medium text-warm-700">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Mode Toggle */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setInputMode('upload')}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium transition-all",
                inputMode === 'upload' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              )}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={cn(
                "flex-1 py-2 px-4 rounded-lg font-medium transition-all",
                inputMode === 'paste' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              )}
            >
              <Type className="w-4 h-4 inline mr-2" />
              Paste Text
            </button>
          </div>

          {/* Upload Zone */}
          {inputMode === 'upload' && (
            <div>
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
                  isDragActive
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.02]'
                    : 'border-warm-200 hover:border-emerald-300 hover:bg-cream-50',
                  uploading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input {...getInputProps()} />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-warm-700">Analyzing your document...</p>
                      <p className="text-sm text-warm-500">This may take 30-60 seconds</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                      <Upload className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-warm-700 mb-1">
                        {isDragActive ? 'Drop your document here 💚' : 'Upload or drag a file'}
                      </p>
                      <p className="text-sm text-warm-500">
                        Images work best (PNG, JPG). PDFs limited to 10MB.
                      </p>
                      <p className="text-xs text-warm-400 mt-2">
                        💡 Tip: For large PDFs, paste key text instead
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileImage className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Quick Tips */}
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>💡 Pro Tips for Large Documents:</strong>
                </p>
                <ul className="text-xs text-amber-700 mt-2 space-y-1">
                  <li>• Screenshots of key pages work better than full PDFs</li>
                  <li>• Focus on: Summary of Benefits, Coverage Details, Costs sections</li>
                  <li>• Or use "Paste Text" mode and copy the important sections</li>
                </ul>
              </div>
            </div>
          )}

          {/* Paste Text Zone */}
          {inputMode === 'paste' && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Paste text from your {getDocumentLabel(selectedDocType)} document
                </label>
                <Textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Paste the text from your ${getDocumentLabel(selectedDocType)} document here...

Tip: Focus on the most important sections like:
- Summary of Benefits
- Coverage Details  
- Costs & Deductibles
- Enrollment Information
- Pregnancy/Maternity Coverage`}
                  className="min-h-[200px]"
                />
              </div>
              <Button 
                onClick={analyzePastedText}
                disabled={!pastedText.trim() || uploading}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Shield className="w-4 h-4 mr-2" /> Analyze Text</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyzed Documents */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-warm-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Analyzed Documents
          </h3>
          
          {documents.map(doc => {
            const Icon = getDocumentIcon(doc.type);
            const colorClass = getDocumentColor(doc.type);
            const isExpanded = expandedDoc === doc.id;
            
            return (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="p-5 flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-warm-50", colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-warm-900">{doc.name}</h4>
                        <Badge 
                          variant={doc.status === 'complete' ? 'default' : doc.status === 'analyzing' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {doc.status === 'complete' ? '✓ Analyzed' : doc.status === 'analyzing' ? 'Analyzing...' : 'Error'}
                        </Badge>
                      </div>
                      <p className="text-sm text-warm-500">
                        {getDocumentLabel(doc.type)} • {doc.uploadDate.toLocaleDateString()}
                      </p>
                      {doc.analysis && (
                        <button
                          onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                          className="mt-2 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          {isExpanded ? (
                            <><ChevronUp className="w-4 h-4" /> Hide Analysis</>
                          ) : (
                            <><ChevronDown className="w-4 h-4" /> View Analysis</>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="text-warm-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Analysis Content */}
                  {isExpanded && doc.analysis && (
                    <div className="border-t border-warm-100 bg-warm-50 p-5">
                      {/* Summary */}
                      <div className="mb-6 p-4 bg-white border border-emerald-100 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-5 h-5 text-emerald-500" />
                          <h5 className="font-semibold text-warm-900">Summary</h5>
                        </div>
                        <p className="text-warm-700">{doc.analysis.summary}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Key Benefits */}
                        {doc.analysis.keyBenefits.length > 0 && (
                          <div className="p-4 bg-white border border-emerald-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <Heart className="w-4 h-4 text-emerald-500" />
                              <h5 className="font-semibold text-warm-900">Key Benefits</h5>
                            </div>
                            <ul className="space-y-2">
                              {doc.analysis.keyBenefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                                  <span className="text-emerald-400 mt-1">•</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Pregnancy Coverage */}
                        {doc.analysis.pregnancyCoverage.length > 0 && (
                          <div className="p-4 bg-white border border-pink-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <Baby className="w-4 h-4 text-pink-500" />
                              <h5 className="font-semibold text-warm-900">Pregnancy Coverage</h5>
                            </div>
                            <ul className="space-y-2">
                              {doc.analysis.pregnancyCoverage.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                                  <span className="text-pink-400 mt-1">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Newborn Coverage */}
                        {doc.analysis.newbornCoverage.length > 0 && (
                          <div className="p-4 bg-white border border-blue-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <Baby className="w-4 h-4 text-blue-500" />
                              <h5 className="font-semibold text-warm-900">Newborn Coverage</h5>
                            </div>
                            <ul className="space-y-2">
                              {doc.analysis.newbornCoverage.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                                  <span className="text-blue-400 mt-1">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Costs */}
                        {doc.analysis.deductibles.length > 0 && (
                          <div className="p-4 bg-white border border-amber-100 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <DollarSign className="w-4 h-4 text-amber-500" />
                              <h5 className="font-semibold text-warm-900">Costs & Deductibles</h5>
                            </div>
                            <ul className="space-y-2">
                              {doc.analysis.deductibles.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                                  <span className="text-amber-400 mt-1">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action Items */}
                      {doc.analysis.actionItems.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <h5 className="font-semibold text-amber-900">Action Items for You</h5>
                          </div>
                          <ol className="space-y-2">
                            {doc.analysis.actionItems.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                                <span className="font-bold text-amber-600">{i + 1}.</span>
                                {item}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Deadlines */}
                      {doc.analysis.deadlines.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-5 h-5 text-red-600" />
                            <h5 className="font-semibold text-red-900">Critical Deadlines</h5>
                          </div>
                          <ul className="space-y-2">
                            {doc.analysis.deadlines.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                                <span className="text-red-400 mt-1">⚠</span>
                                <strong>{item}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Hidden Gems */}
                      {doc.analysis.hiddenGems.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-5 h-5 text-purple-600" />
                            <h5 className="font-semibold text-purple-900">Hidden Gems (Easy to Miss!)</h5>
                          </div>
                          <ul className="space-y-2">
                            {doc.analysis.hiddenGems.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-purple-800">
                                <span className="text-purple-400 mt-1">💎</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warnings */}
                      {doc.analysis.warnings.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h5 className="font-semibold text-red-900">Important Warnings</h5>
                          </div>
                          <ul className="space-y-2">
                            {doc.analysis.warnings.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                                <span className="text-red-400 mt-1">⚠</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Estimated Savings */}
                      {doc.analysis.estimatedSavings && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <h5 className="font-semibold text-green-900">Estimated Value</h5>
                          </div>
                          <p className="text-green-800">{doc.analysis.estimatedSavings}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
