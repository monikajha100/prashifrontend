import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { visitorAPI, adminAPI } from '../../services/api';

const WorkingAdminDashboard = () => {
  // Fetch dashboard stats from API
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery(
    'adminDashboard',
    async () => {
      const response = await adminAPI.getDashboard();
      return response?.data ?? {};
    },
    {
      refetchInterval: 60000, // Refetch every minute
      refetchOnWindowFocus: true
    }
  );

  const { data: visitorStats, isLoading: visitorLoading, error: visitorError } = useQuery(
    'adminVisitorStats',
    async () => {
      const response = await visitorAPI.getStats();
      return response?.data?.data ?? response?.data ?? {};
    },
    {
      refetchInterval: 30000,
      refetchOnWindowFocus: false
    }
  );

  const visitorFormatter = useMemo(() => new Intl.NumberFormat('en-IN'), []);

  const normalizeCount = (value) => {
    const numeric = Number(
      value ?? 0
    );
    if (!Number.isFinite(numeric) || numeric < 0) {
      return 0;
    }
    return numeric;
  };

  const totalVisitorsValue = normalizeCount(
    visitorStats?.totalVisitors ?? visitorStats?.total_visitors
  );
  const todayVisitorsValue = normalizeCount(
    visitorStats?.todayVisitors ?? visitorStats?.today_visitors
  );

  const formattedTotalVisitors = visitorLoading
    ? '...'
    : visitorFormatter.format(totalVisitorsValue);
  const formattedTodayVisitors = visitorLoading
    ? '...'
    : visitorFormatter.format(todayVisitorsValue);

  const lastVisitRaw = visitorStats?.lastVisitAt ?? visitorStats?.last_visit_at;
  const formattedLastUpdate = useMemo(() => {
    if (!lastVisitRaw) return null;
    const parsed = new Date(lastVisitRaw);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [lastVisitRaw]);

  // Use real data from API or fallback to defaults
  const stats = dashboardData?.stats || {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  };
  const recentOrders = dashboardData?.recentOrders || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];

  const statCards = [
    {
      title: 'Total Products',
      value: dashboardLoading ? '...' : stats.totalProducts,
      icon: '📦',
      color: '#D4AF37',
      bgColor: 'rgba(212, 175, 55, 0.1)'
    },
    {
      title: 'Total Orders',
      value: dashboardLoading ? '...' : stats.totalOrders,
      icon: '🛒',
      color: '#28a745',
      bgColor: 'rgba(40, 167, 69, 0.1)'
    },
    {
      title: 'Total Users',
      value: dashboardLoading ? '...' : stats.totalUsers,
      icon: '👥',
      color: '#007bff',
      bgColor: 'rgba(0, 123, 255, 0.1)'
    },
    {
      title: 'Total Revenue',
      value: dashboardLoading ? '...' : `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: '💰',
      color: '#dc3545',
      bgColor: 'rgba(220, 53, 69, 0.1)'
    }
  ];

  // Show error message if dashboard fails to load
  if (dashboardError) {
    console.error('Dashboard error:', dashboardError);
  }

  return (
    <div style={{ padding: '20px', background: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#2C2C2C',
            marginBottom: '10px',
            fontFamily: "'Cormorant Garamond', serif"
          }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Welcome to the working admin panel
          </p>
          {dashboardError && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              background: '#f8d7da',
              color: '#721c24',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              ⚠️ Unable to load dashboard data. Please refresh the page.
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <div 
                style={{ 
                  backgroundColor: stat.bgColor,
                  color: stat.color,
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}
              >
                {stat.icon}
              </div>
              <div>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#2C2C2C',
                  margin: '0 0 5px 0'
                }}>
                  {stat.value}
                </h3>
                <p style={{
                  color: '#666',
                  margin: '0',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {stat.title}
                </p>
              </div>
            </div>
          ))}
          <div
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '25px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div
              style={{
                backgroundColor: 'rgba(111, 66, 193, 0.1)',
                color: '#6f42c1',
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}
            >
              👁️
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#2C2C2C',
                margin: '0 0 5px 0',
                fontFamily: "'Cormorant Garamond', serif"
              }}>
                {formattedTotalVisitors}
              </h3>
              <p style={{
                color: '#666',
                margin: '0 0 12px 0',
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Total Visitors
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.95rem'
              }}>
                <span style={{ color: '#6f42c1', fontWeight: 600 }}>Today:</span>
                <span style={{ color: '#2C2C2C', fontWeight: 600 }}>{formattedTodayVisitors}</span>
              </div>
              {!visitorLoading && visitorError && (
                <p style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '12px' }}>
                  Unable to fetch latest visitor stats.
                </p>
              )}
              {!visitorLoading && !visitorError && formattedLastUpdate && (
                <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '12px' }}>
                  Updated: {formattedLastUpdate}
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px'
        }}>
          {/* Recent Orders */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2C2C2C',
                margin: '0'
              }}>
                Recent Orders
              </h2>
              <button style={{
                background: 'none',
                border: 'none',
                color: '#D4AF37',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                View All
              </button>
            </div>
            
            <div>
              {dashboardLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  Loading orders...
                </div>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                <div key={order.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: '#2C2C2C',
                      margin: '0 0 5px 0'
                    }}>
                      {order.order_number || `#${order.id}`}
                    </p>
                    <p style={{
                      color: '#666',
                      fontSize: '0.9rem',
                      margin: '0'
                    }}>
                      {order.customer_name || order.user_name || 'Guest'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: '600',
                      color: '#2C2C2C',
                      margin: '0 0 5px 0'
                    }}>
                      ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                    </p>
                    <span style={{
                      background: order.status === 'completed' ? '#d4edda' : 
                                 order.status === 'processing' ? '#fff3cd' :
                                 order.status === 'shipped' ? '#cce5ff' : '#f8d7da',
                      color: order.status === 'completed' ? '#155724' : 
                             order.status === 'processing' ? '#856404' :
                             order.status === 'shipped' ? '#004085' : '#721c24',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No recent orders
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2C2C2C',
                margin: '0'
              }}>
                Low Stock Alert
              </h2>
              <button style={{
                background: 'none',
                border: 'none',
                color: '#D4AF37',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Manage Stock
              </button>
            </div>
            
            <div>
              {dashboardLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  Loading products...
                </div>
              ) : lowStockProducts.length > 0 ? (
                lowStockProducts.map((product) => (
                <div key={product.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: '#2C2C2C',
                      margin: '0 0 5px 0'
                    }}>
                      {product.name}
                    </p>
                    <p style={{
                      color: '#666',
                      fontSize: '0.9rem',
                      margin: '0'
                    }}>
                      Min Stock: 5
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      background: product.stock_quantity <= 2 ? '#f8d7da' : '#fff3cd',
                      color: product.stock_quantity <= 2 ? '#721c24' : '#856404',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      {product.stock_quantity || 0} left
                    </span>
                  </div>
                </div>
              ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No low stock products
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div style={{
          marginTop: '40px',
          background: '#d4edda',
          color: '#155724',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>✅ Admin Panel Working!</h3>
          <p style={{ margin: '0' }}>
            This is a working admin dashboard with sample data. No database connection required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkingAdminDashboard;
