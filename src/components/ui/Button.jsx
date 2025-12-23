import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Button = ({ children, isLoading, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-primary/25",
    secondary: "bg-surface border border-border text-textMain hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    ghost: "text-textMuted hover:text-textMain hover:bg-white/5"
  };

  return (
    <button 
      disabled={isLoading}
      className={cn(
        "px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )} 
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
};
export default Button;