import { Mail, Github, Linkedin } from 'lucide-react';

const ProfileContact = ({ profile, setProfile, isEditing }) => {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6">
      <h3 className="font-bold text-textMain mb-6">Contact</h3>
      <div className="space-y-4">
        
        {/* Email */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Mail size={16} /></div>
          <span className="text-textMuted truncate">{profile.email}</span>
        </div>

        {/* GitHub */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Github size={16} /></div>
          {isEditing ? (
             <input type="text" value={profile.github_url || ''} onChange={e => setProfile({...profile, github_url: e.target.value})} className="flex-grow bg-background border border-border rounded px-2 py-1 text-textMain text-sm focus:border-primary outline-none" placeholder="GitHub URL" />
          ) : (
            profile.github_url ? <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">GitHub Profile</a> : <span className="text-textMuted italic">No GitHub</span>
          )}
        </div>

        {/* LinkedIn */}
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Linkedin size={16} /></div>
          {isEditing ? (
             <input type="text" value={profile.linkedin_url || ''} onChange={e => setProfile({...profile, linkedin_url: e.target.value})} className="flex-grow bg-background border border-border rounded px-2 py-1 text-textMain text-sm focus:border-primary outline-none" placeholder="LinkedIn URL" />
          ) : (
            profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">LinkedIn Profile</a> : <span className="text-textMuted italic">No LinkedIn</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileContact;