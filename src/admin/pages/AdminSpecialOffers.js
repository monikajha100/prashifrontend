import React, { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./AdminSpecialOffers.css";

const AdminSpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState(getEmptyFormData());
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [offerCustomers, setOfferCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  function getEmptyFormData() {
    return {
      title: "",
      description: "",
      icon: "🎁",
      offer_type: "percentage",
      discount_percentage: "",
      discount_amount: "",
      discount_text: "",
      highlight_text: "",
      badge_text: "",
      timer_enabled: false,
      timer_text: "",
      start_date: "",
      end_date: "",
      link_url: "",
      button_text: "Shop Now",
      background_color: "",
      text_color: "",
      sort_order: 0,
      is_active: true,
      minimum_purchase_amount: "",
      buy_quantity: "",
      get_quantity: "",
      max_discount_amount: "",
      priority: 0,
      stackable: false,
    };
  }

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await api.get("/special-offers/admin/all");
      const offersData = response.data;
      
      // Fetch customer counts for each offer
      const offersWithCounts = await Promise.all(
        offersData.map(async (offer) => {
          try {
            const customersResponse = await api.get(
              `/special-offers/admin/${offer.id}/customers`
            );
            return {
              ...offer,
              customerCount: customersResponse.data.customers?.length || 0
            };
          } catch (error) {
            console.error(`Error fetching customers for offer ${offer.id}:`, error);
            return { ...offer, customerCount: 0 };
          }
        })
      );
      
      setOffers(offersWithCounts);
    } catch (error) {
      console.error("Error fetching offers:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.link_url || !formData.button_text) {
        toast.error("Please fill in all required fields (Title, Description, Link URL, Button Text)");
        return;
      }

      // Validate and sanitize offer_type
      const allowedOfferTypes = ['percentage', 'fixed_amount', 'buy_x_get_y', 'minimum_purchase', 'referral'];
      const sanitizedOfferType = allowedOfferTypes.includes(formData.offer_type) 
        ? formData.offer_type 
        : 'percentage';

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon || "🎁",
        offer_type: sanitizedOfferType,
        discount_percentage: formData.discount_percentage && formData.discount_percentage !== '' 
          ? parseInt(formData.discount_percentage) 
          : null,
        discount_amount: formData.discount_amount && formData.discount_amount !== '' 
          ? parseFloat(formData.discount_amount) 
          : null,
        discount_text: formData.discount_text && formData.discount_text.trim() 
          ? formData.discount_text.trim() 
          : null,
        highlight_text: formData.highlight_text && formData.highlight_text.trim() 
          ? formData.highlight_text.trim() 
          : null,
        badge_text: formData.badge_text && formData.badge_text.trim() 
          ? formData.badge_text.trim() 
          : null,
        timer_enabled: formData.timer_enabled === true || formData.timer_enabled === "true",
        timer_text: formData.timer_text && formData.timer_text.trim() 
          ? formData.timer_text.trim() 
          : null,
        start_date: formData.start_date && formData.start_date !== '' 
          ? formData.start_date 
          : null,
        end_date: formData.end_date && formData.end_date !== '' 
          ? formData.end_date 
          : null,
        link_url: formData.link_url.trim(),
        button_text: formData.button_text.trim(),
        background_color: formData.background_color && formData.background_color.trim() 
          ? formData.background_color.trim() 
          : null,
        text_color: formData.text_color && formData.text_color.trim() 
          ? formData.text_color.trim() 
          : null,
        sort_order: parseInt(formData.sort_order) || 0,
        is_active: formData.is_active === true || formData.is_active === "true",
        minimum_purchase_amount: formData.minimum_purchase_amount && formData.minimum_purchase_amount !== '' 
          ? parseFloat(formData.minimum_purchase_amount) 
          : null,
        buy_quantity: formData.buy_quantity && formData.buy_quantity !== '' 
          ? parseInt(formData.buy_quantity) 
          : null,
        get_quantity: formData.get_quantity && formData.get_quantity !== '' 
          ? parseInt(formData.get_quantity) 
          : null,
        max_discount_amount: formData.max_discount_amount && formData.max_discount_amount !== '' 
          ? parseFloat(formData.max_discount_amount) 
          : null,
        priority: formData.priority !== undefined && formData.priority !== '' 
          ? (parseInt(formData.priority) || 0) 
          : 0,
        stackable: formData.stackable === true || formData.stackable === "true"
      };

      console.log("Submitting payload:", payload);

      if (editingOffer) {
        const response = await api.put(`/special-offers/${editingOffer.id}`, payload);
        console.log("Update response:", response);
        toast.success("Offer updated successfully!");
      } else {
        const response = await api.post(`/special-offers`, payload);
        console.log("Create response:", response);
        toast.success("Offer created successfully!");
      }

      setShowForm(false);
      setEditingOffer(null);
      setFormData(getEmptyFormData());
      fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      // Handle different error types
      if (error.response?.data?.errors) {
        // Validation errors from express-validator
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(", ");
        toast.error(`Validation Error: ${errorMessages}`);
      } else if (error.response?.data?.error) {
        // Database or other errors
        const errorMsg = error.response.data.error || error.response.data.message;
        toast.error(`Error: ${errorMsg}`);
        console.error("Detailed error:", errorMsg);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save offer. Please check console for details.");
      }
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    
    // Validate offer_type - ensure it's a valid value
    const allowedOfferTypes = ['percentage', 'fixed_amount', 'buy_x_get_y', 'minimum_purchase', 'referral'];
    const validOfferType = allowedOfferTypes.includes(offer.offer_type) 
      ? offer.offer_type 
      : 'percentage';
    
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      icon: offer.icon || "🎁",
      offer_type: validOfferType,
      discount_percentage: offer.discount_percentage || "",
      discount_amount: offer.discount_amount || "",
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
      link_url: offer.link_url || "",
      button_text: offer.button_text || "Shop Now",
      background_color: offer.background_color || "",
      text_color: offer.text_color || "",
      sort_order: offer.sort_order || 0,
      is_active: offer.is_active !== undefined ? offer.is_active : true,
      minimum_purchase_amount: offer.minimum_purchase_amount || "",
      buy_quantity: offer.buy_quantity || "",
      get_quantity: offer.get_quantity || "",
      max_discount_amount: offer.max_discount_amount || "",
      priority: offer.priority || 0,
      stackable: offer.stackable || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      console.log("Deleting offer with ID:", id);
      const response = await api.delete(`/special-offers/${id}`);
      console.log("Delete response:", response);
      toast.success("Offer deleted successfully!");
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to delete offer");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      console.log("Toggling offer status for ID:", id);
      const response = await api.patch(`/special-offers/${id}/toggle`, {});
      console.log("Toggle response:", response);
      toast.success("Offer status updated!");
      fetchOffers();
    } catch (error) {
      console.error("Error toggling offer:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const fetchOfferCustomers = async (offerId) => {
    if (selectedOfferId === offerId) {
      // If already showing, hide it
      setSelectedOfferId(null);
      setOfferCustomers([]);
      return;
    }

    setLoadingCustomers(true);
    setSelectedOfferId(offerId);
    try {
      const response = await api.get(
        `/special-offers/admin/${offerId}/customers`
      );
      setOfferCustomers(response.data.customers || []);
    } catch (error) {
      console.error("Error fetching offer customers:", error);
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Failed to load customers");
      setOfferCustomers([]);
    } finally {
      setLoadingCustomers(false);
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
                  <label>Offer Type</label>
                  <select
                    value={formData.offer_type}
                    onChange={(e) =>
                      setFormData({ ...formData, offer_type: e.target.value })
                    }
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed_amount">Fixed Amount Discount</option>
                    <option value="buy_x_get_y">Buy X Get Y Free</option>
                    <option value="referral">Referral Offer</option>
                  </select>
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
                  <label>Discount Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_amount: e.target.value,
                      })
                    }
                    placeholder="e.g., 100"
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

                {formData.offer_type === "buy_x_get_y" && (
                  <>
                    <div className="form-group">
                      <label>Buy Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.buy_quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buy_quantity: e.target.value,
                          })
                        }
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Get Quantity (Free)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.get_quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            get_quantity: e.target.value,
                          })
                        }
                        placeholder="e.g., 1"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Minimum Purchase Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimum_purchase_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimum_purchase_amount: e.target.value,
                      })
                    }
                    placeholder="e.g., 1000"
                  />
                </div>

                <div className="form-group">
                  <label>Max Discount Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.max_discount_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_discount_amount: e.target.value,
                      })
                    }
                    placeholder="e.g., 500"
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <small>Higher priority offers are applied first</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.stackable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stackable: e.target.checked,
                        })
                      }
                    />
                    Stackable (Can be combined with other offers)
                  </label>
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
                        sort_order: parseInt(e.target.value) || 0,
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
                  className="btn-customers"
                  onClick={() => fetchOfferCustomers(offer.id)}
                  title="View customers who availed this offer"
                >
                  👥 Customers ({loadingCustomers && selectedOfferId === offer.id ? '...' : offer.customerCount || 0})
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(offer.id)}
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Show customers who availed this offer */}
              {selectedOfferId === offer.id && (
                <div className="offer-customers-section">
                  <h4>Customers who availed this offer:</h4>
                  {loadingCustomers ? (
                    <div className="loading">Loading customers...</div>
                  ) : offerCustomers.length === 0 ? (
                    <p className="no-customers">No customers have availed this offer yet.</p>
                  ) : (
                    <div className="customers-list">
                      <table className="customers-table">
                        <thead>
                          <tr>
                            <th>Order #</th>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {offerCustomers.map((customer) => (
                            <tr key={customer.orderId}>
                              <td>{customer.orderNumber}</td>
                              <td>{customer.customerName}</td>
                              <td>{customer.customerEmail}</td>
                              <td>{customer.customerPhone}</td>
                              <td>₹{customer.totalAmount.toFixed(2)}</td>
                              <td>
                                <span className={`status-badge ${customer.orderStatus}`}>
                                  {customer.orderStatus}
                                </span>
                              </td>
                              <td>{new Date(customer.orderDate).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSpecialOffers;