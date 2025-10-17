import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import './AdminContracts.css';

const AdminContracts = () => {
  const [activeTab, setActiveTab] = useState('contracts');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const queryClient = useQueryClient();
  const signatureCanvasRef = useRef(null);

  // Mock data for demonstration - replace with actual API calls
  const mockContracts = [
    {
      id: 1,
      title: 'Supplier Agreement - ABC Corp',
      type: 'Supplier',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      value: 50000,
      renewalDate: '2025-01-15',
      signedBy: 'John Doe',
      signedDate: '2024-01-15',
      template: 'supplier-agreement',
      digitalSignature: true,
      reminderSent: false
    },
    {
      id: 2,
      title: 'Service Contract - XYZ Ltd',
      type: 'Service',
      status: 'pending',
      startDate: '2024-03-01',
      endDate: '2025-03-01',
      value: 25000,
      renewalDate: '2025-03-01',
      signedBy: null,
      signedDate: null,
      template: 'service-contract',
      digitalSignature: false,
      reminderSent: false
    },
    {
      id: 3,
      title: 'Partnership Agreement - Tech Solutions',
      type: 'Partnership',
      status: 'expired',
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      value: 100000,
      renewalDate: '2024-06-01',
      signedBy: 'Jane Smith',
      signedDate: '2023-06-01',
      template: 'partnership-agreement',
      digitalSignature: true,
      reminderSent: true
    }
  ];

  const mockTemplates = [
    { id: 1, name: 'Supplier Agreement', category: 'Procurement', usage: 15 },
    { id: 2, name: 'Service Contract', category: 'Services', usage: 8 },
    { id: 3, name: 'Partnership Agreement', category: 'Partnerships', usage: 3 },
    { id: 4, name: 'NDA Template', category: 'Legal', usage: 12 },
    { id: 5, name: 'Employment Contract', category: 'HR', usage: 25 }
  ];

  // Filter contracts based on search and filters
  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesExpiry = expiryFilter === 'all' || 
                         (expiryFilter === 'expiring' && new Date(contract.renewalDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) ||
                         (expiryFilter === 'expired' && new Date(contract.renewalDate) < new Date());
    return matchesSearch && matchesStatus && matchesExpiry;
  });

  const handleCreateTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleDigitalSignature = (contract) => {
    setSelectedContract(contract);
    setShowSignatureModal(true);
  };

  const handleSendReminder = (contract) => {
    toast.success(`Renewal reminder sent for ${contract.title}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      pending: '#f59e0b',
      expired: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (date) => {
    const expiryDate = new Date(date);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  };

  const isExpired = (date) => {
    return new Date(date) < new Date();
  };

  return (
    <div className="admin-contracts">
      {/* Header */}
      <div className="contracts-header">
        <div>
          <h1>📄 Contracts Management</h1>
          <p>Manage business contracts and legal agreements</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleCreateTemplate}>
            📋 Create Template
          </button>
          <button className="btn-secondary">
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="contracts-tabs">
        <button 
          className={activeTab === 'contracts' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('contracts')}
        >
          📄 Contracts ({filteredContracts.length})
        </button>
        <button 
          className={activeTab === 'templates' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('templates')}
        >
          📋 Templates ({mockTemplates.length})
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="contracts-content">
          {/* Filters and Search */}
          <div className="contracts-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select 
                value={expiryFilter} 
                onChange={(e) => setExpiryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Expiry</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="contracts-table-container">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Renewal Date</th>
                  <th>Digital Signature</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className={isExpiringSoon(contract.renewalDate) ? 'expiring-row' : ''}>
                    <td>
                      <div className="contract-info">
                        <strong>{contract.title}</strong>
                        <div className="contract-dates">
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </div>
                        {isExpiringSoon(contract.renewalDate) && (
                          <span className="expiry-warning">⚠️ Expires Soon</span>
                        )}
                        {isExpired(contract.renewalDate) && (
                          <span className="expired-warning">❌ Expired</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="contract-type">{contract.type}</span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(contract.status) }}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td>
                      <strong>{formatCurrency(contract.value)}</strong>
                    </td>
                    <td>
                      <div className="renewal-info">
                        {formatDate(contract.renewalDate)}
                        {!contract.reminderSent && !isExpired(contract.renewalDate) && (
                          <button 
                            className="reminder-btn"
                            onClick={() => handleSendReminder(contract)}
                            title="Send renewal reminder"
                          >
                            📅
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="signature-status">
                        {contract.digitalSignature ? (
                          <span className="signed">✅ Signed</span>
                        ) : (
                          <button 
                            className="sign-btn"
                            onClick={() => handleDigitalSignature(contract)}
                          >
                            ✍️ Sign
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-view" title="View Contract">👁️</button>
                        <button className="btn-edit" title="Edit Contract">✏️</button>
                        <button className="btn-download" title="Download PDF">📥</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="templates-content">
          <div className="templates-grid">
            {mockTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h3>{template.name}</h3>
                  <span className="template-category">{template.category}</span>
                </div>
                <div className="template-stats">
                  <div className="stat">
                    <span className="stat-number">{template.usage}</span>
                    <span className="stat-label">Times Used</span>
                  </div>
                </div>
                <div className="template-actions">
                  <button className="btn-primary">Use Template</button>
                  <button className="btn-secondary">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-content">
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>📊 Contract Overview</h3>
              <div className="metric">
                <span className="metric-value">{mockContracts.length}</span>
                <span className="metric-label">Total Contracts</span>
              </div>
              <div className="metric">
                <span className="metric-value">{mockContracts.filter(c => c.status === 'active').length}</span>
                <span className="metric-label">Active</span>
              </div>
              <div className="metric">
                <span className="metric-value">{mockContracts.filter(c => isExpiringSoon(c.renewalDate)).length}</span>
                <span className="metric-label">Expiring Soon</span>
              </div>
            </div>
            
            <div className="analytics-card">
              <h3>💰 Contract Values</h3>
              <div className="metric">
                <span className="metric-value">
                  {formatCurrency(mockContracts.reduce((sum, c) => sum + c.value, 0))}
                </span>
                <span className="metric-label">Total Value</span>
              </div>
              <div className="metric">
                <span className="metric-value">
                  {formatCurrency(mockContracts.reduce((sum, c) => sum + c.value, 0) / mockContracts.length)}
                </span>
                <span className="metric-label">Average Value</span>
        </div>
      </div>

            <div className="analytics-card">
              <h3>✍️ Digital Signatures</h3>
              <div className="metric">
                <span className="metric-value">
                  {Math.round((mockContracts.filter(c => c.digitalSignature).length / mockContracts.length) * 100)}%
                </span>
                <span className="metric-label">Signed Digitally</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Modal */}
      {showSignatureModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>✍️ Digital Signature</h3>
              <button onClick={() => setShowSignatureModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Sign contract: <strong>{selectedContract?.title}</strong></p>
              <div className="signature-pad">
                <canvas 
                  ref={signatureCanvasRef}
                  width="400"
                  height="200"
                  style={{ border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div className="signature-actions">
                <button className="btn-secondary">Clear</button>
                <button className="btn-primary">Save Signature</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>📋 Create Contract Template</h3>
              <button onClick={() => setShowTemplateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="template-form">
                <div className="form-group">
                  <label>Template Name</label>
                  <input type="text" placeholder="Enter template name" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select>
                    <option>Procurement</option>
                    <option>Services</option>
                    <option>Partnerships</option>
                    <option>Legal</option>
                    <option>HR</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Template Content</label>
                  <textarea rows="10" placeholder="Enter contract template content..."></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowTemplateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Template
                  </button>
                </div>
              </form>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};

export default AdminContracts;
