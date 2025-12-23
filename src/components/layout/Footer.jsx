import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin, Heart, Code2 } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    // ZMIANA: bg-surface zamiast hardcoded #0d1117
    <footer className="border-t border-border bg-surface mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* KOLUMNA 1: BRAND */}
          <div className="col-span-1 md:col-span-2">
            {/* ZMIANA: text-textMain */}
            <div className="flex items-center gap-2 mb-4 text-textMain font-bold text-xl">
              <div className="bg-primary/20 p-1.5 rounded-lg">
                <Code2 size={24} className="text-primary" />
              </div>
              Squad Up
            </div>
            <p className="text-textMuted text-sm leading-relaxed max-w-sm">
              Seek Quality, Unite And Deliver. 
              The platform designed to connect students and developers into effective project teams.
            </p>
          </div>

          {/* KOLUMNA 2 */}
          <div>
            {/* ZMIANA: text-textMain */}
            <h4 className="text-textMain font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-textMuted">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-primary transition-colors">Find Projects</Link>
              </li>
              <li>
                <Link to="/create-project" className="hover:text-primary transition-colors">Create Listing</Link>
              </li>
            </ul>
          </div>

          {/* KOLUMNA 3 */}
          <div>
            <h4 className="text-textMain font-bold mb-4">Contact & Info</h4>
            <ul className="space-y-3 text-sm text-textMuted">
              <li>
                <a href="mailto:olagolek1@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail size={16} />
                  olagolek1@gmail.com
                </a>
              </li>
              <li>
                {/* ZMIANA: hover:text-textMain */}
                <Link to="/privacy" className="hover:text-textMain transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-textMain transition-colors">Terms of Service</Link>
              </li>
            </ul>
            
            <div className="flex gap-4 mt-6">
              <a href="https://github.com/styliana" target="_blank" rel="noreferrer" className="text-textMuted hover:text-textMain transition-colors">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com/in/aleksandra-golek" target="_blank" rel="noreferrer" className="text-textMuted hover:text-textMain transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-textMuted">
          <p>
            &copy; {currentYear} <span className="text-textMain font-medium">Styliana</span>. All rights reserved.
          </p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> for Engineering Thesis
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;