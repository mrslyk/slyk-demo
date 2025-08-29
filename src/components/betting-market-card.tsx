import { BettingMarket } from 'types/bet';

type Props = {
  market: BettingMarket;
  onSelectBet: (optionId: string, optionName: string, odds: string) => void;
};

export function BettingMarketCard({ market, onSelectBet }: Props) {
  const formatTimeRemaining = (endsAt: string) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Closed';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ${diffHours % 24}h`;
    }
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  return (
    <div className='border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex gap-4'>
        {market.thumbnail && (
          <img
            src={market.thumbnail.url}
            alt={market.name}
            className='w-20 h-20 object-cover rounded-md flex-shrink-0'
          />
        )}
        
        <div className='flex-1'>
          <div className='flex justify-between items-start mb-2'>
            <h4 className='font-semibold text-gray-900 leading-tight'>{market.name}</h4>
            <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded'>
              {formatTimeRemaining(market.endsAt)}
            </span>
          </div>
          
          <p className='text-sm text-gray-600 mb-3'>{market.description}</p>
          
          <div className='grid gap-2' style={{ gridTemplateColumns: `repeat(${market.options.length}, 1fr)` }}>
            {market.options.map(option => (
              <button
                key={option.id}
                onClick={() => onSelectBet(option.id, option.name, option.odds)}
                className='px-3 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-md text-sm font-medium transition-colors'
              >
                <div className='truncate'>{option.name}</div>
                <div className='font-bold'>{parseFloat(option.odds).toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}