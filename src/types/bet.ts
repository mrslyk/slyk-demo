export enum BetStatus {
  Open = 'open',
  Won = 'won',
  Lost = 'lost',
  Cancelled = 'cancelled',
}

export enum BetType {
  Match = 'match',
  Outright = 'outright',
}

export type BetOption = {
  id: string;
  name: string;
  odds: string; // decimal odds as string
  isWinning?: boolean;
};

export type BettingMarket = {
  id: string;
  name: string;
  description: string;
  assetCode: string; // which currency to bet with
  status: 'open' | 'closed' | 'settled';
  type: BetType;
  endsAt: string; // ISO date string
  settledAt?: string; // ISO date string
  options: Array<BetOption>;
  thumbnail?: {
    url: string;
  };
};

export type Bet = {
  id: string;
  userId: string;
  marketId: string;
  optionId: string;
  amount: string; // bet amount as string
  odds: string; // odds at time of bet
  potentialWin: string; // calculated potential winnings
  status: BetStatus;
  placedAt: string; // ISO date string
  settledAt?: string; // ISO date string
  market?: BettingMarket;
  option?: BetOption;
};