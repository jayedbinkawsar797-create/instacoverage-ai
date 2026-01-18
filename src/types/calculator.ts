export interface CalculatorInputs {
  // Step 1: Location & Basics
  zipCode: string;
  state: string;
  ageRange: string;
  currentlyInsured: boolean | null;
  
  // Step 2: Household
  householdSize: number;
  incomeRange: string;
  
  // Step 3: Situation
  situation: string;
  
  // Step 4: Preferences
  planPreference: string;
  urgency: string;
}

export interface CalculatorRun {
  id: string;
  inputs: CalculatorInputs;
  createdAt: Date;
  state: 'locked' | 'unlocked';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface Lead {
  id: string;
  runId: string;
  name: string;
  phone: string;
  email: string;
  status: 'new' | 'contacted' | 'booked' | 'closed' | 'lost';
  assignedAgentId?: string;
  createdAt: Date;
}

export interface Consent {
  id: string;
  runId: string;
  leadId?: string;
  smsConsent: boolean;
  callConsent: boolean;
  consentTextVersion: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ResultsData {
  coveragePaths: {
    name: string;
    match: 'top' | 'alternative';
    reason: string;
  }[];
  monthlyRange: {
    min: number;
    max: number;
    factors: string[];
  };
  planFit: {
    recommendation: 'PPO' | 'HMO' | 'Either';
    reasons: string[];
  };
  nextSteps: string[];
}
