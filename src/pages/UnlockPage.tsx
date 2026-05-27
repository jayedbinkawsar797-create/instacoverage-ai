import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { TrustBadges } from '@/components/TrustBadges';
import { 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  BarChart3, 
  DollarSign, 
  Sparkles, 
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMarketplaceResults } from '@/lib/cmsMarketplaceApi';

const previewItems = [
  { icon: BarChart3, label: 'Coverage paths for your area' },
  { icon: DollarSign, label: 'Estimated monthly range' },
  { icon: Sparkles, label: 'PPO vs HMO fit' },
];

const CONSENT_VERSION = '1.0';

export default function UnlockPage() {
  const navigate = useNavigate();
  const { runId } = useParams();
  const { unlock, setResults, inputs } = useCalculatorStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    smsConsent: false,
    callConsent: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!/^\+?1?\d{10,14}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const results = await getMarketplaceResults(inputs);

    setResults(results);
    unlock();
    navigate(`/results/${runId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Lock Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            {/* Headline */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-heading mb-3">
                Unlock your personalized results
              </h1>
              <p className="text-body">
                Your results are ready! Enter your info to see them.
              </p>
            </div>
            
            {/* Preview */}
            <div className="surface-card p-5 mb-6">
              <p className="text-sm font-medium text-heading mb-4">What you'll see:</p>
              <div className="space-y-3">
                {previewItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="surface-card p-6 md:p-8">
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-heading mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="John Smith"
                    className={cn(
                      "input-field",
                      errors.fullName && "border-destructive ring-destructive/20"
                    )}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive mt-1.5">{errors.fullName}</p>
                  )}
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-heading mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setFormData({ ...formData, phone: formatted });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="(555) 123-4567"
                    className={cn(
                      "input-field",
                      errors.phone && "border-destructive ring-destructive/20"
                    )}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1.5">{errors.phone}</p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-heading mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="john@example.com"
                    className={cn(
                      "input-field",
                      errors.email && "border-destructive ring-destructive/20"
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1.5">{errors.email}</p>
                  )}
                </div>
                
                {/* Consent Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.smsConsent}
                      onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-0.5"
                    />
                    <span className="text-sm text-body">
                      Text me my results and next steps.{' '}
                      <span className="text-muted-foreground">(Reply STOP to opt out.)</span>
                    </span>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.callConsent}
                      onChange={(e) => setFormData({ ...formData, callConsent: e.target.checked })}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-0.5"
                    />
                    <span className="text-sm text-body">
                      I'd like a call to help compare options.
                    </span>
                  </label>
                </div>
                
                {/* Submit */}
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Unlocking...
                    </span>
                  ) : (
                    <>
                      Unlock My Results
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            {/* Trust Message */}
            <div className="mt-6 text-center">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-accent" />
                No Spam Promise •{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-8">
              <TrustBadges variant="compact" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
