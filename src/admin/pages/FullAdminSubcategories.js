import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { subcategoriesAPI, categoriesAPI } from '../../services/api';

const FullAdminSubcategories = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const queryClient = useQueryClient();

  // Fetch subcategories
  const { data: subcategories, isLoading, error } = useQuery(
    ['subcategories', categoryFilter],
    () => {
      const params = categoryFilter !== 'all' ? { category_id: categoryFilter } : {};
      return subcategoriesAPI.getAllAdmin(params);
    },
    {
      select: (response) => response.data || [],
      retry: 1,
      onError: (err) => {
        console.error('Subcategories fetch error:', err);
        if (err.response?.status !== 401) {
          toast.error('Failed to load subcategories. Make sure backend is running.');
        }
      }
    }
  );

  // Fetch categories for dropdown
  const { data: categories } = useQuery(
    'categories',
    categoriesAPI.getAll,
    {
      select: (response) => response.data || [],
      retry: 1
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id) => subcategoriesAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Subcategory deleted successfully!');
        queryClient.invalidateQueries('subcategories');
      },
      onError: (error) => {
        console.error('Delete error:', error);
        toast.error('Failed to delete subcategory');
      }
    }
  );

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setShowAddForm(true);
  };

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
          <h2>⚠️ Error Loading Subcategories</h2>
          <p>Unable to fetch subcategories. Please ensure:</p>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '20px auto' }}>
            <li>Backend server is running</li>
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

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>Loading subcategories...</div>
      </div>
    );
  }

  const filteredSubcategories = categoryFilter === 'all' 
    ? subcategories 
    : subcategories?.filter(sub => sub.category_id == categoryFilter);

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e1e1e1'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2rem', 
            color: '#333',
            fontWeight: '700'
          }}>
            📂 Subcategories Management
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: '5px 0 0 0' }}>
            Total Subcategories: {filteredSubcategories?.length || 0}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingSubcategory(null);
            setShowAddForm(true);
          }}
          style={{
            background: '#D4AF37',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.target.style.background = '#B8941F'}
          onMouseLeave={(e) => e.target.style.background = '#D4AF37'}
        >
          ➕ Add New Subcategory
        </button>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: '#333'
        }}>
          Filter by Category:
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '10px',
            border: '2px solid #e1e1e1',
            borderRadius: '6px',
            fontSize: '1rem',
            minWidth: '200px',
            background: 'white'
          }}
        >
          <option value="all">All Categories</option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategories Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {filteredSubcategories?.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📂</div>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>No subcategories found</h3>
            <p style={{ color: '#999' }}>Create your first subcategory to get started!</p>
          </div>
        ) : (
          filteredSubcategories?.map(subcategory => {
            const category = categories?.find(cat => cat.id === subcategory.category_id);
            return (
              <div key={subcategory.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                border: '1px solid #f0f0f0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}>
                {/* Subcategory Name */}
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: '#333',
                  lineHeight: '1.2'
                }}>
                  {subcategory.name}
                </h3>

                {/* Slug */}
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: '0.9rem',
                  color: '#666',
                  fontFamily: 'monospace'
                }}>
                  Slug: {subcategory.slug}
                </p>

                {/* Parent Category */}
                <p style={{
                  margin: '0 0 15px 0',
                  fontSize: '1rem',
                  color: '#555',
                  lineHeight: '1.4'
                }}>
                  Parent: <strong style={{ color: '#1976d2' }}>{category?.name || 'Unknown Category'}</strong>
                </p>

                {/* Description */}
                {subcategory.description && (
                  <p style={{
                    margin: '0 0 15px 0',
                    fontSize: '0.95rem',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {subcategory.description}
                  </p>
                )}

                {/* Divider */}
                <hr style={{
                  border: 'none',
                  borderTop: '1px solid #e1e1e1',
                  margin: '15px 0'
                }} />

                {/* Status and Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {/* Status */}
                  <span style={{
                    background: subcategory.is_active ? '#d4edda' : '#f8d7da',
                    color: subcategory.is_active ? '#155724' : '#721c24',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    border: 'none'
                  }}>
                    {subcategory.is_active ? 'Active' : 'Inactive'}
                  </span>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(subcategory)}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                      onMouseLeave={(e) => e.target.style.background = '#007bff'}
                      title="Edit subcategory"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(subcategory.id, subcategory.name)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#c82333'}
                      onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                      title="Delete subcategory"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <SubcategoryFormModal
          subcategory={editingSubcategory}
          categories={categories}
          onClose={() => {
            setShowAddForm(false);
            setEditingSubcategory(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingSubcategory(null);
            queryClient.invalidateQueries('subcategories');
          }}
        />
      )}
    </div>
  );
};

const SubcategoryFormModal = ({ subcategory, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: subcategory?.name || '',
    slug: subcategory?.slug || '',
    description: subcategory?.description || '',
    category_id: subcategory?.category_id || '',
    is_active: subcategory?.is_active !== false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveMutation = useMutation(
    async (data) => {
      if (subcategory) {
        return subcategoriesAPI.update(subcategory.id, data);
      } else {
        return subcategoriesAPI.create(data);
      }
    },
    {
      onSuccess: () => {
        toast.success(subcategory ? 'Subcategory updated successfully!' : 'Subcategory created successfully!');
        onSuccess();
      },
      onError: (error) => {
        console.error('Save error:', error);
        toast.error('Failed to save subcategory');
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate slug if not provided
      const finalFormData = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      saveMutation.mutate(finalFormData);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #e1e1e1'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
            {subcategory ? '✏️ Edit Subcategory' : '➕ Add New Subcategory'}
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

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Subcategory Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e1e1',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Enter subcategory name"
            />
          </div>

          {/* Slug */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e1e1',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Auto-generated from name if empty"
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Parent Category *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e1e1',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                background: 'white'
              }}
            >
              <option value="">Select a category</option>
              {categories?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e1e1',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Enter subcategory description"
            />
          </div>

          {/* Status */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ marginRight: '8px', transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: '600', color: '#333' }}>Active</span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '2px solid #6c757d',
                background: 'white',
                color: '#6c757d',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: isSubmitting ? '#6c757d' : '#28a745',
                color: 'white',
                borderRadius: '6px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {isSubmitting ? 'Saving...' : (subcategory ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FullAdminSubcategories;
