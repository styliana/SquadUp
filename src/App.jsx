import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import MyProjects from './pages/MyProjects';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textMain">
        <Navbar />
        <Routes>
          {/* Główne strony */}
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          
          {/* Strony dla zalogowanych */}
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/my-projects" element={<MyProjects />} /> 
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          
          {/* Autoryzacja */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;