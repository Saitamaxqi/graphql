'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../styles/Profile.module.css'
import { AuditsRatioGraph } from './AuditsRatioGraph'
import { InfoSection } from './InfoSection'
import { RecentAudits } from './RecentAudits'
import { RecentProjects } from './RecentProjects'
import { SkillsPieChart } from './PieChart'
import { useUserData } from './Fetch'

interface UserData {
  id: string
  login: string
  firstName: string
  lastName: string
  email: string
  auditRatio: number
  totalUp: number
  totalDown: number
  audits: {
    nodes: {
      id: string
      grade: number
      createdAt: string
      group: {
        captainLogin: string
        object: {
          name: string
        }
      }
    }[]
  }
  progresses: {
    id: string
    object: {
      id: string
      name: string
      type: string
    }
    grade: number
    createdAt: string
    updatedAt: string
  }[]
  skills: {
    type: string
    amount: number
  }[]
}

interface EventUser {
  level: number
}

export default function Profile() {
  const { userData, eventUser, loading, error } = useUserData()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('jwt')
    router.push('/login')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!userData) {
    return <div>No user data available</div>
  }

  const roundedAuditRatio = Math.round(userData.auditRatio * 10) / 10

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardBackground}></div>
        <div className={styles.content}>
          <h1 className={styles.title}>Profile</h1>
          <InfoSection login={userData.login} firstName={userData.firstName} lastName={userData.lastName} email={userData.email} roundedAuditRatio={roundedAuditRatio} level={eventUser ? eventUser.level : 0} />
          <div className={styles.statsSection}>
            <h2 className={styles.statsTitle}>Statistics</h2>
            <div className={styles.graphsContainer}>
              <SkillsPieChart skills={userData.skills} />
              <AuditsRatioGraph totalUp={userData.totalUp} totalDown={userData.totalDown} />
            </div>
            <RecentAudits audits={userData.audits.nodes} />
            <RecentProjects progresses={userData.progresses} />
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
function getUserIdFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload && payload.sub) {
      return parseInt(payload.sub, 10);
    }
    throw new Error('User ID not found in token');
  } catch (error) {
    console.error('Error parsing token:', error);
    throw new Error('Invalid token structure');
  }
}