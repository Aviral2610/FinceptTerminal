import React, { useState, useEffect } from 'react';
import { BaseWidget } from './BaseWidget';
import { marketDataService, QuoteData } from '../../../../services/marketDataService';
import { useTerminalTheme } from '@/contexts/ThemeContext';

interface CryptoWidgetProps {
  id: string;
  onRemove?: () => void;
}

const TOP_CRYPTOS = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD', 'DOGE-USD', 'SOL-USD', 'DOT-USD', 'MATIC-USD', 'LTC-USD'];

export const CryptoWidget: React.FC<CryptoWidgetProps> = ({ id, onRemove }) => {
  const { colors, fontSize } = useTerminalTheme();
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use fontSize.small for content text in widgets
  const contentFontSize = fontSize.small;

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await marketDataService.getEnhancedQuotesWithCache(TOP_CRYPTOS, 'Crypto', 10);
      setQuotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load crypto data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
    const interval = setInterval(loadQuotes, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatChange = (value: number) => value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  const formatPercent = (value: number) => value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;

  return (
    <BaseWidget
      id={id}
      title="CRYPTOCURRENCY MARKETS"
      onRemove={onRemove}
      onRefresh={loadQuotes}
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
        {quotes.map((quote, index) => (
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
            <div style={{ color: colors.accent }}>{quote.symbol.replace('-USD', '')}</div>
            <div style={{ color: colors.text, textAlign: 'right' }}>
              ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{
              color: quote.change >= 0 ? colors.secondary : colors.alert,
              textAlign: 'right'
            }}>
              {formatChange(quote.change)}
            </div>
            <div style={{
              color: quote.change_percent >= 0 ? colors.secondary : colors.alert,
              textAlign: 'right'
            }}>
              {formatPercent(quote.change_percent)}
            </div>
          </div>
        ))}
        {quotes.length === 0 && !loading && !error && (
          <div style={{ color: colors.textMuted, fontSize: contentFontSize, textAlign: 'center', padding: '12px' }}>
            No crypto data available
          </div>
        )}
      </div>
    </BaseWidget>
  );
};
