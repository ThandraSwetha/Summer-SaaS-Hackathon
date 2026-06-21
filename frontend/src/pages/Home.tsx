import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Building2, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse delay-1000"></div>

      <div className="max-w-4xl mx-auto text-center z-10 mt-20">
        <div className="inline-flex items-center space-x-2 bg-secondary/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI-Powered Placement Portal</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Find Your Perfect Match <br />
          <span className="gradient-text">At Lightning Speed</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Promtal Associates connects top-tier talent with industry-leading companies using advanced AI skill matching and resume parsing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/jobs" className="btn-primary flex items-center space-x-2 text-lg px-8 py-4 w-full sm:w-auto justify-center">
            <span>Explore Jobs</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/register" className="glass-panel text-foreground font-medium flex items-center space-x-2 text-lg px-8 py-4 rounded-md hover:bg-card/80 transition-colors w-full sm:w-auto justify-center">
            <span>Join as a Candidate</span>
          </Link>
        </div>
      </div>

      {/* Stats/Features Section */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 mb-20">
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
          <div className="bg-primary/10 p-4 rounded-full mb-6">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Top Companies</h3>
          <p className="text-muted-foreground">Partnering with Fortune 500s and high-growth startups globally.</p>
        </div>
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
          <div className="bg-accent/10 p-4 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Smart Matching</h3>
          <p className="text-muted-foreground">Our AI analyzes your skills and TF-IDF vectors against JD requirements.</p>
        </div>
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
          <div className="bg-green-500/10 p-4 rounded-full mb-6">
            <Users className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Seamless Hiring</h3>
          <p className="text-muted-foreground">Automated resume parsing, scheduling, and offer letter generation.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
