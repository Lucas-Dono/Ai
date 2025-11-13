import { auth } from '@/lib/auth';
import { LeaderboardView } from '@/components/gamification/LeaderboardView';

export default async function LeaderboardPage() {
  const session = await auth();

  return <LeaderboardView currentUserId={session?.user?.id} />;
}
