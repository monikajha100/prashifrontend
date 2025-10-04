import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaTrash, FaDownload, FaSearch, FaUser, FaBuilding, FaStore, FaHandshake } from 'react-icons/fa';
import './AdminPartners.css';

const AdminPartners = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/partners/applications');
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/partners/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/admin/partners/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchApplications();
        fetchStats();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteApplication = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const response = await fetch(`/api/admin/partners/applications/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchApplications();
          fetchStats();
        }
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const viewApplication = async (id) => {
    try {
      const response = await fetch(`/api/admin/partners/applications/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedApplication(data.application);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    }
  };

  const getPartnershipTypeIcon = (type) => {
    switch (type) {
      case 'franchise':
        return <FaBuilding className="type-icon franchise" />;
      case 'agency':
        return <FaHandshake className="type-icon agency" />;
      case 'reseller':
        return <FaStore className="type-icon reseller" />;
      default:
        return <FaUser className="type-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge pending',
      approved: 'status-badge approved',
      rejected: 'status-badge rejected'
    };
    return <span className={statusClasses[status]}>{status}</span>;
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.business.toLowerCase().includes(searchTerm.toLowerCase());
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
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-content">
            <h3>{stats.total || 0}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending || 0}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">✅</div>
          <div className="stat-content">
            <h3>{stats.approved || 0}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected">❌</div>
          <div className="stat-content">
            <h3>{stats.rejected || 0}</h3>
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
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({stats.total || 0})
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending || 0})
          </button>
          <button
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved ({stats.approved || 0})
          </button>
          <button
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
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
                <div className="business-name">
                  {app.business}
                </div>
                <div className="contact-info">
                  <div>{app.email}</div>
                  <div>{app.phone}</div>
                </div>
                <div>
                  {getStatusBadge(app.status)}
                </div>
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
                  {app.status === 'pending' && (
                    <>
                      <button
                        className="action-btn approve"
                        onClick={() => updateApplicationStatus(app.id, 'approved')}
                        title="Approve"
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
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
                    <span className={`type-badge ${selectedApplication.partnership_type}`}>
                      {selectedApplication.partnership_type}
                    </span>
                  </div>
                  <div>
                    <label>Status:</label>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                  <div>
                    <label>Applied:</label>
                    <span>{new Date(selectedApplication.created_at).toLocaleString()}</span>
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

              {selectedApplication.status === 'pending' && (
                <div className="modal-actions">
                  <button
                    className="btn approve"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                  >
                    <FaCheck /> Approve Application
                  </button>
                  <button
                    className="btn reject"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  >
                    <FaTimes /> Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
