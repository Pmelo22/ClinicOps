'use client'

import React from "react"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Activity,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  Building2,
  CreditCard,
  Shield,
  BarChart3,
  UserCog,
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import type { UserRole } from '@/lib/types'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Visao Geral',
    icon: LayoutDashboard,
    roles: ['operacional', 'admin_tenant', 'master'],
  },
  {
    href: '/dashboard/pacientes',
    label: 'Pacientes',
    icon: Users,
    roles: ['operacional', 'admin_tenant'],
  },
  {
    href: '/dashboard/atendimentos',
    label: 'Atendimentos',
    icon: Calendar,
    roles: ['operacional', 'admin_tenant'],
  },
  {
    href: '/dashboard/documentos',
    label: 'Documentos',
    icon: FileText,
    roles: ['operacional', 'admin_tenant'],
  },
  {
    href: '/dashboard/admin/usuarios',
    label: 'Usuarios',
    icon: UserCog,
    roles: ['admin_tenant'],
  },
  {
    href: '/dashboard/admin/relatorios',
    label: 'Relatorios',
    icon: BarChart3,
    roles: ['admin_tenant'],
  },
  {
    href: '/dashboard/admin/configuracoes',
    label: 'Configuracoes',
    icon: Settings,
    roles: ['admin_tenant'],
  },
  {
    href: '/dashboard/master/clinicas',
    label: 'Clinicas',
    icon: Building2,
    roles: ['master'],
  },
  {
    href: '/dashboard/master/planos',
    label: 'Planos',
    icon: CreditCard,
    roles: ['master'],
  },
  {
    href: '/dashboard/master/auditoria',
    label: 'Auditoria',
    icon: Shield,
    roles: ['master'],
  },
]

interface DashboardSidebarProps {
  userRole: UserRole
  userName: string
  clinicName?: string
}

export function DashboardSidebar({ userRole, userName, clinicName }: DashboardSidebarProps) {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole))

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <Activity className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-bold text-sidebar-foreground">ClinicOps</span>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-4">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            {clinicName && (
              <p className="text-xs text-sidebar-foreground/60 truncate">{clinicName}</p>
            )}
            <p className="text-xs text-sidebar-primary capitalize">{userRole.replace('_', ' ')}</p>
          </div>
          <form action={signOut}>
            <Button 
              type="submit" 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </div>
    </aside>
  )
}
