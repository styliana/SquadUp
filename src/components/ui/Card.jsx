import { cn } from '../../utils/cn'; // Zakładam, że masz utility do łączenia klas, jak nie to zwykły string template

const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("bg-surface border border-white/5 rounded-2xl p-6 shadow-sm", className)} 
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;