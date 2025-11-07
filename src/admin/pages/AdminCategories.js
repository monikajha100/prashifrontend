import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import api, { categoriesAPI, toAbsoluteImageUrl } from "../../services/api";
import { Helmet } from "react-helmet-async";
import AdminLayout from "../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";
import "./AdminCategories.css";

const AdminCategories = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery(
    "categories",
    categoriesAPI.getAll,
    {
      select: (response) => {
        const data = response.data;
        console.log('Categories data:', data);
        if (data && Array.isArray(data)) {
          data.forEach(cat => {
            console.log(`Category ${cat.name}:`, { 
              id: cat.id, 
              image: cat.image,
              hasImage: !!cat.image 
            });
          });
        }
        return data;
      },
    }
  );

  const deleteCategoryMutation = useMutation(
    (categoryId) => categoriesAPI.deleteCategory(categoryId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("categories");
        toast.success("Category deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete category");
      },
    }
  );

  const handleDelete = (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
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
            {categories?.map((category) => {
              const imageUrl = category.image ? toAbsoluteImageUrl(category.image) : null;
              console.log(`Rendering category ${category.name}:`, { 
                originalImage: category.image, 
                absoluteUrl: imageUrl 
              });
              
              return (
                <div key={category.id} className="category-card">
                  <div className="category-info">
                    {imageUrl && (
                      <div className="category-image">
                        <img
                          src={imageUrl}
                          alt={category.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginBottom: "15px",
                          }}
                          onError={(e) => {
                            console.error('Category image load error:', { 
                              category: category.name,
                              originalUrl: category.image,
                              absoluteUrl: imageUrl 
                            });
                            e.target.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('Category image loaded successfully:', category.name);
                          }}
                        />
                      </div>
                    )}
                    <h3>{category.name}</h3>
                    <p className="category-slug">Slug: {category.slug}</p>
                    <p className="category-description">{category.description}</p>
                    <div className="category-meta">
                      <span className="product-count">
                        {category.product_count || 0} products
                      </span>
                      <span
                        className={`status-badge ${
                          category.is_active ? "active" : "inactive"
                        }`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
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
              );
            })}
          </div>

          {showAddForm && (
            <CategoryForm
              onClose={() => setShowAddForm(false)}
              onSuccess={() => {
                setShowAddForm(false);
                queryClient.invalidateQueries("categories");
              }}
            />
          )}

          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onClose={() => setEditingCategory(null)}
              onSuccess={() => {
                setEditingCategory(null);
                queryClient.invalidateQueries("categories");
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
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image: category?.image || "",
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active !== undefined ? category.is_active : true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(category?.image || "");

  const createMutation = useMutation(
    (data) => categoriesAPI.createCategory(data),
    {
      onSuccess: () => {
        toast.success("Category created successfully");
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to create category");
      },
    }
  );

  const updateMutation = useMutation(
    (data) => categoriesAPI.updateCategory(category.id, data),
    {
      onSuccess: () => {
        toast.success("Category updated successfully");
        onSuccess();
      },
      onError: () => {
        toast.error("Failed to update category");
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Auto-generate slug when name changes
    if (name === "name" && !category) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData({
        ...formData,
        [name]: value,
        slug: slug,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post(`/upload/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;
      return data.url;
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let submitData = { ...formData };

      // Upload image if a new file is selected
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        submitData.image = imageUrl;
      }

      if (category) {
        updateMutation.mutate(submitData);
      } else {
        createMutation.mutate(submitData);
      }
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{category ? "Edit Category" : "Add New Category"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Category Name *
            </label>
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
            <label htmlFor="slug" className="form-label">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug || ""}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter category slug (e.g., rings, necklaces)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
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

          <div className="form-group">
            <label htmlFor="image" className="form-label">
              Category Icon/Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              className="form-input"
              accept="image/*"
            />
            <small
              style={{
                color: "#666",
                fontSize: "12px",
                marginTop: "5px",
                display: "block",
              }}
            >
              Upload a custom icon or image for this category (JPG, PNG, GIF,
              WebP - Max 5MB)
            </small>
            {imagePreview && (
              <div className="image-preview">
                <img
                  src={imagePreview.startsWith('data:') || imagePreview.startsWith('http') 
                    ? imagePreview 
                    : toAbsoluteImageUrl(imagePreview)}
                  alt="Preview"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginTop: "10px",
                  }}
                  onError={(e) => {
                    console.error('Image preview error:', imagePreview);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sort_order" className="form-label">
                Sort Order
              </label>
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
              {createMutation.isLoading || updateMutation.isLoading
                ? "Saving..."
                : "Save Category"}
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
