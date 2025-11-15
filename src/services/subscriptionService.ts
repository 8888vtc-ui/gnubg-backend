// src/services/subscriptionService.ts
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { prisma } from '../server';

export type UserPlan = 'free' | 'premium';

const ACTIVE_STATUSES: SubscriptionStatus[] = [SubscriptionStatus.ACTIVE];
const PREMIUM_PLANS: SubscriptionPlan[] = [SubscriptionPlan.PREMIUM, SubscriptionPlan.VIP];

export const SubscriptionService = {
  async getUserPlan(userId: string): Promise<UserPlan> {
    if (!userId) {
      return 'free';
    }

    const subscription = await prisma.subscriptions.findUnique({
      where: { user_id: userId }
    });

    if (!subscription) {
      return 'free';
    }

    const isActive = ACTIVE_STATUSES.includes(subscription.status);
    const isPremiumPlan = PREMIUM_PLANS.includes(subscription.plan);

    return isActive && isPremiumPlan ? 'premium' : 'free';
  }
};
