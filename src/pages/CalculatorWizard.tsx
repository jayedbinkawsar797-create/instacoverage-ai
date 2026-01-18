import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ProgressStepper } from '@/components/ProgressStepper';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ageRanges = [
  'Under 26',
  '26-35',
  '36-45',
  '46-55',
  '56-64',
  '65+',
];

const incomeRanges = [
  'Under $20,000',
  '$20,000 - $40,000',
  '$40,000 - $60,000',
  '$60,000 - $80,000',
  '$80,000 - $100,000',
  '$100,000+',
  'Prefer not to say',
];

const situations = [
  { value: 'lost-job', label: 'Lost job / COBRA ending' },
  { value: 'turning-26', label: 'Turning 26 / aging off parents' },
  { value: 'moved', label: 'Recently moved' },
  { value: 'life-event', label: 'Marriage / baby' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'exploring', label: 'Just exploring options' },
];

const planPreferences = [
  { value: 'ppo', label: 'PPO', description: 'More flexibility, higher cost' },
  { value: 'hmo', label: 'HMO', description: 'Lower cost, need referrals' },
  { value: 'not-sure', label: 'Not sure', description: 'Help me decide' },
];

const urgencyOptions = [
  { value: 'asap', label: 'ASAP' },
  { value: '30-60', label: 'Within 30-60 days' },
  { value: 'researching', label: 'Just researching' },
];

