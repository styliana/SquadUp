import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { 
  Users, 
  FolderGit2, 
  Trash2, 
  Search, 
  Loader2, 
  Shield,
  Calendar,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'projects'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Data Fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      let query;

      if (activeTab === 'users') {
        // Fetch profiles sorted by ID
        query = supabase
          .from('profiles')
          .select('*')
          .order('id', { ascending: true });
      } else {
        // Fetch projects with owner email, sorted by newest
        query = supabase
          .from('projects')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false });
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // 2. Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this item?')) return;

    try {
      const table = activeTab === 'users' ? 'profiles' : 'projects';
      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) throw error;

      toast.success('Item deleted successfully');
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item.');
    }
  };

  // 3. Search Filtering
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'users') {
      return (item.email || '').toLowerCase().includes(term) || 
             (item.id || '').toLowerCase().includes(term);
    } else {
      return (item.title || '').toLowerCase().includes(term) || 
             (item.profiles?.email || '').toLowerCase().includes(term);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textMain">Admin Dashboard</h1>
          <p className="text-textMuted mt-1">Manage users and projects.</p>
        </div>

        {/* TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'users' 
                  ? 'bg-primary text-textMain shadow-sm' 
                  : 'text-textMuted hover:text-textMain hover:bg-white/5'
              }`}
            >
              <Users size={16} />
              Users
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'projects' 
                  ? 'bg-primary text-textMain shadow-sm' 
                  : 'text-textMuted hover:text-textMain hover:bg-white/5'
              }`}
            >
              <FolderGit2 size={16} />
              Projects
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted/50"
            />
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-background/50 inline-flex p-4 rounded-full mb-4 text-textMuted">
              {activeTab === 'users' ? <Users size={24} /> : <FolderGit2 size={24} />}
            </div>
            <h3 className="text-lg font-medium text-textMain">No results found</h3>
            <p className="text-sm text-textMuted mt-1">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 text-textMuted text-xs uppercase tracking-wider border-b border-border">
                  {/* DYNAMIC HEADERS BASED ON TAB */}
                  {activeTab === 'users' ? (
                    <>
                      <th className="p-4 font-medium w-1/2">User</th>
                      <th className="p-4 font-medium w-1/4">Role</th>
                      <th className="p-4 font-medium w-1/4 hidden sm:table-cell">ID</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4 font-medium w-2/5">Project Title</th>
                      <th className="p-4 font-medium w-1/4">Owner</th>
                      <th className="p-4 font-medium w-1/4 hidden sm:table-cell">Created</th>
                    </>
                  )}
                  <th className="p-4 font-medium text-right w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    
                    {/* --- USERS TAB ROWS --- */}
                    {activeTab === 'users' && (
                      <>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                              <Users size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-textMain truncate">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            item.role === 'admin' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>
                            {item.role === 'admin' && <Shield size={10} className="mr-1" />}
                            {item.role || 'user'}
                          </span>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className="text-xs font-mono text-textMuted">{item.id.slice(0, 8)}...</span>
                        </td>
                      </>
                    )}

                    {/* --- PROJECTS TAB ROWS --- */}
                    {activeTab === 'projects' && (
                      <>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                              <FolderGit2 size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-textMain truncate max-w-[200px] sm:max-w-xs">{item.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-textMuted">
                            <Mail size={14} />
                            <span className="truncate max-w-[150px]">{item.profiles?.email || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2 text-xs text-textMuted">
                            <Calendar size={14} />
                            <span>{item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy') : '-'}</span>
                          </div>
                        </td>
                      </>
                    )}

                    {/* --- ACTIONS COLUMN --- */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-textMuted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;