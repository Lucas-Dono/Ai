/**
 * Layout del Panel Admin
 * Navegación y estructura base
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboardIcon,
  UsersIcon,
  BotIcon,
  ShieldAlertIcon,
  FileTextIcon,
  Award,
  BarChartIcon,
  LogOutIcon
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/congrats', icon: LayoutDashboardIcon },
  { name: 'Analytics', href: '/congrats/analytics', icon: BarChartIcon },
  { name: 'Usuarios', href: '/congrats/users', icon: UsersIcon },
  { name: 'Agentes', href: '/congrats/agents', icon: BotIcon },
  { name: 'Moderación', href: '/congrats/moderation', icon: ShieldAlertIcon },
  { name: 'Audit Logs', href: '/congrats/audit-logs', icon: FileTextIcon },
  { name: 'Certificados', href: '/congrats/certificates', icon: Award },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 bg-gray-800">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-800">
            <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
              <LogOutIcon className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
