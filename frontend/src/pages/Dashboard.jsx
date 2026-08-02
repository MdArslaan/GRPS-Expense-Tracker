import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package,
  DollarSign
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Sales',
        data: [65000, 59000, 80000, 81000, 56000, 95000, 110000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      },
      {
        label: 'Purchases',
        data: [45000, 48000, 40000, 69000, 46000, 65000, 80000],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4
      }
    ]
  };

  const barChartData = {
    labels: ['Laptop', 'Smartphone', 'Headphones', 'Monitor', 'Keyboard'],
    datasets: [
      {
        label: 'Top Selling Products',
        data: [120, 190, 300, 150, 200],
        backgroundColor: '#8b5cf6',
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8' } }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, here is what's happening today.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <ShoppingCart size={18} /> New Sale
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Total Sales</span>
            <div className="stat-icon" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value">$124,500</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>+12.5% from last month</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Total Purchases</span>
            <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="stat-value">$84,200</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>+5.2% from last month</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Total Outstanding</span>
            <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">$12,450</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>Requires attention</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-header">
            <span>Low Stock Items</span>
            <div className="stat-icon" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">8 Items</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock below threshold</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Sales vs Purchases</h3>
          <div style={{ height: '300px' }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Top Products</h3>
          <div style={{ height: '300px' }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
