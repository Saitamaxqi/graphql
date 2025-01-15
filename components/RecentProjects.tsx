import React from 'react'
import styles from '../styles/Profile.module.css'

interface Progress {
    id: string
    object: {
      id: string
      name: string
      type: string
    }
    grade: number
    createdAt: string
    updatedAt: string
  }
  
  interface RecentProjectsProps {
    progresses: Progress[]
  }
  
  export const RecentProjects: React.FC<RecentProjectsProps> = ({ progresses }) => {
    const getStatus = (grade: number | null) => {
      if (grade === null) return <span className={styles.statusPending}>Pending</span>
      if (grade >= 1) return <span className={styles.statusPass}>Pass</span>
      return <span className={styles.statusFail}>Fail</span>
    }
  
    return (
      <div className={styles.graph}>
        <h3 className={styles.graphTitle}>Recent Projects</h3>
        <ul className={styles.projectList}>
          {progresses.slice(0, 5).map((progress) => (
            <li key={progress.id} className={styles.projectItem}>
              <span>{progress.object.name}</span>
              {getStatus(progress.grade)}
              <span>Last Updated: {new Date(progress.updatedAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  