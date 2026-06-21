import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Download, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');

  // Fetch candidate profile (includes projects relationship)
  const { data: candidate, isLoading: candidateLoading, error: candidateError } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const res = await apiClient.get(`/users/candidates/${id}`);
      return res.data;
    }
  });

  // Fetch candidate user account to get email
  const { data: candidateUser } = useQuery({
    queryKey: ['candidateUser', candidate?.user_id],
    queryFn: async () => {
      // Actually we don't have a GET user by ID endpoint. We can fallback to parsed info or get it from application if available.
      // Wait, let's write a route GET /api/users/{user_id} in users.py or fallback.
      // But we can also retrieve candidateUser via candidate profile or application since candidate.user_id is present.
      // Let's assume we can get candidate's email by fetching candidate user detail, or we can add that to backend as well.
      // Let's check: does the recruiter have access to /users/{id}? We can write a route for that, or just use a dummy or fallback.
      // Let's fetch it from a new endpoint GET /api/users/profile/{user_id} or just use a fallback if not found.
      // Let's implement GET /api/users/profile/{user_id} in users.py just in case, but let's make a request here first.
      try {
        const res = await apiClient.get(`/users/profile/${candidate.user_id}`);
        return res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: !!candidate?.user_id
  });

  // Fetch job application to get skill breakdown
  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['application', id, jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const res = await apiClient.get(`/applications/candidate/${id}/job/${jobId}`);
      return res.data;
    },
    enabled: !!id && !!jobId,
    retry: false
  });

  if (candidateLoading || appLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (candidateError || !candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-red-500">Error loading candidate profile</h2>
        <p className="text-muted-foreground mt-2">The candidate may not exist or you do not have permission to view their details.</p>
        <Link to="/recruiter/dashboard" className="btn-primary mt-6 inline-flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Parse initials
  const initials = candidate.name
    ? candidate.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'C';

  // Helper to format resume download URL
  const getResumeDownloadUrl = (url: string) => {
    if (!url) return '';
    const parts = url.split(/[\\/]/);
    const fileName = parts[parts.length - 1];
    return `${apiClient.defaults.baseURL}/documents/download/${fileName}`;
  };

  // Classify skills for matching view
  const getSkillCategory = (skillName: string) => {
    if (!application || !application.skill_breakdown) return 'default';
    const matched = application.skill_breakdown.matched || [];
    if (matched.includes(skillName.toLowerCase())) return 'matched';
    return 'default';
  };

  // Get missing skills (required by job, not in candidate skills)
  const missingSkills = (application?.skill_breakdown?.missing || []).map((s: string) => s.toUpperCase());

  // Skills tag cloud rendering
  const renderSkills = () => {
    const candidateSkills = candidate.skills || [];
    
    return (
      <div className="flex flex-wrap gap-2.5">
        {candidateSkills.map((skill: string) => {
          const cat = getSkillCategory(skill);
          if (cat === 'matched') {
            return (
              <span key={skill} className="flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {skill}
              </span>
            );
          }
          return (
            <span key={skill} className="bg-secondary/50 text-secondary-foreground border border-border/50 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              {skill}
            </span>
          );
        })}

        {/* Render missing skills if viewed in application context */}
        {jobId && missingSkills.map((skill: string) => (
          <span key={skill} className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" />
            {skill} (Missing)
          </span>
        ))}

        {candidateSkills.length === 0 && missingSkills.length === 0 && (
          <p className="text-sm text-muted-foreground">No skills listed.</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link 
        to={jobId ? `/recruiter/dashboard` : `/recruiter/dashboard`} 
        className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Applicants</span>
      </Link>

      {/* Header Card */}
      <div className="glass-panel p-8 rounded-2xl mb-8 relative overflow-hidden">
        {/* Banner pattern background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/30 to-accent/30 border-b border-border/20 -z-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Photo / Initials */}
            <div className="w-28 h-28 rounded-full border-4 border-background bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-3xl font-extrabold text-white shadow-xl overflow-hidden">
              {candidate.photo_url ? (
                <img src={candidate.photo_url} alt={candidate.name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{candidate.name}</h1>
              <p className="text-primary font-medium text-lg mt-1">
                {candidate.headline || 'Software Engineering Professional'}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-3">
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-primary" /> {candidate.location || 'Not Specified'}</div>
                <div className="flex items-center"><Phone className="w-4 h-4 mr-1 text-primary" /> {candidate.phone || 'No phone'}</div>
                <div className="flex items-center"><Mail className="w-4 h-4 mr-1 text-primary" /> {candidateUser?.email || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-3 mt-4 md:mt-0">
            {jobId && application && (
              <div className="glass px-4 py-2 rounded-lg border border-border/50 text-center md:text-right">
                <p className="text-xs text-muted-foreground">Job Match Score</p>
                <p className="text-2xl font-black text-primary">{application.match_score}%</p>
              </div>
            )}
            
            {candidate.resume_url ? (
              <a 
                href={getResumeDownloadUrl(candidate.resume_url)} 
                target="_blank" 
                rel="noreferrer"
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </a>
            ) : (
              <span className="text-sm text-muted-foreground italic border border-border border-dashed p-2 rounded text-center">
                No Resume Uploaded
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Experience and Projects */}
        <div className="lg:col-span-2 space-y-8">
          {/* Experience */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-border/50">
              <Briefcase className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Work Experience</h2>
            </div>
            
            <div className="relative border-l border-border pl-6 space-y-8 ml-2">
              {candidate.experience && candidate.experience.length > 0 ? (
                candidate.experience.map((exp: any, index: number) => (
                  <div key={index} className="relative">
                    {/* Timeline Node */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{exp.role}</h4>
                      <p className="text-primary font-medium text-sm mt-0.5">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-2 font-medium">{exp.duration}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm py-4 pl-2">No work experience listed yet.</div>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-border/50">
              <FolderGit2 className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Featured Projects</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.projects && candidate.projects.length > 0 ? (
                candidate.projects.map((proj: any) => (
                  <div key={proj.id} className="glass p-5 rounded-xl border border-border/50 hover:border-primary/50 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-lg truncate text-foreground">{proj.title}</h4>
                        {proj.project_link && (
                          <a 
                            href={proj.project_link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line line-clamp-3">
                        {proj.description}
                      </p>
                    </div>
                    {proj.tech_stack && proj.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-border/20">
                        {proj.tech_stack.map((tech: string) => (
                          <span key={tech} className="bg-secondary/40 text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-muted-foreground text-sm py-4">No projects added yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Education */}
        <div className="space-y-8">
          {/* Skills */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-border/50">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">
                {jobId ? 'Skill Match' : 'Skills'}
              </h2>
            </div>
            {renderSkills()}
          </div>

          {/* Education */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-border/50">
              <GraduationCap className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Education</h2>
            </div>
            
            <div className="space-y-6">
              {candidate.education && candidate.education.length > 0 ? (
                candidate.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary/30 pl-4 py-1">
                    <h4 className="font-bold text-foreground">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{edu.institution}</p>
                    <p className="text-xs text-primary/80 font-semibold mt-1">{edu.year}</p>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm py-4">No education listed yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
