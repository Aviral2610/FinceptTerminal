
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';
import { ConnectionStatus } from '@/services/websocket';

// Mock WebSocketManager
vi.mock('@/services/websocket', () => {
  const mockSubscribe = vi.fn().mockResolvedValue({
    unsubscribe: vi.fn(),
    id: 'test-sub-id',
    topic: '',
    callback: () => {}
  });

  const mockManager = {
    subscribe: mockSubscribe,
    getStatus: vi.fn().mockReturnValue('connected'),
    getStats: vi.fn(),
    getAllStatuses: vi.fn(),
    getAllMetrics: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    ping: vi.fn(),
    registry: {
        get: vi.fn().mockReturnValue({
            send: vi.fn()
        })
    }
  };

  return {
    getWebSocketManager: vi.fn().mockReturnValue(mockManager),
    ConnectionStatus: {
      CONNECTED: 'connected',
      DISCONNECTED: 'disconnected'
    },
    useWebSocketManager: vi.fn(),
    useWebSocketConnection: vi.fn(),
  };
});

// Import after mock
import { getWebSocketManager } from '@/services/websocket';

describe('useWebSocket Hook Bug Reproduction', () => {
  const manager = getWebSocketManager();

  beforeEach(() => {
    vi.clearAllMocks();
    (manager.getStatus as any).mockReturnValue(ConnectionStatus.CONNECTED);
  });

  it('should resubscribe when params change', async () => {
    const topic = 'provider.channel.symbol';
    const initialParams = { timeframe: '1m' };
    const newParams = { timeframe: '5m' };

    const { rerender } = renderHook(
      ({ topic, params }) => useWebSocket(topic, null, { params }),
      {
        initialProps: { topic, params: initialParams }
      }
    );

    // Initial subscription
    expect(manager.subscribe).toHaveBeenCalledWith(
      topic,
      expect.any(Function),
      initialParams
    );

    // Reset mock to check for second call
    (manager.subscribe as any).mockClear();

    // Rerender with new params
    rerender({ topic, params: newParams });

    // Wait for effects to run
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Expect subscribe to be called with new params
    expect(manager.subscribe).toHaveBeenCalledWith(
      topic,
      expect.any(Function),
      newParams
    );
  });
});
