import { useProfile } from 'components/session-provider';
import Cookies from 'cookies';
import type { GetServerSideProps, NextPage } from 'next';
import { User } from 'types/user';
import createSlykClient from '@slyk/slyk-sdk-node';
import { Balance } from 'types/balance';
import { Navbar } from 'components/navbar';
import { StackedLayout } from 'components/stacked-layout';
import { ServerSession } from 'server/server-session';
import { Card } from 'components/card';
import { Asset } from 'types/asset';
import { normalizeAssets } from 'utils/assets';
import { useState } from 'react';
import { BettingMarket, Bet, BetType } from 'types/bet';
import { BettingMarketCard } from 'components/betting-market-card';
import { BetSlip } from 'components/bet-slip';
import { BetHistory } from 'components/bet-history';

type Props = {
  user: User;
  assets: Record<string, Asset>;
  balances: Array<Balance>;
  markets: Array<BettingMarket>;
  userBets: Array<Bet>;
};

const Betting: NextPage<Props> = props => {
  const { assets, balances, markets, userBets } = props;
  const user = useProfile() as User;
  const [selectedBet, setSelectedBet] = useState<{
    market: BettingMarket;
    optionId: string;
    optionName: string;
    odds: string;
  } | null>(null);
  const [showBetHistory, setShowBetHistory] = useState(false);

  // Get USD balance for betting
  const usdBalance = balances.find(balance => balance.assetCode === 'USD');
  const usdAsset = assets['USD'];

  return (
    <>
      <StackedLayout navbar={<Navbar user={user} />} title='Betting'>
        <Card className='h-full'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-bold'>Sports Betting</h2>
            <button
              onClick={() => setShowBetHistory(!showBetHistory)}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              {showBetHistory ? 'Show Markets' : 'Bet History'}
            </button>
          </div>

          {!showBetHistory ? (
            <>
              {/* Available balance */}
              <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
                <h3 className='text-lg font-medium mb-2'>Available Balance</h3>
                <div className='text-2xl font-bold text-green-600'>
                  {usdAsset?.symbol ?? 'USD'} {usdBalance?.amount ?? '0.00'}
                </div>
              </div>

              {/* Betting Markets */}
              <div className='grid gap-6 grid-cols-1 lg:grid-cols-2'>
                <div>
                  <h3 className='text-xl font-semibold mb-4'>Available Markets</h3>
                  <div className='space-y-4'>
                    {markets.map(market => (
                      <BettingMarketCard
                        key={market.id}
                        market={market}
                        onSelectBet={(optionId, optionName, odds) => {
                          setSelectedBet({
                            market,
                            optionId,
                            optionName,
                            odds,
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Bet Slip */}
                <div>
                  <h3 className='text-xl font-semibold mb-4'>Bet Slip</h3>
                  <BetSlip
                    selectedBet={selectedBet}
                    availableBalance={usdBalance?.amount ?? '0'}
                    onClearBet={() => setSelectedBet(null)}
                    onBetPlaced={() => {
                      setSelectedBet(null);
                      // In a real app, you'd refresh the data here
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <BetHistory bets={userBets} assets={assets} />
          )}
        </Card>
      </StackedLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
  const { req, res } = ctx;
  const slyk = createSlykClient({
    apikey: process.env.SLYK_API_KEY,
    host: 'api.stg.slyk.io',
  });

  const session = new ServerSession(slyk, new Cookies(req, res));
  const token = await session.getToken();

  if (!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const { user } = await slyk.auth.validate({ token });
  const [assetList, balances] = await Promise.all([
    slyk.asset.list({
      all: true,
      filter: { enabled: 'true' },
    }),
    slyk.wallet.balance(user.primaryWalletId),
  ]);

  const assets = JSON.parse(JSON.stringify(normalizeAssets(assetList.results)));

  // Fetch betting markets (in a real app, this would be from the API or database)
  const sampleMarkets: Array<BettingMarket> = [
    {
      id: 'market_1',
      name: 'Premier League: Manchester United vs Liverpool',
      description: 'Match winner for the Premier League fixture',
      assetCode: 'USD',
      status: 'open',
      type: BetType.Match,
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      options: [
        { id: 'option_8', name: 'Los Angeles Lakers', odds: '1.85' },
        { id: 'option_9', name: 'Boston Celtics', odds: '2.15' },
      ],
      thumbnail: {
        url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
      },
    },
  ];

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
      assets: assets,
      balances: JSON.parse(JSON.stringify(balances)),
      markets: sampleMarkets,
      userBets: [], // In a real app, fetch user's betting history
    },
  };
};

export default Betting;