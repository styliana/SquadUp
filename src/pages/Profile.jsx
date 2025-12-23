import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import useThrowAsyncError from '../hooks/useThrowAsyncError';

// Komponenty
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileBasicInfo from '../components/profile/ProfileBasicInfo'; // <-- Nowy import
import ProfileDetails from '../components/profile/ProfileDetails';
import ProfileContact from '../components/profile/ProfileContact';
import ProfileStats from '../components/profile/ProfileStats';
import DeleteAccount from '../components/profile/DeleteAccount';

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
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setAvailableCategories(data);
    };
    fetchCats();

    if (targetUserId) {
      fetchProfileData(targetUserId);
    }
  }, [targetUserId]);

  const fetchProfileData = async (userId) => {
    try {
      setLoading(true);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`*, profile_skills ( skills ( id, name ) )`)
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

      const { data: statsData } = await supabase.rpc('get_user_stats', { target_user_id: userId });
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
    
    if (profile.github_url && !profile.github_url.match(/^https:\/\/(www\.)?github\.com\//)) {
      toast.error("Invalid GitHub URL"); return;
    }

    try {
      setIsSaving(true);
      
      const { error } = await supabase.from('profiles').update({
          full_name: profile.full_name,
          university: profile.university,
          bio: profile.bio,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          preferred_categories: profile.preferred_categories, 
          avatar_url: profile.avatar_url,
          updated_at: new Date(),
        }).eq('id', user.id);

      if (error) throw error;

      await supabase.from('profile_skills').delete().eq('profile_id', user.id);
      if (profile.skills.length > 0) {
        const { data: skillIds } = await supabase.from('skills').select('id').in('name', profile.skills);
        if (skillIds) {
          await supabase.from('profile_skills').insert(skillIds.map(s => ({ profile_id: user.id, skill_id: s.id })));
        }
      }

      setIsEditing(false);
      toast.success('Profile updated successfully!');
      fetchProfileData(targetUserId);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      toast.success("Account deleted.");
      await signOut();
      navigate('/');
    } catch (error) {
      toast.error("Failed to delete account.");
    }
  };
  
  if (!user && !urlUserId) return <div className="text-center text-textMuted p-20">Please log in.</div>;
  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      <ProfileHeader 
        profile={profile} 
        isOwner={isOwner}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        updateProfile={updateProfile}
        isSaving={isSaving}
      />

      {/* NOWY UKŁAD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEWA KOLUMNA (2/3): Basic Info na górze, potem Details */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileBasicInfo 
            profile={profile} 
            setProfile={setProfile} 
            isEditing={isEditing} 
          />
          
          <ProfileDetails 
            profile={profile}
            setProfile={setProfile}
            isEditing={isEditing}
            availableCategories={availableCategories}
          />
        </div>

        {/* PRAWA KOLUMNA (1/3): Contact na górze (równo z Basic Info), potem Stats */}
        <div className="space-y-6">
          <ProfileContact 
            profile={profile} 
            setProfile={setProfile} 
            isEditing={isEditing} 
          />
          
          <ProfileStats stats={stats} />
          
          {isOwner && <DeleteAccount onDelete={handleDeleteAccount} />}
        </div>
      </div>
    </div>
  );
};

export default Profile;