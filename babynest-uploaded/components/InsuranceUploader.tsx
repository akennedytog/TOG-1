'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileImage, Loader2, CheckCircle2, AlertCircle, Sparkles, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsuranceUploaderProps {
  userState: string;
  onUploadComplete?: (data: any) => void;
}

export function InsuranceUploader({ userState, onUploadComplete }: InsuranceUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);
      setError(null);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('state', userState);

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to process image');
        }

        const data = await response.json();
        setResult(data);
        onUploadComplete?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setUploading(false);
      }
    },
    [userState, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-cream-50 border-b border-warm-100">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-soft">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-warm-900">Insurance Card Scanner</div>
            <div className="text-xs font-normal text-warm-500">AI-powered coverage decoder</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {!result && !error && (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300',
              isDragActive
                ? 'border-primary-500 bg-primary-50 scale-[1.02]'
                : 'border-warm-200 hover:border-primary-300 hover:bg-cream-50',
              uploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-warm-700">Analyzing your insurance card...</p>
                  <p className="text-sm text-warm-500">This may take a moment</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-cream-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-warm-700 mb-1">
                    {isDragActive
                      ? 'Drop your insurance card here 💚'
                      : 'Upload your insurance card'}
                  </p>
                  <p className="text-sm text-warm-500">
                    Drag & drop, or click to select a photo
                  </p>
                </div>
                <span className="text-xs text-warm-400 bg-cream-100 px-3 py-1 rounded-full">
                  PNG, JPG, WebP supported
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-5 bg-accent-50 border border-accent-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-accent-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-accent-800 mb-1">Couldn't process image</p>
                <p className="text-accent-700 text-sm mb-4">{error}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setResult(null);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">Analysis complete!</p>
                <p className="text-sm text-emerald-700">We've decoded your insurance card</p>
              </div>
            </div>

            {result.explanation && (
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cream-50 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h4 className="font-bold text-warm-900">What this means for you</h4>
                </div>
                <p className="text-warm-700 leading-relaxed">{result.explanation}</p>
              </div>
            )}

            {result.keyDetails && result.keyDetails.length > 0 && (
              <div className="p-5 bg-white border border-warm-100 rounded-2xl">
                <h4 className="font-bold text-warm-900 mb-3">Key Details</h4>
                <ul className="space-y-2">
                  {result.keyDetails.map((detail: string, index: number) => (
                    <li key={index} className="text-warm-700 flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.actionItems && result.actionItems.length > 0 && (
              <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-amber-900">Action Items</h4>
                </div>
                <ul className="space-y-2">
                  {result.actionItems.map((item: string, index: number) => (
                    <li key={index} className="text-amber-800 flex items-start gap-2 text-sm">
                      <span className="font-bold text-amber-600">{index + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="w-full"
            >
              Scan Another Card
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
