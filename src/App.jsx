import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects'; // <--- TEGO BRAKOWAŁO!

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textMain">
        <Navbar />
        <Routes>
          {/* Strona główna */}
          <Route path="/" element={<Home />} />
          
          {/* Strona z projektami */}
          <Route path="/projects" element={<Projects />} />
          
          {/* Placeholdery dla reszty stron */}
          <Route path="/create-project" element={<div className="p-10 text-center text-2xl text-gray-400 mt-10">Create Project Page (Coming Soon) 🚀</div>} />
          <Route path="/chat" element={<div className="p-10 text-center text-2xl text-gray-400 mt-10">Chat Page (Coming Soon) 💬</div>} />
          <Route path="/profile" element={<div className="p-10 text-center text-2xl text-gray-400 mt-10">Profile Page (Coming Soon) 👤</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;