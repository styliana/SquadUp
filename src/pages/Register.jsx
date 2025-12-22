import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Lock, Check, X, BadgeCheck, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

// --- 1. SCHEMAT WALIDACJI (ZOD) ---
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept Terms of Service" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Tutaj pokaże się błąd
});

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 2. KONFIGURACJA REACT HOOK FORM ---
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange" // Walidacja w czasie rzeczywistym
  });

  // Obserwujemy hasło, żeby dynamicznie wyświetlać pasek siły (tylko do UI)
  const passwordValue = watch("password", "");

  // --- 3. LOGIKA OBSŁUGI FORMULARZA ---
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Dodatkowe sprawdzenie unikalności na backendzie (można to też zrobić w Zod z async refine, ale tu jest bezpieczniej)
      const { count: usernameCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', data.username);

      if (usernameCount > 0) {
        toast.error("Username already taken");
        setIsSubmitting(false);
        return;
      }

      // Rejestracja w Supabase Auth
      const { error } = await signUp({ 
        email: data.email, 
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            username: data.username,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Account created successfully!', {
        description: 'Please check your email to confirm registration.'
      });
      navigate('/login');

    } catch (error) {
      console.error(error);
      if (error.message?.includes("User already registered")) {
        toast.error("Email already registered.");
      } else {
        toast.error("Registration failed.", { description: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpery do UI
  const checkRequirement = (regex) => regex.test(passwordValue);
  const passwordStrength = [
    passwordValue.length >= 6,
    checkRequirement(/[A-Z]/),
    checkRequirement(/[0-9]/),
    checkRequirement(/[^a-zA-Z0-9]/)
  ].filter(Boolean).length;

  const strengthColor = 
    passwordStrength <= 1 ? 'bg-red-500' : 
    passwordStrength <= 3 ? 'bg-yellow-500' : 
    'bg-green-500';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="bg-surface p-8 rounded-3xl border border-border w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-textMain mb-2">Create Account</h2>
          <p className="text-textMuted">Join the squad and start building.</p>
        </div>
        
        {/* onSubmit z RHF automatycznie blokuje wywołanie, jeśli walidacja Zod nie przejdzie */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* IMIĘ */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                {...register("fullName")}
                type="text" 
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-4 text-textMain focus:outline-none transition-colors ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-400 mt-1 ml-1">{errors.fullName.message}</p>}
          </div>

          {/* USERNAME */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Username</label>
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                {...register("username")}
                type="text" 
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-4 text-textMain focus:outline-none transition-colors ${errors.username ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                placeholder="johndoe123"
                autoComplete="off"
              />
            </div>
            {errors.username && <p className="text-xs text-red-400 mt-1 ml-1">{errors.username.message}</p>}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                {...register("email")}
                type="email" 
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-4 text-textMain focus:outline-none transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                placeholder="student@university.edu"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email.message}</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-10 text-textMain focus:outline-none transition-colors ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-textMain transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password.message}</p>}

            {/* PASEK SIŁY HASŁA */}
            {passwordValue && (
              <div className="flex h-1 mt-2 mb-3 gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step} 
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength >= step ? strengthColor : 'bg-white/5'
                    }`} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                {...register("confirmPassword")}
                type="password" 
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-4 text-textMain focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                <AlertCircle size={12}/> {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* TERMS */}
          <div>
            <div className="flex items-start gap-3 pt-2">
              <div className="relative flex items-center">
                <input
                  {...register("termsAccepted")}
                  type="checkbox"
                  id="terms"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-background transition-all checked:border-primary checked:bg-primary hover:border-primary/50"
                />
                <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-textMain opacity-0 peer-checked:opacity-100" size={14} />
              </div>
              <label htmlFor="terms" className="text-sm text-textMuted cursor-pointer select-none">
                I agree to the <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.
              </label>
            </div>
            {errors.termsAccepted && <p className="text-xs text-red-400 mt-1 ml-1">{errors.termsAccepted.message}</p>}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-textMain font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </button>
        </form>
        
        <p className="text-center text-textMuted mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;