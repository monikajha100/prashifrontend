import React, { useState, useEffect } from "react";
import axios from "axios";
import api, { API_BASE_URL } from "../../services/api";
import toast from "react-hot-toast";
import "./AdminSpecialOffers.css";

const AdminSpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState(getEmptyFormData());

  function getEmptyFormData() {
    return {
      title: "",
      description: "",
      icon: "🎁",
      discount_percentage: "",
      discount_text: "",
      highlight_text: "",
      badge_text: "",
      timer_enabled: false,
      timer_text: "",
      start_date: "",
      end_date: "",
      link_url: "/products",
      button_text: "Shop Now",
      background_color: "",
      text_color: "",
      sort_order: 0,
      is_active: true,
    };
  }

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      const response = await axios.get(
        `${API_BASE_URL}/special-offers/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingOffer) {
        await api.put(`/special-offers/${editingOffer.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Offer updated successfully!");
      } else {
        await api.post(`/special-offers`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Offer created successfully!");
      }

      setShowForm(false);
      setEditingOffer(null);
      setFormData(getEmptyFormData());
      fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error(error.response?.data?.message || "Failed to save offer");
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      icon: offer.icon || "🎁",
      discount_percentage: offer.discount_percentage || "",
      discount_text: offer.discount_text || "",
      highlight_text: offer.highlight_text || "",
      badge_text: offer.badge_text || "",
      timer_enabled: offer.timer_enabled || false,
      timer_text: offer.timer_text || "",
      start_date: offer.start_date
        ? new Date(offer.start_date).toISOString().split("T")[0]
        : "",
      end_date: offer.end_date
        ? new Date(offer.end_date).toISOString().split("T")[0]
        : "",
      link_url: offer.link_url,
      button_text: offer.button_text,
      background_color: offer.background_color || "",
      text_color: offer.text_color || "",
      sort_order: offer.sort_order,
      is_active: offer.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      await axios.delete(`${API_BASE_URL}/special-offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Offer deleted successfully!");
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      await axios.patch(
        `${API_BASE_URL}/special-offers/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Offer status updated!");
      fetchOffers();
    } catch (error) {
      console.error("Error toggling offer:", error);
      toast.error("Failed to update status");
    }
  };

  const iconOptions = [
    "🔥",
    "🎁",
    "💎",
    "⭐",
    "✨",
    "🎉",
    "💰",
    "🛍️",
    "👑",
    "💝",
  ];

  if (loading) {
    return <div className="loading">Loading offers...</div>;
  }

  return (
    <div className="admin-special-offers">
      <div className="page-header">
        <div>
          <h1>🎁 Special Offers & Promotions</h1>
          <p>Manage limited time offers and promotions</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingOffer(null);
            setFormData(getEmptyFormData());
          }}
        >
          ➕ Add New Offer
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingOffer ? "Edit Offer" : "Create New Offer"}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="offer-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="e.g., Flash Sale"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows="3"
                    placeholder="e.g., Up to 70% OFF on selected Victorian sets"
                  />
                </div>

                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-selector">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-btn ${
                          formData.icon === icon ? "selected" : ""
                        }`}
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_percentage: e.target.value,
                      })
                    }
                    placeholder="e.g., 70"
                  />
                </div>

                <div className="form-group">
                  <label>Discount Text</label>
                  <input
                    type="text"
                    value={formData.discount_text}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_text: e.target.value,
                      })
                    }
                    placeholder="e.g., Up to 70% OFF"
                  />
                </div>

                <div className="form-group">
                  <label>Highlight Text</label>
                  <input
                    type="text"
                    value={formData.highlight_text}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        highlight_text: e.target.value,
                      })
                    }
                    placeholder="e.g., ✨ Mix & Match Any 3 Items"
                  />
                </div>

                <div className="form-group">
                  <label>Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge_text}
                    onChange={(e) =>
                      setFormData({ ...formData, badge_text: e.target.value })
                    }
                    placeholder="e.g., 👑 Premium Quality"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.timer_enabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timer_enabled: e.target.checked,
                        })
                      }
                    />
                    Enable Timer
                  </label>
                </div>

                {formData.timer_enabled && (
                  <div className="form-group">
                    <label>Timer Text</label>
                    <input
                      type="text"
                      value={formData.timer_text}
                      onChange={(e) =>
                        setFormData({ ...formData, timer_text: e.target.value })
                      }
                      placeholder="e.g., ⏰ Ends in 24 hours!"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Link URL *</label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) =>
                      setFormData({ ...formData, link_url: e.target.value })
                    }
                    required
                    placeholder="/products?sale=true"
                  />
                </div>

                <div className="form-group">
                  <label>Button Text *</label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) =>
                      setFormData({ ...formData, button_text: e.target.value })
                    }
                    required
                    placeholder="Shop Now"
                  />
                </div>

                <div className="form-group">
                  <label>Background Color</label>
                  <input
                    type="color"
                    value={formData.background_color || "#ffffff"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        background_color: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Text Color</label>
                  <input
                    type="color"
                    value={formData.text_color || "#000000"}
                    onChange={(e) =>
                      setFormData({ ...formData, text_color: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value),
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingOffer ? "Update Offer" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="offers-grid">
        {offers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎁</div>
            <h3>No Special Offers Yet</h3>
            <p>Create your first promotional offer to attract customers!</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create First Offer
            </button>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <div className="offer-header">
                <div className="offer-icon">{offer.icon}</div>
                <div className="offer-status">
                  <span
                    className={`status-badge ${
                      offer.is_active ? "active" : "inactive"
                    }`}
                  >
                    {offer.is_active ? "✓ Active" : "✕ Inactive"}
                  </span>
                </div>
              </div>

              <h3>{offer.title}</h3>
              <p className="offer-description">{offer.description}</p>

              {offer.discount_text && (
                <div className="offer-detail">
                  <strong>Discount:</strong> {offer.discount_text}
                </div>
              )}

              {offer.timer_enabled && offer.timer_text && (
                <div className="offer-detail timer">{offer.timer_text}</div>
              )}

              {(offer.start_date || offer.end_date) && (
                <div className="offer-dates">
                  {offer.start_date && (
                    <span>
                      From: {new Date(offer.start_date).toLocaleDateString()}
                    </span>
                  )}
                  {offer.end_date && (
                    <span>
                      To: {new Date(offer.end_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              <div className="offer-stats">
                <div className="stat">
                  <span className="stat-value">{offer.views_count || 0}</span>
                  <span className="stat-label">Views</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{offer.clicks_count || 0}</span>
                  <span className="stat-label">Clicks</span>
                </div>
              </div>

              <div className="offer-actions">
                <button className="btn-edit" onClick={() => handleEdit(offer)}>
                  ✏️ Edit
                </button>
                <button
                  className={`btn-toggle ${
                    offer.is_active ? "deactivate" : "activate"
                  }`}
                  onClick={() => handleToggleActive(offer.id)}
                >
                  {offer.is_active ? "⏸️ Deactivate" : "▶️ Activate"}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(offer.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSpecialOffers;
