'use client'
import { useEffect, useState } from 'react'

interface ConfettiProps {
  isActive: boolean
}

export default function Confetti({ isActive }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    color: string
    size: number
    speed: number
    rotation: number
    rotationSpeed: number
    shape: 'square' | 'round'
    wobble: number
    wobbleSpeed: number
  }>>([])

  useEffect(() => {
    if (!isActive) return

    // Create more confetti particles with varied shapes
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -30,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'][Math.floor(Math.random() * 10)],
      size: Math.random() * 10 + 6,
      speed: Math.random() * 2 + 1.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      shape: (Math.random() > 0.5 ? 'square' : 'round') as 'square' | 'round',
      wobble: Math.random() * 20,
      wobbleSpeed: Math.random() * 0.1 + 0.05
    }))

    setParticles(newParticles)

    // Animate confetti falling with wobble effect
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y + particle.speed,
          x: particle.x + Math.sin(particle.y * particle.wobbleSpeed) * 0.5,
          rotation: particle.rotation + particle.rotationSpeed
        })).filter(particle => particle.y < window.innerHeight + 50)
      )
    }, 16)

    // Clean up after animation
    const timeout = setTimeout(() => {
      setParticles([])
    }, 4000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isActive])

  if (!isActive || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute ${
            particle.shape === 'square' ? 'rounded-sm' : 'rounded-full'
          }`}
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'none'
          }}
        />
      ))}
    </div>
  )
}
