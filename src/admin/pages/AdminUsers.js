import React, { useState } from 'react';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../../services/api';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminUsers.css';

const AdminUsers = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserOrders, setShowUserOrders] = useState(false);
  const [selectedUserForOrders, setSelectedUserForOrders] = useState(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery(
    'adminUsers',
    async () => {
      try {
        const response = await usersAPI.getAllUsers();
        // Handle both direct array response and wrapped response
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
      }
    },
    {
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const updateStatusMutation = useMutation(
    ({ userId, statusData }) => usersAPI.updateUserStatus(userId, statusData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update user status');
      }
    }
  );

  const createUserMutation = useMutation(
    (userData) => usersAPI.createUser(userData),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('adminUsers');
        toast.success('User created successfully');
        setShowAddUser(false);
        // Show temporary password to admin
        if (response.data.tempPassword) {
          toast.success(`Temporary password: ${response.data.tempPassword}`, { duration: 10000 });
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create user');
      }
    }
  );

  const handleStatusToggle = (userId, currentStatus) => {
    updateStatusMutation.mutate({
      userId,
      statusData: { is_active: !currentStatus }
    });
  };

  const handleViewOrders = (user) => {
    setSelectedUserForOrders(user);
    setShowUserOrders(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="Loading users..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>⚠️ Error Loading Users</h2>
          <p>Unable to fetch users. Please ensure:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Backend server is running</li>
            <li>Database is connected</li>
            <li>You are logged in as admin</li>
          </ul>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Error: {error.message || 'Unknown error'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <>
        <Helmet>
          <title>Users - Admin Panel</title>
        </Helmet>

        <div className="admin-users">
          <div className="page-header">
            <div>
              <h1>Users Management</h1>
              <div className="users-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Users:</span>
                  <span className="stat-value">{users?.length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Users:</span>
                  <span className="stat-value">
                    {users?.filter(user => user.is_active).length || 0}
                  </span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddUser(true)}
              >
                <i className="fas fa-plus"></i> Add New User
              </button>
            </div>
          </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-name">
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => setSelectedUser(user)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewOrders(user)}
                      >
                        View Orders
                      </button>
                      <button 
                        className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <UserDetailsModal 
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}

        {showAddUser && (
          <AddUserModal 
            onClose={() => setShowAddUser(false)}
            onSubmit={createUserMutation.mutate}
            isLoading={createUserMutation.isLoading}
          />
        )}

        {showUserOrders && selectedUserForOrders && (
          <UserOrdersModal 
            user={selectedUserForOrders}
            onClose={() => {
              setShowUserOrders(false);
              setSelectedUserForOrders(null);
            }}
          />
        )}
        </div>
      </>
    </AdminLayout>
  );
};

const UserDetailsModal = ({ user, onClose }) => {
  const { data: userDetails, isLoading } = useQuery(
    ['userDetails', user.id],
    () => usersAPI.getUserById(user.id),
    {
      select: (response) => response.data
    }
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>User Details - {user.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading user details..." />
        ) : (
          <div className="user-details-content">
            <div className="user-info-grid">
              <div className="info-section">
                <h3>Personal Information</h3>
                <div className="info-item">
                  <strong>Name:</strong> {userDetails?.name}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {userDetails?.email}
                </div>
                <div className="info-item">
                  <strong>Phone:</strong> {userDetails?.phone || 'Not provided'}
                </div>
                <div className="info-item">
                  <strong>Role:</strong> 
                  <span className={`role-badge role-${userDetails?.role}`}>
                    {userDetails?.role}
                  </span>
                </div>
                <div className="info-item">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${userDetails?.is_active ? 'active' : 'inactive'}`}>
                    {userDetails?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="info-section">
                <h3>Address Information</h3>
                <div className="info-item">
                  <strong>Address:</strong> {userDetails?.address || 'Not provided'}
                </div>
                <div className="info-item">
                  <strong>City:</strong> {userDetails?.city || 'Not provided'}
                </div>
                <div className="info-item">
                  <strong>State:</strong> {userDetails?.state || 'Not provided'}
                </div>
                <div className="info-item">
                  <strong>Pincode:</strong> {userDetails?.pincode || 'Not provided'}
                </div>
              </div>

              <div className="info-section">
                <h3>Account Information</h3>
                <div className="info-item">
                  <strong>Member Since:</strong> {new Date(userDetails?.created_at).toLocaleDateString()}
                </div>
                <div className="info-item">
                  <strong>Last Updated:</strong> {new Date(userDetails?.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="user-actions">
              <button className="btn btn-primary">
                Send Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AddUserModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New User</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserOrdersModal = ({ user, onClose }) => {
  const { data: orders, isLoading } = useQuery(
    ['userOrders', user.id],
    () => usersAPI.getUserOrders(user.id),
    {
      select: (response) => response.data
    }
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Orders for {user.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading orders..." />
        ) : (
          <div className="orders-content">
            {orders && orders.length > 0 ? (
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="items-cell">
                          <div className="items-summary">
                            {order.items_summary || 'No items'}
                          </div>
                        </td>
                        <td>₹{order.total_amount}</td>
                        <td>
                          <span className={`status-badge status-${order.order_status}`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td>{order.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-orders">
                <p>No orders found for this user.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
