import { getServerSession } from '@/lib/auth-server';
import { LeaderboardView } from '@/components/gamification/LeaderboardView';

export default async function LeaderboardPage() {
  const session = await getServerSession();

  return <LeaderboardView currentUserId={session?.user?.id} />;
}
