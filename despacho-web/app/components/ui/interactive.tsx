// Componente para mejorar todas las tarjetas con microinteracciones

import { motion } from 'framer-motion'
import cn from 'clsx'
import { ReactNode } from 'react'

interface InteractiveCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  scale?: boolean
  glow?: boolean
  delay?: number
}

export function InteractiveCard({ 
  children, 
  className, 
  onClick,
  hover = true,
  scale = true,
  glow = false,
  delay = 0
}: InteractiveCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? {
        scale: scale ? 1.02 : 1,
        boxShadow: glow ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        transition: { duration: 0.2 }
      } : {}}
      whileTap={onClick ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200",
        "transition-all duration-200 cursor-pointer",
        hover && "hover:shadow-md hover:border-gray-300",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

interface InteractiveButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  disabled?: boolean
  className?: string
  icon?: ReactNode
}

export function InteractiveButton({ 
  children, 
  onClick,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  icon
}: InteractiveButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 border border-gray-300"
  }
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading && (
        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
      )}
      {icon && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      <span className={loading ? "opacity-70" : ""}>
        {children}
      </span>
    </motion.button>
  )
}

interface AnimatedBadgeProps {
  children: ReactNode
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "orange"
  size?: "sm" | "md"
  animated?: boolean
  className?: string
}

export function AnimatedBadge({ 
  children, 
  color = "blue",
  size = "md",
  animated = false,
  className
}: AnimatedBadgeProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200"
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm"
  }

  return (
    <motion.span
      animate={animated ? {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1]
      } : {}}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3
      }}
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        colorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </motion.span>
  )
}