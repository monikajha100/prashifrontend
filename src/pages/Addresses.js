import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { addressesAPI } from '../services/api';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import './Addresses.css';

const Addresses = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    address_type: 'home',
    is_default: false
  });

  const { data: addresses = [], isLoading } = useQuery(
    'addresses',
    async () => {
      const response = await addressesAPI.getAll();
      return response.data || [];
    },
    {
      onError: (error) => {
        console.error('Error fetching addresses:', error);
      }
    }
  );

  const createMutation = useMutation(
    (data) => addressesAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses');
        setIsAdding(false);
        resetForm();
      },
      onError: (error) => {
        console.error('Error creating address:', error);
        const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to add address';
        alert(message); // Show error to user
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => addressesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses');
        setEditingId(null);
        resetForm();
        setIsAdding(false);
      },
      onError: (error) => {
        console.error('Error updating address:', error);
        const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to update address';
        alert(message); // Show error to user
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => addressesAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses');
      },
      onError: (error) => {
        console.error('Error deleting address:', error);
        const message = error.response?.data?.message || 'Failed to delete address';
        alert(message); // Show error to user
      }
    }
  );

  const setDefaultMutation = useMutation(
    (id) => addressesAPI.setDefault(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('addresses');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      address_type: 'home',
      is_default: false
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEdit = (address) => {
    setFormData({
      full_name: address.full_name,
      phone: address.phone || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      address_type: address.address_type,
      is_default: address.is_default
    });
    setEditingId(address.id);
    setIsAdding(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetDefault = (id) => {
    setDefaultMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="addresses-page">
        <div className="container">
          <div className="loading">Loading addresses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="addresses-page">
      <Helmet>
        <title>My Addresses - Praashibysupal</title>
      </Helmet>

      <div className="container">
        <motion.div
          className="addresses-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="addresses-header">
            <h1 className="page-title">My Addresses</h1>
            {!isAdding && (
              <button
                className="btn btn-primary"
                onClick={() => setIsAdding(true)}
              >
                Add New Address
              </button>
            )}
          </div>

          {isAdding && (
            <motion.div
              className="address-form-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
              <form onSubmit={handleSubmit} className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address Line 1 *</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Landmark</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Address Type</label>
                    <select
                      name="address_type"
                      value={formData.address_type}
                      onChange={handleChange}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleChange}
                      />
                      Set as default address
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                  >
                    {createMutation.isLoading || updateMutation.isLoading
                      ? 'Saving...'
                      : editingId
                      ? 'Update Address'
                      : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="addresses-list">
            {addresses.length === 0 ? (
              <div className="no-addresses">
                <p>No addresses saved yet.</p>
                <p>Add your first address to get started!</p>
              </div>
            ) : (
              addresses.map((address) => (
                <motion.div
                  key={address.id}
                  className={`address-card ${address.is_default ? 'default' : ''}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="address-header">
                    <div>
                      <span className="address-type">{address.address_type}</span>
                      {address.is_default && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                    <div className="address-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(address)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {!address.is_default && (
                        <button
                          className="btn-icon"
                          onClick={() => handleSetDefault(address.id)}
                          title="Set as Default"
                          disabled={setDefaultMutation.isLoading}
                        >
                          ⭐
                        </button>
                      )}
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDelete(address.id)}
                        title="Delete"
                        disabled={deleteMutation.isLoading}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="address-content">
                    <div className="address-name">{address.full_name}</div>
                    {address.phone && <div className="address-phone">{address.phone}</div>}
                    <div className="address-lines">
                      {address.address_line1}
                      {address.address_line2 && <br />}
                      {address.address_line2}
                    </div>
                    <div className="address-location">
                      {address.city}, {address.state} - {address.pincode}
                    </div>
                    {address.landmark && (
                      <div className="address-landmark">
                        <em>Landmark: {address.landmark}</em>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Addresses;

