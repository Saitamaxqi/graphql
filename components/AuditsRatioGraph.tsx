import React from 'react'
import styles from '../styles/Profile.module.css'

interface AuditsRatioGraphProps {
  totalUp: number
  totalDown: number
}

export const AuditsRatioGraph: React.FC<AuditsRatioGraphProps> = ({ totalUp, totalDown }) => {
  console.log('totalUp:', totalUp)
  console.log('totalDown:', totalDown)
  const totalUpMB = (totalUp / 1000000).toFixed(2)
  const totalDownMB = (totalDown / 1000000).toFixed(2)
  
    
    // Calculate the scaling factor based on the larger value
    const maxValue = Math.max(parseFloat(totalUpMB), parseFloat(totalDownMB))
    const baseWidth = 400
    
    // Calculate relative widths
    const upWidth = (parseFloat(totalUpMB) / maxValue) * baseWidth
    const downWidth = (parseFloat(totalDownMB) / maxValue) * baseWidth

    return (
    <div className={styles.barGraph}>
      <h3 className={styles.graphTitle}>Audits ratio</h3>
      <svg viewBox="0 0 400 200" className={styles.bar}>
        {/* Done bar */}
        <g className="done-group">
          <text x="0" y="40" className={styles.barLabel}>Done</text>
          <rect 
            x="0" 
            y="60" 
            width={upWidth} 
            height="20" 
            fill="#FCD34D" 
            rx="4"
          />
          <text x="400" y="40" textAnchor="end" className={styles.barValue}>
            {totalUpMB} MB ↑
          </text>
        </g>
        
        {/* Received bar */}
        <g className="received-group">
          <text x="0" y="120" className={styles.barLabel}>Received</text>
          <rect 
            x="0" 
            y="140" 
            width={downWidth} 
            height="20" 
            fill="#E5E7EB" 
            rx="4"
          />
          <text x="400" y="120" textAnchor="end" className={styles.barValue}>
            {totalDownMB} MB ↓
          </text>
        </g>
      </svg>
    </div>
  )

}