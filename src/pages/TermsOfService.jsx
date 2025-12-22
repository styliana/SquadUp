import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-textMuted">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-textMain mb-4">Terms of Service</h1>
        <p className="text-textMuted">Effective date: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8 bg-surface border border-white/5 p-8 rounded-2xl">
        <section>
          <h2 className="text-xl font-bold text-textMain mb-3 flex items-center gap-2">
            <FileText className="text-primary" size={20} /> 1. Agreement to Terms
          </h2>
          <p>
            By accessing or using Squad Up, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-textMain mb-3">2. Educational Project Disclaimer</h2>
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-primary shrink-0 mt-0.5" size={20} />
            <p className="text-sm">
              Please note that Squad Up is an <strong>Engineering Thesis project</strong>. The service is provided "as is" and is intended for educational and demonstration purposes. We do not guarantee continuous availability or data persistence.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-textMain mb-3 flex items-center gap-2">
            <CheckCircle className="text-primary" size={20} /> 3. User Accounts
          </h2>
          <p className="mb-2">When you create an account with us, you guarantee that:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
            <li>The information you provide is accurate, complete, and current at all times.</li>
            <li>You are responsible for safeguarding the password that you use to access the Service.</li>
            <li>You will not use the Service for any illegal or unauthorized purpose.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-textMain mb-3">4. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Styliana and its licensors. The Service is protected by copyright, trademark, and other laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-textMain mb-3">5. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-textMain mb-3">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;