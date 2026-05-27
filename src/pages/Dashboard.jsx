import { useState, useEffect } from 'react';
import API from '../api/axios';
import ItemCard from '../components/ItemCard';
import { Search, Filter, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = ['all', 'tools', 'textbooks', 'camping', 'kitchen', 'electronics', 'sports', 'other'];

  useEffect(() => {
    fetchItems();
  }, [search, category]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const { data } = await API.get('/items', { params });
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch items');
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="page-header">
          <h1>Browse Items</h1>
          <p>Discover items available for borrowing in your community</p>
        </div>

        <div className="search-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.8rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
              id="search-input"
            />
          </div>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            id="category-filter"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Package size={48} /></div>
            <h3>No Items Found</h3>
            <p>
              {search || category !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Be the first to list an item for your community!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-auto">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
