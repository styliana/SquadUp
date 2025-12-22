import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Github, Linkedin, Edit2, Save, GraduationCap, Loader2, ArrowLeft, TrendingUp, Send, CheckCircle, Target, AlertTriangle, Trash2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import SkillSelector from '../components/SkillSelector';
import AvatarUpload from '../components/AvatarUpload';
import { toast } from 'sonner';
import useThrowAsyncError from '../hooks/useThrowAsyncError';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { id: urlUserId } = useParams();
  const navigate = useNavigate(); 
  const throwAsyncError = useThrowAsyncError();

  const targetUserId = urlUserId || user?.id; 
  const isOwner = user && targetUserId === user.id; 

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);

  const [profile, setProfile] = useState({
    full_name: "",
    university: "",
    bio: "",
    email: "",
    github_url: "",
    linkedin_url: "",
    skills: [], 
    preferred_categories: [],
    avatar_url: "",
  });

  const [stats, setStats] = useState({ created: 0, applied: 0, accepted: 0 });

  useEffect(() => {
    const fetchCats = async () => {
      const { data, error } = await supabase.from('categories').select('name');
      if (error) console.error("Error fetching categories:", error);
      if (data) setAvailableCategories(data.map(c => c.name));
    };
    fetchCats();

    if (targetUserId) {
      fetchProfileData(targetUserId);
    }
  }, [targetUserId]);

  const fetchProfileData = async (userId) => {
    try {
      setLoading(true);
      
      // 1. Pobieranie profilu + relacyjnych skilli
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_skills (
            skills ( id, name )
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (profileData) {
        const mappedSkills = profileData.profile_skills?.map(ps => ps.skills.name) || [];
        
        setProfile({
          ...profileData,
          skills: mappedSkills,
          preferred_categories: profileData.preferred_categories || []
        });
      }

      // 2. Pobieranie statystyk (Dostosowane do formatu TABLE z rpc)
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { target_user_id: userId });

      if (statsError) throw statsError;

      // Supabase RPC zwraca tablicę dla funkcji typu RETURNS TABLE
      if (statsData && statsData.length > 0) {
        setStats({
          created: Number(statsData[0].created) || 0,
          applied: Number(statsData[0].applied) || 0,
          accepted: Number(statsData[0].accepted) || 0
        });
      }
      
    } catch (error) {
      console.error('Critical Profile Error:', error);
      throwAsyncError(error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!isOwner) return;
    if (!validateLinks()) return;

    try {
      setIsSaving(true);
      
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          university: profile.university,
          bio: profile.bio,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          preferred_categories: profile.preferred_categories,
          avatar_url: profile.avatar_url,
          updated_at: new Date(),
        })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      // Aktualizacja Skilli
      await supabase.from('profile_skills').delete().eq('profile_id', user.id);

      if (profile.skills.length > 0) {
        const { data: skillIds } = await supabase
          .from('skills')
          .select('id')
          .in('name', profile.skills);

        if (skillIds) {
          const newMappings = skillIds.map(s => ({
            profile_id: user.id,
            skill_id: s.id
          }));
          await supabase.from('profile_skills').insert(newMappings);
        }
      }

      setIsEditing(false);
      toast.success('Profile updated successfully! 🔥');
      // Odśwież dane po zapisie
      fetchProfileData(targetUserId);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (category) => {
    setProfile(prev => {
      const current = prev.preferred_categories || [];
      return current.includes(category) 
        ? { ...prev, preferred_categories: current.filter(c => c !== category) }
        : { ...prev, preferred_categories: [...current, category] };
    });
  };

  const validateLinks = () => {
    const { github_url, linkedin_url } = profile;
    if (github_url && !github_url.match(/^https:\/\/(www\.)?github\.com\/[\w-]+\/?/)) {
      toast.error("Invalid GitHub URL"); return false;
    }
    if (linkedin_url && !linkedin_url.match(/^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?/)) {
      toast.error("Invalid LinkedIn URL"); return false;
    }
    return true;
  };

  const handleDeleteClick = () => { setDeleteConfirmation(''); setIsDeleteModalOpen(true); };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    try {
      setLoading(true);
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      setIsDeleteModalOpen(false);
      toast.success("Account deleted. 👋");
      await signOut();
      navigate('/');
    } catch (error) {
      toast.error("Failed to delete account.");
      setLoading(false);
    }
  };
  
  if (!user && !urlUserId) return <div className="text-center text-textMuted p-20">Please log in.</div>;
  if (loading && !isDeleteModalOpen) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {!isOwner && (
            <button onClick={() => navigate(-1)} className="p-2 text-textMuted hover:text-textMain transition-colors rounded-lg bg-surface/50 border border-border">
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-3xl font-bold text-textMain">
            {isOwner ? 'Your' : `${profile.full_name || 'User'}'s`} <span className="text-primary">Profile</span>
          </h1>
        </div>

        {isOwner && (
          <button 
            onClick={() => isEditing ? updateProfile() : setIsEditing(true)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all ${
              isEditing ? 'bg-primary text-textMain border-primary' : 'border-border text-textMain hover:bg-white/5'
            }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <><Save size={18} /> Save</> : <><Edit2 size={18} /> Edit</>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-textMain font-semibold mb-6">
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
                     <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl font-bold text-textMain shadow-2xl shadow-primary/20 shrink-0 uppercase">
                       {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                     </div>
                   )
                )}
              </div>
              <div className="flex-grow w-full space-y-5">
                <div>
                  <label className="text-xs text-textMuted uppercase font-bold block mb-1">Full Name</label>
                  {isEditing ? (
                    <input type="text" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:border-primary" />
                  ) : (<h2 className="text-2xl font-bold text-textMain">{profile.full_name || 'Anonymous User'}</h2>)}
                </div>
                <div>
                  <label className="text-xs text-textMuted uppercase font-bold block mb-1">University</label>
                  {isEditing ? (
                    <input type="text" value={profile.university || ''} onChange={e => setProfile({...profile, university: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:border-primary" />
                  ) : (<div className="flex items-center gap-2 text-textMuted"><GraduationCap size={18} />{profile.university || 'Not specified'}</div>)}
                </div>
                <div>
                  <label className="text-xs text-textMuted uppercase font-bold block mb-1">Bio</label>
                  {isEditing ? (
                    <textarea rows={3} value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:border-primary resize-none" />
                  ) : (<p className="text-textMuted leading-relaxed">{profile.bio || 'No bio yet.'}</p>)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-textMain font-semibold mb-6">
              <span className="text-primary">⚡</span> Skills
            </div>
            {isEditing ? (
              <SkillSelector selectedSkills={profile.skills || []} setSelectedSkills={(newSkills) => setProfile({...profile, skills: newSkills})} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map(skill => (
                  <span key={skill} className="px-3 py-1.5 rounded-lg bg-background border border-border text-textMuted text-sm">{skill}</span>
                ))}
                {profile.skills?.length === 0 && <span className="text-textMuted italic">No skills added yet.</span>}
              </div>
            )}
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-8">
            <div className="flex items-center gap-2 text-textMain font-semibold mb-6">
              <Target size={20} className="text-primary" /> Preferred Project Types
            </div>
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                availableCategories.map(cat => (
                  <button key={cat} onClick={() => toggleCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${profile.preferred_categories?.includes(cat) ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-background border-border text-gray-400'}`}>
                    {cat}
                  </button>
                ))
              ) : (
                profile.preferred_categories?.map(cat => <span key={cat} className="px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">{cat}</span>)
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-textMain mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Mail size={16} /></div>
                <span className="text-textMuted truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Github size={16} /></div>
                {isEditing ? (
                   <input type="text" value={profile.github_url || ''} onChange={e => setProfile({...profile, github_url: e.target.value})} className="flex-grow bg-background border border-border rounded px-2 py-1 text-textMain text-sm focus:border-primary outline-none" placeholder="GitHub URL" />
                ) : (
                  profile.github_url ? <a href={profile.github_url} target="_blank" className="text-primary hover:underline truncate">GitHub Profile</a> : <span className="text-textMuted italic">No GitHub</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-textMuted"><Linkedin size={16} /></div>
                {isEditing ? (
                   <input type="text" value={profile.linkedin_url || ''} onChange={e => setProfile({...profile, linkedin_url: e.target.value})} className="flex-grow bg-background border border-border rounded px-2 py-1 text-textMain text-sm focus:border-primary outline-none" placeholder="LinkedIn URL" />
                ) : (
                  profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" className="text-primary hover:underline truncate">LinkedIn Profile</a> : <span className="text-textMuted italic">No LinkedIn</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-textMain mb-6">Activity</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><TrendingUp size={18} /></div>
                  <span className="text-textMuted text-sm">Created Projects</span>
                </div>
                <span className="font-bold text-textMain text-lg">{stats.created || 0}</span>
              </div>
              
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Send size={18} /></div>
                  <span className="text-textMuted text-sm">Applications Sent</span>
                </div>
                <span className="font-bold text-textMain text-lg">{stats.applied || 0}</span>
              </div>
              
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><CheckCircle size={18} /></div>
                  <span className="text-textMuted text-sm">Joined Teams</span>
                </div>
                <span className="font-bold text-textMain text-lg">{stats.accepted || 0}</span>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 mt-8">
              <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={20} /> Danger Zone
              </h3>
              <button onClick={handleDeleteClick} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold transition-colors">
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-textMain"><X size={20} /></button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={24} /></div>
              <h2 className="text-xl font-bold text-textMain mb-2">Delete Account</h2>
              <p className="text-textMuted text-sm">This action cannot be undone.</p>
            </div>
            <div className="space-y-4">
              <input type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} className="w-full bg-background border border-border rounded-xl py-3 text-center font-bold" placeholder="TYPE DELETE" />
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-white/5 rounded-xl">Cancel</button>
                <button onClick={confirmDeleteAccount} disabled={deleteConfirmation !== 'DELETE' || loading} className="flex-1 py-3 bg-red-500 rounded-xl font-bold disabled:opacity-50">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;