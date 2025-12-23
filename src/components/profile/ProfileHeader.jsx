import { Save, Edit2, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

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
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 text-textMuted hover:text-textMain transition-colors rounded-lg bg-surface/50 border border-border"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-3xl font-bold text-textMain">
          {isOwner ? 'Your' : `${profile.full_name || 'User'}'s`} <span className="text-primary">Profile</span>
        </h1>
      </div>

      {isOwner && (
        <Button 
          onClick={() => isEditing ? updateProfile() : setIsEditing(true)}
          disabled={isSaving}
          isLoading={isSaving}
          variant={isEditing ? 'primary' : 'secondary'}
        >
          {isEditing ? <><Save size={18} /> Save</> : <><Edit2 size={18} /> Edit</>}
        </Button>
      )}
    </div>
  );
};

export default ProfileHeader;