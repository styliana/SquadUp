import { useState } from 'react';

/**
 * Hook pozwalający rzucać błędy asynchroniczne tak, aby zostały złapane przez ErrorBoundary.
 * Użycie: 
 * const throwAsyncError = useThrowAsyncError();
 * try { ... } catch (e) { throwAsyncError(e); }
 */
const useThrowAsyncError = () => {
  const [_, setState] = useState();
  
  return (error) => {
    setState(() => { throw error; });
  };
};

export default useThrowAsyncError;