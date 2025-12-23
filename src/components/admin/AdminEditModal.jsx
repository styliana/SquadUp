import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AdminEditModal = ({ item, type, onClose, onSave }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (item) {
      if (type === 'users') {
        setForm({
          full_name: item.full_name || '',
          username: item.username || '',
          role_id: item.role_id || 1
        });
      } else {
        setForm({
          title: item.title || '',
          members_max: item.members_max || 4,
          members_current: item.members_current || 1,
          status_id: item.status_id || 1
        });
      }
    }
  }, [item, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-textMuted hover:text-textMain"><X size={20} /></button>
        
        <h2 className="text-xl font-bold text-textMain mb-1">Edit {type === 'users' ? 'User' : 'Project'}</h2>
        <p className="text-sm text-textMuted mb-6">ID: <span className="font-mono">{item.id.slice(0,8)}...</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* USER FORM */}
          {type === 'users' && (
            <>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Full Name</label>
                <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Username</label>
                <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Role ID</label>
                <select value={form.role_id} onChange={e => setForm({...form, role_id: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none">
                  <option value="1">User (1)</option>
                  <option value="2">Admin (2)</option>
                </select>
              </div>
            </>
          )}

          {/* PROJECT FORM */}
          {type === 'projects' && (
            <>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Project Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1">Max Members</label>
                  <input type="number" min="1" value={form.members_max} onChange={e => setForm({...form, members_max: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1">Current</label>
                  <input type="number" min="1" value={form.members_current} onChange={e => setForm({...form, members_current: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Status ID</label>
                <select value={form.status_id} onChange={e => setForm({...form, status_id: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none">
                  <option value="1">Open (1)</option>
                  <option value="2">Closed (2)</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">
              <Check size={16} /> Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminEditModal;