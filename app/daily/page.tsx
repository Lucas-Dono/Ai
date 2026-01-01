import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { DailyRewardsView } from '@/components/gamification/DailyRewardsView';
import { ReputationService } from '@/lib/services/reputation.service';

export default async function DailyPage() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const reputation = await ReputationService.getUserReputation(session.user.id);

  return <DailyRewardsView reputation={reputation} />;
}
