import { notFound } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ReputationService } from '@/lib/services/reputation.service';
import { UserModerationService } from '@/lib/services/user-moderation.service';
import { ProfileView } from '@/components/gamification/ProfileView';

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession();
  const { userId } = await params;

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === userId;

  // Fetch reputation and stats
  const [reputation, stats, [followerCount, followingCount], isFollowing, moderationStats] = await Promise.all([
    ReputationService.getUserReputation(userId),
    ReputationService.getUserStats(userId),
    prisma.$transaction([
      prisma.follow.count({ where: { followingId: userId } }), // followers
      prisma.follow.count({ where: { followerId: userId } }), // following
    ]),
    session?.user?.id && session.user.id !== userId
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: userId,
            },
          },
        })
      : null,
    // Solo obtener estadísticas de moderación si es el propio perfil
    isOwnProfile ? UserModerationService.getModerationStats(userId) : Promise.resolve(null),
  ]);

  // Fetch user's public agents
  const agents = await prisma.agent.findMany({
    where: {
      userId,
      visibility: "public",
    },
    select: {
      id: true,
      name: true,
      description: true,
      avatar: true,
      cloneCount: true,
      rating: true,
      createdAt: true,
    },
    orderBy: { cloneCount: 'desc' },
    take: 12,
  });

  // Fetch user's recent activity (posts/comments)
  const [posts, comments] = await Promise.all([
    prisma.communityPost.findMany({
      where: { authorId: userId, status: 'published' },
      select: {
        id: true,
        title: true,
        content: true,
        upvotes: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.communityComment.findMany({
      where: { authorId: userId, status: 'published' },
      select: {
        id: true,
        content: true,
        upvotes: true,
        createdAt: true,
        CommunityPost: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <ProfileView
      user={user}
      reputation={reputation}
      stats={stats}
      moderationStats={moderationStats}
      agents={agents}
      posts={posts}
      comments={comments}
      followersCount={followerCount}
      followingCount={followingCount}
      isFollowing={!!isFollowing}
      isOwnProfile={isOwnProfile}
    />
  );
}
