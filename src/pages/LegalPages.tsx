import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

function LegalLayout({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-heading mb-2">{title}</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
            <div className="prose prose-gray max-w-none">
              {children}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="January 2025">
      <div className="space-y-6 text-body">
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Information We Collect</h2>
          <p>We collect information you provide directly, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Contact information (name, email, phone number)</li>
            <li>Calculator inputs (ZIP code, age range, household size, etc.)</li>
            <li>Communication preferences and consents</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Generate your personalized coverage estimate</li>
            <li>Contact you only with your explicit consent</li>
            <li>Connect you with licensed agents if requested</li>
            <li>Improve our services and user experience</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Data Security</h2>
          <p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your information.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us at any time to exercise these rights.</p>
        </section>
      </div>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="January 2025">
      <div className="space-y-6 text-body">
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Acceptance of Terms</h2>
          <p>By using this service, you agree to these terms. If you disagree with any part, please do not use our service.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Service Description</h2>
          <p>This calculator provides educational estimates about health coverage options. Results are not official quotes and should not be relied upon as such.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Limitation of Liability</h2>
          <p>We provide this tool "as is" and make no warranties about the accuracy of estimates. Actual coverage and costs may vary significantly.</p>
        </section>
      </div>
    </LegalLayout>
  );
}

export function ConsentPage() {
  return (
    <LegalLayout title="Consent Policy" lastUpdated="January 2025">
      <div className="space-y-6 text-body">
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">SMS Consent</h2>
          <p>By checking the SMS consent box, you agree to receive text messages about your results and next steps. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Call Consent</h2>
          <p>By checking the call consent box, you agree to receive a phone call from a licensed insurance agent to discuss your coverage options.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Consent Records</h2>
          <p>We maintain detailed records of all consents, including the exact text shown, timestamp, and your selection, for compliance purposes.</p>
        </section>
      </div>
    </LegalLayout>
  );
}

export function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer" lastUpdated="January 2025">
      <div className="space-y-6 text-body">
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Educational Purpose Only</h2>
          <p>This calculator provides educational estimates to help you understand potential health coverage options. Results are not official quotes, guaranteed rates, or eligibility determinations.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Not Government-Affiliated</h2>
          <p>This service is not affiliated with, endorsed by, or connected to any government agency, including Healthcare.gov, Medicare, or Medicaid.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Accuracy of Information</h2>
          <p>While we strive for accuracy, actual premiums, eligibility, and coverage options depend on many factors not captured in this calculator. Always verify with official sources or licensed professionals.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-heading mb-3">Professional Advice</h2>
          <p>This tool does not replace professional insurance advice. Consult a licensed insurance agent or broker for personalized recommendations.</p>
        </section>
      </div>
    </LegalLayout>
  );
}

export function ContactPage() {
  return (
    <LegalLayout title="Contact Us" lastUpdated="January 2025">
      <div className="space-y-6 text-body">
        <section>
          <p>Have questions or concerns? We're here to help.</p>
          
          <div className="mt-6 surface-card p-6">
            <h2 className="text-lg font-semibold text-heading mb-4">Get in Touch</h2>
            <ul className="space-y-3">
              <li><strong>Email:</strong> support@healthcoveragecalc.com</li>
              <li><strong>Phone:</strong> 1-800-EXAMPLE</li>
              <li><strong>Hours:</strong> Monday–Friday, 9am–5pm EST</li>
            </ul>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}
