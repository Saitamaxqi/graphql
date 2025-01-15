import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface UserData {
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

export interface EventUser {
  level: number
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [eventUser, setEventUser] = useState<EventUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchUserData = async () => {
    const jwt = localStorage.getItem('jwt')
    if (!jwt) {
      router.push('/login')
      return
    }

    let userId
    try {
      userId = getUserIdFromToken(jwt)
    } catch (error) {
      setError('Failed to extract user ID from token')
      setLoading(false)
      return
    }

    const eventId = 20
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
          variables: { userId, eventId }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUserData(data.data.user[0])
      setEventUser(data.data.event_user[0])
    } catch (error) {
      setError('Error fetching user data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  return { userData, eventUser, loading, error, fetchUserData }
}

function getUserIdFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload && payload.sub) {
      return parseInt(payload.sub, 10)
    }
    throw new Error('User ID not found in token')
  } catch (error) {
    throw new Error('Invalid token structure')
  }
}
