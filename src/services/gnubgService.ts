// src/services/gnubgService.ts
import type { IAQuota } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { EvaluationResult, SuggestedMove } from '../types/ai';
import type { Move } from '../types/game';
import type { AnalyzeInput } from './aiService';
import { GNUBGProvider } from '../providers/gnubgProvider';
import { Logger } from '../utils/logger';
import { prisma } from '../server';
import { quotaConsumptionTotal, quotaExhaustedTotal } from '../metrics/quotaMetrics';
import { SubscriptionService, type UserPlan } from './subscriptionService';
import { QuotaExceededError } from './aiService';
import { notificationService } from './notificationService';

export interface HintInput {
  board: unknown;
  dice: unknown;
  move?: Move | null;
  userId?: string | null;
  gameId?: string | null;
}

export interface EvaluateInput {
  board: unknown;
  dice?: unknown;
  userId?: string | null;
  gameId?: string | null;
}

export interface AnalyzeGameInput {
  moves: Move[];
}

const provider = new GNUBGProvider();
const logger = new Logger('GNUBGService');
const FREE_DAILY_QUOTA = 5;
const PREMIUM_DAILY_QUOTA = 10;

const nextResetAt = (date = new Date()): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));

const initialQuota = (plan: UserPlan) => ({
  dailyQuota: plan === 'free' ? FREE_DAILY_QUOTA : 0,
  premiumQuota: plan === 'premium' ? PREMIUM_DAILY_QUOTA : 0
});

const resetQuotaIfNeeded = (record: IAQuota, plan: UserPlan): IAQuota => {
  const now = new Date();
  if (record.resetAt.getTime() > now.getTime()) {
    return record;
  }

  const seed = initialQuota(plan);
  return {
    ...record,
    dailyQuota: seed.dailyQuota,
    premiumQuota: seed.premiumQuota,
    extrasUsed: 0,
    resetAt: nextResetAt(now)
  };
};

const ensureQuotaRecord = async (
  client: Prisma.TransactionClient,
  userId: string,
  plan: UserPlan
): Promise<{ record: IAQuota; reset: boolean }> => {
  const quotaClient = client as Prisma.TransactionClient & { iAQuota: typeof prisma.iAQuota };
  let record = await quotaClient.iAQuota.findUnique({ where: { userId } });
  if (!record) {
    const seed = initialQuota(plan);
    record = await quotaClient.iAQuota.create({
      data: {
        userId,
        dailyQuota: seed.dailyQuota,
        premiumQuota: seed.premiumQuota,
        extrasUsed: 0,
        resetAt: nextResetAt()
      }
    });
    return { record, reset: true };
  }

  const reset = resetQuotaIfNeeded(record, plan);
  if (reset === record) {
    return { record, reset: false };
  }

  const updated = await quotaClient.iAQuota.update({
    where: { userId },
    data: {
      dailyQuota: reset.dailyQuota,
      premiumQuota: reset.premiumQuota,
      extrasUsed: reset.extrasUsed,
      resetAt: reset.resetAt
    }
  });

  return { record: updated, reset: true };
};

type ConsumptionField = 'premiumQuota' | 'dailyQuota' | 'extrasUsed';
type ConsumptionSource = 'premium' | 'daily' | 'extras';

const buildFieldFilter = (field: ConsumptionField) => {
  if (field === 'premiumQuota') {
    return { premiumQuota: { gt: 0 } } as const;
  }
  if (field === 'dailyQuota') {
    return { dailyQuota: { gt: 0 } } as const;
  }
  return { extrasUsed: { gt: 0 } } as const;
};

const buildFieldDecrement = (field: ConsumptionField) => {
  if (field === 'premiumQuota') {
    return { premiumQuota: { decrement: 1 } } as const;
  }
  if (field === 'dailyQuota') {
    return { dailyQuota: { decrement: 1 } } as const;
  }
  return { extrasUsed: { decrement: 1 } } as const;
};

const decrementQuotaField = async (
  client: Prisma.TransactionClient,
  userId: string,
  field: ConsumptionField
): Promise<IAQuota | null> => {
  const quotaClient = client as Prisma.TransactionClient & { iAQuota: typeof prisma.iAQuota };
  const result = await quotaClient.iAQuota.updateMany({
    where: {
      userId,
      ...buildFieldFilter(field)
    },
    data: buildFieldDecrement(field)
  });

  if (result.count === 0) {
    return null;
  }

  return quotaClient.iAQuota.findUnique({ where: { userId } });
};

