import React from 'react'

const AuthForm = () => {
  return (
    <div>
      <h2>Authentication</h2>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default AuthForm
