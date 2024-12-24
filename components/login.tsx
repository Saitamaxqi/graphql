'use client'
import React from 'react';
import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Login.module.css'

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { username, password } = credentials
    const auth = btoa(`${username}:${password}`)

    try {
      const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      localStorage.setItem('jwt', data)
      console.log(data.token)
      router.push('/profile')
    } catch (err) {
      console.log(err)
      setError('Invalid username or password')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Sign in to your account</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className="sr-only">Username or Email</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className={`${styles.input} focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              placeholder="Username or Email"
              value={credentials.username}
              onChange={handleChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`${styles.input} focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={`${styles.button} focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}