const consumeQuotaInTransaction = async (
  client: Prisma.TransactionClient,
  userId: string,
  plan: UserPlan
): Promise<{ record: IAQuota; source: ConsumptionSource } | null> => {
  if (plan === 'premium') {
    const premium = await decrementQuotaField(client, userId, 'premiumQuota');
    if (premium) {
      return { record: premium, source: 'premium' };
    }
  }

  const daily = await decrementQuotaField(client, userId, 'dailyQuota');
  if (daily) {
    return { record: daily, source: 'daily' };
  }

  const extras = await decrementQuotaField(client, userId, 'extrasUsed');
  if (extras) {
    return { record: extras, source: 'extras' };
  }

  return null;
};

const checkAndConsumeQuota = async (userId: string): Promise<void> => {
  const plan = await SubscriptionService.getUserPlan(userId);
  let exhaustedState: IAQuota | null = null;
  let quotaResetSnapshot: { dailyQuota: number; premiumQuota: number } | null = null;
  let lastConsumptionSource: ConsumptionSource | null = null;

  try {
    const consumption = await prisma.$transaction(
      async tx => {
        const ensureResult = await ensureQuotaRecord(tx, userId, plan);

        if (ensureResult.reset) {
          quotaResetSnapshot = {
            dailyQuota: ensureResult.record.dailyQuota,
            premiumQuota: ensureResult.record.premiumQuota
          };
        }

        const result = await consumeQuotaInTransaction(tx, userId, plan);
        if (!result) {
          exhaustedState = await tx.iAQuota.findUnique({ where: { userId } });
          throw new QuotaExceededError();
        }

        lastConsumptionSource = result.source;
        return result;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    const quota = consumption.record;
    logger.debug('Quota consumed', {
      userId,
      plan,
      consumedFrom: consumption.source,
      dailyQuota: quota.dailyQuota,
      premiumQuota: quota.premiumQuota,
      extrasRemaining: quota.extrasUsed
    });

    quotaConsumptionTotal.labels(plan, consumption.source).inc();

    if (quotaResetSnapshot) {
      const dailyQuotaAfterConsumption =
        quotaResetSnapshot.dailyQuota - (lastConsumptionSource === 'daily' ? 1 : 0);
      const premiumQuotaAfterConsumption =
        quotaResetSnapshot.premiumQuota - (lastConsumptionSource === 'premium' ? 1 : 0);

      notificationService.notifyQuotaReset(userId, {
        plan,
        dailyQuota: Math.max(0, dailyQuotaAfterConsumption),
        premiumQuota: Math.max(0, premiumQuotaAfterConsumption),
        extraQuota: 0
      });
    }
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      logger.warn('Quota exhausted', { userId, plan, quota: exhaustedState });
      quotaExhaustedTotal.labels(plan).inc();

       const remainingDaily = exhaustedState?.dailyQuota ?? 0;
       const remainingPremium = exhaustedState?.premiumQuota ?? 0;

       notificationService.notifyQuotaExhausted(userId, {
         plan,
         remainingDailyQuota: Math.max(0, remainingDaily),
         remainingPremiumQuota: Math.max(0, remainingPremium),
         remainingExtraQuota: 0
       });
    }
    throw error;
  }
};

const buildAnalyzeInput = (input: HintInput | EvaluateInput): AnalyzeInput => {
  const payload: AnalyzeInput = {
    boardState: input.board,
    dice: 'dice' in input && typeof input.dice !== 'undefined' ? input.dice : null
  };

  if ('move' in input && typeof input.move !== 'undefined') {
    payload.move = input.move ?? null;
  }

  if (input.userId) {
    payload.userId = input.userId;
  }

  if (input.gameId) {
    payload.gameId = input.gameId;
  }

  return payload;
};

export async function getHint(input: HintInput): Promise<SuggestedMove> {
  try {
    if (input.userId) {
      await checkAndConsumeQuota(input.userId);
    }

    return await provider.getBestMove(buildAnalyzeInput(input));
  } catch (error) {
    logger.error('Failed to fetch hint from GNUBG', error);
    throw error;
  }
}

export async function evaluatePosition(input: EvaluateInput): Promise<EvaluationResult> {
  try {
    if (input.userId) {
      await checkAndConsumeQuota(input.userId);
    }

    return await provider.evaluatePosition(buildAnalyzeInput(input));
  } catch (error) {
    logger.error('Failed to evaluate position via GNUBG', error);
    throw error;
  }
}

export async function analyzeGame(input: AnalyzeGameInput) {
  try {
    return await provider.analyzeGame(input.moves);
  } catch (error) {
    logger.error('Failed to analyze game via GNUBG', error);
    throw error;
  }
}

export const gnubgService = {
  getHint,
  evaluatePosition,
  analyzeGame
};
