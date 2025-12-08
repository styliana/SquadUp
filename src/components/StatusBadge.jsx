import { APPLICATION_STATUS_STYLES } from '../utils/constants';

const StatusBadge = ({ status, className = "" }) => {
  // Pobieramy styl ze stałych lub domyślny
  const style = APPLICATION_STATUS_STYLES[status] || APPLICATION_STATUS_STYLES.pending;
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;