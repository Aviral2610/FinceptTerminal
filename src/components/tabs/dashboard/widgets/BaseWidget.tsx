import React from 'react';
import { X, RefreshCw, Settings } from 'lucide-react';
import { useTerminalTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export interface BaseWidgetProps {
  id: string;
  title: string;
  onRemove?: () => void;
  onRefresh?: () => void;
  onConfigure?: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  headerColor?: string;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  title,
  onRemove,
  onRefresh,
  onConfigure,
  children,
  isLoading = false,
  error = null,
  headerColor
}) => {
  const { t } = useTranslation('dashboard');
  const { colors, fontSize } = useTerminalTheme();

  // Use theme's headerColor if none provided
  const widgetHeaderColor = headerColor || colors.primary;

  // Calculate scaled font sizes based on theme fontSize
  const baseFontSize = parseInt(fontSize.body) || 12;
  const headerFontSize = `${Math.max(baseFontSize - 1, 9)}px`;
  const contentFontSize = `${Math.max(baseFontSize - 2, 8)}px`;

  return (
    <div style={{
      height: '100%',
      width: '100%',
      backgroundColor: '#000000',
      border: `1px solid ${colors.textMuted || '#787878'}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontSize: `${baseFontSize}px`
    }}>
      {/* Widget Header */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderBottom: `1px solid ${colors.textMuted || '#787878'}`,
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '28px',
        flexShrink: 0
      }}>
        <div
          className="widget-drag-handle"
          style={{
            color: widgetHeaderColor,
            fontSize: headerFontSize,
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            cursor: 'move',
            flex: 1,
            userSelect: 'none'
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {onConfigure && (
            <button
              onClick={onConfigure}
              style={{
                background: 'none',
                border: 'none',
                color: colors.textMuted || '#787878',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text || '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted || '#787878'}
              title={t('widgets.configure')}
            >
              <Settings size={12} />
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                color: isLoading ? (colors.textMuted || '#787878') : (colors.text || '#FFFFFF'),
                cursor: isLoading ? 'not-allowed' : 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.color = widgetHeaderColor)}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.color = colors.text || '#FFFFFF')}
              title={t('widgets.refresh')}
            >
              <RefreshCw size={12} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              style={{
                background: 'none',
                border: 'none',
                color: colors.textMuted || '#787878',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.alert || '#FF0000'}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted || '#787878'}
              title={t('widgets.remove')}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
        fontSize: contentFontSize
      }}>
        {error ? (
          <div style={{
            padding: '12px',
            color: colors.alert || '#FF0000',
            fontSize: contentFontSize,
            textAlign: 'center'
          }}>
            {t('widgets.error')}: {error}
          </div>
        ) : isLoading ? (
          <div style={{
            padding: '12px',
            color: colors.textMuted || '#787878',
            fontSize: contentFontSize,
            textAlign: 'center'
          }}>
            {t('widgets.loading')}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Global spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
