'use client';
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useRef, useState, useEffect } from 'react';

interface FileInfo {
  name: string;
  size: number;
  uploadDate: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Get business ID and fetch files
  useEffect(() => {
    if (!user) return;
    
    const getBusinessId = async () => {
      try {
        const response = await fetch('/api/business-id');
        const data = await response.json();
        setBusinessId(data.businessId);
      } catch (error) {
        console.error('Error getting business ID:', error);
      }
    };
    
    getBusinessId();
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/upload-pricing-doc?list=1');
      const data = await res.json();
      if (data.files) {
        setUploadedFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    
    // Upload files one by one
    let successCount = 0;
    let failedFiles: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/upload-pricing-doc', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        
        if (data.success) {
          successCount++;
        } else {
          failedFiles.push(`${file.name}: ${data.error || 'Upload failed'}`);
        }
      } catch {
        failedFiles.push(`${file.name}: Upload failed`);
      }
    }
    
    // Show results
    if (failedFiles.length > 0) {
      setError(`${successCount} file(s) uploaded successfully. Failed: ${failedFiles.join(', ')}`);
    } else if (successCount > 0) {
      // Clear any previous errors on successful upload
      setError(null);
    }
    
    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await fetchFiles(); // Refresh the file list
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    
    setDeletingFile(fileName);
    
    try {
      const res = await fetch('/api/upload-pricing-doc', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        await fetchFiles(); // Refresh the file list
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch {
      setError('Delete failed');
    }
    
    setDeletingFile(null);
  };

  const supportedFormats = [
    '.txt', '.md', '.csv', '.json', '.xml',
    '.pdf', '.docx', '.xlsx', '.xls',
    '.py', '.js', '.ts', '.html', '.css',
    '.png', '.jpg', '.jpeg', '.gif', '.webp'
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <SignedIn>
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.firstName || user?.username || 'Business Owner'}!</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Manage your business files and view your public chat page. Upload any files that Claude can read directly.
        </p>
        
        <div className="w-full max-w-4xl bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          {/* File Upload Section */}
          <h3 className="text-lg font-semibold mb-4">Upload Business Files</h3>
          <div className="mb-6">
            <div className="relative">
              <input 
                ref={fileInputRef} 
                type="file" 
                multiple
                accept={supportedFormats.join(',')}
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer disabled:file:bg-gray-100 disabled:file:text-gray-400 disabled:file:cursor-not-allowed" 
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm font-medium">
                      {uploadProgress ? `Uploading ${uploadProgress.current} of ${uploadProgress.total} files...` : 'Uploading...'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Select one or multiple files to automatically upload. Supported: {supportedFormats.join(', ')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Files List Section */}
          <h3 className="text-lg font-semibold mb-4">Your Business Files ({uploadedFiles.length})</h3>
          
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="mb-2">No files uploaded yet.</p>
              <p className="text-sm">Upload pricing lists, service menus, policies, or any business documents to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.name)}
                    disabled={deletingFile === file.name}
                    className="ml-3 px-3 py-1 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingFile === file.name ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Public Chat Page Section */}
          <h3 className="text-lg font-semibold mb-4 mt-8">Your Public Quote Page</h3>
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Share this link with your customers to let them get instant quotes using your uploaded files:
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <code className="flex-1 p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm font-mono text-gray-700 dark:text-gray-300">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/business/{businessId ? `${businessId.slice(0, 8)}****${businessId.slice(-4)}` : 'biz_****_****'}
                </code>
                <button
                  onClick={() => {
                    if (businessId) {
                      const url = `${window.location.origin}/business/${businessId}`;
                      navigator.clipboard.writeText(url);
                    }
                  }}
                  disabled={!businessId}
                  className="px-3 py-2 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Copy your actual quote page link"
                >
                  {businessId ? 'Copy Link' : 'Loading...'}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This is your personalized quote page where customers can chat with your AI assistant.
            </p>
          </div>
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="flex flex-col items-center">
          <p className="mb-4 text-lg">Please sign in to access your dashboard.</p>
          <SignInButton />
        </div>
      </SignedOut>
    </main>
  );
} 