// src/components/BotPanel.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Types for application data (adjust as needed)
interface Application {
  id: number;
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  job_id: number;
  job_title: string;
  status: string;
}

const salaryOptions = ['$80k', '$90k', '$100k'];
const dateOptions = [
  { label: 'Immediately', value: new Date().toISOString().split('T')[0] },
  { label: 'In 2 weeks', value: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { label: 'In 1 month', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];

const BotPanel: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [salary, setSalary] = useState<string>('');
  const [joiningDate, setJoiningDate] = useState<string>('');

  // Fetch shortlisted applications for the recruiter
  const { data: apps, isLoading } = useQuery({
    queryKey: ['shortlistedApplications'],
    queryFn: async () => {
      const res = await apiClient.get('/applications');
      return res.data; // return all applications
    },
    enabled: !!user,
  });

  const sendOfferMutation = useMutation({
    mutationFn: async () => {
      if (!selectedApp) throw new Error('No application selected');
      await apiClient.post(`/documents/offer-letter/${selectedApp.id}`, {
        salary,
        joining_date: joiningDate,
      });
    },
    onSuccess: () => {
      // Refresh list after successful send
      queryClient.invalidateQueries({ queryKey: ['shortlistedApplications'] });
      setStep(1);
      setSelectedApp(null);
      setSalary('');
      setJoiningDate('');
      alert('✅ Offer letter sent successfully');
    },
    onError: (err) => {
      console.error(err);
      alert('❌ Failed to send offer letter');
    },
  });

  // Render UI based on step
  const renderStep1 = () => (
    <div className="flex flex-col space-y-2">
      <p className="font-medium text-gray-200 mb-2">🤖 Hi! I can help you send offer letters. Select a candidate below:</p>
      {isLoading && <p className="text-gray-400">Loading candidates...</p>}
      {apps && apps.length > 0 ? (
        apps.map((app: Application) => (
          <button
            key={app.id}
            className="w-full text-left bg-background/60 hover:bg-primary/20 border border-gray-500 rounded p-2 transition"
            onClick={() => {
              setSelectedApp(app);
              setStep(2);
            }}
          >
            {app.candidate_name} – {app.job_title}
          </button>
        ))
      ) : (
        <p className="text-gray-400">No shortlisted candidates.</p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col space-y-3">
      <p className="font-medium text-gray-200">🤖 Great! Sending an offer to <strong>{selectedApp?.candidate_name}</strong> for <strong>{selectedApp?.job_title}</strong>.</p>
      <div className="space-y-1">
        <p className="text-sm text-gray-300">Salary:</p>
        <div className="flex space-x-2">
          {salaryOptions.map((opt) => (
            <button
              key={opt}
              className={`px-3 py-1 rounded ${salary === opt ? 'bg-primary text-white' : 'bg-background/60 border border-gray-500'}`}
              onClick={() => setSalary(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-300">Joining Date:</p>
        <div className="flex space-x-2">
          {dateOptions.map((opt) => (
            <button
              key={opt.label}
              className={`px-3 py-1 rounded ${joiningDate === opt.value ? 'bg-primary text-white' : 'bg-background/60 border border-gray-500'}`}
              onClick={() => setJoiningDate(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-2">
        <button
          className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => {
            setStep(1);
            setSelectedApp(null);
            setSalary('');
            setJoiningDate('');
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-1 bg-primary text-white rounded disabled:opacity-50"
          disabled={!salary || !joiningDate || sendOfferMutation.isPending}
          onClick={() => sendOfferMutation.mutate()}
        >
          {sendOfferMutation.isPending ? 'Sending…' : 'Confirm & Send'}
        </button>
      </div>
    </div>
  );

  // The panel container – glassmorphic fixed corner
  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-y-auto bg-black/60 backdrop-blur-lg rounded-xl border border-gray-700 shadow-lg p-4 text-white z-50">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  );
};

export default BotPanel;
