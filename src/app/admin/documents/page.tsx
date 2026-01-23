'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Folder,
  File,
  Trash2,
  Loader2,
  Calendar,
  X,
} from 'lucide-react';
import { GlassCard, GlassButton, GlassModal } from '@/components/ui';
import { GlassTabs, GlassTabPanels, GlassTabPanel } from '@/components/ui/glass-tabs';
import { GlassSelect } from '@/components/ui/glass-input';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/page-transition';
import { toast } from 'sonner';
import type { DocumentDisplay, YearGroupDisplay } from '@/types';

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('weekly_mailing');
  const [documents, setDocuments] = useState<DocumentDisplay[]>([]);
  const [yearGroups, setYearGroups] = useState<YearGroupDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedYearGroup, setSelectedYearGroup] = useState('');

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents?type=${activeTab}`);
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchYearGroups();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const fetchYearGroups = async () => {
    try {
      const res = await fetch('/api/year-groups');
      const data = await res.json();
      setYearGroups(data);
    } catch (error) {
      console.error('Failed to fetch year groups:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('type', activeTab);
      if (selectedYearGroup) {
        formData.append('yearGroupId', selectedYearGroup);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Document uploaded successfully');
        setIsUploadOpen(false);
        setUploadFile(null);
        fetchDocuments();
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Document deleted');
        fetchDocuments();
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const groupedByWeek = documents.reduce((acc, doc) => {
    const week = doc.weekStartDate || 'No Week';
    if (!acc[week]) acc[week] = [];
    acc[week].push(doc);
    return acc;
  }, {} as Record<string, DocumentDisplay[]>);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <PageTransition>
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Documents</h1>
            <p className="text-white/60">
              Manage weekly mailings and fact sheets
            </p>
          </div>
          <GlassButton
            variant="primary"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Document
          </GlassButton>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-6">
          <GlassTabs
            tabs={[
              { id: 'weekly_mailing', label: 'Weekly Mailings', icon: <FileText className="w-4 h-4" /> },
              { id: 'fact_sheet', label: 'Fact Sheets', icon: <File className="w-4 h-4" /> },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </FadeIn>

      <GlassTabPanels>
        <GlassTabPanel tabId={activeTab} activeTab={activeTab}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
            </div>
          ) : Object.keys(groupedByWeek).length === 0 ? (
            <GlassCard className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-white/30" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                No Documents
              </h3>
              <p className="text-white/50">
                Upload your first document to get started
              </p>
            </GlassCard>
          ) : (
            <StaggerContainer className="space-y-6">
              {Object.entries(groupedByWeek)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([week, docs]) => (
                  <StaggerItem key={week}>
                    <GlassCard>
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-accent-emerald/30 to-pink-500/30">
                          <Folder className="w-5 h-5 text-accent-emerald" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            Week of {week !== 'No Week' ? new Date(week).toLocaleDateString() : 'Unassigned'}
                          </h3>
                          <p className="text-sm text-white/60">
                            {docs.length} document{docs.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {docs.map((doc) => (
                          <motion.div
                            key={doc.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <File className="w-5 h-5 text-accent-primary flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium truncate">{doc.filename}</p>
                                <p className="text-sm text-white/50">
                                  {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <a
                                href={doc.s3Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-accent-primary"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </GlassCard>
                  </StaggerItem>
                ))}
            </StaggerContainer>
          )}
        </GlassTabPanel>
      </GlassTabPanels>

      {/* Upload Modal */}
      <GlassModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadFile(null);
        }}
        title="Upload Document"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Document Type
            </label>
            <GlassSelect
              options={[
                { value: 'weekly_mailing', label: 'Weekly Mailing' },
                { value: 'fact_sheet', label: 'Fact Sheet' },
              ]}
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            />
          </div>

          {activeTab === 'fact_sheet' && (
            <GlassSelect
              label="Year Group (Optional)"
              options={[
                { value: '', label: 'School-wide' },
                ...yearGroups.map((yg) => ({ value: yg.id, label: yg.name })),
              ]}
              value={selectedYearGroup}
              onChange={(e) => setSelectedYearGroup(e.target.value)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/20 hover:border-accent-primary/50 transition-colors cursor-pointer"
              >
                {uploadFile ? (
                  <div className="flex items-center gap-3">
                    <File className="w-6 h-6 text-accent-primary" />
                    <span>{uploadFile.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadFile(null);
                      }}
                      className="p-1 rounded-full hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-white/50" />
                    <span className="text-white/50">
                      Click to select a file or drag and drop
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <GlassButton
              variant="default"
              onClick={() => {
                setIsUploadOpen(false);
                setUploadFile(null);
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={!uploadFile}
            >
              Upload
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </PageTransition>
  );
}
