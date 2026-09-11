import { useState, useEffect } from 'react'

function OrderBook({ market, token }) {
  const [orderbook, setOrderbook] = useState({ buy: [], sell: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrderBook()
    // Refresh every 5 seconds
    const interval = setInterval(fetchOrderBook, 5000)
    return () => clearInterval(interval)
  }, [market, token])

  const fetchOrderBook = async () => {
    try {
      // Try to fetch market depth/orderbook
      const response = await fetch(`/api/orders/depth/${market}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 501) {
        // Endpoint not implemented yet
        setError('Orderbook endpoint not implemented yet')
        setLoading(false)
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log('Orderbook data received:', data)
        
        // Group orders by side
        const buyOrders = data.orders?.filter(o => o.side === 'buy' && o.status === 'open') || []
        const sellOrders = data.orders?.filter(o => o.side === 'sell' && o.status === 'open') || []
        
        console.log('Buy orders:', buyOrders.length, 'Sell orders:', sellOrders.length)
        
        // Sort buy orders by price (highest first)
        buyOrders.sort((a, b) => b.price - a.price)
        
        // Sort sell orders by price (lowest first)
        sellOrders.sort((a, b) => a.price - b.price)
        
        setOrderbook({ buy: buyOrders, sell: sellOrders })
        setError('')
      } else {
        console.error('Failed to fetch orderbook:', response.status, response.statusText)
        setError(`Failed to load orderbook (${response.status})`)
      }
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch orderbook')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card orderbook-card">
        <h3>📊 Order Book - {market}</h3>
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          Loading orderbook...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card orderbook-card">
        <h3>📊 Order Book - {market}</h3>
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '5px', 
          padding: '15px', 
          margin: '10px 0',
          color: '#856404'
        }}>
          <strong>⚠️ Backend Endpoint Needed</strong>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            To display the orderbook, add this endpoint to your backend:
          </p>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '3px', 
            fontSize: '12px',
            overflow: 'auto',
            marginTop: '10px'
          }}>
{`// In your backend (e.g., ordercontrollers.ts)
export const getMarketDepth = async (req, res) => {
  const { market } = req.params;
  const orders = await prisma.order.findMany({
    where: { 
      market: market.toUpperCase(),
      status: 'open'
    },
    orderBy: { price: 'desc' }
  });
  return res.json({ market, orders });
}

// In routes/order.ts
router.get('/depth/:market', getMarketDepth);`}
          </pre>
        </div>
      </div>
    )
  }

  const totalBuyVolume = orderbook.buy.reduce((sum, o) => sum + (o.qty - o.filledQty), 0)
  const totalSellVolume = orderbook.sell.reduce((sum, o) => sum + (o.qty - o.filledQty), 0)

  return (
    <div className="card orderbook-card">
      <h3>📊 Order Book - {market}</h3>
      
      <div className="orderbook-container">
        {/* Sell Orders (Asks) */}
        <div className="orderbook-section">
          <div className="orderbook-header sell">
            <span>SELL ORDERS (Asks)</span>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              Total: {totalSellVolume.toFixed(2)}
            </span>
          </div>
          <div className="orderbook-table">
            <div className="orderbook-table-header">
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>
            {orderbook.sell.length === 0 ? (
              <div className="orderbook-empty">No sell orders</div>
            ) : (
              orderbook.sell.slice(0, 10).map((order, idx) => {
                const remaining = order.qty - order.filledQty
                return (
                  <div key={order.id || idx} className="orderbook-row sell">
                    <span className="price">${order.price.toFixed(2)}</span>
                    <span>{remaining.toFixed(4)}</span>
                    <span>${(order.price * remaining).toFixed(2)}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Spread */}
        {orderbook.buy.length > 0 && orderbook.sell.length > 0 && (
          <div className="spread">
            <div className="spread-value">
              Spread: ${(orderbook.sell[0].price - orderbook.buy[0].price).toFixed(2)}
            </div>
          </div>
        )}

        {/* Buy Orders (Bids) */}
        <div className="orderbook-section">
          <div className="orderbook-header buy">
            <span>BUY ORDERS (Bids)</span>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              Total: {totalBuyVolume.toFixed(2)}
            </span>
          </div>
          <div className="orderbook-table">
            <div className="orderbook-table-header">
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>
            {orderbook.buy.length === 0 ? (
              <div className="orderbook-empty">No buy orders</div>
            ) : (
              orderbook.buy.slice(0, 10).map((order, idx) => {
                const remaining = order.qty - order.filledQty
                return (
                  <div key={order.id || idx} className="orderbook-row buy">
                    <span className="price">${order.price.toFixed(2)}</span>
                    <span>{remaining.toFixed(4)}</span>
                    <span>${(order.price * remaining).toFixed(2)}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderBook
