'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/app/hooks/useUserRole'
import type { Profile } from '@/lib/types/database'

interface SidebarProps {
  isCollapsed: boolean
  isMobile: boolean
  isTablet: boolean
  isLargeTablet: boolean
  isDesktop: boolean
  isAndroid: boolean
  onToggle: () => void
  onProfileClick?: () => void
}

export default function Sidebar({ 
  isCollapsed, 
  isMobile, 
  isTablet, 
  isLargeTablet, 
  isAndroid,
  onProfileClick
}: SidebarProps) {
  const pathname = usePathname()
  const { isAdmin } = useUserRole()
  const [profile, setProfile] = useState<Profile | null>(null)
  
  // Cargar perfil del usuario actual
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    })
  }, [])

  // Menú base (visible para todos)
  const baseMenuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      exact: true
    },
    {
      name: 'Casos',
      href: '/dashboard/casos',
      icon: '📁',
      exact: false
    },
    {
      name: 'Agenda',
      href: '/dashboard/agenda',
      icon: '📅',
      exact: false
    },
  ]
  
  // Agregar Reportes solo para admin
  const menuItems = isAdmin 
    ? [
        ...baseMenuItems,
        {
          name: 'Reportes',
          href: '/dashboard/reportes',
          icon: '📈',
          exact: false
        },
      ]
    : baseMenuItems

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  // Sidebar con ancho consistente
  const getSidebarWidth = () => {
    return isCollapsed ? 'w-16' : 'w-64'  // Volver al tamaño normal
  }

  const sidebarClasses = `
    bg-white transition-all duration-300 ease-in-out z-40
    ${isMobile ? 'fixed left-0 top-0 h-screen border-r border-gray-200' : 'h-screen sticky top-0'}
    ${getSidebarWidth()}
    ${isMobile ? (isCollapsed ? '-translate-x-full' : 'translate-x-0') : 
               (isCollapsed ? '-translate-x-full w-0 border-r-0' : `${getSidebarWidth()} translate-x-0 border-r border-gray-200`)}
    overflow-y-auto
  `

  const showText = !isCollapsed || (!isTablet && !isCollapsed)
  const getIconSize = () => {
    if (isTablet && isCollapsed) return 'text-2xl'
    if (isLargeTablet && isCollapsed) return 'text-xl'
    return 'text-lg'
  }

  const getPaddingClass = () => {
    if (isTablet && isCollapsed) return 'px-2'
    if (isLargeTablet && isCollapsed) return 'px-3'
    return 'px-4'
  }

  return (
    <aside className={sidebarClasses}>
      {/* Header del Sidebar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center mb-2">
          {!isCollapsed || isMobile ? (
            <Image
              src="/images/mlp-logo-dark.png"
              alt="MLP Logo"
              width={isTablet && isCollapsed ? 32 : isLargeTablet && isCollapsed ? 40 : 120}
              height={isTablet && isCollapsed ? 24 : isLargeTablet && isCollapsed ? 32 : 40}
              className="object-contain"
            />
          ) : (
            <div className={`${
              isTablet ? 'w-8 h-8' : isLargeTablet ? 'w-10 h-10' : 'w-10 h-10'
            } bg-blue-600 rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">MLP</span>
            </div>
          )}
        </div>
        {showText && (
          <p className={`text-xs text-gray-500 text-center ${isTablet ? 'hidden' : ''}`}>
            Sistema de Gestión
          </p>
        )}
      </div>

      {/* Navegación */}
      <nav className={`py-4 ${getPaddingClass()}`}>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 py-3 rounded-lg transition-all duration-200
                  ${isActive(item)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${isTablet && isCollapsed ? 'justify-center px-2' : 'px-3'}
                  ${isAndroid ? 'min-h-[48px]' : ''} // Touch target mínimo para Android
                `}
                title={isCollapsed ? item.name : ''}
              >
                <span className={`${getIconSize()} flex-shrink-0`}>
                  {item.icon}
                </span>
                {showText && (
                  <span className={`font-medium ${isTablet && isCollapsed ? 'hidden' : 'block'}`}>
                    {item.name}
                  </span>
                )}
                {isActive(item) && showText && (
                  <div className="w-2 h-2 bg-white rounded-full ml-auto"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Espacio flexible */}
      <div className="flex-1"></div>

      {/* Footer del Sidebar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        {/* Perfil del usuario */}
        <button
          onClick={onProfileClick}
          className={`w-full p-4 border-b border-gray-200 ${getPaddingClass()} hover:bg-gray-50 transition-colors cursor-pointer`}
        >
          <div className={`flex items-center gap-3 ${isTablet && isCollapsed ? 'justify-center' : ''}`}>
            <div className={`relative rounded-full overflow-hidden flex-shrink-0 ${
              isTablet && isCollapsed ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.nombre_completo || profile.username || 'Usuario'}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-600 flex items-center justify-center text-white font-bold">
                  {(profile?.nombre_completo || profile?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {showText && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.nombre_completo || profile?.username || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {profile?.rol || 'Sin rol'}
                </p>
              </div>
            )}
          </div>
        </button>

        {/* Cerrar sesión */}
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className={`
              w-full flex items-center gap-3 py-3 rounded-lg text-gray-700 
              hover:bg-red-50 hover:text-red-600 transition-colors
              ${getPaddingClass()}
              ${isTablet && isCollapsed ? 'justify-center px-2' : 'px-4'}
              ${isAndroid ? 'min-h-[48px]' : ''}
            `}
            title={isCollapsed ? 'Cerrar sesión' : ''}
          >
            <span className="text-xl">🚪</span>
            {showText && (
              <span className="font-medium">Cerrar sesión</span>
            )}
          </button>
        </form>
      </div>
    </aside>
  )
}