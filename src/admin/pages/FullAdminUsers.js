import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FullAdminUsers = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery(
    ['users', roleFilter],
    () => usersAPI.getAllUsers({ role: roleFilter !== 'all' ? roleFilter : undefined }),
    {
      select: (response) => response.data || [],
      retry: 1,
      onError: (err) => {
        console.error('Users fetch error:', err);
        if (err.response?.status !== 401) {
          toast.error('Failed to load users. Make sure backend is running.');
        }
      }
    }
  );

  const updateStatusMutation = useMutation(
    ({ userId, is_active }) => usersAPI.updateUserStatus(userId, { is_active }),
    {
      onSuccess: () => {
        toast.success('User status updated successfully!');
        queryClient.invalidateQueries('users');
      },
      onError: () => {
        toast.error('Failed to update user status');
      }
    }
  );

  const handleStatusToggle = (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      updateStatusMutation.mutate({ userId, is_active: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error && error.response?.status !== 401) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>⚠️ Error Loading Users</h2>
          <p>Unable to fetch users. Please ensure:</p>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto' }}>
            <li>Backend server is running (http://localhost:5000)</li>
            <li>Database is connected</li>
            <li>You are logged in as admin</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#721c24',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const userStats = {
    total: users?.length || 0,
    active: users?.filter(u => u.is_active).length || 0,
    inactive: users?.filter(u => !u.is_active).length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
    customers: users?.filter(u => u.role === 'user').length || 0
  };

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2C2C2C',
              marginBottom: '10px',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              Users Management
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Total Users: {userStats.total}
            </p>
          </div>
        </div>

        {/* User Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {[
            { label: 'Total Users', count: userStats.total, color: '#6c757d' },
            { label: 'Active', count: userStats.active, color: '#28a745' },
            { label: 'Inactive', count: userStats.inactive, color: '#dc3545' },
            { label: 'Admins', count: userStats.admins, color: '#ffc107' },
            { label: 'Customers', count: userStats.customers, color: '#007bff' }
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'white',
                padding: '15px',
                borderRadius: '10px',
                textAlign: 'center',
                border: `2px solid ${stat.color}`,
                borderLeft: `4px solid ${stat.color}`
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '5px', color: stat.color }}>
                {stat.count}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#666' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '20px' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '2px solid #e1e1e1',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Users</option>
            <option value="user">Customers Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>

        {/* Users Table */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e1e1e1' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>ID</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Name</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Email</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Phone</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Role</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Joined</th>
                  <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#2C2C2C' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '15px', color: '#666' }}>#{user.id}</td>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#2C2C2C' }}>
                        {user.name}
                      </td>
                      <td style={{ padding: '15px', color: '#666' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '15px', color: '#666' }}>
                        {user.phone || 'N/A'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: user.role === 'admin' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 123, 255, 0.2)',
                          color: user.role === 'admin' ? '#856404' : '#004085',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: user.is_active ? '#d4edda' : '#f8d7da',
                          color: user.is_active ? '#155724' : '#721c24',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          {user.is_active ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#666', fontSize: '0.9rem' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => setSelectedUser(user)}
                            style={{
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            👁️ View
                          </button>
                          <button 
                            onClick={() => handleStatusToggle(user.id, user.is_active)}
                            style={{
                              background: user.is_active ? '#dc3545' : '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}
                          >
                            {user.is_active ? '🔒' : '🔓'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onStatusToggle={handleStatusToggle}
        />
      )}
    </div>
  );
};

const UserDetailsModal = ({ user, onClose, onStatusToggle }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#2C2C2C' }}>
            User Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '10px'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ margin: '0 0 5px 0', color: '#2C2C2C' }}>{user.name}</h3>
            <div style={{
              display: 'inline-block',
              background: user.role === 'admin' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(0, 123, 255, 0.2)',
              color: user.role === 'admin' ? '#856404' : '#004085',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {user.role === 'admin' ? '👑 Admin' : '👤 Customer'}
            </div>
          </div>

          <div style={{ fontSize: '0.95rem', color: '#666' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
              <strong>Email:</strong>
              <span>{user.email}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
              <strong>Phone:</strong>
              <span>{user.phone || 'Not provided'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
              <strong>Address:</strong>
              <span>{user.address || 'Not provided'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
              <strong>City:</strong>
              <span>{user.city || 'Not provided'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
              <strong>State:</strong>
              <span>{user.state || 'Not provided'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
              <strong>Pincode:</strong>
              <span>{user.pincode || 'Not provided'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
              <strong>Status:</strong>
              <span>
                <span style={{
                  background: user.is_active ? '#d4edda' : '#f8d7da',
                  color: user.is_active ? '#155724' : '#721c24',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  {user.is_active ? '✅ Active' : '❌ Inactive'}
                </span>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '10px' }}>
              <strong>Joined:</strong>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              onStatusToggle(user.id, user.is_active);
              onClose();
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: user.is_active ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {user.is_active ? '🔒 Deactivate' : '🔓 Activate'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullAdminUsers;
