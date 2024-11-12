'use client'
import React from 'react';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Profile.module.css'

interface UserData {
  id: string
  login: string
  firstName: string
  lastName: string
  totalXp: number
  auditRatio: number
  transactions: {
    type: string
    amount: number
    createdAt: string
  }[]
  projects: {
    name: string
    status: string
  }[]
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const jwt = localStorage.getItem('jwt')
    if (!jwt) {
      router.push('/login')
      return
    }

    const query = `
      query {
        user {
          id
          login
          firstName
          lastName
          totalXp
          auditRatio
          transactions {
            type
            amount
            createdAt
          }
          projects {
            name
            status
          }
        }
      }
    `

    try {
      const response = await fetch('https://((DOMAIN))/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUserData(data.data.user)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('jwt')
    router.push('/login')
  }

  if (!userData) {
    return <div>Loading...</div>
  }

  const xpOverTime = userData.transactions
    .filter(t => t.type === 'xp')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const projectStatus = userData.projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardBackground}></div>
        <div className={styles.content}>
          <h1 className={styles.title}>Profile</h1>
          <div className={styles.infoSection}>
            <p className={styles.infoText}>Username: {userData.login}</p>
            <p className={styles.infoText}>Name: {userData.firstName} {userData.lastName}</p>
            <p className={styles.infoText}>Total XP: {userData.totalXp}</p>
            <p className={styles.infoText}>Audit Ratio: {userData.auditRatio}</p>
          </div>
          <div className={styles.statsSection}>
            <h2 className={styles.statsTitle}>Statistics</h2>
            <div className={styles.graph}>
              <h3 className={styles.graphTitle}>XP over Time</h3>
              <svg width="400" height="200" className="bg-gray-100">
                {xpOverTime.map((t, i) => (
                  <rect
                    key={i}
                    x={i * (400 / xpOverTime.length)}
                    y={200 - (t.amount / 1000)}
                    width={400 / xpOverTime.length - 1}
                    height={t.amount / 1000}
                    fill="rgb(14, 165, 233)"
                  />
                ))}
              </svg>
            </div>
            <div className={styles.graph}>
              <h3 className={styles.graphTitle}>Project Status</h3>
              <svg width="200" height="200" viewBox="-1 -1 2 2" className="bg-gray-100">
                {Object.entries(projectStatus).map(([status, count], i) => {
                  const startAngle = i * (2 * Math.PI / Object.keys(projectStatus).length)
                  const endAngle = (i + 1) * (2 * Math.PI / Object.keys(projectStatus).length)
                  const x1 = Math.cos(startAngle)
                  const y1 = Math.sin(startAngle)
                  const x2 = Math.cos(endAngle)
                  const y2 = Math.sin(endAngle)
                  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1"
                  return (
                    <path
                      key={status}
                      d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={status === 'finished' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
                    />
                  )
                })}
              </svg>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}