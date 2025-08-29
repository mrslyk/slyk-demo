import type { NextApiRequest, NextApiResponse } from 'next';
import createSlykClient from '@slyk/slyk-sdk-node';
import { ServerSession } from 'server/server-session';
import Cookies from 'cookies';
import { Bet, BetStatus } from 'types/bet';
import { ApiError } from 'types/api';
import BigNumber from 'bignumber.js';

// In-memory storage for demo purposes - in a real app this would be a database
const bets: Array<Bet> = [];

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Bet | Array<Bet> | ApiError>
) {
  const slyk = createSlykClient({
    apikey: process.env.SLYK_API_KEY,
    host: 'api.stg.slyk.io',
  });

  const session = new ServerSession(slyk, new Cookies(request, response));
  const token = await session.getToken();

  if (!token) {
    const apiError: ApiError = {
      code: 'UNAUTHORIZED',
      status: 401,
    };
    response.status(401).json(apiError);
    return;
  }

  try {
    const { user } = await slyk.auth.validate({ token });

    if (request.method === 'GET') {
      // Get user's bet history
      const userBets = bets.filter(bet => bet.userId === user.id);
      response.status(200).json(userBets);
      return;
    }

    if (request.method === 'POST') {
      // Place a new bet
      const { marketId, optionId, amount, odds } = request.body;

      if (!marketId || !optionId || !amount || !odds) {
        const apiError: ApiError = {
          code: 'MISSING_PARAMETERS',
          status: 400,
        };
        response.status(400).json(apiError);
        return;
      }

      // Validate amount format
      const betAmount = new BigNumber(amount);
      if (betAmount.isNaN() || betAmount.isLessThanOrEqualTo(0)) {
        const apiError: ApiError = {
          code: 'INVALID_AMOUNT',
          status: 400,
        };
        response.status(400).json(apiError);
        return;
      }

      // Get user's wallet balance to verify they have enough funds
      // For this demo, we'll assume they're betting with USD
      const balances = await slyk.wallet.balance(user.primaryWalletId);
      const usdBalance = balances.find((balance: any) => balance.assetCode === 'USD');
      
      if (!usdBalance || new BigNumber(usdBalance.amount).isLessThan(betAmount)) {
        const apiError: ApiError = {
          code: 'INSUFFICIENT_FUNDS',
          status: 400,
        };
        response.status(400).json(apiError);
        return;
      }

      // Calculate potential winnings
      const oddsDecimal = new BigNumber(odds);
      const potentialWin = betAmount.multipliedBy(oddsDecimal).toFixed(2);

      // Create the bet
      const bet: Bet = {
        id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        marketId,
        optionId,
        amount: betAmount.toFixed(2),
        odds: oddsDecimal.toFixed(2),
        potentialWin,
        status: BetStatus.Open,
        placedAt: new Date().toISOString(),
      };

      // In a real app, you would:
      // 1. Create a transaction to hold/reserve the bet amount using Slyk
      // 2. Store the bet in a database
      // 3. Handle bet settlement logic
      
      // For this demo, we'll just store it in memory
      bets.push(bet);

      response.status(201).json(bet);
      return;
    }

    response.status(404);
  } catch (error: any) {
    console.log('Error handling bet operation', error);
    const apiError: ApiError = {
      code: error.data?.code ?? error.message ?? 'INTERNAL_ERROR',
      status: 500,
    };
    response.status(500).json(apiError);
  }
}