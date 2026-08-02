import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // States for Reports
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [reportType, setReportType] = useState(''); // '' = All (Closing Balance), 'purchase' = Purchase Only, 'sale' = Sale Only
  const [reportMonth, setReportMonth] = useState('all');

  // States for Details
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [monthTransactions, setMonthTransactions] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/transactions/stats?year=${year}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats', error);
      }
      setLoading(false);
    };

    if (user?.token) {
      fetchStats();
      const fetchUsers = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/users', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setUsers(res.data);
        } catch (err) {
          console.error('Error fetching users', err);
        }
      };
      fetchUsers();
    }
  }, [user, year]);

  const handleRowClick = async (monthNumber) => {
    if (expandedMonth === monthNumber) {
      setExpandedMonth(null);
      setMonthTransactions([]);
      return;
    }

    setExpandedMonth(monthNumber);
    setLoadingDetails(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/transactions?month=${monthNumber}&year=${year}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMonthTransactions(res.data);
    } catch (error) {
      console.error('Error fetching month details', error);
    }
    setLoadingDetails(false);
  };

  const downloadFormattedReport = async () => {
    try {
      let url = `http://localhost:5000/api/transactions?year=${year}`;
      let title = "Stock Summary";
      let dateRange = "All Time";

      if (reportMonth !== 'all') {
        url += `&month=${reportMonth}`;
        dateRange = `${months[parseInt(reportMonth) - 1]} ${year}`;
      }

      if (selectedUserId) {
        url += `&userId=${selectedUserId}`;
        const selectedUser = users.find(u => u._id === selectedUserId);
        title = `Worker Report - ${selectedUser?.username || 'Unknown'}`;
      } else if (reportType === 'purchase') {
        title = "Purchase Report";
      } else if (reportType === 'sale') {
        title = "Sales Report";
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const transactions = res.data;

      // Grouping data
      const groupedData = {};
      transactions.forEach(t => {
         // Filter by type if a specific type is selected
         if (reportType && t.type !== reportType) return;

         const cat = t.productCategory.toUpperCase();
         if (!groupedData[cat]) groupedData[cat] = {};
         
         const subCat = `${t.thickness ? t.thickness : ''} ${t.size ? t.size : ''}`.trim() || 'General';
         if (!groupedData[cat][subCat]) {
            groupedData[cat][subCat] = { quantity: 0, amount: 0 };
         }
         
         const multiplier = (!reportType && t.type === 'sale') ? -1 : 1;
         
         groupedData[cat][subCat].quantity += (t.quantity * multiplier);
         groupedData[cat][subCat].amount += (t.amount * multiplier);
      });

      const doc = new jsPDF();
      
      // Header matching the requested format
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('GRPS PLYWOOD AND LAMINATES', 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('A-1/22, Warehousing Scheme Kirti Nagar', 105, 21, { align: 'center' });
      doc.text('Basement Florr, Marble Market,', 105, 26, { align: 'center' });
      doc.text('New Delhi', 105, 31, { align: 'center' });
      doc.text('UDYAM : UDYAM-DL-10-0108822 (Micro/Traders)', 105, 36, { align: 'center' });
      doc.text('Contact : 9811060872,+91-9811060872', 105, 41, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 105, 50, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(dateRange, 105, 55, { align: 'center' });

      // Table formatting
      let tableRows = [];
      let totalAmount = 0;
      
      Object.keys(groupedData).sort().forEach(cat => {
         tableRows.push([
           { content: cat, styles: { fontStyle: 'bold' } },
           '', '', ''
         ]);

         let catQty = 0;
         let catAmt = 0;

         Object.keys(groupedData[cat]).sort().forEach(subCat => {
            const data = groupedData[cat][subCat];
            if (data.quantity === 0 && data.amount === 0) return; // Skip empty rows

            const rate = data.quantity !== 0 ? Math.abs(data.amount / data.quantity).toFixed(2) : '0.00';
            
            tableRows.push([
               { content: `   ${subCat}`, styles: { fontStyle: 'italic' } },
               `${data.quantity}`,
               `${rate}`,
               `${data.amount.toFixed(2)}`
            ]);
            catQty += data.quantity;
            catAmt += data.amount;
            totalAmount += data.amount;
         });
      });

      autoTable(doc, {
        startY: 62,
        head: [['Particulars', reportType === '' ? 'Closing Balance\nQuantity' : 'Quantity', 'Rate', 'Value']],
        body: tableRows,
        theme: 'plain',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: { bottom: 0.5 }, lineColor: [0,0,0], halign: 'center' },
        bodyStyles: { textColor: [0, 0, 0], fontSize: 10 },
        columnStyles: {
           0: { halign: 'left' },
           1: { halign: 'right' },
           2: { halign: 'right' },
           3: { halign: 'right' }
        },
      });

      const finalY = doc.lastAutoTable.finalY || 65;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Value: ${totalAmount.toFixed(2)}`, 195, finalY + 10, { align: 'right' });

      doc.save(`${title.replace(/ /g, '_')}_Report.pdf`);
    } catch (error) {
      console.error('Error downloading report', error);
      alert('Failed to generate report');
    }
  };

  const purchaseData = {
    labels: months,
    datasets: [
      {
        label: 'Total Purchase Amount (₹)',
        data: stats.map(s => s.purchase.amount),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const saleData = {
    labels: months,
    datasets: [
      {
        label: 'Total Sale Amount (₹)',
        data: stats.map(s => s.sale.amount),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#e2e8f0' } },
      title: { display: false },
    },
    scales: {
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  return (
    <div className="dashboard-container admin-mode">
      <div className="dashboard-header flex-between">
        <div>
          <h1>Admin Overview</h1>
          <p>Monthly Purchase & Sale Insights</p>
        </div>
        <div className="year-selector">
          <label>Year: </label>
          <input 
            type="number" 
            value={year} 
            onChange={(e) => setYear(e.target.value)} 
            className="modern-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading Data...</div>
      ) : (
        <div className="charts-grid">
          <div className="card glassmorphism chart-card">
            <h3>Monthly Purchases ({year})</h3>
            <div className="chart-wrapper">
              <Bar options={chartOptions} data={purchaseData} />
            </div>
          </div>

          <div className="card glassmorphism chart-card">
            <h3>Monthly Sales ({year})</h3>
            <div className="chart-wrapper">
              <Bar options={chartOptions} data={saleData} />
            </div>
          </div>
        </div>
      )}

      {/* Reports Generation Section */}
      <div className="card glassmorphism mt-8">
        <h3>Generate Formatted PDF Reports</h3>
        <div className="flex-between" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
          
          <div className="input-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Month</label>
            <select className="modern-input" style={{ width: '100%' }} value={reportMonth} onChange={(e) => setReportMonth(e.target.value)}>
              <option value="all">All Months ({year})</option>
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>

          <div className="input-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Worker (Individual)</label>
            <select className="modern-input" style={{ width: '100%' }} value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">All Workers</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
            </select>
          </div>

          <div className="input-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Report Type</label>
            <select className="modern-input" style={{ width: '100%' }} value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="">Stock Summary (Net Closing Balance)</option>
              <option value="purchase">Total Purchases</option>
              <option value="sale">Total Sales</option>
            </select>
          </div>

          <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'flex-end' }}>
            <button className="primary-btn flex-center" onClick={downloadFormattedReport} style={{ height: '42px', marginTop: '1.5rem' }}>
              <Download size={18} className="mr-2" /> Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="card glassmorphism mt-8">
        <h3>Detailed Monthly Breakdown</h3>
        <div className="table-responsive">
          <table className="custom-table admin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th colSpan="2" className="text-center purchase-header">Purchases</th>
                <th colSpan="2" className="text-center sale-header">Sales</th>
              </tr>
              <tr>
                <th></th>
                <th>Quantity</th>
                <th>Amount (₹)</th>
                <th>Quantity</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <React.Fragment key={stat.month}>
                  <tr onClick={() => handleRowClick(stat.month)} style={{ cursor: 'pointer' }}>
                    <td className="font-bold">{months[index]} {expandedMonth === stat.month ? '▼' : '▶'}</td>
                    <td className="text-red-400">{stat.purchase.quantity}</td>
                    <td className="text-red-400 font-semibold">₹{stat.purchase.amount.toLocaleString()}</td>
                    <td className="text-green-400">{stat.sale.quantity}</td>
                    <td className="text-green-400 font-semibold">₹{stat.sale.amount.toLocaleString()}</td>
                  </tr>
                  {expandedMonth === stat.month && (
                    <tr>
                      <td colSpan="5" style={{ padding: 0, borderBottom: 'none' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', margin: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <h4 style={{ marginBottom: '1rem', color: '#e2e8f0', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Detailed Transactions - {months[index]} {year}</span>
                            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{monthTransactions.length} records</span>
                          </h4>
                          
                          {loadingDetails ? (
                            <div className="text-center py-4" style={{ color: '#94a3b8' }}>Loading details...</div>
                          ) : monthTransactions.length === 0 ? (
                            <div className="text-center py-4" style={{ color: '#94a3b8' }}>No transactions found for this month.</div>
                          ) : (
                            <div className="table-responsive">
                              <table className="custom-table">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Product</th>
                                    <th>Thickness</th>
                                    <th>Size</th>
                                    <th>Qty</th>
                                    <th>Amount (₹)</th>
                                    <th>Added By</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {monthTransactions.map(t => (
                                    <tr key={t._id}>
                                      <td>{new Date(t.date).toLocaleDateString()}</td>
                                      <td>
                                        <span className={`badge ${t.type}`}>{t.type}</span>
                                      </td>
                                      <td>{t.productCategory}</td>
                                      <td>{t.thickness || '-'}</td>
                                      <td>{t.size || '-'}</td>
                                      <td>{t.quantity}</td>
                                      <td>₹{t.amount.toLocaleString()}</td>
                                      <td>{t.addedBy?.username || 'Unknown'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
