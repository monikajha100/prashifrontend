import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productsAPI, categoriesAPI } from '../../services/api';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import './AdminProducts.css';

const AdminProducts = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery(
    'adminProducts',
    () => productsAPI.getAll({ limit: 50 }),
    {
      select: (response) => response.data.products
    }
  );

  const { data: categories } = useQuery(
    'categories',
    categoriesAPI.getAll,
    {
      select: (response) => response.data
    }
  );

  const deleteProductMutation = useMutation(
    (productId) => productsAPI.deleteProduct(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        toast.success('Product deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete product');
      }
    }
  );

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner text="Loading products..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <>
        <Helmet>
          <title>Products - Admin Panel</title>
        </Helmet>

        <div className="admin-products">
        <div className="page-header">
          <h1>Products Management</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New Product
          </button>
        </div>

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map(product => (
                <tr key={product.id}>
                  <td>
                    <img 
                      src={product.primary_image || '/placeholder-product.jpg'} 
                      alt={product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>
                    <div className="product-name">
                      <strong>{product.name}</strong>
                      <small>SKU: {product.sku || 'N/A'}</small>
                    </div>
                  </td>
                  <td>{product.category_name || 'Uncategorized'}</td>
                  <td>
                    <div className="price-info">
                      <span className="current-price">₹{product.price}</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="original-price">₹{product.original_price}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`stock-level ${product.stock_quantity < 10 ? 'low' : 'good'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingProduct(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddForm && (
          <ProductForm 
            categories={categories}
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              queryClient.invalidateQueries('adminProducts');
            }}
          />
        )}

        {editingProduct && (
          <ProductForm 
            product={editingProduct}
            categories={categories}
            onClose={() => setEditingProduct(null)}
            onSuccess={() => {
              setEditingProduct(null);
              queryClient.invalidateQueries('adminProducts');
            }}
          />
        )}
        </div>
      </>
    </AdminLayout>
  );
};

const ProductForm = ({ product, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    category_id: product?.category_id || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    sku: product?.sku || '',
    stock_quantity: product?.stock_quantity || 0,
    weight: product?.weight || '',
    dimensions: product?.dimensions || '',
    material: product?.material || '',
    color: product?.color || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active !== undefined ? product.is_active : true,
    meta_title: product?.meta_title || '',
    meta_description: product?.meta_description || ''
  });

  const createMutation = useMutation(
    (data) => productsAPI.createProduct(data),
    {
      onSuccess: () => {
        toast.success('Product created successfully');
        onSuccess();
      },
      onError: () => {
        toast.error('Failed to create product');
      }
    }
  );

  const updateMutation = useMutation(
    (data) => productsAPI.updateProduct(product.id, data),
    {
      onSuccess: () => {
        toast.success('Product updated successfully');
        onSuccess();
      },
      onError: () => {
        toast.error('Failed to update product');
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
    if (product) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category_id" className="form-label">Category *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Category</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="short_description" className="form-label">Short Description</label>
            <textarea
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              className="form-textarea"
              rows="2"
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
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price" className="form-label">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="original_price" className="form-label">Original Price</label>
              <input
                type="number"
                id="original_price"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="stock_quantity" className="form-label">Stock Quantity *</label>
              <input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sku" className="form-label">SKU</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="material" className="form-label">Material</label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="color" className="form-label">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight" className="form-label">Weight (g)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="dimensions" className="form-label">Dimensions</label>
              <input
                type="text"
                id="dimensions"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 2cm x 3cm"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                />
                Featured Product
              </label>
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
              {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save Product'}
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

export default AdminProducts;
