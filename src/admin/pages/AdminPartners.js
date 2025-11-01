import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaCheck,
  FaTimes,
  FaTrash,
  FaDownload,
  FaSearch,
  FaUser,
  FaBuilding,
  FaStore,
  FaHandshake,
  FaPlus,
} from "react-icons/fa";
import { partnersAPI } from "../../services/api";
import PartnerForm from "../../admin/components/PartnerForm";
import toast from "react-hot-toast";
import "./AdminPartners.css";

const AdminPartners = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await partnersAPI.getAllApplications();
      if (response.data.success) {
        // Ensure applications is always an array
        setApplications(Array.isArray(response.data.applications) ? response.data.applications : []);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch partner applications");
      // Set to empty array on error to prevent filter errors
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await partnersAPI.getStats();
      if (response.data.success && response.data.stats) {
        setStats(response.data.stats);
      } else {
        // Set default stats if API fails or returns no stats
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default stats on error
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
    }
  };

  const createPartner = async (partnerData) => {
    try {
      const response = await partnersAPI.createPartner(partnerData);
      
      if (response.data.success) {
        toast.success("Partner created successfully!");
        fetchApplications();
        fetchStats();
        setShowCreateForm(false);
        setEditingPartner(null);
      } else {
        toast.error(response.data.message || "Error creating partner");
      }
    } catch (error) {
      console.error("Error creating partner:", error);
      toast.error(error.response?.data?.message || "Error creating partner");
    }
  };

  const updatePartner = async (id, partnerData) => {
    try {
      const response = await partnersAPI.updatePartner(id, partnerData);

      if (response.data.success) {
        toast.success("Partner updated successfully!");
        fetchApplications();
        fetchStats();
        setShowCreateForm(false);
        setEditingPartner(null);
      } else {
        toast.error(response.data.message || "Error updating partner");
      }
    } catch (error) {
      console.error("Error updating partner:", error);
      toast.error(error.response?.data?.message || "Error updating partner");
    }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      const response = await partnersAPI.updateApplicationStatus(id, status);

      if (response.data.success) {
        toast.success(`Application ${status} successfully!`);
        fetchApplications();
        fetchStats();
        setShowModal(false);
      } else {
        toast.error(response.data.message || "Error updating status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  const deleteApplication = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        const response = await partnersAPI.deleteApplication(id);

        if (response.data.success) {
          toast.success("Application deleted successfully!");
          fetchApplications();
          fetchStats();
        } else {
          toast.error(response.data.message || "Error deleting application");
        }
      } catch (error) {
        console.error("Error deleting application:", error);
        toast.error(error.response?.data?.message || "Error deleting application");
      }
    }
  };

  const viewApplication = async (id) => {
    try {
      const response = await partnersAPI.getApplicationById(id);
      if (response.data.success) {
        setSelectedApplication(response.data.application);
        setShowModal(true);
      } else {
        toast.error(response.data.message || "Error fetching application details");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      toast.error("Error fetching application details");
    }
  };

  const handleEditPartner = (partner) => {
    setEditingPartner(partner);
    setShowCreateForm(true);
  };

  const handleSavePartner = (partnerData) => {
    if (editingPartner) {
      updatePartner(editingPartner.id, partnerData);
    } else {
      createPartner(partnerData);
    }
  };

  const getPartnershipTypeIcon = (type) => {
    switch (type) {
      case "franchise":
        return <FaBuilding className="type-icon franchise" />;
      case "agency":
        return <FaHandshake className="type-icon agency" />;
      case "reseller":
        return <FaStore className="type-icon reseller" />;
      default:
        return <FaUser className="type-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-badge pending",
      approved: "status-badge approved",
      rejected: "status-badge rejected",
    };
    return <span className={statusClasses[status]}>{status}</span>;
  };

  const filteredApplications = (Array.isArray(applications) ? applications : []).filter((app) => {
    const matchesFilter = filter === "all" || app.status === filter;
    const matchesSearch =
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.business?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="admin-partners">
        <div className="loading">Loading partner applications...</div>
      </div>
    );
  }

  return (
    <div className="admin-partners">
      <div className="page-header">
        <div>
          <h1>🤝 Partner Applications</h1>
          <p>Manage partnership applications and approvals</p>
        </div>
        <button 
          className="btn-primary create-btn"
          onClick={() => {
            setEditingPartner(null);
            setShowCreateForm(true);
          }}
        >
          <FaPlus /> Create Partner
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-content">
            <h3>{stats?.total || 0}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-content">
            <h3>{stats?.pending || 0}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">✅</div>
          <div className="stat-content">
            <h3>{stats?.approved || 0}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected">❌</div>
          <div className="stat-content">
            <h3>{stats?.rejected || 0}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({stats.total || 0})
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending ({stats.pending || 0})
          </button>
          <button
            className={filter === "approved" ? "active" : ""}
            onClick={() => setFilter("approved")}
          >
            Approved ({stats.approved || 0})
          </button>
          <button
            className={filter === "rejected" ? "active" : ""}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({stats.rejected || 0})
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="applications-table">
        <div className="table-header">
          <div className="table-row header">
            <div>Partner</div>
            <div>Type</div>
            <div>Business</div>
            <div>Contact</div>
            <div>Status</div>
            <div>Date</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="table-body">
          {filteredApplications.length === 0 ? (
            <div className="no-data">
              <p>No applications found</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app.id} className="table-row">
                <div className="partner-info">
                  {getPartnershipTypeIcon(app.partnership_type)}
                  <div>
                    <strong>{app.name}</strong>
                  </div>
                </div>
                <div className="partnership-type">
                  <span className={`type-badge ${app.partnership_type}`}>
                    {app.partnership_type}
                  </span>
                </div>
                <div className="business-name">{app.business}</div>
                <div className="contact-info">
                  <div>{app.email}</div>
                  <div>{app.phone}</div>
                </div>
                <div>{getStatusBadge(app.status)}</div>
                <div className="date">
                  {new Date(app.created_at).toLocaleDateString()}
                </div>
                <div className="actions">
                  <button
                    className="action-btn view"
                    onClick={() => viewApplication(app.id)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditPartner(app)}
                    title="Edit Partner"
                  >
                    <FaUser />
                  </button>
                  {app.status === "pending" && (
                    <>
                      <button
                        className="action-btn approve"
                        onClick={() =>
                          updateApplicationStatus(app.id, "approved")
                        }
                        title="Approve"
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() =>
                          updateApplicationStatus(app.id, "rejected")
                        }
                        title="Reject"
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                  <button
                    className="action-btn delete"
                    onClick={() => deleteApplication(app.id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div>
                    <label>Name:</label>
                    <span>{selectedApplication.name}</span>
                  </div>
                  <div>
                    <label>Email:</label>
                    <span>{selectedApplication.email}</span>
                  </div>
                  <div>
                    <label>Phone:</label>
                    <span>{selectedApplication.phone}</span>
                  </div>
                  <div>
                    <label>Business:</label>
                    <span>{selectedApplication.business}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Partnership Details</h3>
                <div className="detail-grid">
                  <div>
                    <label>Type:</label>
                    <span
                      className={`type-badge ${selectedApplication.partnership_type}`}
                    >
                      {selectedApplication.partnership_type}
                    </span>
                  </div>
                  <div>
                    <label>Status:</label>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                  <div>
                    <label>Applied:</label>
                    <span>
                      {new Date(
                        selectedApplication.created_at
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedApplication.experience && (
                <div className="detail-section">
                  <h3>Business Experience</h3>
                  <div className="experience-text">
                    {selectedApplication.experience}
                  </div>
                </div>
              )}

              {selectedApplication.documents && (
                <div className="detail-section">
                  <h3>Documents</h3>
                  <div className="document-link">
                    <a
                      href={`/${selectedApplication.documents}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      <FaDownload /> Download Document
                    </a>
                  </div>
                </div>
              )}

              {selectedApplication.status === "pending" && (
                <div className="modal-actions">
                  <button
                    className="btn approve"
                    onClick={() =>
                      updateApplicationStatus(
                        selectedApplication.id,
                        "approved"
                      )
                    }
                  >
                    <FaCheck /> Approve Application
                  </button>
                  <button
                    className="btn reject"
                    onClick={() =>
                      updateApplicationStatus(
                        selectedApplication.id,
                        "rejected"
                      )
                    }
                  >
                    <FaTimes /> Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Partner Form Modal */}
      {showCreateForm && (
        <PartnerForm
          partner={editingPartner}
          onSave={handleSavePartner}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingPartner(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPartners;
