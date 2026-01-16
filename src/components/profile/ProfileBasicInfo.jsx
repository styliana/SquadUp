import { GraduationCap, User } from 'lucide-react';
import AvatarUpload from '../common/AvatarUpload';
import Card from '../ui/Card'; 

const ProfileBasicInfo = ({ profile, setProfile, isEditing }) => {
  return (
    <Card className="p-8">
      <div className="flex items-center gap-2 text-textMain font-semibold mb-6">
        <User size={20} className="text-primary" /> Basic Information
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* AVATAR */}
        <div className="shrink-0 mx-auto md:mx-0">
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
        
        {/* INPUTS */}
        <div className="flex-grow w-full space-y-5">
          <div>
            <label className="text-xs text-textMuted uppercase font-bold block mb-1">Full Name</label>
            {isEditing ? (
              <input 
                type="text" 
                maxLength={100}
                value={profile.full_name || ''} 
                onChange={e => setProfile({...profile, full_name: e.target.value})} 
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:border-primary focus:outline-none transition-colors" 
              />
            ) : (<h2 className="text-2xl font-bold text-textMain">{profile.full_name || 'Anonymous User'}</h2>)}
          </div>
          <div>
            <label className="text-xs text-textMuted uppercase font-bold block mb-1">University</label>
            {isEditing ? (
              <input 
                type="text" 
                maxLength={150}
                value={profile.university || ''} 
                onChange={e => setProfile({...profile, university: e.target.value})} 
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:border-primary focus:outline-none transition-colors" 
              />
            ) : (<div className="flex items-center gap-2 text-textMuted"><GraduationCap size={18} />{profile.university || 'Not specified'}</div>)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileBasicInfo;