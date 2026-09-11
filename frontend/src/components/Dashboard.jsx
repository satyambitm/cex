import { useState, useEffect } from 'react'
import Balance from './Balance'
import OrderForm from './OrderForm'
import OrderList from './OrderList'
import OrderBook from './OrderBook'

function Dashboard({ token }) {
  const [selectedMarket, setSelectedMarket] = useState('SOL_USD')
  const [balances, setBalances] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchBalances = async () => {
    try {
      const response = await fetch('/api/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setBalances(data.balances || [])
      }
    } catch (err) {
      console.error('Failed to fetch balances:', err)
    }
  }

  const fetchOrders = async () => {
    // Since you don't have a GET /api/orders endpoint yet,
    // we'll just store orders locally when they're created
    setOrders([])
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchBalances(), fetchOrders()])
      setLoading(false)
    }
    fetchData()
  }, [token])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  const handleDeposit = async (asset, amount) => {
    try {
      const response = await fetch('/api/balance/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ asset, amount: parseFloat(amount) }),
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', `Deposited ${amount} ${asset} successfully!`)
        await fetchBalances()
      } else {
        showMessage('error', data.error || 'Deposit failed')
      }
    } catch (err) {
      showMessage('error', 'Failed to deposit')
    }
  }

  const handleOrderCreate = async (orderData) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'Order placed successfully!')
        setOrders([data.order, ...orders])
        await fetchBalances()
        return data.order
      } else {
        showMessage('error', data.error || 'Order failed')
        return null
      }
    } catch (err) {
      showMessage('error', 'Failed to place order')
      return null
    }
  }

  const handleOrderCancel = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'Order cancelled successfully!')
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        ))
        await fetchBalances()
      } else {
        showMessage('error', data.error || 'Cancel failed')
      }
    } catch (err) {
      showMessage('error', 'Failed to cancel order')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', color: 'white', fontSize: '24px' }}>Loading...</div>
  }

  return (
    <div>
      {message.text && (
        <div className={message.type === 'error' ? 'error' : 'success'}>
          {message.text}
        </div>
      )}
      
      <div className="dashboard">
        <Balance balances={balances} onDeposit={handleDeposit} />
        <OrderForm onSubmit={handleOrderCreate} selectedMarket={selectedMarket} setSelectedMarket={setSelectedMarket} />
        <OrderBook market={selectedMarket} token={token} />
        <OrderList orders={orders} onCancel={handleOrderCancel} />
      </div>
    </div>
  )
}

export default Dashboard
