import { Users, FolderGit2, Search } from 'lucide-react';
import Button from '../ui/Button';

const AdminHeader = ({ activeTab, setActiveTab, searchTerm, setSearchTerm }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-textMain">Admin Dashboard</h1>
        <p className="text-textMuted mt-1">Direct database management.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* TABS */}
        <div className="flex bg-surface border border-border rounded-xl p-1">
          <Button
            variant={activeTab === 'users' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="h-9 px-4 text-sm"
          >
            <Users size={16} /> Users
          </Button>
          <Button
            variant={activeTab === 'projects' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('projects')}
            className="h-9 px-4 text-sm"
          >
            <FolderGit2 size={16} /> Projects
          </Button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
          <input 
            type="text" 
            placeholder={activeTab === 'users' ? "Search users..." : "Search projects..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;