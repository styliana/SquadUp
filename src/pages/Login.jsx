import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn({ 
        email: formData.email, 
        password: formData.password 
      });
      
      if (error) throw error;
      
      toast.success('Welcome back! 👋');
      navigate('/'); // Przekierowanie na stronę główną po zalogowaniu
      
    } catch (error) {
      console.error(error);
      toast.error("Login failed", {
        description: "Invalid email or password."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-10 px-4">
      <div className="bg-surface p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-textMuted">Enter your credentials to access your account.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* EMAIL */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                name="email"
                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors placeholder:text-gray-600"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                name="password"
                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors placeholder:text-gray-600"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* FORGOT PASSWORD LINK */}
          <div className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Log In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-textMuted text-sm">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-white font-bold hover:underline transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;