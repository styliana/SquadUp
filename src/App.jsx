import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject'; 
import MyProjects from './pages/MyProjects';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute'; // Import strażnika

function App() {
  return (
    <Router>
      <Toaster position="top-center" theme="dark" richColors />
      
      <div className="min-h-screen bg-background text-textMain">
        <Navbar />
        <Routes>
          {/* TRASY PUBLICZNE */}
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* TRASY CHRONIONE (Tylko dla zalogowanych) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/edit-project/:id" element={<EditProject />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/profile/:id?" element={<Profile />} /> 
            <Route path="/chat" element={<Chat />} />
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;