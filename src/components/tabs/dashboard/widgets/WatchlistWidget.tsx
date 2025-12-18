import React, { useState, useEffect } from 'react';
import { BaseWidget } from './BaseWidget';
import { watchlistService, WatchlistStockWithQuote } from '../../../../services/watchlistService';
import { useTerminalTheme } from '@/contexts/ThemeContext';

interface WatchlistWidgetProps {
  id: string;
  watchlistId?: string;
  watchlistName?: string;
  onRemove?: () => void;
}

export const WatchlistWidget: React.FC<WatchlistWidgetProps> = ({
  id,
  watchlistId,
  watchlistName = 'Watchlist',
  onRemove
}) => {
  const { colors, fontSize } = useTerminalTheme();
  const [stocks, setStocks] = useState<WatchlistStockWithQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use theme font sizes
  const contentFontSize = fontSize.small;

  const loadStocks = async () => {
    if (!watchlistId) {
      setError('No watchlist selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await watchlistService.initialize();
      const data = await watchlistService.getWatchlistStocksWithQuotes(watchlistId);
      setStocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
    const interval = setInterval(loadStocks, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [watchlistId]);

  const formatChange = (value: number) => value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  const formatPercent = (value: number) => value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;

  return (
    <BaseWidget
      id={id}
      title={`WATCHLIST - ${watchlistName}`}
      onRemove={onRemove}
      onRefresh={loadStocks}
      isLoading={loading}
      error={error}
    >
      <div style={{ padding: '4px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '4px',
          fontSize: contentFontSize,
          fontWeight: 'bold',
          color: colors.text,
          borderBottom: `1px solid ${colors.textMuted}`,
          padding: '4px 0',
          marginBottom: '4px'
        }}>
          <div>SYMBOL</div>
          <div style={{ textAlign: 'right' }}>PRICE</div>
          <div style={{ textAlign: 'right' }}>CHG</div>
          <div style={{ textAlign: 'right' }}>%CHG</div>
        </div>
        {stocks.map((stock, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '4px',
              fontSize: contentFontSize,
              padding: '2px 0',
              borderBottom: '1px solid rgba(120,120,120,0.3)'
            }}
          >
            <div style={{ color: colors.accent }}>{stock.symbol}</div>
            <div style={{ color: colors.text, textAlign: 'right' }}>
              {stock.quote?.price?.toFixed(2) || '-'}
            </div>
            <div style={{
              color: (stock.quote?.change || 0) >= 0 ? colors.secondary : colors.alert,
              textAlign: 'right'
            }}>
              {stock.quote ? formatChange(stock.quote.change) : '-'}
            </div>
            <div style={{
              color: (stock.quote?.change_percent || 0) >= 0 ? colors.secondary : colors.alert,
              textAlign: 'right'
            }}>
              {stock.quote ? formatPercent(stock.quote.change_percent) : '-'}
            </div>
          </div>
        ))}
        {stocks.length === 0 && !loading && !error && (
          <div style={{ color: colors.textMuted, fontSize: contentFontSize, textAlign: 'center', padding: '12px' }}>
            No stocks in watchlist
          </div>
        )}
      </div>
    </BaseWidget>
  );
};
