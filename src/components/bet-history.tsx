import { Bet, BetStatus } from 'types/bet';
import { Asset } from 'types/asset';

type Props = {
  bets: Array<Bet>;
  assets: Record<string, Asset>;
};

export function BetHistory({ bets, assets }: Props) {
  const getStatusColor = (status: BetStatus) => {
    switch (status) {
      case BetStatus.Won:
        return 'text-green-600 bg-green-50';
      case BetStatus.Lost:
        return 'text-red-600 bg-red-50';
      case BetStatus.Cancelled:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (bets.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-400 text-6xl mb-4'>🎲</div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>No bets yet</h3>
        <p className='text-gray-500'>
          Your betting history will appear here once you place your first bet.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold'>Your Betting History</h3>
      
      <div className='grid gap-4'>
        {bets.map(bet => (
          <div key={bet.id} className='border border-gray-200 rounded-lg p-4 bg-white'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                {bet.market && (
                  <h4 className='font-semibold text-gray-900'>{bet.market.name}</h4>
                )}
                {bet.option && (
                  <p className='text-sm text-gray-600'>Selection: {bet.option.name}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bet.status)}`}>
                {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
              </span>
            </div>
            
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-gray-500'>Bet Amount:</span>
                <p className='font-medium'>${bet.amount}</p>
              </div>
              <div>
                <span className='text-gray-500'>Odds:</span>
                <p className='font-medium'>{parseFloat(bet.odds).toFixed(2)}</p>
              </div>
              <div>
                <span className='text-gray-500'>Potential Win:</span>
                <p className='font-medium'>${bet.potentialWin}</p>
              </div>
              <div>
                <span className='text-gray-500'>Placed:</span>
                <p className='font-medium'>{formatDate(bet.placedAt)}</p>
              </div>
            </div>
            
            {bet.settledAt && (
              <div className='mt-2 pt-2 border-t border-gray-100'>
                <span className='text-sm text-gray-500'>
                  Settled: {formatDate(bet.settledAt)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}