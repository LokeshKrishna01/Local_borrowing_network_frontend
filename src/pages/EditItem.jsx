import { useState, useEffect, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { Save, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EditItem = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [currentImage, setCurrentImage] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const categories = ['tools', 'textbooks', 'camping', 'kitchen', 'electronics', 'sports', 'other'];

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data } = await API.get(`/items/${id}`);
      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category);
      setCurrentImage(data.imageUrl);

      if (data.status === 'borrowed') {
        toast.error('Cannot edit — item is currently borrowed');
        navigate('/my-items');
      }
    } catch (error) {
      toast.error('Item not found');
      navigate('/my-items');
    } finally {
      setFetching(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (image) formData.append('image', image);

      await API.put(`/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Item updated!');
      navigate('/my-items');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '650px' }}>
        <div className="page-header">
          <h1>Edit Item</h1>
          <p>Update your item listing</p>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit} id="edit-item-form">
            <div className="form-group">
              <label htmlFor="edit-title">Title</label>
              <input
                id="edit-title"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Item Photo</label>
              <div style={{ marginBottom: '0.5rem' }}>
                <img
                  src={preview || currentImage}
                  alt="Current"
                  style={{
                    width: '100%',
                    maxHeight: '250px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)',
                  }}
                />
              </div>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus size={14} /> Change Photo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
              id="save-item-btn"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
