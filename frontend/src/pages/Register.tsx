import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/client';
import { UserPlus, Loader2, Mail, Lock } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/auth/register', { email, password, role });
      
      // Auto login after registration
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      // Note: In a real app we'd handle the login token right away using context, 
      // but for simplicity we'll just redirect to login so they see the success path
      navigate(`/login?redirect=${encodeURIComponent(redirect || '')}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-accent/10 p-3 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold">Create Account</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">I am a...</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center py-2 px-3 border rounded-md cursor-pointer transition-colors ${role === 'candidate' ? 'bg-primary/20 border-primary' : 'bg-background/50 border-border hover:border-primary/50'}`}>
                <input type="radio" className="hidden" name="role" value="candidate" checked={role === 'candidate'} onChange={(e) => setRole(e.target.value)} />
                <span className="text-sm font-medium">Candidate</span>
              </label>
              <label className={`flex-1 flex items-center justify-center py-2 px-3 border rounded-md cursor-pointer transition-colors ${role === 'recruiter' ? 'bg-primary/20 border-primary' : 'bg-background/50 border-border hover:border-primary/50'}`}>
                <input type="radio" className="hidden" name="role" value="recruiter" checked={role === 'recruiter'} onChange={(e) => setRole(e.target.value)} />
                <span className="text-sm font-medium">Recruiter</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass pl-10" 
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass pl-10" 
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center py-2.5"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect || '')}`} className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
