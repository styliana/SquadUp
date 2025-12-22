import { memo, useState, useEffect } from 'react';

const StatItem = memo(({ icon, end, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    if (end === 0) return;

    const duration = 2000;
    const frameRate = 16;
    const increment = end / (duration / frameRate);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div 
      className="flex flex-col items-center p-4 rounded-2xl hover:bg-textMain/5 transition-colors"
      role="group"
      aria-label={`${label}: ${count}`}
    >
      <div aria-hidden="true">{icon}</div>
      
      <span className="text-4xl font-bold text-textMain mb-1">
        {count}
      </span>
      
      <span className="text-textMuted font-medium text-sm uppercase tracking-wide">{label}</span>
    </div>
  );
});

export default StatItem;