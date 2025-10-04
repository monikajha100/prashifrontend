import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { categoriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FullAdminCategories = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery(
    'adminCategories',
    categoriesAPI.getAllAdmin,
    {
      select: (response) => response.data || []
    }
  );

  const deleteMutation = useMutation(
    (id) => categoriesAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Category deleted successfully!');
        queryClient.invalidateQueries('adminCategories');
      },
      onError: () => {
        toast.error('Failed to delete category');
      }
    }
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
              Categories Management
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Total Categories: {categories?.length || 0}
            </p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 5px 15px rgba(212, 175, 55, 0.3)'
            }}
          >
            ➕ Add New Category
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} style={{
                background: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#2C2C2C',
                    margin: '0 0 10px 0'
                  }}>
                    {category.name}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                    Slug: {category.slug}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                    {category.description || 'No description'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '15px',
                  borderTop: '1px solid #e1e1e1'
                }}>
                  <span style={{
                    background: category.is_active ? '#d4edda' : '#f8d7da',
                    color: category.is_active ? '#155724' : '#721c24',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setEditingCategory(category)}
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
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              padding: '40px',
              textAlign: 'center',
              color: '#666',
              background: 'white',
              borderRadius: '15px'
            }}>
              No categories found. Click "Add New Category" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {(showAddForm || editingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setShowAddForm(false);
            setEditingCategory(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingCategory(null);
            queryClient.invalidateQueries('adminCategories');
          }}
        />
      )}
    </div>
  );
};

const CategoryFormModal = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    is_active: category?.is_active !== false
  });

  const saveMutation = useMutation(
    (data) => category ? categoriesAPI.update(category.id, data) : categoriesAPI.create(data),
    {
      onSuccess: () => {
        toast.success(category ? 'Category updated successfully!' : 'Category created successfully!');
        onSuccess();
      },
      onError: () => {
        toast.error('Failed to save category');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
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
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2C2C2C' }}>
          {category ? 'Edit Category' : 'Add New Category'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Category Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: '600' }}>Active</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isLoading}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {saveMutation.isLoading ? 'Saving...' : (category ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FullAdminCategories;
