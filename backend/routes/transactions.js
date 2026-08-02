const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect, admin } = require('../middleware/auth');

// Add a new transaction (purchase/sale)
router.post('/', protect, async (req, res) => {
  try {
    const { type, productCategory, thickness, size, quantity, amount, date } = req.body;
    
    const transaction = new Transaction({
      type,
      productCategory,
      thickness,
      size,
      quantity,
      amount,
      date: date || Date.now(),
      addedBy: req.user.id
    });

    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all transactions (with optional filtering)
router.get('/', protect, async (req, res) => {
  try {
    const { type, month, year, userId } = req.query;
    let query = {};
    
    if (type) {
      query.type = type;
    }

    if (userId) {
      query.addedBy = userId;
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (req.query.date) {
      const specificDate = new Date(req.query.date);
      const nextDate = new Date(specificDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: specificDate, $lt: nextDate };
    }

    // Workers might only need to see recent, but let's allow all for now.
    // In a strict app, maybe only admin sees all, workers see their own.
    const transactions = await Transaction.find(query)
      .populate('addedBy', 'username')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a transaction
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Workers can delete records. To be safe, maybe only their own, but requirements just say "Worker can able to add or delete product in purchase and sale"
    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get admin dashboard stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const stats = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${targetYear}-01-01`),
            $lt: new Date(`${targetYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type"
          },
          totalAmount: { $sum: "$amount" },
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ]);

    // Format the stats for the frontend
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      purchase: { amount: 0, quantity: 0 },
      sale: { amount: 0, quantity: 0 }
    }));

    stats.forEach(stat => {
      const monthIndex = stat._id.month - 1;
      if (stat._id.type === 'purchase') {
        monthlyStats[monthIndex].purchase = { amount: stat.totalAmount, quantity: stat.totalQuantity };
      } else {
        monthlyStats[monthIndex].sale = { amount: stat.totalAmount, quantity: stat.totalQuantity };
      }
    });

    res.json(monthlyStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
