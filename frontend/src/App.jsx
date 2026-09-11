import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  const handleLogout = () => {
    setToken(null)
    setUser(null)
  }

  if (!token) {
    return <Auth onLogin={(token, user) => {
      setToken(token)
      setUser(user)
    }} />
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🚀 CEX Exchange</h1>
        <div>
          {user && <span style={{ marginRight: '20px' }}>Welcome, {user.username}</span>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <Dashboard token={token} />
    </div>
  )
}

export default App
