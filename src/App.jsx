import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textMain">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          
          {/* NOWA TRASA */}
          <Route path="/create-project" element={<CreateProject />} />
          
          <Route path="/chat" element={<div className="p-10 text-center text-2xl text-gray-400 mt-10">Chat Page (Coming Soon) 💬</div>} />
          <Route path="/profile" element={<div className="p-10 text-center text-2xl text-gray-400 mt-10">Profile Page (Coming Soon) 👤</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;