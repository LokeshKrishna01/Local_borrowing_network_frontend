import { useState, useEffect } from 'react';
import API from '../api/axios';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  Users,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Ban,
  UserCheck,
  Trash2,
  BarChart3,
  ArrowLeftRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [userFilter, setUserFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [banModal, setBanModal] = useState({ open: false, userId: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, itemId: null });

  const userFilters = ['all', 'pending', 'active', 'banned'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, itemsRes, transactionsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/items'),
        API.get('/admin/transactions'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setItems(itemsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/approve`);
      toast.success('User approved!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleBan = async () => {
    const userId = banModal.userId;
    try {
      await API.put(`/admin/users/${userId}/ban`);
      toast.success('User banned');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleDeleteItem = async () => {
    const itemId = deleteModal.itemId;
    try {
      await API.delete(`/admin/items/${itemId}`);
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const filteredUsers = userFilter === 'all'
    ? users
    : users.filter((u) => u.status === userFilter);

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
        <div className="page-header">
          <h1>
            <Shield size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Admin Dashboard
          </h1>
          <p>Manage users and monitor platform activity</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-4" style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="stat-card">
              <div className="stat-icon purple"><Users size={22} /></div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><Clock size={22} /></div>
              <div className="stat-info">
                <h3>{stats.pendingUsers}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={22} /></div>
              <div className="stat-info">
                <h3>{stats.activeUsers}</h3>
                <p>Active</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon teal"><Package size={22} /></div>
              <div className="stat-info">
                <h3>{stats.totalItems}</h3>
                <p>Total Items</p>
              </div>
            </div>
          </div>
        )}

        {/* Item Stats Bar */}
        {stats && (
          <div className="glass-card" style={{ marginBottom: 'var(--space-2xl)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} /> Inventory Overview
            </h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available</span>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>{stats.availableItems}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Borrowed</span>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning)', fontFamily: 'var(--font-heading)' }}>{stats.borrowedItems}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Banned Users</span>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--error)', fontFamily: 'var(--font-heading)' }}>{stats.bannedUsers}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top-Level Tabs */}
        <div className="tab-filter" style={{ marginBottom: 'var(--space-xl)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
          {['users', 'inventory', 'transactions'].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
              style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem', background: 'transparent', border: 'none' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-lg)', fontSize: '1.3rem' }}>
              User Management
            </h2>

            <div className="tab-filter" style={{ marginBottom: 'var(--space-lg)' }}>
              {userFilters.map((f) => (
                <button
                  key={f}
                  className={userFilter === f ? 'active' : ''}
                  onClick={() => setUserFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'pending' && stats?.pendingUsers > 0 && (
                    <span style={{
                      background: 'var(--error)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      marginLeft: '0.3rem',
                    }}>{stats.pendingUsers}</span>
                  )}
                </button>
              ))}
            </div>

            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Users size={48} /></div>
                <h3>No Users Found</h3>
                <p>No users match this filter.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Reputation</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id} id={`user-row-${u._id}`}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.status}`}>{u.status}</span>
                        </td>
                        <td style={{ color: 'var(--warning)' }}>{u.reputationScore}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {u.status === 'pending' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleApprove(u._id)}
                              >
                                <UserCheck size={14} /> Approve
                              </button>
                            )}
                            {u.status !== 'banned' && (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => setBanModal({ open: true, userId: u._id })}
                              >
                                <Ban size={14} /> Ban
                              </button>
                            )}
                            {u.status === 'banned' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleApprove(u._id)}
                              >
                                <UserCheck size={14} /> Unban
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Inventory Management Tab */}
        {activeTab === 'inventory' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-lg)', fontSize: '1.3rem' }}>
              All Inventory Items
            </h2>
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Package size={48} /></div>
                <h3>No Items Found</h3>
                <p>There are no items listed on the platform yet.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Added On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={item.imageUrl} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <span style={{ fontWeight: 500 }}>{item.title}</span>
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                        <td>{item.owner?.name} <br/><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.owner?.email}</span></td>
                        <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => setDeleteModal({ open: true, itemId: item._id })}
                            disabled={item.status === 'borrowed'}
                            title={item.status === 'borrowed' ? 'Cannot delete while borrowed' : 'Delete item'}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-lg)', fontSize: '1.3rem' }}>
              Borrowing Details
            </h2>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><ArrowLeftRight size={48} /></div>
                <h3>No Transactions Found</h3>
                <p>There are no borrowing requests on the platform yet.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Borrower</th>
                      <th>Lender</th>
                      <th>Dates</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn._id}>
                        <td style={{ fontWeight: 500 }}>{txn.item?.title}</td>
                        <td>{txn.borrower?.name}</td>
                        <td>{txn.lender?.name}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {new Date(txn.startDate).toLocaleDateString()} to {new Date(txn.endDate).toLocaleDateString()}
                        </td>
                        <td><span className={`badge badge-${txn.status}`}>{txn.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Confirmation Modals */}
      <ConfirmationModal
        isOpen={banModal.open}
        onClose={() => setBanModal({ open: false, userId: null })}
        onConfirm={handleBan}
        title="Ban User"
        message="Are you sure you want to ban this user? They will no longer be able to access the platform."
        confirmText="Yes, Ban User"
        type="danger"
      />

      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, itemId: null })}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Yes, Delete Item"
        type="danger"
      />
    </div>
  );
};

export default AdminDashboard;
