import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AchievementsView } from '@/components/gamification/AchievementsView';
import { ReputationService } from '@/lib/services/reputation.service';

export default async function AchievementsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const [reputation, stats] = await Promise.all([
    ReputationService.getUserReputation(session.user.id),
    ReputationService.getUserStats(session.user.id),
  ]);

  return <AchievementsView reputation={reputation} stats={stats} />;
}
