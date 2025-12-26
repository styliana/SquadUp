import React from 'react';
import { APPLICATION_STATUS_STYLES, APPLICATION_STATUS } from "../../utils/constants";

const StatusBadge = ({ status, className = "" }) => {
  // Zabezpieczenie: jeśli status jest null/undefined, traktuj jako PENDING
  const safeStatus = status || APPLICATION_STATUS.PENDING;
  
  // Pobieramy styl, a jak nie ma - bierzemy domyślny (pending)
  const style = APPLICATION_STATUS_STYLES[safeStatus] || APPLICATION_STATUS_STYLES[APPLICATION_STATUS.PENDING];
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style} ${className}`}>
      {safeStatus}
    </span>
  );
};

export default StatusBadge;