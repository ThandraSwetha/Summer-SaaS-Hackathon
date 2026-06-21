import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '../api/client';
import { MapPin, Briefcase, DollarSign, Loader2, ArrowLeft, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const applyParam = searchParams.get('apply');

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await apiClient.get(`/jobs/${id}`);
      return res.data;
    }
  });

  // Query to check if the candidate has already applied
  const { data: existingApplication, isLoading: checkingApp } = useQuery({
    queryKey: ['existingApplication', id, user?.email],
    queryFn: async () => {
      try {
        const profileRes = await apiClient.get('/users/candidates/me');
        const candidateId = profileRes.data.id;
        const res = await apiClient.get(`/applications/candidate/${candidateId}/job/${id}`);
        return res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: isAuthenticated && user?.role === 'candidate' && !!id,
    retry: false
  });

  const isApplied = applySuccess || !!existingApplication;

  // Auto-apply if redirected with apply param after login
  useEffect(() => {
    if (
      applyParam &&
      isAuthenticated &&
      user?.role === 'candidate' &&
      !isApplied &&
      !checkingApp &&
      !applying
    ) {
      handleApply();
    }
  }, [applyParam, isAuthenticated, user, isApplied, checkingApp, applying]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const profileRes = await apiClient.get('/users/candidates/me');
      const candidateId = profileRes.data.id;

      await apiClient.post('/applications/', {
        job_id: parseInt(id!),
        candidate_id: candidateId,
        status: 'applied'
      });
      setApplySuccess(true);
    } catch (e: any) {
      const msg = getErrorMessage(e);
      console.error('Apply error:', e?.response?.data || e);
      alert(`Failed to apply.\n${msg}`);
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error || !job) return <div className="text-center py-20 text-red-500">Error loading job details.</div>;

  const postedDate = new Date(job.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const loginUrl = `/login?redirect=${encodeURIComponent(window.location.pathname + '?apply=1')}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link to="/jobs" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </Link>

      <div className="glass-panel p-8 rounded-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-card rounded-lg border border-border flex items-center justify-center shadow-sm overflow-hidden">
              {job.company?.logo_url ? (
                <img src={job.company.logo_url} alt={job.company.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="text-muted-foreground text-lg mt-1">
                {job.company?.name || `Company ID: ${job.company_id}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-2 w-full md:w-auto">
            {!isAuthenticated ? (
              <Link to={loginUrl} className="btn-primary text-center">Log in to Apply</Link>
            ) : user?.role === 'candidate' ? (
              <button
                onClick={handleApply}
                disabled={applying || isApplied || checkingApp}
                className={`btn-primary w-full md:w-auto ${isApplied ? 'bg-green-500 hover:opacity-100 cursor-not-allowed shadow-green-500/20' : ''}`}
              >
                {checkingApp ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : applying ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : isApplied ? (
                  <span className="flex items-center justify-center gap-1">Applied ✓</span>
                ) : (
                  'Apply Now'
                )}
              </button>
            ) : (
              <div className="text-sm text-muted-foreground bg-secondary/50 p-2.5 rounded border border-border text-center">
                Switch to a candidate account to apply.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-muted-foreground mb-8 pb-8 border-b border-border/50">
          <div className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary" /> {job.location || 'Remote'}</div>
          <div className="flex items-center"><Briefcase className="w-5 h-5 mr-2 text-primary" /> {job.experience_range || 'Entry Level'}</div>
          <div className="flex items-center"><DollarSign className="w-5 h-5 mr-2 text-primary" /> {job.salary_range || 'Competitive'}</div>
          <div className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-primary" /> Posted {postedDate}</div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider">
            {job.job_type.replace('_', ' ')}
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <h3 className="text-xl font-semibold mb-4 text-foreground">About the Role</h3>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed mb-8">
            {job.description}
          </p>

          <h3 className="text-xl font-semibold mb-4 text-foreground">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills_required?.map((skill: string) => (
              <span key={skill} className="bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
