'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../styles/Profile.module.css'
import { AuditsRatioGraph } from './AuditsRatioGraph'

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
  const [userData, setUserData] = useState<UserData | null>(null)
  const [eventUser, setEventUser] = useState<EventUser | null>(null)
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

    let userId;
    try {
      userId = getUserIdFromToken(jwt);
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw new Error('Failed to extract user ID from token');
    }
    const eventId = 20;

    const query = `
      query($userId: Int!, $eventId: Int!) {
        user(where: {id: {_eq: $userId}}) {
          id
          login
          firstName
          lastName
          email
          auditRatio
          totalUp
          totalDown
          audits: audits_aggregate(
            where: {
              auditorId: {_eq: $userId},
              grade: {_is_null: false}
            },
            order_by: {createdAt: desc}
          ) {
            nodes {
              id
              grade
              createdAt
              group {
                captainLogin
                object {
                  name
                }
              }
            }
          }
          progresses(where: { userId: { _eq: $userId }, object: { type: { _eq: "project" } } }, order_by: {updatedAt: desc}) {
            id
            object {
              id
              name
              type
            }
            grade
            createdAt
            updatedAt
          }
          skills: transactions(
            order_by: [{type: desc}, {amount: desc}]
            distinct_on: [type]
            where: {userId: {_eq: $userId}, type: {_in: ["skill_js", "skill_go", "skill_html", "skill_prog", "skill_front-end", "skill_back-end"]}}
          ) {
            type
            amount
          }
        }
        event_user(where: { userId: { _eq: $userId }, eventId: {_eq: $eventId}}) {
          level
        }
      }
    `

    try {
      const response = await fetch('https://learn.reboot01.com//api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ 
          query,
          variables: { userId: userId, eventId: eventId }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      console.log(data)
      setUserData(data.data.user[0])
      setEventUser(data.data.event_user[0])
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

  const roundedAuditRatio = Math.round(userData.auditRatio * 10) / 10

  const totalSkillAmount = userData.skills.reduce((sum, skill) => sum + skill.amount, 0)

  const getStatus = (grade: number | null) => {
    if (grade === null) return <span className={styles.statusPending}>Pending</span>
    if (grade >= 1) return <span className={styles.statusPass}>Pass</span>
    return <span className={styles.statusFail}>Fail</span>
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardBackground}></div>
        <div className={styles.content}>
          <h1 className={styles.title}>Profile</h1>
          <div className={styles.infoSection}>
            <p className={styles.infoText}>Username: {userData.login}</p>
            <p className={styles.infoText}>Name: {userData.firstName} {userData.lastName}</p>
            <p className={styles.infoText}>Email: {userData.email}</p>
            <p className={styles.infoText}>Audit Ratio: {roundedAuditRatio}</p>
            {eventUser && <p className={styles.infoText}>Event Level: {eventUser.level}</p>}
          </div>
          <div className={styles.statsSection}>
            <h2 className={styles.statsTitle}>Statistics</h2>
            <div className={styles.graphsContainer}>
              <div className={styles.pieChart}>
                <h3 className={styles.graphTitle}>Skills</h3>
                <svg viewBox="0 0 100 100" className={styles.pie}>
                  {userData.skills.map((skill, index, array) => {
                    const startAngle = array.slice(0, index).reduce((sum, s) => sum + s.amount, 0) / totalSkillAmount * 360
                    const endAngle = (array.slice(0, index + 1).reduce((sum, s) => sum + s.amount, 0) / totalSkillAmount) * 360
                    const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180)
                    const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180)
                    const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180)
                    const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180)
                    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
                    return (
                      <path
                        key={skill.type}
                        d={`M50,50 L${x1},${y1} A50,50 0 ${largeArcFlag},1 ${x2},${y2} Z`}
                        fill={`hsl(${index * 60}, 70%, 60%)`}
                      />
                    )
                  })}
                </svg>
                <div className={styles.skillLabels}>
                  {userData.skills.map((skill, index) => (
                    <span key={skill.type} className={styles.skillLabel} style={{backgroundColor: `hsl(${index * 60}, 70%, 60%)`}}>
                      {skill.type.replace('skill_', '')}: {skill.amount}
                    </span>
                  ))}
                </div>
              </div>
              <AuditsRatioGraph totalUp={userData.totalUp} totalDown={userData.totalDown} />
            </div>
            
            <div className={styles.graph}>
              <h3 className={styles.graphTitle}>Recent Audits</h3>
              <ul className={styles.auditList}>
                {userData.audits.nodes.slice(0, 5).map((audit) => (
                  <li key={audit.id} className={styles.auditItem}>
                    <span>{audit.group.object.name}</span>
                    {getStatus(audit.grade)}
                    <span>Date: {new Date(audit.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.graph}>
              <h3 className={styles.graphTitle}>Recent Projects</h3>
              <ul className={styles.projectList}>
                {userData.progresses.slice(0, 5).map((progress) => (
                  <li key={progress.id} className={styles.projectItem}>
                    <span>{progress.object.name}</span>
                    {getStatus(progress.grade)}
                    <span>Last Updated: {new Date(progress.updatedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
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