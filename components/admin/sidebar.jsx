'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  BellRing,
  ListChecks,
  MessageSquare,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/recordatorios', label: 'Recordatorios', icon: BellRing },
  { href: '/admin/listas', label: 'Listas', icon: ListChecks },
  { href: '/admin/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/admin/leads', label: 'Leads', icon: UserPlus },
];

export function Sidebar({ user }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-xl">🤖</span>
        <span className="font-semibold">Bot Ejecutivos</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 px-3 text-xs text-muted-foreground">
          {user?.name || user?.email}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
