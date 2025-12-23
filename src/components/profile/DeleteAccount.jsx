import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../ui/Button'; // Importujemy nasz Button

const DeleteAccount = ({ onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return;
    setLoading(true);
    try {
      await onDelete();
      setIsOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 mt-8">
        <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={20} /> Danger Zone
        </h3>
        <Button 
          variant="danger" 
          onClick={() => { setConfirmation(''); setIsOpen(true); }}
          className="w-full text-sm font-bold"
        >
          Delete Account
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-textMain">
                <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-bold text-textMain mb-2">Delete Account</h2>
              <p className="text-textMuted text-sm">This action cannot be undone. Type <strong>DELETE</strong> to confirm.</p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                value={confirmation} 
                onChange={(e) => setConfirmation(e.target.value)} 
                className="w-full bg-background border border-border rounded-xl py-3 text-center font-bold text-textMain focus:border-red-500 focus:outline-none" 
                placeholder="TYPE DELETE" 
              />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">
                    Cancel
                </Button>
                <Button 
                    variant="danger" // Możesz zdefiniować ten wariant w Button.jsx lub użyć custom class
                    onClick={handleDelete} 
                    disabled={confirmation !== 'DELETE' || loading} 
                    isLoading={loading}
                    className="flex-1 bg-red-500 text-white hover:bg-red-600 border-none"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccount;