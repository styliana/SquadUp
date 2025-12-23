import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FolderGit2, 
  Trash2, 
  Search, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginacja i Szukanie
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edycja
  const [editingItem, setEditingItem] = useState(null);
  const [userForm, setUserForm] = useState({ full_name: '', username: '', role_id: 1 });
  const [projectForm, setProjectForm] = useState({ title: '', members_max: 4, members_current: 1, status_id: 1 });

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  // --- 1. DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      let query;

      if (activeTab === 'users') {
        query = supabase
          .from('profiles')
          .select('id, full_name, username, email, updated_at, role_id', { count: 'exact' })
          .order('updated_at', { ascending: false })
          .range(from, to);

        if (debouncedSearch) {
          query = query.or(`email.ilike.%${debouncedSearch}%,full_name.ilike.%${debouncedSearch}%,username.ilike.%${debouncedSearch}%`);
        }
      } else {
        // ZMIANA: Usunięto odniesienia do kolumny 'role', bo ją usunęliśmy z bazy
        query = supabase
          .from('projects')
          .select(`
            *,
            profiles:author_id ( full_name, email, username ),
            applications ( id )
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (debouncedSearch) {
          query = query.ilike('title', `%${debouncedSearch}%`);
        }
      }

      const { data: result, error, count } = await query;
      if (error) throw error;
      
      setData(result || []);
      setTotalCount(count || 0);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, debouncedSearch]);

  // --- 2. DELETE HANDLER ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This effectively removes it from the database.')) return;

    try {
      const table = activeTab === 'users' ? 'profiles' : 'projects';
      
      // ZMIANA: Dodajemy select() aby upewnić się, że rekord został usunięty
      // Jeśli RLS zablokuje, error może być null, ale data będzie pusta
      const { error, count } = await supabase
        .from(table)
        .delete({ count: 'exact' }) // Prosimy o liczbę usuniętych wierszy
        .eq('id', id);
      
      if (error) throw error;
      
      // Dodatkowe sprawdzenie dla pewności
      if (count === 0) {
         toast.error("Database permission denied (RLS). Check your SQL policies.");
         return;
      }
      
      toast.success('Deleted successfully');
      fetchData(); 
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item: ' + error.message);
    }
  };

  // --- 3. EDIT LOGIC ---
  const openEditModal = (item) => {
    setEditingItem(item);

    if (activeTab === 'users') {
      setUserForm({
        full_name: item.full_name || '',
        username: item.username || '',
        role_id: item.role_id || 1
      });
    } else {
      setProjectForm({
        title: item.title || '',
        members_max: item.members_max || 4,
        members_current: item.members_current || 1,
        status_id: item.status_id || 1
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      let error;
      
      if (activeTab === 'users') {
        const res = await supabase
          .from('profiles')
          .update({
            full_name: userForm.full_name,
            username: userForm.username,
            role_id: parseInt(userForm.role_id),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
        error = res.error;
      } else {
        const res = await supabase
          .from('projects')
          .update({
            title: projectForm.title,
            members_max: parseInt(projectForm.members_max),
            members_current: parseInt(projectForm.members_current),
            status_id: parseInt(projectForm.status_id)
          })
          .eq('id', editingItem.id);
        error = res.error;
      }

      if (error) throw error;

      toast.success('Database updated successfully');
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update: ' + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const safeFormatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textMain">Admin Dashboard</h1>
          <p className="text-textMuted mt-1">Direct database management.</p>
        </div>

        {/* TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'users' ? 'bg-primary text-textMain shadow-sm' : 'text-textMuted hover:text-textMain'
              }`}
            >
              <Users size={16} /> Users
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'projects' ? 'bg-primary text-textMain shadow-sm' : 'text-textMuted hover:text-textMain'
              }`}
            >
              <FolderGit2 size={16} /> Projects
            </button>
          </div>

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

      {/* TABLE */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-16">
            <h3 className="text-lg font-medium text-textMain">No results found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 text-textMuted text-xs uppercase tracking-wider border-b border-border">
                  {activeTab === 'users' ? (
                    <>
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Full Name</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium text-center">Profile</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4 font-medium w-1/4">Project Name</th>
                      <th className="p-4 font-medium">Author (Leader)</th>
                      <th className="p-4 font-medium">Created</th>
                      <th className="p-4 font-medium text-center">Status</th>
                      <th className="p-4 font-medium text-center">View</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* --- USERS ROWS --- */}
                    {activeTab === 'users' && (
                      <>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-textMain">@{item.username || 'unknown'}</span>
                            <span className="text-[10px] font-mono text-textMuted">{item.id.slice(0, 6)}...</span>
                          </div>
                        </td>
                        <td className="p-4 text-textMain">{item.full_name || '-'}</td>
                        <td className="p-4 text-sm text-textMuted">{item.email}</td>
                        <td className="p-4">
                           <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            item.role_id === 2 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>
                            {item.role_id === 2 ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Link to={`/profile/${item.id}`} target="_blank" className="text-primary hover:text-primary/80">
                            <ExternalLink size={16}/>
                          </Link>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(item)} className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-primary"><Edit2 size={16}/></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-red-400"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </>
                    )}

                    {/* --- PROJECTS ROWS --- */}
                    {activeTab === 'projects' && (
                      <>
                        <td className="p-4">
                           <div className="flex flex-col">
                            <span className="text-sm font-medium text-textMain line-clamp-1" title={item.title}>{item.title}</span>
                            <span className="text-xs text-textMuted">Apps: {item.applications?.length || 0}</span>
                           </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col text-sm">
                            <span className="text-textMain font-medium">{item.profiles?.full_name || 'Unknown'}</span>
                            <span className="text-xs text-textMuted">{item.profiles?.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-textMuted whitespace-nowrap">
                          {safeFormatDate(item.created_at)}
                        </td>
                        <td className="p-4 text-center">
                            <span className={`text-[10px] inline-flex w-fit px-2 py-0.5 rounded border ${
                                item.status_id === 1 ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-gray-500/20 text-gray-400'
                            }`}>
                              {item.status_id === 1 ? 'Open' : 'Closed'}
                            </span>
                            <div className="text-[10px] text-textMuted mt-1">
                                {item.members_current}/{item.members_max} Team
                            </div>
                        </td>
                        <td className="p-4 text-center">
                          <Link 
                            to={`/projects/${item.id}`} 
                            target="_blank"
                            className="inline-flex p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(item)} className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-primary"><Edit2 size={16}/></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-red-400"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalCount > 0 && (
          <div className="border-t border-border p-4 bg-background/30 flex items-center justify-between">
             <span className="text-xs text-textMuted">Page {page} of {totalPages} ({totalCount} items)</span>
             <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border border-border disabled:opacity-30"><ChevronLeft size={16}/></button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded border border-border disabled:opacity-30"><ChevronRight size={16}/></button>
             </div>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setEditingItem(null)} className="absolute right-4 top-4 text-textMuted hover:text-textMain"><X size={20} /></button>
            
            <h2 className="text-xl font-bold text-textMain mb-1">Edit {activeTab === 'users' ? 'User' : 'Project'}</h2>
            <p className="text-sm text-textMuted mb-6">Database ID: <span className="font-mono">{editingItem.id.slice(0,8)}...</span></p>

            <form onSubmit={handleUpdate} className="space-y-4">
              
              {/* --- USER FIELDS --- */}
              {activeTab === 'users' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-1">Full Name</label>
                    <input type="text" value={userForm.full_name} onChange={e => setUserForm({...userForm, full_name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-1">Username</label>
                    <input type="text" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-1">Role ID</label>
                    <select value={userForm.role_id} onChange={e => setUserForm({...userForm, role_id: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none">
                      <option value="1">User (1)</option>
                      <option value="2">Admin (2)</option>
                    </select>
                  </div>
                </>
              )}

              {/* --- PROJECT FIELDS --- */}
              {activeTab === 'projects' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-1">Project Title</label>
                    <input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-1">Members Max</label>
                      <input type="number" min="1" value={projectForm.members_max} onChange={e => setProjectForm({...projectForm, members_max: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-1">Current</label>
                      <input type="number" min="1" value={projectForm.members_current} onChange={e => setProjectForm({...projectForm, members_current: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-1">Status ID</label>
                    <select value={projectForm.status_id} onChange={e => setProjectForm({...projectForm, status_id: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none">
                      <option value="1">Open (1)</option>
                      <option value="2">Closed (2)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-textMuted hover:bg-white/5">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 flex items-center gap-2">
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;