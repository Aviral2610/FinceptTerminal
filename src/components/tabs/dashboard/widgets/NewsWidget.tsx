import React, { useState, useEffect } from 'react';
import { BaseWidget } from './BaseWidget';
import { fetchNewsWithCache, NewsArticle } from '../../../../services/newsService';
import { useTerminalTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface NewsWidgetProps {
  id: string;
  category?: string;
  limit?: number;
  onRemove?: () => void;
}

export const NewsWidget: React.FC<NewsWidgetProps> = ({ id, category = 'ALL', limit = 5, onRemove }) => {
  const { t } = useTranslation('dashboard');
  const { colors, fontSize } = useTerminalTheme();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use theme font sizes
  const headlineFontSize = fontSize.small;
  const summaryFontSize = fontSize.tiny;
  const metaFontSize = fontSize.tiny;

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const articles = await fetchNewsWithCache();
      // Filter by category if not ALL
      const filtered = category === 'ALL' ? articles : articles.filter(a => a.category === category);
      setNews(filtered.slice(0, limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category, limit]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'FLASH':
      case 'URGENT': return colors.alert;
      case 'BREAKING': return colors.warning;
      default: return colors.textMuted;
    }
  };

  return (
    <BaseWidget
      id={id}
      title={`${t('widgets.news')} - ${category}`}
      onRemove={onRemove}
      onRefresh={loadNews}
      isLoading={loading}
      error={error}
    >
      <div style={{ padding: '8px' }}>
        {news.map((article, index) => (
          <div
            key={article.id}
            style={{
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: index < news.length - 1 ? `1px solid ${colors.textMuted}` : 'none'
            }}
          >
            <div style={{ display: 'flex', gap: '4px', marginBottom: '2px', fontSize: metaFontSize }}>
              <span style={{ color: getPriorityColor(article.priority), fontWeight: 'bold' }}>
                [{article.priority}]
              </span>
              <span style={{ color: colors.info }}>[{article.category}]</span>
              <span style={{ color: colors.textMuted }}>{article.time}</span>
            </div>
            <div style={{ color: colors.text, fontSize: headlineFontSize, fontWeight: 'bold', marginBottom: '2px', lineHeight: '1.2' }}>
              {article.headline}
            </div>
            <div style={{ color: colors.textMuted, fontSize: summaryFontSize, lineHeight: '1.2' }}>
              {article.summary.substring(0, 100)}...
            </div>
            <div style={{ color: colors.textMuted, fontSize: metaFontSize, marginTop: '2px' }}>
              {article.source}
            </div>
          </div>
        ))}
        {news.length === 0 && !loading && !error && (
          <div style={{ color: colors.textMuted, fontSize: headlineFontSize, textAlign: 'center', padding: '12px' }}>
            {t('widgets.noNewsData')}
          </div>
        )}
      </div>
    </BaseWidget>
  );
};
