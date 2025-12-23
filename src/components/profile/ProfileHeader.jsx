import { Save, Edit2, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ 
  profile, 
  isOwner, 
  isEditing, 
  setIsEditing, 
  updateProfile, 
  isSaving 
}) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default ProfileHeader;