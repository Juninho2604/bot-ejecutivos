import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/admin/sidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl p-8">{children}</div>
      </main>
    </div>
  );
}
