import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { 
  Shield, 
  UserCheck, 
  UserX, 
  Loader2, 
  Filter, 
  ArrowUpDown, 
  Search, 
  Calendar 
} from 'lucide-react';
import { useState } from 'react';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  
  // States for filtering & sorting
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [appSearch, setAppSearch] = useState<string>('');
  const [recruiterSearch, setRecruiterSearch] = useState<string>('');
  const [sortField, setSortField] = useState<string>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch all applications (admin view)
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['adminApplications'],
    queryFn: async () => {
      const res = await apiClient.get('/applications/admin/all');
      return res.data;
    }
  });

  // Fetch all recruiters (admin view)
  const { data: recruiters, isLoading: recruitersLoading } = useQuery({
    queryKey: ['adminRecruiters'],
    queryFn: async () => {
      const res = await apiClient.get('/users/admin/recruiters');
      return res.data;
    }
  });

  // Toggle active status mutation handler
  const handleToggleActive = async (userId: number) => {
    try {
      await apiClient.put(`/users/admin/users/${userId}/toggle-active`);
      queryClient.invalidateQueries({ queryKey: ['adminRecruiters'] });
    } catch (err) {
      console.error(err);
      alert('Failed to update recruiter active status.');
    }
  };

  // Sort and Filter applications
  const filteredApps = (applications || [])
    .filter((app: any) => {
      const matchesStatus = appStatusFilter === 'all' || app.status === appStatusFilter;
      const searchStr = `${app.candidate_name} ${app.job_title} ${app.company_name} ${app.status}`.toLowerCase();
      const matchesSearch = searchStr.includes(appSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  // Filter recruiters
  const filteredRecruiters = (recruiters || []).filter((rec: any) => {
    const searchStr = `${rec.email} ${rec.company_name}`.toLowerCase();
    return searchStr.includes(recruiterSearch.toLowerCase());
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
      {/* Title */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground mt-0.5">Global overview of placement applications and recruiter accounts.</p>
        </div>
      </div>

      {/* Applications status table card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border/50 pb-4">
          <div>
            <h2 className="text-xl font-bold">Applications Tracker</h2>
            <p className="text-sm text-muted-foreground mt-0.5">View and monitor every job application across the platform.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search applications..." 
                className="input-glass pl-9 py-1.5 text-sm w-full md:w-60"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 glass px-3 py-1.5 rounded-lg border border-border/50 text-sm">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={appStatusFilter} 
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-foreground font-semibold text-xs uppercase cursor-pointer"
              >
                <option value="all" className="bg-background text-foreground">ALL STATUSES</option>
                <option value="applied" className="bg-background text-foreground">APPLIED</option>
                <option value="shortlisted" className="bg-background text-foreground">SHORTLISTED</option>
                <option value="interview_scheduled" className="bg-background text-foreground">INTERVIEW SCHEDULED</option>
                <option value="selected" className="bg-background text-foreground">SELECTED</option>
                <option value="rejected" className="bg-background text-foreground">REJECTED</option>
                <option value="on_hold" className="bg-background text-foreground">ON HOLD</option>
              </select>
            </div>
          </div>
        </div>

        {appsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No applications matching criteria found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-card/50 text-muted-foreground border-b border-border font-medium">
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('candidate_name')}>
                    Candidate <ArrowUpDown className="w-3.5 h-3.5 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('job_title')}>
                    Job Role <ArrowUpDown className="w-3.5 h-3.5 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('company_name')}>
                    Company <ArrowUpDown className="w-3.5 h-3.5 inline ml-1" />
                  </th>
                  <th className="p-4">Recruiter</th>
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors text-center" onClick={() => toggleSort('match_score')}>
                    Match Score <ArrowUpDown className="w-3.5 h-3.5 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('status')}>
                    Status <ArrowUpDown className="w-3.5 h-3.5 inline ml-1" />
                  </th>
                  <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('updated_at')}>
                    Last Updated <ArrowUpDown className="w-3.5 h-3.5 inline ml-1" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app: any) => (
                  <tr key={app.id} className="border-b border-border/30 hover:bg-card/45 transition-colors">
                    <td className="p-4 font-bold text-foreground">{app.candidate_name}</td>
                    <td className="p-4 font-semibold text-primary">{app.job_title}</td>
                    <td className="p-4 text-muted-foreground">{app.company_name}</td>
                    <td className="p-4 text-xs text-muted-foreground font-mono">{app.recruiter_email}</td>
                    <td className="p-4 text-center">
                      <span className="font-extrabold text-primary">{app.match_score}%</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-secondary/60 text-secondary-foreground border border-border/50 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(app.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recruiter Accounts Status Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-border/50 pb-4">
          <div>
            <h2 className="text-xl font-bold">Recruiter & Company Accounts</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Toggle active/inactive status to restrict platform and login access.</p>
          </div>

          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search recruiter email or company..." 
              className="input-glass pl-9 py-1.5 text-sm w-full md:w-64"
              value={recruiterSearch}
              onChange={(e) => setRecruiterSearch(e.target.value)}
            />
          </div>
        </div>

        {recruitersLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredRecruiters.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">No recruiter accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-card/50 text-muted-foreground border-b border-border font-medium">
                  <th className="p-4">Recruiter Email</th>
                  <th className="p-4">Associated Company</th>
                  <th className="p-4 text-center">Jobs Posted</th>
                  <th className="p-4">Date Joined</th>
                  <th className="p-4 text-center">Account Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecruiters.map((rec: any) => (
                  <tr key={rec.id} className="border-b border-border/30 hover:bg-card/45 transition-colors">
                    <td className="p-4 font-bold text-foreground font-mono text-xs">{rec.email}</td>
                    <td className="p-4 font-semibold text-primary">{rec.company_name}</td>
                    <td className="p-4 text-center font-bold text-foreground">{rec.jobs_count}</td>
                    <td className="p-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {rec.is_active ? (
                        <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                          <UserCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                          <UserX className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleToggleActive(rec.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          rec.is_active 
                            ? 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                        }`}
                      >
                        {rec.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
