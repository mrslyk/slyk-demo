import { useState } from 'react';
import BigNumber from 'bignumber.js';
import { BettingMarket } from 'types/bet';

type Props = {
  selectedBet: {
    market: BettingMarket;
    optionId: string;
    optionName: string;
    odds: string;
  } | null;
  availableBalance: string;
  onClearBet: () => void;
  onBetPlaced: () => void;
};

export function BetSlip({ selectedBet, availableBalance, onClearBet, onBetPlaced }: Props) {
  const [betAmount, setBetAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');

  const calculatePotentialWin = () => {
    if (!selectedBet || !betAmount) return '0.00';
    
    const amount = new BigNumber(betAmount);
    const odds = new BigNumber(selectedBet.odds);
    
    if (amount.isNaN() || odds.isNaN()) return '0.00';
    
    return amount.multipliedBy(odds).toFixed(2);
  };

  const handlePlaceBet = async () => {
    if (!selectedBet || !betAmount) return;
    
    setError('');
    setIsPlacing(true);
    
    try {
      const amount = new BigNumber(betAmount);
      const balance = new BigNumber(availableBalance);
      
      if (amount.isLessThanOrEqualTo(0)) {
        setError('Bet amount must be greater than 0');
        return;
      }
      
      if (amount.isGreaterThan(balance)) {
        setError('Insufficient balance');
        return;
      }
      
      const response = await fetch('/api/betting/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId: selectedBet.market.id,
          optionId: selectedBet.optionId,
          amount: amount.toFixed(2),
          odds: selectedBet.odds,
        }),
      });
      
      if (response.ok) {
        setBetAmount('');
        onBetPlaced();
        alert('Bet placed successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.code || 'Failed to place bet');
      }
    } catch (err) {
      setError('Failed to place bet');
      console.error('Bet placement error:', err);
    } finally {
      setIsPlacing(false);
    }
  };

  if (!selectedBet) {
    return (
      <div className='border border-gray-200 rounded-lg p-6 bg-gray-50'>
        <p className='text-gray-500 text-center'>
          Select a betting option to get started
        </p>
      </div>
    );
  }

  return (
    <div className='border border-gray-200 rounded-lg p-6 bg-white shadow-sm'>
      <div className='mb-4'>
        <h4 className='font-semibold text-gray-900 mb-1'>{selectedBet.market.name}</h4>
        <p className='text-sm text-gray-600'>Selection: {selectedBet.optionName}</p>
        <p className='text-sm text-gray-600'>Odds: {parseFloat(selectedBet.odds).toFixed(2)}</p>
      </div>
      
      <div className='mb-4'>
        <label htmlFor='betAmount' className='block text-sm font-medium text-gray-700 mb-2'>
          Bet Amount (USD)
        </label>
        <input
          id='betAmount'
          type='number'
          step='0.01'
          min='0'
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          placeholder='0.00'
        />
        <p className='text-xs text-gray-500 mt-1'>
          Available: ${availableBalance}
        </p>
      </div>
      
      <div className='mb-4 p-3 bg-gray-50 rounded-md'>
        <div className='flex justify-between items-center text-sm'>
          <span>Potential Win:</span>
          <span className='font-semibold'>${calculatePotentialWin()}</span>
        </div>
      </div>
      
      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}
      
      <div className='flex gap-2'>
        <button
          onClick={onClearBet}
          className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
        >
          Clear
        </button>
        <button
          onClick={handlePlaceBet}
          disabled={!betAmount || isPlacing}
          className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors'
        >
          {isPlacing ? 'Placing...' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
}