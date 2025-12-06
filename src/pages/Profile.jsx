import { useState, useEffect } from 'react';
import { User, Mail, Github, Linkedin, Edit2, Save, GraduationCap, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Stan profilu
  const [profile, setProfile] = useState({
    full_name: "",
    university: "",
    bio: "",
    email: "",
    website: "", // Użyjemy jako github/linkedin w jednym polu dla uproszczenia lub dodamy więcej
    skills: [],
    stats_projects: 0,
    stats_applications: 0,
    stats_completed: 0
  });

  // Nowy skill input
  const [newSkill, setNewSkill] = useState("");

  // 1. POBIERANIE DANYCH
  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. ZAPISYWANIE DANYCH
  const updateProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          university: profile.university,
          bio: profile.bio,
          website: profile.website,
          skills: profile.skills,
          updated_at: new Date(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
      alert('Profil zaktualizowany! 🔥');
    } catch (error) {
      alert('Błąd zapisu!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Obsługa skillsów
  const addSkill = () => {
    if (newSkill && !profile.skills?.includes(newSkill)) {
      setProfile({ ...profile, skills: [...(profile.skills || []), newSkill] });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          Your <span className="text-primary">Profile</span>
        </h1>
        <button 
          onClick={() => isEditing ? updateProfile() : setIsEditing(true)}
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
        
        {/* LEWA KOLUMNA */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-white font-semibold mb-6">
              <User size={20} className="text-primary" />
              Basic Information
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* AVATAR */}
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-primary/20 shrink-0 uppercase">
                {profile.email ? profile.email.charAt(0) : 'U'}
              </div>

              {/* POLA DANYCH */}
              <div className="flex-grow w-full space-y-5">
                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.full_name || ''} 
                      onChange={e => setProfile({...profile, full_name: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-white">{profile.full_name || 'Anonymous User'}</h2>
                  )}
                </div>

                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">University</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.university || ''} 
                      onChange={e => setProfile({...profile, university: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. Warsaw University of Technology"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-300">
                      <GraduationCap size={18} />
                      {profile.university || 'Not specified'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">Bio</label>
                  {isEditing ? (
                    <textarea 
                      rows={3}
                      value={profile.bio || ''} 
                      onChange={e => setProfile({...profile, bio: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-textMuted leading-relaxed">
                      {profile.bio || 'No bio yet.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SKILLSY */}
          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-white font-semibold mb-6">
              <span className="text-primary">⚡</span>
              Skills
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.skills?.map(skill => (
                <span key={skill} className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-gray-300 text-sm flex items-center gap-2">
                  {skill}
                  {isEditing && (
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-400">×</button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <button onClick={addSkill} className="px-3 py-1.5 rounded-lg border border-dashed border-white/20 text-textMuted text-sm hover:text-white hover:border-white/40">
                  Add
                </button>
              </div>
            )}
          </div>

        </div>

        {/* PRAWA KOLUMNA */}
        <div className="space-y-6">
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Mail size={16} /></div>
                <span className="text-gray-300">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Github size={16} /></div>
                {isEditing ? (
                   <input type="text" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} className="flex-grow bg-background border border-white/10 rounded px-2 py-1 text-white text-sm" placeholder="Your Website/GitHub URL" />
                ) : (
                  <span className="text-primary cursor-pointer hover:underline truncate">{profile.website || 'Not set'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-textMuted">Projects</span>
                <span className="font-bold text-white text-lg">{profile.stats_projects}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/4"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;