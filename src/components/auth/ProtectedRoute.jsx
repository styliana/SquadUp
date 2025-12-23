import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // 1. Czekamy na załadowanie sesji, żeby nie wyrzucić usera przypadkiem
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // 2. Jeśli nie ma usera -> Kierunek: Logowanie
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Jeśli jest user -> Pokaż treść (Outlet to placeholder dla dzieci routingu)
  return <Outlet />;
};

export default ProtectedRoute;