'use client';
import { useUser, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useRef, useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch uploaded files for the user
  useEffect(() => {
    if (!user) return;
    fetch('/api/upload-pricing-doc?list=1')
      .then(res => res.json())
      .then(data => {
        if (data.files) setUploadedFiles(data.files);
      });
  }, [user]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload-pricing-doc', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadedFiles(prev => [...prev, file.name]);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <SignedIn>
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.firstName || user?.username || 'Business Owner'}!</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">This is your dashboard. Here you can upload and manage your pricing documents, and view your public chat page link.</p>
        <div className="w-full max-w-lg bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Your Pricing Documents</h3>
          <form onSubmit={handleFileUpload} className="flex gap-2 mb-4 items-center">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="flex-1" />
            <button type="submit" disabled={uploading} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <ul className="mb-4 list-disc list-inside text-gray-700 dark:text-gray-300">
            {uploadedFiles.length === 0 && <li className="italic text-gray-400">No documents uploaded yet.</li>}
            {uploadedFiles.map((file, i) => (
              <li key={i}>{file}</li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold mb-2 mt-6">Your Public Chat Page</h3>
          <div className="mb-2">
            <a
              href={`/business/${user?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline font-mono break-all hover:text-blue-800 dark:hover:text-blue-300 transition"
            >
              {typeof window !== 'undefined' ? `${window.location.origin}/business/${user?.id}` : `/business/${user?.id}`}
            </a>
            <button
              type="button"
              className="ml-2 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  navigator.clipboard.writeText(`${window.location.origin}/business/${user?.id}`);
                }
              }}
            >
              Copy
            </button>
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