import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // To wywołuje Supabase Auth
      const { data, error } = await signUp({ email, password });
      
      if (error) throw error;
      
      alert('Sprawdź email, aby potwierdzić rejestrację!');
      navigate('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-surface p-8 rounded-2xl border border-white/10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Join Squad Up</h2>
        <p className="text-textMuted text-center mb-8">Create an account to find your team.</p>
        
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-textMuted block mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-textMuted block mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/20 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-textMuted mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;