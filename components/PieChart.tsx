import React from 'react'
import styles from '../styles/Profile.module.css'

interface SkillsPieChartProps {
    skills: {
      type: string
      amount: number
    }[]
  }
  
  export const SkillsPieChart: React.FC<SkillsPieChartProps> = ({ skills }) => {
    const totalSkillAmount = skills.reduce((sum, skill) => sum + skill.amount, 0)
  
    return (
      <div className={styles.pieChart}>
        <h3 className={styles.graphTitle}>Skills</h3>
        <svg viewBox="0 0 100 100" className={styles.pie}>
          {skills.map((skill, index, array) => {
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
          {skills.map((skill, index) => (
            <span key={skill.type} className={styles.skillLabel} style={{backgroundColor: `hsl(${index * 60}, 70%, 60%)`}}>
              {skill.type.replace('skill_', '')}: {skill.amount}
            </span>
          ))}
        </div>
      </div>
    )
  }
  