'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import ToggleSidebarButton from './ToggleSidebarButton'
import BuscadorFlotante from './BuscadorFlotante'
import PerfilModal from '@/app/components/PerfilModal'
import { NotificationPermissionPrompt } from '@/app/components/NotificationPermissionPrompt'
import { ServiceWorkerRegistration } from '@/app/components/ServiceWorkerRegistration'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

interface SidebarContextType {
  isCollapsed: boolean
  isMobile: boolean
  isTablet: boolean
  isLargeTablet: boolean
  isDesktop: boolean
  isAndroid: boolean
  toggleSidebar: () => void
  collapseSidebar: () => void
  expandSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobile: false,
  isTablet: false,
  isLargeTablet: false,
  isDesktop: false,
  isAndroid: false,
  toggleSidebar: () => {},
  collapseSidebar: () => {},
  expandSidebar: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

export default function DashboardLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [manuallyExpanded, setManuallyExpanded] = useState(false) // Usuario expandió manualmente
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  })
  const [isAndroid, setIsAndroid] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  
  // Obtener userId y perfil del usuario autenticado
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUserId(user?.id || null)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setUserProfile(profile)
      }
    })
  }, [])

  // Detectar si estamos en modo full-screen (notas, agenda con día seleccionado, o casos)
  const isNotasFullScreen = pathname?.includes('/notas')
  const isAgendaMonthView = pathname?.match(/\/agenda\/\d{4}\/\d{1,2}/) !== null
  const isCasosView = pathname === '/dashboard/casos'
  const isFullScreenMode = isNotasFullScreen || isAgendaMonthView || isCasosView

  // Detectar dispositivo y tamaño de pantalla
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })
      
      // Detectar si es Android
      const userAgent = navigator.userAgent.toLowerCase()
      setIsAndroid(userAgent.includes('android'))
      
      // Optimizado para tablets Samsung:
      // - Móvil: < 768px
      // - Tablet pequeña: 768px - 900px (ej: Galaxy Tab A 8.0)
      // - Tablet grande: 900px - 1200px (ej: Galaxy Tab S series)
      // - Desktop: > 1200px
      
      if (width < 768) {
        setIsCollapsed(true) // Móvil siempre colapsado
      } else if (width >= 768 && width <= 900) {
        setIsCollapsed(true) // Tablets pequeñas colapsadas por defecto (touch más pequeño)
      } else if (width > 900 && width <= 1200) {
        setIsCollapsed(false) // Tablets grandes expandidas (más espacio)
      } else {
        setIsCollapsed(false) // Desktop expandido
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  const isMobile = screenSize.width < 768
  const isTablet = screenSize.width >= 768 && screenSize.width <= 900
  const isLargeTablet = screenSize.width > 900 && screenSize.width <= 1200
  const isDesktop = screenSize.width > 1200

  // Auto-colapsar sidebar en casos (a menos que el usuario lo haya expandido manualmente)
  // Si no estamos en casos, resetear el estado manual
  const shouldAutoCollapse = isCasosView && !manuallyExpanded
  const effectiveCollapsed = shouldAutoCollapse || isCollapsed
  
  // Resetear manuallyExpanded cuando salís de la vista de casos
  const prevPathRef = React.useRef(pathname)
  React.useEffect(() => {
    if (prevPathRef.current !== pathname && !isCasosView && manuallyExpanded) {
      setManuallyExpanded(false)
    }
    prevPathRef.current = pathname
  }, [pathname, isCasosView, manuallyExpanded])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsCollapsed(!isCollapsed)
    } else {
      // Invertir basándose en el estado EFECTIVO, no en isCollapsed
      const newCollapsed = !effectiveCollapsed
      setIsCollapsed(newCollapsed)
      
      // Si el usuario expande en la vista de casos, marcar como manualmente expandido
      if (isCasosView && !newCollapsed) {
        setManuallyExpanded(true)
      } else if (newCollapsed) {
        setManuallyExpanded(false)
      }
    }
  }

  const collapseSidebar = () => setIsCollapsed(true)
  const expandSidebar = () => setIsCollapsed(false)

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed: effectiveCollapsed, 
      isMobile, 
      isTablet,
      isLargeTablet, 
      isDesktop,
      isAndroid,
      toggleSidebar, 
      collapseSidebar, 
      expandSidebar 
    }}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={effectiveCollapsed} 
          isMobile={isMobile}
          isTablet={isTablet}
          isLargeTablet={isLargeTablet}
          isDesktop={isDesktop}
          isAndroid={isAndroid}
          onToggle={toggleSidebar}
          onProfileClick={() => setShowProfileModal(true)}
        />
        
        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Overlay solo para móvil */}
          {isMobile && !isCollapsed && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={collapseSidebar}
            />
          )}
          
          {/* Header móvil con botón siempre visible */}
          {isMobile && (
            <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20 px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-900">MLP Abogados</h1>
                <div className="w-10"></div>
              </div>
            </header>
          )}
          
          {/* Espacio para header móvil */}
          {isMobile && <div className="h-16"></div>}
          
          
          
          {/* Contenido dinámico */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
         
        {/* Componentes adicionales */}
        {!isMobile && <ToggleSidebarButton />}
        {!isFullScreenMode && <BuscadorFlotante />}
        
        {/* Service Worker para notificaciones push */}
        <ServiceWorkerRegistration />
        
        {/* Notificaciones Push - Mostrar en todas las pantallas */}
        {userId && <NotificationPermissionPrompt userId={userId} />}
        
        {/* Modal de Perfil */}
        {showProfileModal && userProfile && (
          <PerfilModal
            user={userProfile}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </div>
    </SidebarContext.Provider>
  )
}