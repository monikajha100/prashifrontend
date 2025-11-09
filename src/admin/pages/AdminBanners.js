import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./AdminBanners.css";
import api, { bannersAPI } from "../../services/api";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    mobile_title: "",
    mobile_subtitle: "",
    mobile_image: "",
    link_url: "",
    button_text: "",
    sort_order: 0,
    device_type: "both",
    is_active: true,
  });
  const [uploading, setUploading] = useState(false);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching banners from /admin/banners/admin");
      console.log("API Base URL:", api.defaults.baseURL);
      
      // Try using the bannersAPI helper first, fallback to direct API call
      let response;
      try {
        // Use direct API call since bannersAPI doesn't have getAdmin method
        response = await api.get("/admin/banners/admin");
      } catch (apiError) {
        // If that fails, try the alternative endpoint
        console.log("Trying alternative endpoint...");
        response = await api.get("/banners/admin");
      }
      console.log("Banners response:", response);
      const data = response.data;
      
      // Handle both array and object responses
      if (Array.isArray(data)) {
        setBanners(data);
      } else if (data && Array.isArray(data.banners)) {
        setBanners(data.banners);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError("Network error: Unable to connect to server. Please check if the backend server is running.");
      } else if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || error.message}`);
      } else {
        setError(`Error: ${error.message || 'Unable to connect to server'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle image upload
  const handleImageUpload = async (file, type) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/upload/banner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;
      setFormData((prev) => ({
        ...prev,
        [type]: data.url,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingBanner) {
        // Fix: Remove multipart/form-data header for JSON data
        response = await api.put(
          `/admin/banners/${editingBanner.id}`,
          formData
        );
      } else {
        // Fix: Remove multipart/form-data header for JSON data
        response = await api.post("/admin/banners", formData);
      }

      setShowModal(false);
      setEditingBanner(null);
      setFormData({
        title: "",
        subtitle: "",
        image: "",
        mobile_title: "",
        mobile_subtitle: "",
        mobile_image: "",
        link_url: "",
        button_text: "",
        sort_order: 0,
        device_type: "both",
        is_active: true,
      });
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert("Error saving banner: " + (error.response?.data?.message || error.message));
    }
  };

  // Handle edit
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image,
      mobile_title: banner.mobile_title || banner.title,
      mobile_subtitle: banner.mobile_subtitle || banner.subtitle || "",
      mobile_image: banner.mobile_image || banner.image,
      link_url: banner.link_url || "",
      button_text: banner.button_text || "",
      sort_order: banner.sort_order || 0,
      device_type: banner.device_type || "both",
      is_active: banner.is_active,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/admin/banners/${id}/toggle`);
      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner status:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await api.delete(`/admin/banners/${id}`);
        fetchBanners();
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Open modal for new banner
  const openNewBannerModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      link_url: "",
      button_text: "",
      sort_order: 0,
      is_active: true,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="admin-banners">
        <div className="loading">Loading banners...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-banners">
        <div className="error">
          <h2>Error Loading Banners</h2>
          <p>{error}</p>
          <button onClick={fetchBanners} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-banners">
      <div className="admin-banners-header">
        <h1>Website Banners</h1>
        <button className="btn-primary" onClick={openNewBannerModal}>
          <FaPlus /> Add New Banner
        </button>
      </div>

      <div className="banners-grid">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`banner-card ${!banner.is_active ? "inactive" : ""}`}
          >
            <div className="banner-image">
              <img
                src={banner.image}
                alt={banner.title}
                onError={(e) => {
                  console.error("Image failed to load:", banner.image);
                  e.target.style.display = "none";
                }}
                onLoad={() => {
                  console.log("Image loaded successfully:", banner.image);
                }}
              />
              <div className="banner-overlay">
                <div className="banner-status">
                  {banner.is_active ? (
                    <span className="status-active">
                      <FaEye /> Active
                    </span>
                  ) : (
                    <span className="status-inactive">
                      <FaEyeSlash /> Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="banner-content">
              <h3>{banner.title}</h3>
              {banner.subtitle && (
                <p className="banner-subtitle">{banner.subtitle}</p>
              )}
              {banner.button_text && (
                <span className="banner-button">{banner.button_text}</span>
              )}
              {banner.device_type && (
                <div className="banner-device-type">
                  <span className={`device-badge ${banner.device_type}`}>
                    {banner.device_type === "both"
                      ? "Desktop & Mobile"
                      : banner.device_type === "desktop"
                      ? "Desktop Only"
                      : "Mobile Only"}
                  </span>
                </div>
              )}
              {banner.mobile_title && (
                <div className="mobile-info">
                  <small>Mobile: {banner.mobile_title}</small>
                </div>
              )}
              <div className="banner-meta">
                <span>Order: {banner.sort_order}</span>
                <span>
                  Created: {new Date(banner.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="banner-actions">
              <button
                className="btn-toggle"
                onClick={() => handleToggleActive(banner.id)}
                title={banner.is_active ? "Deactivate" : "Activate"}
              >
                {banner.is_active ? <FaToggleOn /> : <FaToggleOff />}
              </button>
              <button
                className="btn-edit"
                onClick={() => handleEdit(banner)}
                title="Edit Banner"
              >
                <FaEdit />
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(banner.id)}
                title="Delete Banner"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="no-banners">
          <p>No banners found. Create your first website banner!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBanner ? "Edit Banner" : "Add New Banner"}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="banner-form">
              <div className="form-group">
                <label htmlFor="device_type">Device Type *</label>
                <select
                  id="device_type"
                  name="device_type"
                  value={formData.device_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="both">Both Desktop & Mobile</option>
                  <option value="desktop">Desktop Only</option>
                  <option value="mobile">Mobile Only</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Desktop Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Free Shipping On Orders ₹ 999 & Above"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subtitle">Desktop Subtitle</label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Optional subtitle text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Desktop Image *</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleImageUpload(file, "image");
                    }}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("image-upload").click()
                    }
                    className="upload-btn"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Desktop Image"}
                  </button>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Or enter image URL"
                  />
                </div>
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Desktop preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="mobile_title">Mobile Title</label>
                <input
                  type="text"
                  id="mobile_title"
                  name="mobile_title"
                  value={formData.mobile_title}
                  onChange={handleInputChange}
                  placeholder="Shorter title for mobile"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile_subtitle">Mobile Subtitle</label>
                <input
                  type="text"
                  id="mobile_subtitle"
                  name="mobile_subtitle"
                  value={formData.mobile_subtitle}
                  onChange={handleInputChange}
                  placeholder="Optional mobile subtitle"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile_image">Mobile Image</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="mobile-image-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleImageUpload(file, "mobile_image");
                    }}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("mobile-image-upload").click()
                    }
                    className="upload-btn"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload Mobile Image"}
                  </button>
                  <input
                    type="url"
                    id="mobile_image"
                    name="mobile_image"
                    value={formData.mobile_image}
                    onChange={handleInputChange}
                    placeholder="Or enter mobile image URL"
                  />
                </div>
                {formData.mobile_image && (
                  <div className="image-preview">
                    <img src={formData.mobile_image} alt="Mobile preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="link_url">Link URL</label>
                <input
                  type="url"
                  id="link_url"
                  name="link_url"
                  value={formData.link_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/landing-page"
                />
              </div>

              <div className="form-group">
                <label htmlFor="button_text">Button Text</label>
                <input
                  type="text"
                  id="button_text"
                  name="button_text"
                  value={formData.button_text}
                  onChange={handleInputChange}
                  placeholder="e.g., Shop Now, Learn More"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sort_order">Sort Order</label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Active Banner
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                >
                  {uploading
                    ? "Uploading..."
                    : editingBanner
                    ? "Update Banner"
                    : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
