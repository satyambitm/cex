import { useState } from 'react'

function OrderForm({ onSubmit, selectedMarket, setSelectedMarket }) {
  const [side, setSide] = useState('buy')
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const orderData = {
      market: selectedMarket,
      side,
      type: 'limit',
      price: parseFloat(price),
      qty: parseFloat(qty),
    }

    await onSubmit(orderData)
    
    // Reset form
    setPrice('')
    setQty('')
    setLoading(false)
  }

  return (
    <div className="card">
      <h3>📈 Place Order</h3>
      <form onSubmit={handleSubmit} className="order-form">
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Market
          </label>
          <select value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)}>
            <option value="SOL_USD">SOL/USD</option>
            <option value="BTC_USD">BTC/USD</option>
            <option value="ETH_USD">ETH/USD</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Side
          </label>
          <select value={side} onChange={(e) => setSide(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Price
          </label>
          <input
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0.01"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Quantity
          </label>
          <input
            type="number"
            placeholder="Enter quantity"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            step="0.01"
            min="0.01"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Placing...' : `${side === 'buy' ? '🟢 Buy' : '🔴 Sell'} ${selectedMarket.split('_')[0]}`}
        </button>
      </form>
    </div>
  )
}

export default OrderForm
