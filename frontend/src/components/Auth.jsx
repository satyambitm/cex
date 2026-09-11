import { useState } from 'react'

function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/signin'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Authentication failed')
      }

      if (data.token) {
        onLogin(data.token, data.user || { username })
      } else {
        throw new Error('No token received')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      
      <div className="switch-auth">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}
        {' '}
        <button onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  )
}

export default Auth
