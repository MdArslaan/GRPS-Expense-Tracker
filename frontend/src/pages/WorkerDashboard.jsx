import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const WorkerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    type: 'purchase',
    productCategory: 'Plywood',
    thickness: '',
    size: '',
    quantity: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);

  const productCategories = ['Door', 'Plywood', 'Flexi', 'PVC', 'HDMR', 'Laminates', 'MDF', 'Teak Ply', 'Natural Ply', 'Royal Club Ply', 'Clubwood'];
  
  const thicknesses = ['1.9mm', '2.1mm', '3mm', '3.3mm', '4mm', '4.6mm', '5.5mm', '6mm', '7.3mm', '7.5mm', '9mm', '9.75mm', '11mm', '12mm', '14.5mm', '16mm', '16.5mm', '16.75mm', '17mm', '18mm', '19 BB', '22mm', '25mm', '25m BB', '30mm'];
  
  const sizes = ['8x4', '10x4', '78x24', '78x27', '78x30', '78x33', '78x36', '78x39', '78x42', '78x45', '78x48', '82x24', '82x27', '82x30', '82x33', '82x36', '82x39', '82x42', '82x45', '82x48', '87x24', '87x27', '87x30', '87x33', '87x36', '87x39', '87x42', '87x45', '87x48', '90x24', '90x27', '90x30', '90x33', '90x36', '90x39', '90x42', '90x45', '90x48', '93x24', '93x27', '93x30', '93x33', '93x36', '93x39', '93x42', '93x45', '93x48'];

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchTransactions();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error('Please enter a valid quantity greater than 0.');
      return;
    }

    if (!formData.amount || Number(formData.amount) < 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/transactions`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Record added successfully!');
      setFormData({ ...formData, thickness: '', size: '', quantity: '', amount: '' }); // Reset fields
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction', error);
      toast.error(error.response?.data?.message || 'Failed to add record.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${API_URL}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success('Record deleted successfully!');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction', error);
      toast.error('Failed to delete record.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Worker Dashboard</h1>
        <p>Manage Purchases & Sales</p>
      </div>

      <div className="card glassmorphism mb-8">
        <h3>Add New Record</h3>
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
            </select>
          </div>
          
          <div className="input-group">
            <label>Product Category</label>
            <select name="productCategory" value={formData.productCategory} onChange={handleChange}>
              {productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Thickness (Optional)</label>
            <select name="thickness" value={formData.thickness} onChange={handleChange}>
              <option value="">Select Thickness</option>
              {thicknesses.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Size (Optional)</label>
            <select name="size" value={formData.size} onChange={handleChange}>
              <option value="">Select Size</option>
              {sizes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Quantity</label>
            <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Amount (₹)</label>
            <input type="number" name="amount" min="0" step="0.01" value={formData.amount} onChange={handleChange} required />
          </div>

          <button type="submit" className="primary-btn submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Record'}
          </button>
        </form>
      </div>

      <div className="card glassmorphism">
        <h3>Recent Records</h3>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Thickness</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Added By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${t.type}`}>{t.type}</span>
                  </td>
                  <td>{t.productCategory}</td>
                  <td>{t.thickness || '-'}</td>
                  <td>{t.size || '-'}</td>
                  <td>{t.quantity}</td>
                  <td>₹{t.amount}</td>
                  <td>{t.addedBy?.username}</td>
                  <td>
                    <button className="icon-btn delete" onClick={() => handleDelete(t._id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
