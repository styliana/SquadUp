import { cn } from '../../utils/cn'; 

const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "group relative rounded-2xl bg-surface p-6",
        "border border-white/5 shadow-lg",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-2xl hover:border-white/10",
        className
      )} 
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default Card;