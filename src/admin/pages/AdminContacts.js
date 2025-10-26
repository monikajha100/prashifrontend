import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './AdminContacts.css';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    priority: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchContacts();
    fetchStatistics();
  }, [filters]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await contactAPI.getAllMessages(filters);
      setContacts(response.messages || []);
      setPagination({
        total: response.total || 0,
        totalPages: response.totalPages || 0
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await contactAPI.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleViewContact = async (contact) => {
    try {
      const fullContact = await contactAPI.getMessageById(contact.id);
      setSelectedContact(fullContact);
      setShowModal(true);
      
      // Mark as read if it's unread
      if (!contact.is_read) {
        await contactAPI.markAsRead(contact.id);
        fetchContacts();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error viewing contact:', error);
      toast.error('Failed to load contact details');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await contactAPI.updateStatus(id, status);
      toast.success('Status updated successfully');
      fetchContacts();
      fetchStatistics();
      if (selectedContact && selectedContact.id === id) {
        const updated = await contactAPI.getMessageById(id);
        setSelectedContact(updated);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleUpdatePriority = async (id, priority) => {
    try {
      await contactAPI.updatePriority(id, priority);
      toast.success('Priority updated successfully');
      fetchContacts();
      if (selectedContact && selectedContact.id === id) {
        const updated = await contactAPI.getMessageById(id);
        setSelectedContact(updated);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  };

  const handleAddNotes = async (id, notes) => {
    if (!notes.trim()) {
      toast.error('Please enter response notes');
      return;
    }
    
    try {
      await contactAPI.addNotes(id, notes);
      toast.success('Response notes added successfully');
      fetchContacts();
      fetchStatistics();
      if (selectedContact && selectedContact.id === id) {
        const updated = await contactAPI.getMessageById(id);
        setSelectedContact(updated);
      }
    } catch (error) {
      console.error('Error adding notes:', error);
      toast.error('Failed to add response notes');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }
    
    try {
      await contactAPI.deleteMessage(id);
      toast.success('Contact message deleted successfully');
      fetchContacts();
      fetchStatistics();
      if (showModal) {
        setShowModal(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact message');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-contacts">
      {/* Header with Statistics */}
      <div className="contacts-header">
        <div className="contacts-header-top">
          <div className="contacts-title-section">
            <h1>
              <i className="fas fa-envelope"></i>
              Contacts Management
            </h1>
            <p>View and manage customer inquiries and contact form submissions</p>
          </div>
        </div>

        {statistics && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📧</div>
              <div className="stat-value">{statistics.total || 0}</div>
              <div className="stat-label">Total Messages</div>
            </div>
            <div className="stat-card unread">
              <div className="stat-icon">🔔</div>
              <div className="stat-value">{statistics.unread || 0}</div>
              <div className="stat-label">Unread Messages</div>
            </div>
            <div className="stat-card new">
              <div className="stat-icon">✨</div>
              <div className="stat-value">{statistics.byStatus?.new || 0}</div>
              <div className="stat-label">New Inquiries</div>
            </div>
            <div className="stat-card responded">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{statistics.byStatus?.responded || 0}</div>
              <div className="stat-label">Responded</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="contacts-controls">
        <div className="controls-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={filters.search}
              onChange={handleSearch}
            />
            <i className="fas fa-search search-icon"></i>
          </div>
          
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
            <option value="archived">Archived</option>
          </select>

          <select
            className="filter-select"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button className="refresh-btn" onClick={fetchContacts}>
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="contacts-table-container">
        {loading ? (
          <div className="loading">
            <i className="fas fa-spinner"></i>
            <p>Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No Contact Messages</h3>
            <p>No contact messages found matching your filters.</p>
          </div>
        ) : (
          <>
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Contact Info</th>
                  <th>Subject</th>
                  <th>Message Preview</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className={!contact.is_read ? 'unread' : ''}>
                    <td>
                      <div className="contact-name">
                        {!contact.is_read && <i className="fas fa-circle" style={{fontSize: '6px', color: '#667eea', marginRight: '8px'}}></i>}
                        {contact.name}
                      </div>
                      <div className="contact-email">
                        <i className="fas fa-envelope"></i>
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="contact-phone">
                          <i className="fas fa-phone"></i>
                          {contact.phone}
                        </div>
                      )}
                    </td>
                    <td>{contact.subject || 'General Inquiry'}</td>
                    <td>
                      <div className="message-preview">{contact.message}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${contact.status}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${contact.priority}`}>
                        {contact.priority}
                      </span>
                    </td>
                    <td className="contact-date">
                      <strong>{new Date(contact.created_at).toLocaleDateString('en-IN')}</strong>
                      {new Date(contact.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div className="contact-actions">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewContact(contact)}
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <span>
                Page {filters.page} of {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= pagination.totalPages}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Contact Details Modal */}
      {showModal && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => {
            setShowModal(false);
            setSelectedContact(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePriority={handleUpdatePriority}
          onAddNotes={handleAddNotes}
          onDelete={handleDeleteContact}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Contact Details Modal Component
const ContactDetailsModal = ({
  contact,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onAddNotes,
  onDelete,
  formatDate
}) => {
  const [responseNotes, setResponseNotes] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-envelope-open-text"></i>
            Contact Details
          </h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Contact Information */}
          <div className="detail-section">
            <h3>
              <i className="fas fa-user"></i>
              Contact Information
            </h3>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{contact.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </span>
            </div>
            {contact.phone && (
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Subject:</span>
              <span className="detail-value">{contact.subject || 'General Inquiry'}</span>
            </div>
          </div>

          {/* Message */}
          <div className="detail-section">
            <h3>
              <i className="fas fa-comment-dots"></i>
              Message
            </h3>
            <div className="message-content">{contact.message}</div>
          </div>

          {/* Status and Priority */}
          <div className="detail-section">
            <h3>
              <i className="fas fa-cog"></i>
              Status & Priority
            </h3>
            <div className="detail-actions">
              <select
                className="select-input"
                value={contact.status}
                onChange={(e) => onUpdateStatus(contact.id, e.target.value)}
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
                <option value="archived">Archived</option>
              </select>

              <select
                className="select-input"
                value={contact.priority}
                onChange={(e) => onUpdatePriority(contact.id, e.target.value)}
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Response Notes */}
          <div className="detail-section notes-section">
            <h3>
              <i className="fas fa-sticky-note"></i>
              Response Notes
            </h3>
            
            {contact.response_notes && (
              <div className="existing-notes">
                <h4>📝 Existing Notes:</h4>
                <p>{contact.response_notes}</p>
                {contact.responded_at && (
                  <p style={{marginTop: '10px', fontSize: '0.85rem'}}>
                    <i className="fas fa-clock"></i> Responded on: {formatDate(contact.responded_at)}
                  </p>
                )}
              </div>
            )}

            <textarea
              placeholder="Add response notes or details about how you handled this inquiry..."
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
            />
            <button
              className="btn-primary"
              onClick={() => {
                onAddNotes(contact.id, responseNotes);
                setResponseNotes('');
              }}
              style={{marginTop: '10px'}}
            >
              <i className="fas fa-save"></i>
              Save Response Notes
            </button>
          </div>

          {/* Metadata */}
          <div className="detail-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              Metadata
            </h3>
            <div className="detail-row">
              <span className="detail-label">Received:</span>
              <span className="detail-value">{formatDate(contact.created_at)}</span>
            </div>
            {contact.ip_address && (
              <div className="detail-row">
                <span className="detail-label">IP Address:</span>
                <span className="detail-value">{contact.ip_address}</span>
              </div>
            )}
            {contact.responded_at && (
              <div className="detail-row">
                <span className="detail-label">Responded:</span>
                <span className="detail-value">{formatDate(contact.responded_at)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="detail-section">
            <div className="detail-actions">
              <button
                className="action-btn delete"
                onClick={() => onDelete(contact.id)}
                style={{marginLeft: 'auto'}}
              >
                <i className="fas fa-trash"></i>
                Delete Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;
