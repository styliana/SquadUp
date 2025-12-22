import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'; // 1. DODANO useLocation
import { Toaster } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// --- LENIWE IMPORTY ---
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CreateProject = lazy(() => import('./pages/CreateProject'));
const EditProject = lazy(() => import('./pages/EditProject'));
const MyProjects = lazy(() => import('./pages/MyProjects'));
const Profile = lazy(() => import('./pages/Profile'));
const Chat = lazy(() => import('./pages/Chat'));

// Strony prawne
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Odzyskiwanie hasła
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

const PageLoader = () => (
  <div className="flex justify-center items-center h-[calc(100vh-64px)]">
    <Loader2 className="animate-spin text-primary" size={40} />
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center px-4">
    <div className="bg-surface/50 p-8 rounded-3xl border border-border backdrop-blur-sm max-w-md w-full">
      <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
      <h1 className="text-3xl font-bold text-textMain mb-2">404</h1>
      <p className="text-xl text-textMain font-semibold mb-2">Page not found</p>
      <p className="text-textMuted mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        to="/" 
        className="inline-flex px-6 py-3 bg-primary text-textMain font-bold rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
      >
        Back to Home
      </Link>
    </div>
  </div>
);

// 2. NOWY KOMPONENT LAYOUTU (Wewnątrz Routera)
const Layout = () => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat'; // Sprawdź czy jesteśmy na czacie

  return (
    <div className="min-h-screen bg-background text-textMain flex flex-col">
      <Navbar />
      
      <div className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* TRASY PUBLICZNE */}
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
            {/* TRASA ODZYSKIWANIA HASŁA */}
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* TRASY CHRONIONE */}
            <Route element={<ProtectedRoute />}>
              <Route path="/create-project" element={<CreateProject />} />
              <Route path="/edit-project/:id" element={<EditProject />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/profile/:id?" element={<Profile />} /> 
              <Route path="/chat" element={<Chat />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>

      {/* 3. Footer renderowany warunkowo */}
      {!isChatPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" theme="dark" richColors />
      <Layout />
    </Router>
  );
}

export default App;