import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productsAPI, categoriesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FullAdminProducts = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery(
    'adminProducts',
    () => productsAPI.getAll({ limit: 100 }),
    {
      select: (response) => response.data.products || []
    }
  );

  const { data: categories } = useQuery(
    'categories',
    categoriesAPI.getAll,
    {
      select: (response) => response.data || []
    }
  );

  const deleteMutation = useMutation(
    (id) => productsAPI.delete(id),
    {
      onSuccess: () => {
        toast.success('Product deleted successfully!');
        queryClient.invalidateQueries('adminProducts');
      },
      onError: () => {
        toast.error('Failed to delete product');
      }
    }
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
              Products Management
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Total Products: {products?.length || 0}
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
            ➕ Add New Product
          </button>
        </div>

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
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Product</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Category</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Price</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Stock</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2C2C2C' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#2C2C2C' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '15px', color: '#666' }}>#{product.id}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600', color: '#2C2C2C' }}>{product.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{product.slug}</div>
                      </td>
                      <td style={{ padding: '15px', color: '#666' }}>{product.category_name || 'N/A'}</td>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#2C2C2C' }}>₹{product.price}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: product.stock_quantity < 10 ? '#f8d7da' : '#d4edda',
                          color: product.stock_quantity < 10 ? '#721c24' : '#155724',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          {product.stock_quantity} units
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          background: product.is_active ? '#d4edda' : '#f8d7da',
                          color: product.is_active ? '#155724' : '#721c24',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => setEditingProduct(product)}
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
                            onClick={() => handleDelete(product.id)}
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
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      No products found. Click "Add New Product" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddForm || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingProduct(null);
            queryClient.invalidateQueries('adminProducts');
          }}
        />
      )}
    </div>
  );
};

const ProductFormModal = ({ product, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || '',
    original_price: product?.original_price || '',
    discount_percentage: product?.discount_percentage || 0,
    category_id: product?.category_id || '',
    stock_quantity: product?.stock_quantity || 0,
    is_featured: product?.is_featured || false,
    is_active: product?.is_active !== false
  });

  const saveMutation = useMutation(
    (data) => product ? productsAPI.update(product.id, data) : productsAPI.create(data),
    {
      onSuccess: () => {
        toast.success(product ? 'Product updated successfully!' : 'Product created successfully!');
        onSuccess();
      },
      onError: () => {
        toast.error('Failed to save product');
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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#2C2C2C' }}>
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Product Name</label>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
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

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Original Price (₹)</label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Category</label>
              <select
                name="category_id"
                value={formData.category_id}
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
              >
                <option value="">Select Category</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
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
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: '600' }}>Featured Product</span>
            </label>
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
              {saveMutation.isLoading ? 'Saving...' : (product ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FullAdminProducts;