export default function CalculatorWizard() {
  const navigate = useNavigate();
  const { currentStep, inputs, updateInputs, nextStep, prevStep, setStep, setRunId } = useCalculatorStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        if (!inputs.zipCode || inputs.zipCode.length !== 5) {
          newErrors.zipCode = 'Please enter a valid 5-digit ZIP code';
        }
        if (!inputs.ageRange) {
          newErrors.ageRange = 'Please select your age range';
        }
        if (inputs.currentlyInsured === null) {
          newErrors.currentlyInsured = 'Please select an option';
        }
        break;
      case 2:
        if (!inputs.householdSize || inputs.householdSize < 1) {
          newErrors.householdSize = 'Please select household size';
        }
        break;
      case 3:
        if (!inputs.situation) {
          newErrors.situation = 'Please select your situation';
        }
        break;
      case 4:
        if (!inputs.planPreference) {
          newErrors.planPreference = 'Please select a preference';
        }
        if (!inputs.urgency) {
          newErrors.urgency = 'Please select your timeline';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    setIsTransitioning(true);
    
    if (currentStep === 4) {
      // Generate run ID and navigate to unlock
      const runId = crypto.randomUUID();
      setRunId(runId);
      setTimeout(() => {
        navigate(`/unlock/${runId}`);
      }, 300);
    } else {
      setTimeout(() => {
        nextStep();
        setIsTransitioning(false);
      }, 200);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/');
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        prevStep();
        setIsTransitioning(false);
      }, 200);
    }
  };

  const handleZipChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    updateInputs({ zipCode: cleaned });
    // Simple state derivation (mock)
    if (cleaned.length === 5) {
      updateInputs({ state: 'CA' }); // Would be actual lookup
    }
    if (errors.zipCode) setErrors({ ...errors, zipCode: '' });
  };

  useEffect(() => {
    // Reset to step 1 on mount
    setStep(1);
  }, [setStep]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Progress */}
        <div className="bg-card border-b border-border/50 py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <ProgressStepper currentStep={currentStep} totalSteps={4} />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex items-center justify-center py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className={cn(
              "max-w-lg mx-auto transition-all duration-300",
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}>
              {/* Step Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-heading mb-2">
                  Coverage Check
                </h1>
                <p className="text-muted-foreground">
                  {currentStep === 1 && "Let's start with your basics"}
                  {currentStep === 2 && "Tell us about your household"}
                  {currentStep === 3 && "What brought you here?"}
                  {currentStep === 4 && "Almost done — your preferences"}
                </p>
              </div>
              
              {/* Step Content */}
              <div className="surface-card p-6 md:p-8">
                {/* Step 1: Location & Basics */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* ZIP Code */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputs.zipCode || ''}
                        onChange={(e) => handleZipChange(e.target.value)}
                        placeholder="Enter 5-digit ZIP"
                        className={cn(
                          "input-field",
                          errors.zipCode && "border-destructive ring-destructive/20"
                        )}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-destructive mt-1.5">{errors.zipCode}</p>
                      )}
                    </div>
                    
                    {/* Age Range */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        Your Age Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {ageRanges.map((range) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => {
                              updateInputs({ ageRange: range });
                              if (errors.ageRange) setErrors({ ...errors, ageRange: '' });
                            }}
                            className={cn(
                              "px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                              inputs.ageRange === range
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-primary/50 text-foreground"
                            )}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                      {errors.ageRange && (
                        <p className="text-sm text-destructive mt-1.5">{errors.ageRange}</p>
                      )}
                    </div>
                    
                    {/* Currently Insured */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        Currently have health insurance?
                      </label>
                      <div className="flex gap-3">
                        {[
                          { value: true, label: 'Yes' },
                          { value: false, label: 'No' },
                        ].map((option) => (
                          <button
                            key={String(option.value)}
                            type="button"
                            onClick={() => {
                              updateInputs({ currentlyInsured: option.value });
                              if (errors.currentlyInsured) setErrors({ ...errors, currentlyInsured: '' });
                            }}
                            className={cn(
                              "flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                              inputs.currentlyInsured === option.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-primary/50 text-foreground"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {errors.currentlyInsured && (
                        <p className="text-sm text-destructive mt-1.5">{errors.currentlyInsured}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Step 2: Household */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Household Size */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        Household Size
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => updateInputs({ householdSize: Math.max(1, (inputs.householdSize || 1) - 1) })}
                          className="w-12 h-12 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center text-lg font-medium transition-colors"
                          disabled={(inputs.householdSize || 1) <= 1}
                        >
                          −
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-3xl font-bold text-heading">{inputs.householdSize || 1}</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {(inputs.householdSize || 1) === 1 ? 'person' : 'people'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateInputs({ householdSize: Math.min(10, (inputs.householdSize || 1) + 1) })}
                          className="w-12 h-12 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center text-lg font-medium transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Income Range */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium text-heading">
                          Household Income (optional)
                        </label>
                        <div className="group relative">
                          <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Helps us estimate subsidy eligibility
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {incomeRanges.map((range) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => updateInputs({ incomeRange: range })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-200",
                              inputs.incomeRange === range
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-primary/50 text-foreground"
                            )}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Situation */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-heading mb-3">
                        What best describes your situation?
                      </label>
                      <div className="space-y-2">
                        {situations.map((situation) => (
                          <button
                            key={situation.value}
                            type="button"
                            onClick={() => {
                              updateInputs({ situation: situation.value });
                              if (errors.situation) setErrors({ ...errors, situation: '' });
                            }}
                            className={cn(
                              "w-full px-4 py-4 rounded-xl border text-sm font-medium text-left transition-all duration-200",
                              inputs.situation === situation.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-primary/50 text-foreground"
                            )}
                          >
                            {situation.label}
                          </button>
                        ))}
                      </div>
                      {errors.situation && (
                        <p className="text-sm text-destructive mt-1.5">{errors.situation}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Step 4: Preferences */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Plan Preference */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-3">
                        Plan preference
                      </label>
                      <div className="space-y-2">
                        {planPreferences.map((pref) => (
                          <button
                            key={pref.value}
                            type="button"
                            onClick={() => {
                              updateInputs({ planPreference: pref.value });
                              if (errors.planPreference) setErrors({ ...errors, planPreference: '' });
                            }}
                            className={cn(
                              "w-full px-4 py-4 rounded-xl border text-left transition-all duration-200",
                              inputs.planPreference === pref.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-primary/50 text-foreground"
                            )}
                          >
                            <span className="font-semibold text-sm">{pref.label}</span>
                            <span className={cn(
                              "block text-xs mt-0.5",
                              inputs.planPreference === pref.value ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}>
                              {pref.description}
                            </span>
                          </button>
                        ))}
                      </div>
                      {errors.planPreference && (
                        <p className="text-sm text-destructive mt-1.5">{errors.planPreference}</p>
                      )}
                    </div>
                    
                    {/* Urgency */}
                    <div>
                      <label className="block text-sm font-medium text-heading mb-3">
                        How soon do you need coverage?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {urgencyOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              updateInputs({ urgency: option.value });
                              if (errors.urgency) setErrors({ ...errors, urgency: '' });
                            }}
                            className={cn(
                              "px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                              inputs.urgency === option.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:border-primary/50 text-foreground"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {errors.urgency && (
                        <p className="text-sm text-destructive mt-1.5">{errors.urgency}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="flex-1 md:flex-none"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  variant="default"
                  onClick={handleNext}
                  className="flex-1"
                >
                  {currentStep === 4 ? 'See My Results' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
