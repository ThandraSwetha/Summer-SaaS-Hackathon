import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '../api/client';
import { 
  FileText, 
  Loader2, 
  UploadCloud, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  X, 
  Briefcase, 
  GraduationCap, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  // Profile fields state
  const [profileForm, setProfileForm] = useState({
    name: '',
    headline: '',
    location: '',
    phone: '',
    photo_url: '',
    skills: '',
    experience: [] as any[],
    education: [] as any[]
  });

  // Project fields state
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tech_stack: '',
    project_link: ''
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: async () => {
      const res = await apiClient.get('/users/candidates/me');
      // Initialize form with fetched data
      setProfileForm({
        name: res.data.name || '',
        headline: res.data.headline || '',
        location: res.data.location || '',
        phone: res.data.phone || '',
        photo_url: res.data.photo_url || '',
        skills: res.data.skills ? res.data.skills.join(', ') : '',
        experience: res.data.experience || [],
        education: res.data.education || []
      });
      return res.data;
    }
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const res = await apiClient.get('/applications/me');
      return res.data;
    }
  });

  // Handle profile update submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skillsArray = profileForm.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      
      const payload = {
        name: profileForm.name,
        headline: profileForm.headline,
        location: profileForm.location,
        phone: profileForm.phone,
        photo_url: profileForm.photo_url,
        skills: skillsArray,
        experience: profileForm.experience,
        education: profileForm.education
      };

      await apiClient.put('/users/candidates/me', payload);
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setProfileModalOpen(false);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error('Profile save error:', err?.response?.data || err);
      alert(`Error updating profile:\n${msg}`);
    }
  };

  // Handle project submit (create or update)
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const techArray = projectForm.tech_stack
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        tech_stack: techArray,
        project_link: projectForm.project_link || null
      };

      if (editingProject) {
        await apiClient.put(`/projects/${editingProject.id}`, payload);
      } else {
        await apiClient.post('/projects/', payload);
      }
      
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      setProjectModalOpen(false);
      setEditingProject(null);
      setProjectForm({ title: '', description: '', tech_stack: '', project_link: '' });
    } catch (err) {
      console.error(err);
      alert('Error saving project.');
    }
  };

  // Handle project delete
  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiClient.delete(`/projects/${projectId}`);
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
    } catch (err) {
      console.error(err);
      alert('Error deleting project.');
    }
  };

  // Open edit project modal
  const openEditProject = (proj: any) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      description: proj.description || '',
      tech_stack: proj.tech_stack ? proj.tech_stack.join(', ') : '',
      project_link: proj.project_link || ''
    });
    setProjectModalOpen(true);
  };

  // Timeline list item modifiers
  const addExperienceItem = () => {
    setProfileForm({
      ...profileForm,
      experience: [...profileForm.experience, { company: '', role: '', duration: '', description: '' }]
    });
  };

  const removeExperienceItem = (index: number) => {
    const nextExp = [...profileForm.experience];
    nextExp.splice(index, 1);
    setProfileForm({ ...profileForm, experience: nextExp });
  };

  const updateExperienceItem = (index: number, key: string, val: string) => {
    const nextExp = [...profileForm.experience];
    nextExp[index] = { ...nextExp[index], [key]: val };
    setProfileForm({ ...profileForm, experience: nextExp });
  };

  const addEducationItem = () => {
    setProfileForm({
      ...profileForm,
      education: [...profileForm.education, { degree: '', institution: '', year: '' }]
    });
  };

  const removeEducationItem = (index: number) => {
    const nextEdu = [...profileForm.education];
    nextEdu.splice(index, 1);
    setProfileForm({ ...profileForm, education: nextEdu });
  };

  const updateEducationItem = (index: number, key: string, val: string) => {
    const nextEdu = [...profileForm.education];
    nextEdu[index] = { ...nextEdu[index], [key]: val };
    setProfileForm({ ...profileForm, education: nextEdu });
  };

  if (profileLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.name || user?.email}</h1>
          <p className="text-muted-foreground mt-1 font-medium">Headline: <span className="text-primary">{profile?.headline || 'Not set'}</span></p>
        </div>
        <button 
          onClick={() => setProfileModalOpen(true)}
          className="btn-primary flex items-center space-x-2 w-full md:w-auto justify-center"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar and Basic details */}
          <div className="glass-panel p-6 rounded-xl flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-md overflow-hidden">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'C'
              )}
            </div>
            <h3 className="text-xl font-bold">{profile?.name || 'Your Name'}</h3>
            <p className="text-sm text-muted-foreground mt-1">{profile?.headline || 'Headline not set'}</p>
            <div className="w-full border-t border-border/50 my-4" />
            <div className="text-left w-full space-y-2 text-sm text-muted-foreground">
              <p>📍 <span className="font-semibold text-foreground">Location:</span> {profile?.location || 'Not set'}</p>
              <p>📞 <span className="font-semibold text-foreground">Phone:</span> {profile?.phone || 'Not set'}</p>
              <p>✉️ <span className="font-semibold text-foreground">Email:</span> {user?.email}</p>
            </div>
          </div>

          {/* Resume Extraction placeholder */}
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FileText className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Resume Parsing</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your PDF resume. Our AI automatically extracts your skills and experience to match you with top job opportunities.
            </p>
            
            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-card/50 transition-colors">
              <UploadCloud className="w-8 h-8 text-primary mb-2" />
              <p className="text-sm font-medium">Click to upload PDF</p>
              <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>
            </div>
          </div>

          {/* Skills cloud */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Your Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill: string) => (
                <span key={skill} className="bg-secondary/50 border border-border/50 px-2.5 py-1 rounded text-sm text-secondary-foreground font-semibold">
                  {skill}
                </span>
              )) || <p className="text-sm text-muted-foreground">No skills listed yet.</p>}
            </div>
          </div>
        </div>

        {/* Projects and Applications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects Manager */}
          <div className="glass-panel rounded-xl overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/50">
              <h3 className="text-xl font-bold">My Projects</h3>
              <button 
                onClick={() => {
                  setEditingProject(null);
                  setProjectForm({ title: '', description: '', tech_stack: '', project_link: '' });
                  setProjectModalOpen(true);
                }}
                className="btn-primary flex items-center space-x-1.5 py-1.5 px-3 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile?.projects && profile.projects.length > 0 ? (
                profile.projects.map((proj: any) => (
                  <div key={proj.id} className="glass p-5 rounded-xl border border-border/50 flex flex-col justify-between hover:border-primary/50 transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-lg truncate text-foreground">{proj.title}</h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {proj.project_link && (
                            <a 
                              href={proj.project_link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button 
                            onClick={() => openEditProject(proj)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(proj.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                <div className="col-span-2 text-center py-10 text-muted-foreground text-sm">
                  No projects added yet. Click "Add Project" to add your featured work.
                </div>
              )}
            </div>
          </div>

          {/* Applications */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold">Application Status Tracker</h3>
            </div>
            
            {appsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : applications?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                You haven't applied to any jobs yet.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {applications?.map((app: any) => (
                  <div key={app.id} className="p-6 hover:bg-card/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-lg">Job ID: #{app.job_id}</h4>
                      <p className="text-sm text-muted-foreground mt-1">Applied: {new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Match</p>
                        <span className="font-extrabold text-primary">{app.match_score}%</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 bg-secondary/30 px-3 py-1.5 rounded-full border border-border">
                        {app.status === 'selected' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        <span className="text-sm font-semibold capitalize">{app.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up border border-primary/20">
            <button 
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-primary" />
              <span>Edit Profile Details</span>
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Full Name</label>
                  <input 
                    type="text" 
                    className="input-glass"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Photo URL</label>
                  <input 
                    type="text" 
                    className="input-glass"
                    value={profileForm.photo_url}
                    onChange={(e) => setProfileForm({ ...profileForm, photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold">Headline (Recent role & focus)</label>
                  <input 
                    type="text" 
                    className="input-glass"
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    placeholder="e.g. Full Stack Developer · Python, React"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Location</label>
                  <input 
                    type="text" 
                    className="input-glass"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    placeholder="e.g. New York, NY"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Phone Number</label>
                  <input 
                    type="text" 
                    className="input-glass"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold">Skills (Comma separated)</label>
                  <textarea 
                    className="input-glass h-20 py-2 resize-none"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    placeholder="React, JavaScript, Python, Django, SQL"
                  />
                </div>
              </div>

              {/* Education Sublist */}
              <div className="space-y-4 pt-4 border-t border-border/55">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-1.5"><GraduationCap className="w-5 h-5 text-primary" /> Education</h3>
                  <button 
                    type="button" 
                    onClick={addEducationItem}
                    className="text-primary hover:underline text-sm font-semibold flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Education
                  </button>
                </div>
                {profileForm.education.map((edu, idx) => (
                  <div key={idx} className="glass p-4 rounded-lg relative space-y-3 border border-border/30">
                    <button 
                      type="button"
                      onClick={() => removeEducationItem(idx)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Degree / Field</label>
                        <input 
                          type="text" 
                          className="input-glass py-1.5 text-sm" 
                          value={edu.degree || ''} 
                          onChange={(e) => updateEducationItem(idx, 'degree', e.target.value)}
                          placeholder="B.S. Computer Science" 
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Institution</label>
                        <input 
                          type="text" 
                          className="input-glass py-1.5 text-sm" 
                          value={edu.institution || ''} 
                          onChange={(e) => updateEducationItem(idx, 'institution', e.target.value)}
                          placeholder="Stanford University" 
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Graduation Year</label>
                        <input 
                          type="text" 
                          className="input-glass py-1.5 text-sm" 
                          value={edu.year || ''} 
                          onChange={(e) => updateEducationItem(idx, 'year', e.target.value)}
                          placeholder="2025" 
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience Sublist */}
              <div className="space-y-4 pt-4 border-t border-border/55">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-1.5"><Briefcase className="w-5 h-5 text-primary" /> Experience</h3>
                  <button 
                    type="button" 
                    onClick={addExperienceItem}
                    className="text-primary hover:underline text-sm font-semibold flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Experience
                  </button>
                </div>
                {profileForm.experience.map((exp, idx) => (
                  <div key={idx} className="glass p-4 rounded-lg relative space-y-3 border border-border/30">
                    <button 
                      type="button"
                      onClick={() => removeExperienceItem(idx)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Role / Title</label>
                        <input 
                          type="text" 
                          className="input-glass py-1.5 text-sm" 
                          value={exp.role || ''} 
                          onChange={(e) => updateExperienceItem(idx, 'role', e.target.value)}
                          placeholder="Frontend Intern" 
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Company</label>
                        <input 
                          type="text" 
                          className="input-glass py-1.5 text-sm" 
                          value={exp.company || ''} 
                          onChange={(e) => updateExperienceItem(idx, 'company', e.target.value)}
                          placeholder="Google" 
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-semibold">Duration</label>
                        <input 
                          type="text" 
                          className="input-glass py-1.5 text-sm" 
                          value={exp.duration || ''} 
                          onChange={(e) => updateExperienceItem(idx, 'duration', e.target.value)}
                          placeholder="June 2025 - Present" 
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-muted-foreground font-semibold">Description / Highlights</label>
                        <textarea 
                          className="input-glass py-1.5 text-sm h-16 resize-none" 
                          value={exp.description || ''} 
                          onChange={(e) => updateExperienceItem(idx, 'description', e.target.value)}
                          placeholder="Briefly describe responsibilities and projects achieved..." 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/55">
                <button 
                  type="button" 
                  onClick={() => setProfileModalOpen(false)}
                  className="glass px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-card/40 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {projectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-8 rounded-2xl relative animate-fade-in-up border border-primary/20">
            <button 
              onClick={() => {
                setProjectModalOpen(false);
                setEditingProject(null);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6">
              {editingProject ? 'Edit Project' : 'Add Project'}
            </h2>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Project Title</label>
                <input 
                  type="text" 
                  className="input-glass"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. AI Portfolio Generator"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Description</label>
                <textarea 
                  className="input-glass h-24 py-2 resize-none"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Briefly describe the project, problem solved, and results..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Tech Stack (Comma separated)</label>
                <input 
                  type="text" 
                  className="input-glass"
                  value={projectForm.tech_stack}
                  onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })}
                  placeholder="e.g. React, Python, FastAPI, SQLite"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold">Project URL (Optional)</label>
                <input 
                  type="url" 
                  className="input-glass"
                  value={projectForm.project_link}
                  onChange={(e) => setProjectForm({ ...projectForm, project_link: e.target.value })}
                  placeholder="e.g. https://github.com/username/project"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                <button 
                  type="button" 
                  onClick={() => {
                    setProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="glass px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-card/40 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  {editingProject ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
