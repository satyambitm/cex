import { useState } from 'react'

function Balance({ balances, onDeposit }) {
  const [depositAsset, setDepositAsset] = useState('USD')
  const [depositAmount, setDepositAmount] = useState('')

  const handleDeposit = (e) => {
    e.preventDefault()
    if (depositAsset && depositAmount > 0) {
      onDeposit(depositAsset, depositAmount)
      setDepositAmount('')
    }
  }

  return (
    <div className="card">
      <h3>💰 Your Balances</h3>
      {balances.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
          No balances yet. Deposit some funds to get started!
        </p>
      ) : (
        <ul className="balance-list">
          {balances.map((balance) => (
            <li key={balance.id} className="balance-item">
              <div>
                <strong>{balance.asset}</strong>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>Available: {balance.available}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>Locked: {balance.locked}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="deposit-section">
        <h4>💵 Deposit Funds</h4>
        <form onSubmit={handleDeposit} className="deposit-form">
          <select
            value={depositAsset}
            onChange={(e) => setDepositAsset(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="SOL">SOL</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            step="0.01"
            min="0.01"
            required
          />
          <button type="submit" className="btn btn-small">
            Deposit
          </button>
        </form>
      </div>
    </div>
  )
}

export default Balance
