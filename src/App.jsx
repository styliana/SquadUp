import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textMain">
        <Navbar />
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<Home />} />
          
          {/* Projects / Listings */}
          <Route path="/projects" element={<div className="p-10">Projects Page (Coming Soon)</div>} />
          
          {/* Create New Project */}
          <Route path="/create-project" element={<div className="p-10">Create Project Page (Coming Soon)</div>} />
          
          {/* Chat / Messages */}
          <Route path="/chat" element={<div className="p-10">Chat Page (Coming Soon)</div>} />
          
          {/* User Profile */}
          <Route path="/profile" element={<div className="p-10">Profile Page (Coming Soon)</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;