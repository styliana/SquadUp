import { Target } from 'lucide-react';
import SkillSelector from '../SkillSelector'; // Upewnij się, że ścieżka do SkillSelector jest poprawna

const ProfileDetails = ({ profile, setProfile, isEditing, availableCategories }) => {

  // Logika przełączania kategorii (ID)
  const toggleCategory = (categoryId) => {
    setProfile(prev => {
      const current = prev.preferred_categories || [];
      // Jeśli kategoria już jest, usuwamy ją (filter). Jeśli nie ma, dodajemy.
      return current.includes(categoryId) 
        ? { ...prev, preferred_categories: current.filter(c => c !== categoryId) }
        : { ...prev, preferred_categories: [...current, categoryId] };
    });
  };

  // Helper do wyświetlania nazwy zamiast ID (dla trybu podglądu)
  const getCategoryName = (id) => {
    const cat = availableCategories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      
      {/* BIO SECTION */}
      <div className="bg-surface border border-white/5 rounded-2xl p-8">
        <label className="text-xs text-textMuted uppercase font-bold block mb-4">Bio</label>
        {isEditing ? (
          <textarea 
            rows={3} 
            value={profile.bio || ''} 
            onChange={e => setProfile({...profile, bio: e.target.value})} 
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textMain focus:border-primary resize-none" 
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-textMuted leading-relaxed">
            {profile.bio || 'No bio yet.'}
          </p>
        )}
      </div>

      {/* SKILLS SECTION */}
      <div className="bg-surface border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-2 text-textMain font-semibold mb-6">
          <span className="text-primary">⚡</span> Skills
        </div>
        
        {isEditing ? (
          // TRYB EDYCJI: Używamy SkillSelector
          // profile.skills to teraz tablica obiektów {id, name}, co pasuje do Selectora
          <SkillSelector 
            selectedSkills={profile.skills || []} 
            setSelectedSkills={(newSkills) => setProfile({...profile, skills: newSkills})} 
          />
        ) : (
          // TRYB PODGLĄDU: Iterujemy po obiektach i wyświetlamy .name
          <div className="flex flex-wrap gap-2">
            {profile.skills?.length > 0 ? (
              profile.skills.map(skill => (
                <span 
                  key={skill.id || skill.name} // Fallback key
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
      </div>

      {/* CATEGORIES SECTION */}
      <div className="bg-surface border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-2 text-textMain font-semibold mb-6">
          <Target size={20} className="text-primary" /> Preferred Project Types
        </div>
        
        <div className="flex flex-wrap gap-3">
          {isEditing ? (
            // TRYB EDYCJI: Wyświetlamy wszystkie dostępne kategorie do wyboru
            availableCategories.length > 0 ? (
              availableCategories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => toggleCategory(cat.id)} 
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    profile.preferred_categories?.includes(cat.id) 
                    ? 'bg-secondary/20 border-secondary text-secondary' 
                    : 'bg-background border-border text-gray-400 hover:text-textMain'
                  }`}
                >
                  {cat.name}
                </button>
              ))
            ) : (
              <span className="text-textMuted text-sm">Loading categories...</span>
            )
          ) : (
            // TRYB PODGLĄDU: Wyświetlamy tylko wybrane (zamieniając ID na Nazwę)
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
      </div>
    </div>
  );
};

export default ProfileDetails;