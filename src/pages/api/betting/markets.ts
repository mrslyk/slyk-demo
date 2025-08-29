import type { NextApiRequest, NextApiResponse } from 'next';
import createSlykClient from '@slyk/slyk-sdk-node';
import { ServerSession } from 'server/server-session';
import Cookies from 'cookies';
import { BettingMarket, BetType } from 'types/bet';
import { ApiError } from 'types/api';

// Sample betting markets data - in a real app this would come from a database
const sampleMarkets: Array<BettingMarket> = [
  {
    id: 'market_1',
    name: 'Premier League: Manchester United vs Liverpool',
    description: 'Match winner for the Premier League fixture',
    assetCode: 'USD',
    status: 'open',
    type: BetType.Match,
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    options: [
      { id: 'option_1', name: 'Manchester United', odds: '2.50' },
      { id: 'option_2', name: 'Draw', odds: '3.20' },
      { id: 'option_3', name: 'Liverpool', odds: '1.95' },
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
    },
  },
  {
    id: 'market_2', 
    name: 'Champions League Winner 2024',
    description: 'Outright winner of the 2024 Champions League tournament',
    assetCode: 'USD',
    status: 'open',
    type: BetType.Outright,
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    options: [
      { id: 'option_4', name: 'Manchester City', odds: '3.50' },
      { id: 'option_5', name: 'Real Madrid', odds: '4.00' },
      { id: 'option_6', name: 'Barcelona', odds: '5.50' },
      { id: 'option_7', name: 'Bayern Munich', odds: '6.00' },
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=300&fit=crop',
    },
  },
  {
    id: 'market_3',
    name: 'NBA Finals: Lakers vs Celtics',
    description: 'Game 1 winner of the NBA Finals series',
    assetCode: 'USD', 
    status: 'open',
    type: BetType.Match,
    endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    options: [
      { id: 'option_8', name: 'Los Angeles Lakers', odds: '1.85' },
      { id: 'option_9', name: 'Boston Celtics', odds: '2.15' },
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
    },
  },
];

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Array<BettingMarket> | ApiError>
) {
  if (request.method !== 'GET') {
    response.status(404);
    return;
  }

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
    // Validate the user session
    await slyk.auth.validate({ token });
    
    // Return sample markets - in a real app, filter by status, sort, etc.
    const openMarkets = sampleMarkets.filter(market => market.status === 'open');
    response.status(200).json(openMarkets);
  } catch (error: any) {
    console.log('Error fetching betting markets', error);
    const apiError: ApiError = {
      code: error.data?.code ?? error.message ?? 'INTERNAL_ERROR',
      status: 500,
    };
    response.status(500).json(apiError);
  }
}