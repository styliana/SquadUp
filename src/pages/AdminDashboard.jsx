import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDebounce } from '../hooks/useDebounce';
import { adminService } from '../services/adminService';

// Import Klocków
import AdminHeader from '../components/admin/AdminHeader';
import AdminTable from '../components/admin/AdminTable';
import AdminEditModal from '../components/admin/AdminEditModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await adminService.fetchData(activeTab, page, debouncedSearch);
      setData(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await adminService.deleteItem(activeTab, id);
      toast.success('Deleted successfully');
      loadData(); 
    } catch (error) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const handleSave = async (id, formData) => {
    try {
      // Dla Users dodajemy updated_at, dla projektów rzutujemy typy
      const updateData = activeTab === 'users' 
        ? { ...formData, role_id: parseInt(formData.role_id), updated_at: new Date().toISOString() }
        : { ...formData, members_max: parseInt(formData.members_max), members_current: parseInt(formData.members_current), status_id: parseInt(formData.status_id) };

      await adminService.updateItem(activeTab, id, updateData);
      toast.success('Updated successfully');
      setEditingItem(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update: ' + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen relative">
      
      <AdminHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />

      <AdminTable 
        data={data} 
        loading={loading} 
        activeTab={activeTab}
        page={page}
        totalCount={totalCount}
        setPage={setPage}
        onEdit={setEditingItem}
        onDelete={handleDelete}
      />

      {editingItem && (
        <AdminEditModal 
          item={editingItem} 
          type={activeTab} 
          onClose={() => setEditingItem(null)} 
          onSave={handleSave} 
        />
      )}

    </div>
  );
};

export default AdminDashboard;