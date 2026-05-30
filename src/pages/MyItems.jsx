import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ConfirmationModal from '../components/ConfirmationModal';
import { Package, Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MyItems = () => {
  const { logout, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, itemId: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const { data } = await API.get('/items/my/items');
      setItems(data);
    } catch (error) {
      toast.error('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const id = deleteModal.itemId;
    setIsDeleting(true);
    try {
      const { data } = await API.delete(`/items/${id}`);
      
      const cancelledCount = data.cancelledTransactions || 0;
      if (cancelledCount > 0) {
        toast.success(`Item deleted. ${cancelledCount} pending request(s) cancelled.`);
      } else {
        toast.success('Item deleted successfully');
      }

      setItems(items.filter((i) => i._id !== id));
      setDeleteModal({ open: false, itemId: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>My Items</h1>
            <p>Manage items you've listed for lending</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/add-item')} id="add-item-btn">
            <Plus size={16} /> List New Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Package size={48} /></div>
            <h3>No Items Listed</h3>
            <p>You haven't listed any items yet. Start sharing with your community!</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-item')}>
              <Plus size={16} /> List Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-auto">
            {items.map((item) => (
              <div key={item._id} className="item-card fade-in" id={`my-item-${item._id}`}>
                <div className="item-card-image">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300/1a1a2e/6c63ff?text=No+Image';
                    }}
                  />
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                </div>
                <div className="item-card-body">
                  <span className="category">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p className="description">{item.description}</p>
                </div>
                <div className="item-card-footer">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigate(`/edit-item/${item._id}`)}
                    disabled={item.status === 'borrowed'}
                    title={item.status === 'borrowed' ? 'Cannot edit while borrowed' : 'Edit item'}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setDeleteModal({ open: true, itemId: item._id })}
                    disabled={item.status === 'borrowed'}
                    title={item.status === 'borrowed' ? 'Cannot delete while borrowed' : 'Delete item'}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <ConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, itemId: null })}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Yes, Delete"
          type="danger"
        />
      </div>
    </div>
  );
};

export default MyItems;
