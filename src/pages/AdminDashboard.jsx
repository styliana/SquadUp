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
  
  // POPRAWKA 1: Domyślne sortowanie dla 'users' to teraz 'updated_at'
  const [sortConfig, setSortConfig] = useState({ 
    column: 'updated_at', 
    direction: 'desc' 
  });

  const [editingItem, setEditingItem] = useState(null);

  // Reset widoku przy zmianie zakładki
  useEffect(() => {
    setPage(1);
    setSearchTerm('');
    // Reset sortowania: 'updated_at' dla userów, 'created_at' dla projektów
    setSortConfig({ 
        column: activeTab === 'users' ? 'updated_at' : 'created_at', 
        direction: 'desc' 
    });
  }, [activeTab]);

  // Pobieranie danych
  const loadData = async () => {
    setLoading(true);
    try {
      // --- SAFETY CHECK (POPRAWKA 2) ---
      let safeSort = sortConfig;
      
      if (activeTab === 'users') {
        // Usunięto 'created_at', bo tabela profiles go nie ma
        const validUserCols = ['full_name', 'username', 'email', 'role_id', 'updated_at', 'id'];
        
        // Jeśli obecna kolumna sortowania nie istnieje w tabeli profiles, wymuś updated_at
        if (!validUserCols.includes(sortConfig.column)) {
           safeSort = { column: 'updated_at', direction: 'desc' };
           // Opcjonalnie aktualizujemy stan UI, żeby był spójny z zapytaniem
           setSortConfig(safeSort);
        }
      } else {
        // Projekty mają created_at, więc tu jest OK
        const validProjectCols = ['title', 'members_max', 'members_current', 'status_id', 'created_at', 'author_id', 'id'];
        if (!validProjectCols.includes(sortConfig.column)) {
           safeSort = { column: 'created_at', direction: 'desc' };
           setSortConfig(safeSort);
        }
      }

      const result = await adminService.fetchData(
        activeTab, 
        page, 
        debouncedSearch,
        safeSort
      );
      
      setData(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error("Data load error:", error);
      toast.error('Failed to load data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, debouncedSearch, sortConfig]);

  const handleSort = (column) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

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
        
        sortConfig={sortConfig} 
        onSort={handleSort}     
        
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