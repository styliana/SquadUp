import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

// UI Components
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      
      setIsSubmitted(true);
      toast.success("Reset link sent!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reset link. Try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        
        {/* SUCCESS STATE */}
        {isSubmitted ? (
          <Card className="text-center py-10 px-6">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-textMain mb-2">Check your email</h2>
            <p className="text-textMuted mb-8">
              We've sent a password reset link to your email address.
            </p>
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Back to Login
              </Button>
            </Link>
          </Card>
        ) : (
          /* FORM STATE */
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-textMain mb-2">Reset Password</h1>
              <p className="text-textMuted">Enter your email to receive instructions</p>
            </div>

            <Card>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                    <input 
                      {...register("email")}
                      type="email" 
                      className={`w-full bg-background border rounded-xl pl-10 pr-4 py-3 text-textMain focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500' : 'border-border focus:border-primary'
                      }`}
                      placeholder="student@university.edu"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full py-3">
                  Send Reset Link
                </Button>
              </form>
            </Card>

            <div className="text-center mt-6">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-textMuted hover:text-textMain transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;