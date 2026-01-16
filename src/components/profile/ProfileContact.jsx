import { Mail, Github, Linkedin } from 'lucide-react';
import Card from '../ui/Card';

// Pomocnicza funkcja do sprawdzania i naprawiania linków
const formatUrl = (url) => {
  if (!url) return '';
  // Jeśli url nie zaczyna się od http:// lub https://, dodaj https://
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

const ProfileContact = ({ profile, setProfile, isEditing }) => {
  return (
    <Card className="p-6">
      <h3 className="font-bold text-textMain mb-6">Contact</h3>
      <div className="space-y-4">
        
        {/* Email */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted" aria-hidden="true">
            <Mail size={16} />
          </div>
          <span className="text-textMuted truncate" title={profile.email}>{profile.email}</span>
        </div>

        {/* GitHub */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted" aria-hidden="true">
            <Github size={16} />
          </div>
          {isEditing ? (
            <input 
              type="url"
              maxLength={255}
              value={profile.github_url || ''} 
              onChange={e => setProfile({...profile, github_url: e.target.value})} 
              className="flex-grow bg-background border border-border rounded px-2 py-1 text-textMain text-sm focus:border-primary outline-none transition-colors" 
              placeholder="github.com/username" 
            />
          ) : (
            profile.github_url ? (
              <a 
                href={formatUrl(profile.github_url)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline truncate"
              >
                GitHub Profile
              </a>
            ) : (
              <span className="text-textMuted italic">No GitHub</span>
            )
          )}
        </div>

        {/* LinkedIn */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted" aria-hidden="true">
            <Linkedin size={16} />
          </div>
          {isEditing ? (
            <input 
              type="url"
              maxLength={255}
              value={profile.linkedin_url || ''} 
              onChange={e => setProfile({...profile, linkedin_url: e.target.value})} 
              className="flex-grow bg-background border border-border rounded px-2 py-1 text-textMain text-sm focus:border-primary outline-none transition-colors" 
              placeholder="linkedin.com/in/username" 
            />
          ) : (
            profile.linkedin_url ? (
              <a 
                href={formatUrl(profile.linkedin_url)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline truncate"
              >
                LinkedIn Profile
              </a>
            ) : (
              <span className="text-textMuted italic">No LinkedIn</span>
            )
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProfileContact;