import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Users, Briefcase, FileCheck, XCircle, Loader2 } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const RecruiterDashboard = () => {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
// Offer Letter functionality moved to BotPanel

// Functions removed; BotPanel handles offer flow

// Offer send handled by BotPanel
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['recruiterDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/dashboard');
      return res.data;
    }
  });

  const { data: myJobs } = useQuery({
    queryKey: ['myJobs'],
    queryFn: async () => {
      const res = await apiClient.get('/jobs'); // Simplified, should filter by company
      return res.data;
    }
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications', selectedJob],
    queryFn: async () => {
      if (!selectedJob) return [];
      const res = await apiClient.get(`/applications/job/${selectedJob}`);
      return res.data;
    },
    enabled: !!selectedJob
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const stats = dashboardData?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold mb-8">Recruiter Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-xl border-l-4 border-l-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Total Jobs</p>
              <h3 className="text-3xl font-bold">{stats?.total_jobs || 0}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-md"><Briefcase className="w-5 h-5 text-primary" /></div>
          </div>
        </div>
        <div className="glass p-6 rounded-xl border-l-4 border-l-accent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Total Applicants</p>
              <h3 className="text-3xl font-bold">{stats?.total_applicants || 0}</h3>
            </div>
            <div className="bg-accent/10 p-2 rounded-md"><Users className="w-5 h-5 text-accent" /></div>
          </div>
        </div>
        <div className="glass p-6 rounded-xl border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Shortlisted</p>
              <h3 className="text-3xl font-bold">{stats?.shortlisted || 0}</h3>
            </div>
            <div className="bg-green-500/10 p-2 rounded-md"><FileCheck className="w-5 h-5 text-green-500" /></div>
          </div>
        </div>
        <div className="glass p-6 rounded-xl border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Rejected</p>
              <h3 className="text-3xl font-bold">{stats?.rejected || 0}</h3>
            </div>
            <div className="bg-red-500/10 p-2 rounded-md"><XCircle className="w-5 h-5 text-red-500" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Job Selector */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Your Jobs</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {myJobs?.map((job: any) => (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job.id)}
                className={`p-4 rounded-lg cursor-pointer transition-colors border ${selectedJob === job.id ? 'bg-primary/20 border-primary' : 'glass hover:border-primary/50'}`}
              >
                <h4 className="font-medium truncate">{job.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{job.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {selectedJob ? 'Applicants' : 'Select a job to view applicants'}
              </h3>
            </div>
            
            {!selectedJob ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                Select a job from the left panel to review its applications.
              </div>
            ) : appsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : applications?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No applicants for this job yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-card/50 text-muted-foreground text-sm border-b border-border">
                      <th className="p-4 font-medium">Candidate ID</th>
                      <th className="p-4 font-medium">Match Score</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Applied On</th>
                      <th className="p-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications?.sort((a: any, b: any) => b.match_score - a.match_score).map((app: any) => (
                      <tr 
                        key={app.id} 
                        onClick={() => navigate(`/recruiter/candidates/${app.candidate_id}?job_id=${selectedJob}`)}
                        className="border-b border-border/50 hover:bg-card/50 transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-medium">#{app.candidate_id}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${app.match_score > 75 ? 'bg-green-500' : app.match_score > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                style={{ width: `${app.match_score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{app.match_score}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-secondary/50 px-2 py-1 rounded text-xs uppercase tracking-wider">{app.status}</span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <span className="text-gray-400 text-sm">Use BotPanel</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
{/* Modal removed; BotPanel provides UI */}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default RecruiterDashboard;
