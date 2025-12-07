import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Github, Linkedin, Edit2, Save, GraduationCap, Loader2, ArrowLeft, TrendingUp, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import SkillSelector from '../components/SkillSelector';
import AvatarUpload from '../components/AvatarUpload';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const { id: urlUserId } = useParams();
  const navigate = useNavigate(); 

  const targetUserId = urlUserId || user?.id; 
  const isOwner = user && targetUserId === user.id; 

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: "",
    university: "",
    bio: "",
    email: "",
    github_url: "",
    linkedin_url: "",
    skills: [],
    avatar_url: "",
  });

  // NOWE: Stan na statystyki
  const [stats, setStats] = useState({
    created: 0,
    applied: 0,
    accepted: 0
  });

  useEffect(() => {
    if (targetUserId) {
      fetchProfileData(targetUserId);
    }
  }, [targetUserId]);

  const fetchProfileData = async (userId) => {
    try {
      setLoading(true);
      
      // 1. Pobierz dane profilu
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (profileData) setProfile(profileData);

      // 2. Pobierz statystyki (używając naszej funkcji RPC z bazy)
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { target_user_id: userId });

      if (statsError) {
        console.error("Error fetching stats:", statsError);
      } else if (statsData) {
        setStats(statsData);
      }
      
    } catch (error) {
      console.error('Błąd ładowania:', error);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const validateLinks = () => {
    const { github_url, linkedin_url } = profile;
    if (github_url && !github_url.match(/^https:\/\/(www\.)?github\.com\/[\w-]+\/?/)) {
      toast.error("Invalid GitHub URL", { description: "Link must look like: https://github.com/username" });
      return false;
    }
    if (linkedin_url && !linkedin_url.match(/^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?/)) {
      toast.error("Invalid LinkedIn URL", { description: "Link must look like: https://linkedin.com/in/username" });
      return false;
    }
    return true;
  };

  const updateProfile = async () => {
    if (!isOwner) return;
    if (!validateLinks()) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          university: profile.university,
          bio: profile.bio,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          skills: profile.skills,
          avatar_url: profile.avatar_url,
          updated_at: new Date(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
      toast.success('Profile updated successfully! 🔥');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user && !urlUserId) return <div className="text-center text-textMuted p-20">Please log in to view your profile.</div>;
  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {!isOwner && (
            <button onClick={() => navigate(-1)} className="p-2 text-textMuted hover:text-white transition-colors rounded-lg bg-surface/50 border border-white/10">
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-3xl font-bold text-white">
            {isOwner ? 'Your' : `${profile.full_name || profile.email}'s`} <span className="text-primary">Profile</span>
          </h1>
        </div>

        {isOwner && (
          <button 
            onClick={() => isEditing ? updateProfile() : setIsEditing(true)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditing ? 'bg-primary text-white border-primary hover:bg-primary/90' : 'border-white/10 text-white hover:bg-white/5'
            }`}
          >
            {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : isEditing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEWA STRONA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-white font-semibold mb-6">
              <User size={20} className="text-primary" /> Basic Information
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="shrink-0">
                {isEditing ? (
                   <AvatarUpload url={profile.avatar_url} onUpload={(url) => setProfile({ ...profile, avatar_url: url })} />
                ) : (
                   profile.avatar_url ? (
                     <img src={profile.avatar_url} alt="Profile" className="w-32 h-32 rounded-3xl object-cover border-4 border-surface shadow-2xl shadow-primary/20" />
                   ) : (
                     <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-primary/20 shrink-0 uppercase">
                       {profile.email ? profile.email.charAt(0) : 'U'}
                     </div>
                   )
                )}
              </div>
              <div className="flex-grow w-full space-y-5">
                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">Full Name</label>
                  {isEditing ? (
                    <input type="text" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  ) : (<h2 className="text-2xl font-bold text-white">{profile.full_name || 'Anonymous User'}</h2>)}
                </div>
                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">University</label>
                  {isEditing ? (
                    <input type="text" value={profile.university || ''} onChange={e => setProfile({...profile, university: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" placeholder="e.g. Warsaw University of Technology" />
                  ) : (<div className="flex items-center gap-2 text-gray-300"><GraduationCap size={18} />{profile.university || 'Not specified'}</div>)}
                </div>
                <div>
                  <label className="text-xs text-textMuted uppercase font-bold tracking-wider block mb-1">Bio</label>
                  {isEditing ? (
                    <textarea rows={3} value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary resize-none" placeholder="Tell us about yourself..." />
                  ) : (<p className="text-textMuted leading-relaxed">{profile.bio || 'No bio yet.'}</p>)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-white font-semibold mb-6">
              <span className="text-primary">⚡</span> Skills
            </div>
            {(isEditing && isOwner) ? (
              <SkillSelector selectedSkills={profile.skills || []} setSelectedSkills={(newSkills) => setProfile({...profile, skills: newSkills})} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map(skill => (<span key={skill} className="px-3 py-1.5 rounded-lg bg-background border border-white/10 text-gray-300 text-sm">{skill}</span>))}
                {(!profile.skills || profile.skills.length === 0) && (<span className="text-textMuted italic">No skills added yet.</span>)}
              </div>
            )}
          </div>
        </div>

        {/* PRAWA STRONA */}
        <div className="space-y-6">
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Mail size={16} /></div>
                <span className="text-gray-300 truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Github size={16} /></div>
                {(isEditing && isOwner) ? (
                   <input type="text" value={profile.github_url || ''} onChange={e => setProfile({...profile, github_url: e.target.value})} className="flex-grow bg-background border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-primary outline-none" placeholder="https://github.com/username" />
                ) : (
                  profile.github_url ? <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">GitHub Profile</a> : <span className="text-textMuted italic">No GitHub</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Linkedin size={16} /></div>
                {(isEditing && isOwner) ? (
                   <input type="text" value={profile.linkedin_url || ''} onChange={e => setProfile({...profile, linkedin_url: e.target.value})} className="flex-grow bg-background border border-white/10 rounded px-2 py-1 text-white text-sm focus:border-primary outline-none" placeholder="https://linkedin.com/in/user" />
                ) : (
                  profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">LinkedIn Profile</a> : <span className="text-textMuted italic">No LinkedIn</span>
                )}
              </div>
            </div>
          </div>

          {/* NOWE: STATYSTYKI */}
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-6">Activity</h3>
            <div className="space-y-6">
              
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><TrendingUp size={18} /></div>
                  <span className="text-gray-300 text-sm">Created Projects</span>
                </div>
                <span className="font-bold text-white text-lg">{stats.created}</span>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Send size={18} /></div>
                  <span className="text-gray-300 text-sm">Applications Sent</span>
                </div>
                <span className="font-bold text-white text-lg">{stats.applied}</span>
              </div>

              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><CheckCircle size={18} /></div>
                  <span className="text-gray-300 text-sm">Joined Teams</span>
                </div>
                <span className="font-bold text-white text-lg">{stats.accepted}</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;