import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getLocalities, saveLocality, deleteLocality } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash, Loader2 } from 'lucide-react';

export default function AdminLocalitiesPage() {
  const { getToken } = useAuth();
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(null); // null for new, or locality object for editing
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchLocalities();
  }, []);

  const fetchLocalities = async () => {
    try {
      const data = await getLocalities();
      setLocalities(data);
    } catch (error) {
      toast.error('Failed to fetch localities.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (locality) => {
    setEditMode(locality);
    setName(locality.name);
    setDescription(locality.description || '');
  };

  const handleCancel = () => {
    setEditMode(null);
    setName('');
    setDescription('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return toast.error('Locality name is required.');
    setIsSaving(true);
    try {
      const token = await getToken();
      await saveLocality({
        id: editMode?.id,
        name,
        description,
      }, token);
      toast.success(`Locality ${editMode ? 'updated' : 'saved'} successfully!`);
      handleCancel();
      fetchLocalities(); // Refresh list
    } catch (error) {
      toast.error(error.message || 'Failed to save locality.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this locality? This action cannot be undone.')) return;
    try {
      const token = await getToken();
      await deleteLocality(id, token);
      toast.success('Locality deleted.');
      fetchLocalities(); // Refresh list
    } catch (error) {
      toast.error(error.message || 'Failed to delete locality.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Localities</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Existing Localities</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-3">
                {localities.map((loc) => (
                  <div key={loc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{loc.name}</p>
                      <p className="text-xs text-gray-500">{loc.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(loc)} className="p-2 text-gray-500 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(loc.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">{editMode ? 'Edit Locality' : 'Add New Locality'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alkapuri"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Premium residential area"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isSaving} className="w-full bg-brand-500 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {editMode ? 'Update' : 'Save'}
                </button>
                {editMode && (
                  <button type="button" onClick={handleCancel} className="w-full bg-gray-200 py-2 rounded-lg text-sm">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
