import React from 'react'
import styles from '../styles/Profile.module.css'

interface AuditNode {
    id: string
    grade: number
    createdAt: string
    group: {
      captainLogin: string
      object: {
        name: string
      }
    }
  }
  
  interface RecentAuditsProps {
    audits: AuditNode[]
  }
  
  export const RecentAudits: React.FC<RecentAuditsProps> = ({ audits }) => {
    const getStatus = (grade: number | null) => {
      if (grade === null) return <span className={styles.statusPending}>Pending</span>
      if (grade >= 1) return <span className={styles.statusPass}>Pass</span>
      return <span className={styles.statusFail}>Fail</span>
    }
  
    return (
      <div className={styles.graph}>
        <h3 className={styles.graphTitle}>Recent Audits</h3>
        <ul className={styles.auditList}>
          {audits.slice(0, 5).map((audit) => (
            <li key={audit.id} className={styles.auditItem}>
              <span>{audit.group.object.name}</span>
              {getStatus(audit.grade)}
              <span>Date: {new Date(audit.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  