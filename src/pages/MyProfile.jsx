import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ConfirmationModal from '../components/ConfirmationModal';
import { User, ShieldAlert, CheckCircle, Save, Mail, Calendar, Phone, MapPin, AlignLeft, Star, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Collection of premium avatar presets
const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Dusty&backgroundColor=d1c4e9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala&backgroundColor=ffd54f',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Buster&backgroundColor=ff8a65'
];

const MyProfile = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  const [saving, setSaving] = useState(false);
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Initialize form fields when user data is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfilePicture(user.profilePicture || '');
      setAddress(user.address || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  // Calculate reputation badge and progress color
  const repScore = user.reputationScore || 0;
  let repTier = 'Good';
  let repColor = 'var(--warning)';
  if (repScore < 50) {
    repTier = 'Needs Improvement';
    repColor = 'var(--error)';
  } else if (repScore >= 100 && repScore < 150) {
    repTier = 'Trusted Member';
    repColor = 'var(--info)';
  } else if (repScore >= 150) {
    repTier = 'Community Pillar';
    repColor = 'var(--success)';
  }

  const handlePresetSelect = (presetUrl) => {
    setProfilePicture(presetUrl);
    setShowCustomAvatarInput(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      await API.put('/auth/profile', {
        name,
        profilePicture,
        address,
        phone,
        bio
      });
      await refreshUser(); // sync context state with database
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await API.delete('/auth/profile');
      toast.success('Your account has been deleted successfully.');
      logout();
      navigate('/register');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
      setDeleteAccountOpen(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1>My Profile</h1>
          <p>Customize your identity, settings, and neighborhood profile information</p>
        </div>

        {/* Profile Card Header (Premium UI) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2.5rem', marginBottom: 'var(--space-xl)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle colored ambient lights under the avatar */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-20%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108, 99, 255, 0.15) 0%, transparent 70%)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50%',
            right: '-20%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 184, 148, 0.1) 0%, transparent 70%)',
            zIndex: 0,
            pointerEvents: 'none'
          }} />

          {/* Large Avatar container */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {profilePicture ? (
                <img src={profilePicture} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={50} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
          </div>

          <div style={{ zIndex: 1 }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Mail size={14} /> {user.email}
            </p>
          </div>

          {/* Reputation Progress Bar Card */}
          {user.role !== 'admin' && (
            <div style={{
              width: '100%',
              maxWidth: '500px',
              padding: '1.25rem',
              borderRadius: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Star size={14} style={{ color: 'var(--warning)' }} /> Reputation Score
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: repColor }}>
                  {repScore} / 200 ({repTier})
                </span>
              </div>
              <div style={{
                height: '8px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (repScore / 200) * 100)}%`,
                  background: repColor,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease-in-out'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Main Details and Preset Avatar forms */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          
          {/* Avatar Customization Block */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Edit3 size={18} style={{ color: 'var(--primary)' }} /> Select Profile Avatar
            </h3>
            
            {/* Grid of illustrated presets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {AVATAR_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '50%',
                    padding: '3px',
                    border: profilePicture === preset ? '3px solid var(--primary)' : '2px solid transparent',
                    background: 'transparent',
                    transition: 'all 0.2s',
                    transform: profilePicture === preset ? 'scale(1.05)' : 'none',
                    aspectRatio: '1',
                    overflow: 'hidden'
                  }}
                  title="Choose preset avatar"
                >
                  <img src={preset} alt={`preset-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
              ))}
            </div>

            {/* Toggle custom URL input */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
              >
                {showCustomAvatarInput ? 'Hide Custom URL Input' : 'Use Custom Image URL'}
              </button>
            </div>

            {showCustomAvatarInput && (
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Custom Avatar Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://example.com/avatar.jpg"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  style={{ marginTop: '0.35rem' }}
                />
              </div>
            )}
          </div>

          {/* Form details block */}
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <User size={18} style={{ color: 'var(--primary)' }} /> Edit Profile Info
            </h3>

            <div className="form-group">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ marginTop: '0.4rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <Phone size={14} /> Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ marginTop: '0.4rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <AlignLeft size={14} /> Bio (Introduce yourself to neighbors)
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="I love gardening, woodworking, and helping out my neighborhood..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ resize: 'vertical', marginTop: '0.4rem' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <MapPin size={14} /> Handover / Home Address
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="123 Maple Street, Apt 4B, Springfield"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ resize: 'vertical', marginTop: '0.4rem' }}
              />
            </div>

            {/* Read-only badges section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'rgba(255, 255, 255, 0.015)'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Account Role</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Member Since</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={14} /> {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', width: '100%' }}
            >
              <Save size={16} /> {saving ? 'Saving changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Danger Zone (relocated here) */}
        {user.role !== 'admin' && (
          <div className="glass-card" style={{ marginTop: 'var(--space-2xl)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>
              <ShieldAlert size={20} /> Danger Zone
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
              Permanently delete your profile, and all listed items. This action is irreversible and all your borrowing/lending history will be cleared.
            </p>
            <button className="btn btn-danger" onClick={() => setDeleteAccountOpen(true)}>
              Delete My Account
            </button>
          </div>
        )}

        <ConfirmationModal
          isOpen={deleteAccountOpen}
          onClose={() => setDeleteAccountOpen(false)}
          onConfirm={handleDeleteAccount}
          isLoading={isDeletingAccount}
          title="Delete Account"
          message="Are you sure you want to permanently delete your account? This will erase all your items, conversations, messages, notifications, and past records. This action cannot be undone."
          confirmText="Yes, Delete My Account"
          type="danger"
        />
      </div>
    </div>
  );
};

export default MyProfile;
