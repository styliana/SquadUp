import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

// 1. SCHEMAT WALIDACJI
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // 2. KONFIGURACJA RHF
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // 3. OBSŁUGA LOGOWANIA
  const onSubmit = async (data) => {
    try {
      const { error } = await signIn({ 
        email: data.email, 
        password: data.password 
      });
      
      if (error) throw error;
      
      toast.success('Welcome back! 👋');
      navigate('/');
      
    } catch (error) {
      console.error(error);
      toast.error("Login failed", {
        description: "Invalid email or password."
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-10 px-4">
      <div className="bg-surface p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-textMuted">Enter your credentials to access your account.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* EMAIL */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                {...register("email")}
                type="email" 
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'
                }`}
                placeholder="student@university.edu"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                <AlertCircle size={12}/> {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none transition-colors ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'
                }`}
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                <AlertCircle size={12}/> {errors.password.message}
              </p>
            )}
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
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
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