import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { categoriesAPI } from '../../services/api';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminCategories.css';

const AdminCategories = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery(
    'categories',
    categoriesAPI.getAll,
    {
      select: (response) => response.data
    }
  );

  const deleteCategoryMutation = useMutation(
    (categoryId) => categoriesAPI.deleteCategory(categoryId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        toast.success('Category deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete category');
      }
    }
  );

  const handleDelete = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="Loading categories..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <>
        <Helmet>
          <title>Categories - Admin Panel</title>
        </Helmet>

        <div className="admin-categories">
        <div className="page-header">
          <h1>Categories Management</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New Category
          </button>
        </div>

        <div className="categories-grid">
          {categories?.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-info">
                <h3>{category.name}</h3>
                <p className="category-slug">Slug: {category.slug}</p>
                <p className="category-description">{category.description}</p>
                <div className="category-meta">
                  <span className="product-count">{category.product_count || 0} products</span>
                  <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="category-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => setEditingCategory(category)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(category.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAddForm && (
          <CategoryForm 
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              queryClient.invalidateQueries('categories');
            }}
          />
        )}

        {editingCategory && (
          <CategoryForm 
            category={editingCategory}
            onClose={() => setEditingCategory(null)}
            onSuccess={() => {
              setEditingCategory(null);
              queryClient.invalidateQueries('categories');
            }}
          />
        )}
        </div>
      </>
    </AdminLayout>
  );
};

const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active !== undefined ? category.is_active : true
  });

  const createMutation = useMutation(
    (data) => categoriesAPI.createCategory(data),
    {
      onSuccess: () => {
        toast.success('Category created successfully');
        onSuccess();
      },
      onError: () => {
        toast.error('Failed to create category');
      }
    }
  );

  const updateMutation = useMutation(
    (data) => categoriesAPI.updateCategory(category.id, data),
    {
      onSuccess: () => {
        toast.success('Category updated successfully');
        onSuccess();
      },
      onError: () => {
        toast.error('Failed to update category');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{category ? 'Edit Category' : 'Add New Category'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Category Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter category name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Enter category description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sort_order" className="form-label">Sort Order</label>
              <input
                type="number"
                id="sort_order"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                className="form-input"
                min="0"
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save Category'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategories;
