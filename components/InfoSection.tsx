import React from 'react'
import styles from '../styles/Profile.module.css'

interface InfoSectionProps {
 login: string
 firstName: string
 lastName: string
 email: string
 roundedAuditRatio: number
 level: number
}

export const InfoSection: React.FC<InfoSectionProps> = ({ login, firstName, lastName, email, roundedAuditRatio, level }) => {
  
      return (
        <div className={styles.infoSection}>
        <p className={styles.infoText}>Username: {login}</p>
        <p className={styles.infoText}>Name: {firstName} {lastName}</p>
        <p className={styles.infoText}>Email: {email}</p>
        <p className={styles.infoText}>Audit Ratio: {roundedAuditRatio}</p>
        {<p className={styles.infoText}>Event Level: {level}</p>}
      </div>
    )
}