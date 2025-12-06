import { useState } from 'react';
import { User, Mail, Github, Linkedin, Edit2, Save, GraduationCap } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Stan z danymi użytkownika (normalnie pobierany z bazy danych)
  const [profile, setProfile] = useState({
    name: "Jan Kowalski",
    university: "Politechnika Warszawska",
    bio: "Student informatyki na Politechnice Warszawskiej. Interesuję się web developmentem i machine learningiem. Szukam zespołu do ciekawych projektów!",
    email: "jan.kowalski@student.edu.pl",
    github: "jankowalski",
    linkedin: "jan-kowalski",
    skills: ["React", "TypeScript", "Python", "Node.js", "Figma"],
    stats: {
      projects: 3,
      applications: 7,
      completed: 2
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER: Tytuł i Przycisk Edycji */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          Your <span className="text-primary">Profile</span>
        </h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
            isEditing 
              ? 'bg-primary text-white border-primary hover:bg-primary/90' 
              : 'border-white/10 text-white hover:bg-white/5'
          }`}
        >
          {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEWA KOLUMNA: Info i Skillsy */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KARTA: PODSTAWOWE INFO */}
          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-white font-semibold mb-6">
              <User size={20} className="text-primary" />
              Basic Information
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* AVATAR (Duża litera imienia) */}
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-primary/20 shrink-0">
                {profile.name.charAt(0)}
              </div>

              {/* POLA DANYCH */}
              <div className="flex-grow w-full space-y-5">
                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                  )}
                </div>

                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">University</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.university} 
                      onChange={e => setProfile({...profile, university: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-300">
                      <GraduationCap size={18} />
                      {profile.university}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">Bio</label>
                  {isEditing ? (
                    <textarea 
                      rows={3}
                      value={profile.bio} 
                      onChange={e => setProfile({...profile, bio: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary resize-none"
                    />
                  ) : (
                    <p className="text-textMuted leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KARTA: UMIEJĘTNOŚCI */}
          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-white font-semibold mb-6">
              <span className="text-primary">⚡</span>
              Skills
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-gray-300 text-sm">
                  {skill}
                </span>
              ))}
              {isEditing && (
                <button className="px-3 py-1.5 rounded-lg border border-dashed border-white/20 text-textMuted text-sm hover:text-white hover:border-white/40 transition-colors">
                  + Add Skill
                </button>
              )}
            </div>
          </div>

        </div>

        {/* PRAWA KOLUMNA: Kontakt i Statystyki */}
        <div className="space-y-6">
          
          {/* KARTA: KONTAKT */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Contact</h3>
            <div className="space-y-4">
              
              {/* Email */}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted">
                  <Mail size={16} />
                </div>
                {isEditing ? (
                   <input 
                      type="text" 
                      value={profile.email} 
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      className="flex-grow bg-background border border-white/10 rounded px-2 py-1 text-white text-sm"
                    />
                ) : (
                  <span className="text-gray-300">{profile.email}</span>
                )}
              </div>

              {/* Github */}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted">
                  <Github size={16} />
                </div>
                {isEditing ? (
                   <input 
                      type="text" 
                      value={profile.github} 
                      onChange={e => setProfile({...profile, github: e.target.value})}
                      className="flex-grow bg-background border border-white/10 rounded px-2 py-1 text-white text-sm"
                    />
                ) : (
                  <span className="text-primary cursor-pointer hover:underline">@{profile.github}</span>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted">
                  <Linkedin size={16} />
                </div>
                {isEditing ? (
                   <input 
                      type="text" 
                      value={profile.linkedin} 
                      onChange={e => setProfile({...profile, linkedin: e.target.value})}
                      className="flex-grow bg-background border border-white/10 rounded px-2 py-1 text-white text-sm"
                    />
                ) : (
                  <span className="text-primary cursor-pointer hover:underline">{profile.linkedin}</span>
                )}
              </div>

            </div>
          </div>

          {/* KARTA: STATYSTYKI */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-textMuted">Projects</span>
                <span className="font-bold text-white text-lg">{profile.stats.projects}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4"></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-textMuted">Applications</span>
                <span className="font-bold text-white text-lg">{profile.stats.applications}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-textMuted">Completed</span>
                <span className="font-bold text-white text-lg">{profile.stats.completed}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;