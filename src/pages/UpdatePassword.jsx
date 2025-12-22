import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast.error("Password too short", { description: "Must be at least 6 characters." });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) throw error;

      toast.success('Password updated!', { description: 'You can now login with your new password.' });
      navigate('/login'); // Przekieruj do logowania
    } catch (error) {
      console.error(error);
      toast.error('Update failed.', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="bg-surface p-8 rounded-3xl border border-border w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-textMain mb-2">Set New Password</h2>
          <p className="text-textMuted text-sm">
            Enter your new password below to secure your account.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-10 text-textMain focus:border-primary focus:outline-none transition-colors"
                placeholder="Min. 6 characters"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-textMain transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default UpdatePassword;