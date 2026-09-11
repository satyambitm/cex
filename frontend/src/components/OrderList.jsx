function OrderList({ orders, onCancel }) {
  if (orders.length === 0) {
    return (
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>📋 Your Orders</h3>
        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
          No orders yet. Place your first order to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <h3>📋 Your Orders</h3>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className={`order-item ${order.side} ${order.status}`}>
            <div className="order-header">
              <span className="order-market">{order.market}</span>
              <span className={`order-status ${order.status}`}>{order.status}</span>
            </div>
            
            <div className="order-details">
              <div>
                <strong>Side:</strong>{' '}
                <span style={{ color: order.side === 'buy' ? '#2ecc71' : '#ff4757' }}>
                  {order.side.toUpperCase()}
                </span>
              </div>
              <div><strong>Type:</strong> {order.type}</div>
              <div><strong>Price:</strong> ${order.price}</div>
              <div><strong>Quantity:</strong> {order.qty}</div>
              <div><strong>Filled:</strong> {order.filledQty}</div>
              <div><strong>Total:</strong> ${(order.price * order.qty).toFixed(2)}</div>
            </div>

            {order.status === 'open' && (
              <div className="order-actions">
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => onCancel(order.id)}
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderList
