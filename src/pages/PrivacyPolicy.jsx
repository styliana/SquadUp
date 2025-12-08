import { Shield, Lock, Eye } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-gray-300">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-textMuted">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-8 bg-surface border border-white/5 p-8 rounded-2xl">
        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="text-primary" size={20} /> 1. Introduction
          </h2>
          <p>
            Welcome to Squad Up. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Eye className="text-primary" size={20} /> 2. Data We Collect
          </h2>
          <p className="mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address.</li>
            <li><strong>Profile Data:</strong> includes your interests, preferences, feedback and survey responses.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Lock className="text-primary" size={20} /> 3. How We Use Your Data
          </h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm mt-2">
            <li>To register you as a new customer.</li>
            <li>To manage our relationship with you.</li>
            <li>To enable you to partake in a prize draw, competition or complete a survey.</li>
            <li>To improve our website, products/services, marketing or customer relationships.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Contact Details</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:olagolek1@gmail.com" className="text-primary hover:underline">olagolek1@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;