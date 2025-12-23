import { Target } from 'lucide-react';
import SkillSelector from '../common/SkillSelector';
import Card from '../ui/Card';

const ProfileDetails = ({ profile, setProfile, isEditing, availableCategories }) => {

  const toggleCategory = (categoryId) => {
    setProfile(prev => {
      const current = prev.preferred_categories || [];
      return current.includes(categoryId) 
        ? { ...prev, preferred_categories: current.filter(c => c !== categoryId) }
        : { ...prev, preferred_categories: [...current, categoryId] };
    });
  };

  const getCategoryName = (id) => {
    const cat = availableCategories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      
      {/* BIO SECTION */}
      <Card className="p-8">
        <label className="text-xs text-textMuted uppercase font-bold block mb-4">Bio</label>
        {isEditing ? (
          <textarea 
            rows={3} 
            value={profile.bio || ''} 
            onChange={e => setProfile({...profile, bio: e.target.value})} 
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:border-primary resize-none focus:outline-none transition-colors" 
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-textMuted leading-relaxed">
            {profile.bio || 'No bio yet.'}
          </p>
        )}
      </Card>

      {/* SKILLS SECTION */}
      <Card className="p-8">
        <div className="flex items-center gap-2 text-textMain font-semibold mb-6">
          <span className="text-primary">⚡</span> Skills
        </div>
        
        {isEditing ? (
          <SkillSelector 
            selectedSkills={profile.skills || []} 
            setSelectedSkills={(newSkills) => setProfile({...profile, skills: newSkills})} 
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills?.length > 0 ? (
              profile.skills.map(skill => (
                <span 
                  key={skill.id || skill.name} 
                  className="px-3 py-1.5 rounded-lg bg-background border border-border text-textMuted text-sm"
                >
                  {skill.name}
                </span>
              ))
            ) : (
              <span className="text-textMuted italic">No skills added yet.</span>
            )}
          </div>
        )}
      </Card>

      {/* CATEGORIES SECTION */}
      <Card className="p-8">
        <div className="flex items-center gap-2 text-textMain font-semibold mb-6">
          <Target size={20} className="text-primary" /> Preferred Project Types
        </div>
        
        <div className="flex flex-wrap gap-3">
          {isEditing ? (
            availableCategories.length > 0 ? (
              availableCategories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => toggleCategory(cat.id)} 
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    profile.preferred_categories?.includes(cat.id) 
                    ? 'bg-secondary/20 border-secondary text-secondary' 
                    : 'bg-background border-border text-gray-400 hover:text-textMain hover:border-primary/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))
            ) : (
              <span className="text-textMuted text-sm">Loading categories...</span>
            )
          ) : (
            profile.preferred_categories?.length > 0 ? (
              profile.preferred_categories.map(catId => (
                <span key={catId} className="px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
                  {getCategoryName(catId)}
                </span>
              ))
            ) : (
              <span className="text-textMuted italic">No preferences selected.</span>
            )
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileDetails;