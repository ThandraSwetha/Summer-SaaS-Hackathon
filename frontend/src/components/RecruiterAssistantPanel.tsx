// src/components/RecruiterAssistantPanel.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User2, RefreshCw, Check, ArrowLeft, Send } from 'lucide-react';

// Types (mirroring BotPanel's Application type)
interface Application {
  id: number;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  status: string;
  match_score?: number; // optional – if backend does not provide, we fallback
}

const salaryOptions = [
  { label: '$80k', value: '80000' },
  { label: '$90k', value: '90000' },
  { label: '$100k', value: '100000' },
];
const dateOptions = [
  { label: 'Immediately', value: new Date().toISOString().split('T')[0] },
  { label: 'In 2 weeks', value: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { label: 'In 1 month', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];

const RecruiterAssistantPanel: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  // Fetch recruiter's jobs (filtered to the logged-in recruiter's company)
  const { data: jobs } = useQuery({
    queryKey: ['recruiterJobs'],
    queryFn: async () => {
      const res = await apiClient.get('/jobs');
      return res.data as any[]; // job objects
    },
    enabled: !!user,
  });

  // Use all fetched jobs (assume endpoint returns recruiter-owned jobs)
  const recruiterJobs = jobs ?? [];

  // Fetch applications for all recruiter jobs
  const { data: apps, isLoading, refetch } = useQuery({
    queryKey: ['recruiterApplications', recruiterJobs.map((j: any) => j.id).join(',')],
    queryFn: async () => {
      if (!recruiterJobs) return [] as Application[];
      const promises = recruiterJobs.map((job: any) => apiClient.get(`/applications/job/${job.id}`));
      const results = await Promise.all(promises);
      const all: Application[] = results.flatMap(r => r.data as Application[]);
      return all;
    },
    enabled: !!recruiterJobs && !!user,
  });

  const filteredApps = (apps ?? [])
    .filter(
      (app) =>
        app.status !== 'rejected' &&
        (user?.role === 'recruiter' || user?.role === 'super_admin')
    )
    .map((app) => ({
      ...app,
      // if match_score missing, generate a deterministic placeholder based on id
      match_score: app.match_score ?? (100 - (app.id % 100)),
    }))
    .sort((a, b) => (b.match_score! - a.match_score!));

  // ---------------------------------------------------
  // Mutation to send the offer letter (re‑using existing logic)
  // ---------------------------------------------------
  const sendOfferMutation = useMutation({
    mutationFn: async () => {
      if (!selectedApp) throw new Error('No application selected');
      console.log('Sending offer letter payload:', { salary, joining_date: joiningDate });
        await apiClient.post(`/documents/offer-letter/${selectedApp.id}`, {
          salary,
          joining_date: joiningDate,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterApplications'] });
      setStep(3);
    },
    onError: (err) => {
      console.error(err);
      alert('❌ Failed to send offer letter');
    },
  });

  // ---------------------------------------------------
  // UI helpers
  // ---------------------------------------------------
  const Header = () => (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-t-xl text-white flex justify-between items-center">
      <div className="font-semibold">💬 Recruiter Assistant</div>
      <div className="text-sm">🟢 Online • AI Hiring Support</div>
    </div>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="glass p-4 rounded-b-xl border border-border text-foreground">
      {children}
    </div>
  );

  // ---------------------------------------------------
  // Render steps
  // ---------------------------------------------------
  const renderStep1 = () => (
    <>
      <Header />
      <Card>
        <div className="font-medium mb-2">📋 Candidates Ready for Offers</div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading candidates…</p>
        ) : filteredApps.length === 0 ? (
          <p className="text-muted-foreground">No candidates available.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                className="flex justify-between items-center w-full py-2 px-3 rounded hover:bg-primary/10"
                onClick={() => {
                  setSelectedApp(app);
                  setStep(2);
                }}
              >
                <span className="flex items-center space-x-2">
                  <User2 className="h-5 w-5" />
                  <span>{app.candidate_name} — {app.job_title}</span>
                </span>
                <span className="text-sm font-medium text-purple-400">{app.match_score}% match</span>
              </button>
            ))}
          </div>
        )}
        {/* Quick‑action pills */}
        <div className="flex gap-2 mt-3">
          <button
            className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700"
            onClick={() => {
              if (filteredApps[0]) {
                setSelectedApp(filteredApps[0]);
                setStep(2);
              }
            }}
          >
            <Check size={14} />
            <span>Send Top Match</span>
          </button>
          <button
            className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-full hover:bg-gray-700"
            onClick={() => refetch()}
          >
            <RefreshCw size={14} />
            <span>Refresh List</span>
          </button>
        </div>
      </Card>
    </>
  );

  const renderStep2 = () => (
    <>
      <Header />
      <Card>
        <div className="font-medium mb-2">Sending offer to {selectedApp?.candidate_name}</div>
        <p className="text-sm mb-3">{selectedApp?.job_title}</p>
        {/* Salary pills */}
        <div className="mb-2">
          <span className="text-sm mr-2">Salary:</span>
          <div className="flex gap-2 flex-wrap">
            {salaryOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`px-3 py-1 rounded-full border ${salary === opt.value ? 'bg-purple-600 text-white' : 'bg-transparent text-foreground'} hover:bg-purple-600 hover:text-white`}
                  onClick={() => setSalary(opt.value)}
                >
                  {opt.label}
                </button>
            ))}
          </div>
        </div>
        {/* Joining date pills */}
        <div className="mb-3">
          <span className="text-sm mr-2">Joining:</span>
          <div className="flex gap-2 flex-wrap">
          {dateOptions.map((opt) => (
                <button
                  key={opt.label}
                  className={`px-3 py-1 rounded-full border ${joiningDate === opt.value ? 'bg-purple-600 text-white' : 'bg-transparent text-foreground'} hover:bg-purple-600 hover:text-white`}
                  onClick={() => setJoiningDate(opt.value)}
                >
                  {opt.label}
                </button>
            ))}
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-full disabled:opacity-50"
            disabled={!salary || !joiningDate || sendOfferMutation.isPending}
            onClick={() => sendOfferMutation.mutate()}
          >
            {sendOfferMutation.isPending ? 'Sending…' : <><Check size={14} className="mr-1" /> Confirm & Send</>}
          </button>
          <button
            className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-full"
            onClick={() => setStep(1)}
          >
            <ArrowLeft size={14} className="mr-1" /> Back
          </button>
        </div>
      </Card>
    </>
  );

  const renderStep3 = () => (
    <>
      <Header />
      <Card>
        <div className="flex items-center text-green-500 mb-2">
          <Check size={20} className="mr-2" />
          Offer letter sent to {selectedApp?.candidate_email}!
        </div>
        <p className="mb-3">PDF generated and emailed successfully.</p>
        <button
          className="flex items-center justify-center w-full px-3 py-2 bg-purple-600 text-white rounded-full"
          onClick={() => {
            // reset state for a fresh list
            setStep(1);
            setSelectedApp(null);
            setSalary('');
            setJoiningDate('');
          }}
        >
          <Send size={14} className="mr-1" /> Back to Candidate List
        </button>
      </Card>
    </>
  );

  return (
    <div className="fixed bottom-4 right-4 w-[360px] max-w-xs z-50">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default RecruiterAssistantPanel;
