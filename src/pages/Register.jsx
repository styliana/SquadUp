import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, Lock, Check, X, BadgeCheck, XCircle, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  // --- STANY WALIDACJI ---
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    uppercase: false,
    special: false
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Username & Email states
  const debouncedUsername = useDebounce(formData.username, 500);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  const debouncedEmail = useDebounce(formData.email, 500);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [isEmailAvailable, setIsEmailAvailable] = useState(null);

  const [loading, setLoading] = useState(false);

  // --- 1. WALIDACJA HASŁA (LIVE) ---
  useEffect(() => {
    const pwd = formData.password;
    const criteria = {
      length: pwd.length >= 6,
      number: /\d/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    setPasswordCriteria(criteria);

    // Sprawdź zgodność haseł tylko jeśli confirm nie jest puste
    if (formData.confirmPassword) {
      setPasswordsMatch(pwd === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  // --- 2. WALIDACJA USERNAME (Backend) ---
  useEffect(() => {
    const checkUsername = async () => {
      setIsUsernameAvailable(null);
      setUsernameError(null);

      if (!debouncedUsername) return;
      
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (debouncedUsername.length < 3) {
        setUsernameError("Min. 3 characters.");
        return;
      }
      if (!usernameRegex.test(debouncedUsername)) {
        setUsernameError("Only letters, numbers, _ allowed.");
        return;
      }

      try {
        setIsCheckingUsername(true);
        const { data: isTaken, error } = await supabase
          .rpc('check_username_availability', { username_input: debouncedUsername });

        if (error) throw error;

        if (isTaken) {
          setIsUsernameAvailable(false);
          setUsernameError("Username taken.");
        } else {
          setIsUsernameAvailable(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    checkUsername();
  }, [debouncedUsername]);

  // --- 3. WALIDACJA EMAIL (Backend) ---
  useEffect(() => {
    const checkEmail = async () => {
      setIsEmailAvailable(null);
      setEmailError(null);

      if (!debouncedEmail) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(debouncedEmail)) {
        setEmailError("Invalid email format.");
        return;
      }

      try {
        setIsCheckingEmail(true);
        const { data: isTaken, error } = await supabase
          .rpc('check_email_availability', { email_input: debouncedEmail });

        if (error) throw error;

        if (isTaken) {
          setIsEmailAvailable(false);
          setEmailError("Email already registered.");
        } else {
          setIsEmailAvailable(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsCheckingEmail(false);
      }
    };
    checkEmail();
  }, [debouncedEmail]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Resetuj statusy przy pisaniu
    if (name === 'username') {
      setIsUsernameAvailable(null);
      setUsernameError(null);
    }
    if (name === 'email') {
      setIsEmailAvailable(null);
      setEmailError(null);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ostateczna weryfikacja przed wysłaniem
    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
    
    if (!isPasswordValid) {
      toast.error("Password does not meet requirements.");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!formData.termsAccepted) {
      toast.error("You must accept Terms of Service.");
      return;
    }
    if (usernameError || isUsernameAvailable === false || emailError || isEmailAvailable === false) {
      toast.error("Please fix form errors.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
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
      if (error.message.includes("User already registered")) {
        toast.error("Account already exists.");
      } else {
        toast.error("Registration failed.", { description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper UI dla statusów
  const StatusIcon = ({ checking, available, error }) => {
    if (checking) return <Loader2 className="animate-spin text-primary" size={18} />;
    if (error || available === false) return <XCircle className="text-red-500" size={18} />;
    if (available === true) return <BadgeCheck className="text-green-500" size={18} />;
    return null;
  };

  // Obliczanie siły hasła do paska postępu (0-4)
  const passwordStrength = Object.values(passwordCriteria).filter(Boolean).length;
  const strengthColor = 
    passwordStrength <= 1 ? 'bg-red-500' : 
    passwordStrength <= 3 ? 'bg-yellow-500' : 
    'bg-green-500';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="bg-surface p-8 rounded-3xl border border-white/10 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-textMuted">Join the squad and start building.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* IMIĘ */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                name="fullName"
                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* USERNAME */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Username</label>
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                name="username"
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none transition-colors ${
                  usernameError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
                }`}
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <StatusIcon checking={isCheckingUsername} available={isUsernameAvailable} error={usernameError} />
              </div>
            </div>
            {usernameError && <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12}/> {usernameError}</p>}
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                name="email"
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none transition-colors ${
                  emailError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
                }`}
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <StatusIcon checking={isCheckingEmail} available={isEmailAvailable} error={emailError} />
              </div>
            </div>
            {emailError && <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12}/> {emailError}</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* PASEK SIŁY HASŁA */}
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

            {/* LISTA WYMAGAŃ (Checklista) */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <RequirementItem met={passwordCriteria.length} text="Min. 6 chars" />
              <RequirementItem met={passwordCriteria.number} text="Contains number" />
              <RequirementItem met={passwordCriteria.uppercase} text="Uppercase letter" />
              <RequirementItem met={passwordCriteria.special} text="Special char (@$!%*?&)" />
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-xs font-bold text-textMuted uppercase ml-1 mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                name="confirmPassword"
                className={`w-full bg-background border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none transition-colors ${
                  !passwordsMatch && formData.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'
                }`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {!passwordsMatch && formData.confirmPassword && (
              <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                <AlertCircle size={12}/> Passwords do not match
              </p>
            )}
          </div>

          {/* TERMS */}
          <div className="flex items-start gap-3 pt-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                name="termsAccepted"
                id="terms"
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/10 bg-background transition-all checked:border-primary checked:bg-primary hover:border-primary/50"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={14} />
            </div>
            <label htmlFor="terms" className="text-sm text-textMuted cursor-pointer select-none">
              I agree to the <Link to="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <button 
            disabled={loading || passwordStrength < 4 || !passwordsMatch || !formData.termsAccepted || usernameError || emailError}
            className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] mt-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="text-center text-textMuted mt-8 text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log In</Link>
        </p>
      </div>
    </div>
  );
};

// Pomocniczy komponent do listy wymagań
const RequirementItem = ({ met, text }) => (
  <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-400' : 'text-gray-500'}`}>
    {met ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
    {text}
  </div>
);

export default Register;