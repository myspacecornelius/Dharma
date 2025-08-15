import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface LACESBalance {
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  rank: number;
  percentile: number;
}

interface LACESTransaction {
  transaction_id: string;
  amount: number;
  reason: string;
  timestamp: string;
  reference_type?: string;
  reference_id?: string;
}

interface LACESTokenProps {
  apiToken: string;
  userId: string;
}

export const LACESToken: React.FC<LACESTokenProps> = ({ apiToken, userId }) => {
  const [balance, setBalance] = useState<LACESBalance | null>(null);
  const [transactions, setTransactions] = useState<LACESTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);
  const [animateBalance, setAnimateBalance] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch balance
  const fetchBalance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/laces/balance`, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data);
        
        // Animate balance change
        if (balance && data.balance !== balance.balance) {
          setAnimateBalance(true);
          setTimeout(() => setAnimateBalance(false), 1000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch LACES balance:', error);
      toast.error('Failed to load LACES balance');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/laces/transactions?limit=20`, {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();

    // Set up WebSocket for real-time updates
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws?token=${apiToken}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'laces_earned') {
        fetchBalance();
        fetchTransactions();
        
        // Show notification
        toast.success(`+${data.amount} LACES earned for ${data.reason}!`, {
          icon: '🎉',
          duration: 4000
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [apiToken]);

  const getReasonIcon = (reason: string) => {
    const icons: { [key: string]: string } = {
      SPOT: '👀',
      VERIFY: '✓',
      KNOWLEDGE: '🧠',
      TRADE: '🤝',
      GOOD_VIBES: '✨',
      DROPZONE: '📍'
    };
    return icons[reason] || '🪙';
  };

  const getReasonText = (reason: string) => {
    const texts: { [key: string]: string } = {
      SPOT: 'Spotted a drop',
      VERIFY: 'Verified an event',
      KNOWLEDGE: 'Shared knowledge',
      TRADE: 'Completed trade',
      GOOD_VIBES: 'Community contribution',
      DROPZONE: 'DropZone activity'
    };
    return texts[reason] || reason;
  };

  if (loading) {
    return (
      <div className="laces-loading">
        <div className="spinner" />
        Loading LACES...
      </div>
    );
  }

  return (
    <div className="laces-container">
      <motion.div 
        className="laces-balance-card"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="balance-header">
          <h3>LACES Balance</h3>
          <motion.div 
            className="balance-amount"
            animate={animateBalance ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="laces-icon">🪙</span>
            <span className="amount">{balance?.balance.toLocaleString() || 0}</span>
          </motion.div>
        </div>

        <div className="balance-stats">
          <div className="stat">
            <span className="label">Rank</span>
            <span className="value">#{balance?.rank || '-'}</span>
          </div>
          <div className="stat">
            <span className="label">Top</span>
            <span className="value">{balance?.percentile || 0}%</span>
          </div>
          <div className="stat">
            <span className="label">Earned</span>
            <span className="value">{balance?.lifetime_earned.toLocaleString() || 0}</span>
          </div>
        </div>

        <button 
          className="transactions-toggle"
          onClick={() => setShowTransactions(!showTransactions)}
        >
          {showTransactions ? 'Hide' : 'Show'} History
        </button>
      </motion.div>

      <AnimatePresence>
        {showTransactions && (
          <motion.div 
            className="transactions-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4>Recent Transactions</h4>
            {transactions.length === 0 ? (
              <p className="no-transactions">No transactions yet</p>
            ) : (
              <div className="transactions">
                {transactions.map((tx) => (
                  <motion.div 
                    key={tx.transaction_id}
                    className="transaction-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="tx-icon">{getReasonIcon(tx.reason)}</div>
                    <div className="tx-details">
                      <div className="tx-reason">{getReasonText(tx.reason)}</div>
                      <div className="tx-time">
                        {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    <div className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .laces-container {
          width: 100%;
          max-width: 400px;
        }

        .laces-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px;
          color: #888;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #333;
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .laces-balance-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border: 1px solid #333;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .laces-balance-card:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .balance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .balance-header h3 {
          margin: 0;
          font-size: 18px;
          color: #888;
        }

        .balance-amount {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .laces-icon {
          font-size: 28px;
        }

        .amount {
          font-size: 32px;
          font-weight: bold;
          color: var(--primary-color);
        }

        .balance-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat {
          text-align: center;
        }

        .stat .label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .stat .value {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #fff;
        }

        .transactions-toggle {
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .transactions-toggle:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .transactions-list {
          margin-top: 16px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px;
          overflow: hidden;
        }

        .transactions-list h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          color: #888;
        }

        .no-transactions {
          text-align: center;
          color: #666;
          padding: 20px;
        }

        .transactions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .transaction-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .tx-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .tx-details {
          flex: 1;
        }

        .tx-reason {
          font-size: 14px;
          color: #fff;
          margin-bottom: 2px;
        }

        .tx-time {
          font-size: 12px;
          color: #666;
        }

        .tx-amount {
          font-size: 18px;
          font-weight: bold;
        }

        .tx-amount.positive {
          color: #4ade80;
        }

        .tx-amount.negative {
          color: #f87171;
        }
      `}</style>
    </div>
  );
};
