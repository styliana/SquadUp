import { TrendingUp, Send, CheckCircle } from 'lucide-react';

const ProfileStats = ({ stats }) => {
  return (
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
  );
};

export default ProfileStats;