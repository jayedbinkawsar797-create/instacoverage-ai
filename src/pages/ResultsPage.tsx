import { useNavigate, useParams } from 'react-router-dom';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageSquare, 
  Mail,
  TrendingUp,
  DollarSign,
  Sparkles,
  ListChecks,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { runId } = useParams();
  const { results, isUnlocked, inputs } = useCalculatorStore();
  const [expandedFactors, setExpandedFactors] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUnlocked || !results) {
      navigate(`/unlock/${runId}`);
      return;
    }
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [isUnlocked, results, runId, navigate]);

  if (!results) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Preparing your results...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Educational estimate • Not an official quote</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-heading mb-2">
                Your Results
              </h1>
              <p className="text-body">
                Based on your answers, here's what we found.
              </p>
            </div>
            
            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border mb-6 animate-slide-up">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Not government-affiliated. Actual eligibility and costs vary. Consult a licensed agent for personalized advice.
              </p>
            </div>
            
            {/* Results Cards */}
            <div className="space-y-5">
              {/* Card A: Coverage Paths */}
              <div className="surface-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-heading">Your likely coverage paths</h2>
                </div>
                
                <div className="space-y-4">
                  {results.coveragePaths.map((path, index) => (
                    <div 
                      key={path.name}
                      className={cn(
                        "p-4 rounded-xl border",
                        path.match === 'top' 
                          ? "bg-primary/5 border-primary/20" 
                          : "bg-muted/30 border-border"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-sm font-semibold",
                              path.match === 'top' ? "text-primary" : "text-foreground"
                            )}>
                              {path.name}
                            </span>
                            {path.match === 'top' && (
                              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                Top Match
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{path.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Card B: Monthly Range */}
              <div className="surface-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-lg font-semibold text-heading">Estimated monthly range</h2>
                </div>
                
                <div className="text-center py-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl mb-4">
                  <p className="text-4xl md:text-5xl font-bold text-heading">
                    ${results.monthlyRange.min} – ${results.monthlyRange.max}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">per month</p>
                </div>
                
                <button
                  onClick={() => setExpandedFactors(!expandedFactors)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  {expandedFactors ? 'Hide' : 'What affects this?'}
                  {expandedFactors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {expandedFactors && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3">Your estimate is based on:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {results.monthlyRange.factors.map((factor) => (
                        <div key={factor} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card C: Plan Fit */}
              <div className="surface-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-heading">Plan fit (PPO vs HMO)</h2>
                </div>
                
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                  <p className="text-lg font-semibold text-primary mb-1">
                    We recommend: {results.planFit.recommendation}
                  </p>
                  <p className="text-sm text-muted-foreground">Based on your preferences and situation</p>
                </div>
                
                <ul className="space-y-2">
                  {results.planFit.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-body">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Card D: Next Steps */}
              <div className="surface-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <ListChecks className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="text-lg font-semibold text-heading">Next steps checklist</h2>
                </div>
                
                <ul className="space-y-3">
                  {results.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </div>
                      <span className="text-sm text-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Card E: Actions */}
              <div className="surface-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <h2 className="text-lg font-semibold text-heading mb-5">Want more help?</h2>
                
                <div className="grid gap-3">
                  <Button variant="default" size="lg" className="w-full justify-start">
                    <Phone className="w-5 h-5" />
                    Book a 10-minute call
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                  
                  <Button variant="secondary" size="lg" className="w-full justify-start">
                    <MessageSquare className="w-5 h-5" />
                    Text me a summary
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                  
                  <Button variant="secondary" size="lg" className="w-full justify-start">
                    <Mail className="w-5 h-5" />
                    Email my results
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Start Over */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  useCalculatorStore.getState().reset();
                  navigate('/');
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Start over with new information
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
