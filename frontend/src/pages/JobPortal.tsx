import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, Loader2, Filter } from 'lucide-react';

const JobPortal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'internships'>('all');

  // Handle search typing with simple timeout
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setTimeout(() => setDebouncedSearch(e.target.value), 500);
  };

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs', debouncedSearch],
    queryFn: async () => {
      const url = debouncedSearch ? `/jobs?search=${debouncedSearch}` : '/jobs';
      const res = await apiClient.get(url);
      return res.data;
    }
  });

  const filteredJobs = jobs?.filter((job: any) => {
    if (activeTab === 'jobs') {
      return job.job_type !== 'internship';
    }
    if (activeTab === 'internships') {
      return job.job_type === 'internship';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Discover Opportunities</h1>
          <p className="text-muted-foreground mt-1">Find your next career step or internship role.</p>
        </div>
        
        <div className="w-full md:w-1/2 relative flex items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by title, skill, or keyword..." 
              className="input-glass pl-10 py-3"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button className="glass p-3 rounded-md hover:bg-card/80 transition-colors border border-border">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-border/50 mb-8 space-x-6">
        <button 
          onClick={() => setActiveTab('all')}
          className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'all' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          All
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'jobs' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Jobs
          {activeTab === 'jobs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button 
          onClick={() => setActiveTab('internships')}
          className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'internships' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Internships
          {activeTab === 'internships' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center text-red-500 rounded-xl">
          Error loading jobs. Please try again later.
        </div>
      ) : filteredJobs?.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex flex-col items-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium">No positions found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs?.map((job: any) => (
            <div key={job.id} className="glass-panel p-6 rounded-xl hover:border-primary/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">Job ID: {job.id} • Posted recently</p>
                </div>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                  {job.job_type.replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location || 'Remote'}</div>
                <div className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {job.experience_range || 'Entry Level'}</div>
                <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {job.salary_range || 'Competitive'}</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills_required?.slice(0, 4).map((skill: string) => (
                  <span key={skill} className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {job.skills_required?.length > 4 && (
                  <span className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded text-xs">
                    +{job.skills_required.length - 4} more
                  </span>
                )}
              </div>

              <div className="flex justify-end border-t border-border/50 pt-4 mt-auto">
                <Link to={`/jobs/${job.id}`} className="btn-primary w-full sm:w-auto text-center">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPortal;
