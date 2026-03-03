'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useSidebar } from './DashboardLayoutWrapper'

export default function ToggleSidebarButton() {
  const { isCollapsed, toggleSidebar, isAndroid, isMobile } = useSidebar()

  // No mostrar en mobile (ya tiene su propio botón)
  if (isMobile) return null

  return (
    <motion.button
      onClick={toggleSidebar}
      className={`
        fixed top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-r-lg shadow-lg 
        hover:shadow-xl hover:bg-gray-50 transition-all duration-200 z-50
        flex items-center justify-center
        ${isCollapsed ? 'left-0' : 'left-64'}
        ${isAndroid ? 'min-h-[48px] min-w-[48px]' : 'min-h-[40px] min-w-[32px]'}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isCollapsed ? 'Mostrar menú' : 'Ocultar menú'}
    >
      <motion.div
        animate={{ rotate: isCollapsed ? 0 : 180 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </motion.div>
    </motion.button>
  )
}
