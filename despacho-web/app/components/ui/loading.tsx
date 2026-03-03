// Componentes reutilizables para loading states

import cn from 'clsx'

interface SkeletonProps {
  className?: string
  lines?: number
  height?: string
  rows?: number
  columns?: number
}

export function SkeletonCard({ className, lines = 3, height = "h-4" }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-white rounded-lg shadow p-6", className)}>
      <div className="space-y-3">
        <div className={cn("bg-gray-200 rounded", height, "w-3/4")}></div>
        {Array.from({ length: lines - 1 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "bg-gray-200 rounded",
              height,
              i === lines - 2 ? "w-full" : "w-5/6"
            )}
          ></div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonAvatar({ size = "w-10 h-10", className }: { size?: string; className?: string }) {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded-full", size, className)}></div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonProps) {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <div
                  key={colIndex}
                  className={cn(
                    "h-4 bg-gray-200 rounded",
                    colIndex === 0 ? "w-3/4" : colIndex === 2 ? "w-1/2" : "w-full"
                  )}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <div
      className={cn(
        "animate-spin border-2 border-blue-600 border-t-transparent rounded-full",
        sizeClasses[size],
        className
      )}
    ></div>
  )
}

interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function LoadingButton({ 
  loading = false, 
  children, 
  className,
  disabled = false 
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-all duration-200",
        "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      <span className={loading ? "opacity-70" : ""}>
        {children}
      </span>
    </button>
  )
}