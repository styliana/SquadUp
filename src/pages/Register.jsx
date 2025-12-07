import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner'; // Dodany import

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // Usunąłem lokalny stan error, bo obsłużymy go przez toast

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Walidacja hasła (dobra praktyka inżynierska)
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      const { data, error } = await signUp({ email, password });
      
      if (error) throw error;
      
      // SUKCES - Profesjonalny toast zamiast alert()
      toast.success('Account created!', {
        description: 'Please check your email to confirm registration.'
      });
      
      navigate('/login');
    } catch (error) {
      // BŁĄD - Profesjonalny toast
      console.error(error);
      toast.error("Registration failed", {
        description: error.message || "Something went wrong."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-surface p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Join Squad Up</h2>
        <p className="text-textMuted text-center mb-8">Create an account to find your team.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-textMuted block mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="student@university.edu"
            />
          </div>
          <div>
            <label className="text-sm text-textMuted block mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/20 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-textMuted mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;