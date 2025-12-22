import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Supabase wyśle email z linkiem do zmiany hasła
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/update-password', // Ważne: Gdzie ma wrócić user
      });

      if (error) throw error;

      toast.success('Check your inbox!', {
        description: 'We sent a password reset link to your email.'
      });
      
    } catch (error) {
      console.error(error);
      toast.error('Error sending reset link.', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="bg-surface p-8 rounded-3xl border border-border w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-bold text-textMain mb-2">Forgot Password?</h2>
          <p className="text-textMuted text-sm">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-textMain focus:border-primary focus:outline-none transition-colors placeholder:text-gray-600"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-textMain font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-400 hover:text-textMain flex items-center justify-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;