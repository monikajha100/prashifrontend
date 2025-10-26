import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/api';
import './AdminReports.css';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  
  // Data states
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [growthData, setGrowthData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, period]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: customDateRange.start && customDateRange.end 
          ? { startDate: customDateRange.start, endDate: customDateRange.end }
          : { period }
      };

      let response;
      switch (activeTab) {
        case 'sales':
          response = await axios.get(`${API_BASE_URL}/reports/sales`, config);
          setSalesData(response.data);
          break;
        case 'customers':
          response = await axios.get(`${API_BASE_URL}/reports/customers`, config);
          setCustomerData(response.data);
          break;
        case 'orders':
          response = await axios.get(`${API_BASE_URL}/reports/orders`, config);
          setOrderData(response.data);
          break;
        case 'growth':
          response = await axios.get(`${API_BASE_URL}/reports/growth`, config);
          setGrowthData(response.data);
          break;
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportType) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        format: 'csv',
        ...(customDateRange.start && customDateRange.end 
          ? { startDate: customDateRange.start, endDate: customDateRange.end }
          : {})
      });

      const response = await axios.get(
        `${API_BASE_URL}/reports/export/${reportType}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatNumber = (num) => {
    return parseFloat(num || 0).toLocaleString('en-IN');
  };

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <div>
          <h1>📈 Reports & Analytics</h1>
          <p>Comprehensive business insights and performance metrics</p>
        </div>
        <div className="date-filter">
          <select 
            value={period} 
            onChange={(e) => {
              setPeriod(e.target.value);
              if (e.target.value !== 'custom') {
                setCustomDateRange({ start: '', end: '' });
              }
            }}
            className="period-select"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {period === 'custom' && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                placeholder="Start Date"
              />
              <span>to</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                placeholder="End Date"
              />
              <button onClick={fetchReportData} className="apply-btn">Apply</button>
            </div>
          )}
        </div>
      </div>

      <div className="reports-tabs">
        {[
          { id: 'sales', label: '💰 Sales Reports', icon: '💰' },
          { id: 'customers', label: '📊 Customer Analytics', icon: '📊' },
          { id: 'orders', label: '🛒 Order Analytics', icon: '🛒' },
          { id: 'growth', label: '📈 Growth Metrics', icon: '📈' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading report data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchReportData} className="retry-btn">Retry</button>
        </div>
      ) : (
        <div className="reports-content">
          {activeTab === 'sales' && salesData && (
            <SalesReport data={salesData} onExport={() => handleExport('sales')} formatCurrency={formatCurrency} formatNumber={formatNumber} />
          )}
          {activeTab === 'customers' && customerData && (
            <CustomerReport data={customerData} onExport={() => handleExport('customers')} formatCurrency={formatCurrency} formatNumber={formatNumber} />
          )}
          {activeTab === 'orders' && orderData && (
            <OrderReport data={orderData} formatNumber={formatNumber} />
          )}
          {activeTab === 'growth' && growthData && (
            <GrowthReport data={growthData} formatCurrency={formatCurrency} formatNumber={formatNumber} />
          )}
        </div>
      )}
    </div>
  );
};

// Sales Report Component
const SalesReport = ({ data, onExport, formatCurrency, formatNumber }) => {
  const summary = data.summary || {};
  
  return (
    <div className="report-section">
      <div className="section-header">
        <h2>Sales Performance</h2>
        <button onClick={onExport} className="export-btn">📱 Export CSV</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(summary.total_revenue)}</p>
            <span className="stat-label">Total sales amount</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{formatNumber(summary.total_orders)}</p>
            <span className="stat-label">Completed orders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Avg Order Value</h3>
            <p className="stat-value">{formatCurrency(summary.avg_order_value)}</p>
            <span className="stat-label">Per transaction</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-value">{formatNumber(summary.total_customers)}</p>
            <span className="stat-label">Unique buyers</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Daily Sales Trend</h3>
          <div className="simple-chart">
            {data.dailySales && data.dailySales.slice(0, 15).reverse().map((day, idx) => (
              <div key={idx} className="chart-bar-container">
                <div className="chart-label">{new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ 
                      width: `${(day.revenue / Math.max(...data.dailySales.map(d => d.revenue)) * 100)}%`,
                      background: '#D4AF37'
                    }}
                  ></div>
                  <span className="chart-value">{formatCurrency(day.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Payment Methods</h3>
          <div className="pie-chart-container">
            {data.salesByPaymentMethod && data.salesByPaymentMethod.map((method, idx) => (
              <div key={idx} className="pie-item">
                <div className="pie-color" style={{ background: ['#D4AF37', '#28a745', '#007bff'][idx % 3] }}></div>
                <span className="pie-label">{method.payment_method || 'COD'}</span>
                <span className="pie-value">{formatCurrency(method.revenue)}</span>
                <span className="pie-count">({formatNumber(method.orders)} orders)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-card">
        <h3>Top Selling Products</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts && data.topProducts.map((product, idx) => (
                <tr key={idx}>
                  <td>{product.product_name}</td>
                  <td>{formatNumber(product.total_quantity)}</td>
                  <td>{formatCurrency(product.total_revenue)}</td>
                  <td>{formatNumber(product.order_count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Customer Report Component
const CustomerReport = ({ data, onExport, formatCurrency, formatNumber }) => {
  const summary = data.summary || {};
  
  return (
    <div className="report-section">
      <div className="section-header">
        <h2>Customer Analytics</h2>
        <button onClick={onExport} className="export-btn">📱 Export CSV</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Customers</h3>
            <p className="stat-value">{formatNumber(summary.total_customers)}</p>
            <span className="stat-label">All registered users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <h3>New Customers (30d)</h3>
            <p className="stat-value">{formatNumber(summary.new_customers_30d)}</p>
            <span className="stat-label">Recent registrations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💚</div>
          <div className="stat-content">
            <h3>Active Customers</h3>
            <p className="stat-value">{formatNumber(summary.active_customers)}</p>
            <span className="stat-label">Currently active</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Customer Registration Trend</h3>
          <div className="simple-chart">
            {data.customerTrend && data.customerTrend.slice(0, 15).reverse().map((day, idx) => (
              <div key={idx} className="chart-bar-container">
                <div className="chart-label">{new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ 
                      width: `${(day.new_customers / Math.max(...data.customerTrend.map(d => d.new_customers)) * 100)}%`,
                      background: '#007bff'
                    }}
                  ></div>
                  <span className="chart-value">{formatNumber(day.new_customers)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Customer Lifetime Value</h3>
          <div className="pie-chart-container">
            {data.customerLTVDistribution && data.customerLTVDistribution.map((ltv, idx) => (
              <div key={idx} className="pie-item">
                <div className="pie-color" style={{ background: ['#dc3545', '#ffc107', '#28a745', '#007bff', '#D4AF37'][idx % 5] }}></div>
                <span className="pie-label">{ltv.ltv_range}</span>
                <span className="pie-value">{formatNumber(ltv.customer_count)} customers</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-card">
        <h3>Top Customers</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {data.topCustomers && data.topCustomers.map((customer, idx) => (
                <tr key={idx}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{formatNumber(customer.total_orders)}</td>
                  <td>{formatCurrency(customer.total_spent)}</td>
                  <td>{new Date(customer.last_order_date).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Order Report Component
const OrderReport = ({ data, formatNumber }) => {
  const summary = data.summary || {};
  
  return (
    <div className="report-section">
      <div className="section-header">
        <h2>Order Analytics</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{formatNumber(summary.total_orders)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Avg Fulfillment Time</h3>
            <p className="stat-value">{parseFloat(summary.avg_fulfillment_time_hours || 0).toFixed(1)} hrs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Avg Items/Order</h3>
            <p className="stat-value">{parseFloat(summary.avg_items_per_order || 0).toFixed(1)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Delivered</h3>
            <p className="stat-value">{formatNumber(summary.delivered_orders)}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Orders by Day of Week</h3>
          <div className="simple-chart">
            {data.ordersByDayOfWeek && data.ordersByDayOfWeek.map((day, idx) => (
              <div key={idx} className="chart-bar-container">
                <div className="chart-label">{day.day_name}</div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ 
                      width: `${(day.order_count / Math.max(...data.ordersByDayOfWeek.map(d => d.order_count)) * 100)}%`,
                      background: '#28a745'
                    }}
                  ></div>
                  <span className="chart-value">{formatNumber(day.order_count)} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Orders by Hour</h3>
          <div className="simple-chart" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {data.ordersByHour && data.ordersByHour.map((hour, idx) => (
              <div key={idx} className="chart-bar-container">
                <div className="chart-label">{hour.hour}:00</div>
                <div className="chart-bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ 
                      width: `${(hour.order_count / Math.max(...data.ordersByHour.map(h => h.order_count)) * 100)}%`,
                      background: '#ffc107'
                    }}
                  ></div>
                  <span className="chart-value">{formatNumber(hour.order_count)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Growth Report Component
const GrowthReport = ({ data, formatCurrency, formatNumber }) => {
  const metrics = data.growthMetrics || {};
  
  return (
    <div className="report-section">
      <div className="section-header">
        <h2>Growth Metrics</h2>
      </div>

      <div className="growth-comparison">
        <h3>This Month vs Last Month</h3>
        <div className="comparison-grid">
          <div className="comparison-card">
            <h4>Orders</h4>
            <div className="comparison-values">
              <div className="current-value">
                <span className="label">This Month</span>
                <span className="value">{formatNumber(metrics.orders?.current)}</span>
              </div>
              <div className="growth-indicator">
                <span className={`growth-badge ${parseFloat(metrics.orders?.growth) >= 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(metrics.orders?.growth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(metrics.orders?.growth || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="last-value">
                <span className="label">Last Month</span>
                <span className="value">{formatNumber(metrics.orders?.last)}</span>
              </div>
            </div>
          </div>

          <div className="comparison-card">
            <h4>Revenue</h4>
            <div className="comparison-values">
              <div className="current-value">
                <span className="label">This Month</span>
                <span className="value">{formatCurrency(metrics.revenue?.current)}</span>
              </div>
              <div className="growth-indicator">
                <span className={`growth-badge ${parseFloat(metrics.revenue?.growth) >= 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(metrics.revenue?.growth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(metrics.revenue?.growth || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="last-value">
                <span className="label">Last Month</span>
                <span className="value">{formatCurrency(metrics.revenue?.last)}</span>
              </div>
            </div>
          </div>

          <div className="comparison-card">
            <h4>Customers</h4>
            <div className="comparison-values">
              <div className="current-value">
                <span className="label">This Month</span>
                <span className="value">{formatNumber(metrics.customers?.current)}</span>
              </div>
              <div className="growth-indicator">
                <span className={`growth-badge ${parseFloat(metrics.customers?.growth) >= 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(metrics.customers?.growth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(metrics.customers?.growth || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="last-value">
                <span className="label">Last Month</span>
                <span className="value">{formatNumber(metrics.customers?.last)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <h3>Monthly Revenue Trend (Last 12 Months)</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyRevenueTrend && data.monthlyRevenueTrend.map((month, idx) => (
                <tr key={idx}>
                  <td>{month.month}</td>
                  <td>{formatNumber(month.orders)}</td>
                  <td>{formatCurrency(month.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card">
        <h3>Category Performance</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.categoryPerformance && data.categoryPerformance.map((cat, idx) => (
                <tr key={idx}>
                  <td>{cat.category_name}</td>
                  <td>{formatNumber(cat.products_count)}</td>
                  <td>{formatNumber(cat.units_sold)}</td>
                  <td>{formatCurrency(cat.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
