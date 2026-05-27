import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Upload, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AddItem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const categories = ['tools', 'textbooks', 'camping', 'kitchen', 'electronics', 'sports', 'other'];

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

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      return toast.error('Item photo is mandatory');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('image', image);

      await API.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Item listed successfully!');
      navigate('/my-items');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '650px' }}>
        <div className="page-header">
          <h1>List New Item</h1>
          <p>Share something with your community</p>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit} id="add-item-form">
            <div className="form-group">
              <label htmlFor="item-title">Title</label>
              <input
                id="item-title"
                type="text"
                className="form-input"
                placeholder="e.g., Power Drill, Calculus Textbook"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-description">Description</label>
              <textarea
                id="item-description"
                className="form-textarea"
                placeholder="Describe the item, its condition, and any usage notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label htmlFor="item-category">Category</label>
              <select
                id="item-category"
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
              <label>Item Photo (Required)</label>
              {preview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--glass-border)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="btn btn-sm btn-danger"
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="file-upload" onClick={() => fileRef.current?.click()}>
                  <ImagePlus size={40} className="upload-icon" />
                  <p className="upload-text">
                    <span>Click to upload</span> or drag and drop
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    JPG, PNG, WEBP (max 5MB)
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
              id="submit-item-btn"
            >
              <Upload size={18} />
              {loading ? 'Uploading...' : 'List Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
