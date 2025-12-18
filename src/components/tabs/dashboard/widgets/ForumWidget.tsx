import React, { useState, useEffect } from 'react';
import { BaseWidget } from './BaseWidget';
import { ForumApiService } from '../../../../services/forumApi';
import { useTerminalTheme } from '@/contexts/ThemeContext';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  category: string;
  likes: number;
  replies: number;
  time: string;
}

interface ForumWidgetProps {
  id: string;
  categoryId?: number;
  categoryName?: string;
  limit?: number;
  onRemove?: () => void;
}

export const ForumWidget: React.FC<ForumWidgetProps> = ({
  id,
  categoryId,
  categoryName = 'Recent Posts',
  limit = 5,
  onRemove
}) => {
  const { colors, fontSize } = useTerminalTheme();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use theme font sizes
  const titleFontSize = fontSize.small;
  const metaFontSize = fontSize.tiny;

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = localStorage.getItem('fincept_api_key') || undefined;
      const deviceId = localStorage.getItem('fincept_device_id') || undefined;
      const targetCategoryId = categoryId || 1;
      const response = await ForumApiService.getPostsByCategory(targetCategoryId, 'latest', limit, apiKey, deviceId);

      if (response.success) {
        const postsData = (response.data as any)?.data?.posts || (response.data as any)?.posts || [];
        const formattedPosts = postsData.map((post: any) => ({
          id: post.post_uuid,
          title: post.title,
          author: post.author_display_name || 'Anonymous',
          category: post.category_name || 'General',
          likes: post.likes || 0,
          replies: post.reply_count || 0,
          time: new Date(post.created_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        }));
        setPosts(formattedPosts);
      } else {
        setError(response.error || `HTTP ${response.status_code || 'error'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    const interval = setInterval(loadPosts, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [categoryId, limit]);

  return (
    <BaseWidget
      id={id}
      title={`FORUM - ${categoryName}`}
      onRemove={onRemove}
      onRefresh={loadPosts}
      isLoading={loading}
      error={error}
    >
      <div style={{ padding: '8px' }}>
        {posts.map((post, index) => (
          <div
            key={post.id}
            style={{
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: index < posts.length - 1 ? `1px solid ${colors.textMuted}` : 'none'
            }}
          >
            <div style={{ color: colors.text, fontSize: titleFontSize, fontWeight: 'bold', marginBottom: '2px', lineHeight: '1.2' }}>
              {post.title.substring(0, 60)}{post.title.length > 60 ? '...' : ''}
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: metaFontSize, color: colors.textMuted }}>
              <span style={{ color: colors.accent }}>@{post.author}</span>
              <span style={{ color: colors.info }}>[{post.category}]</span>
              <span>{post.time}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: metaFontSize, color: colors.textMuted, marginTop: '2px' }}>
              <span style={{ color: colors.secondary }}>👍 {post.likes}</span>
              <span>💬 {post.replies}</span>
            </div>
          </div>
        ))}
        {posts.length === 0 && !loading && !error && (
          <div style={{ color: colors.textMuted, fontSize: titleFontSize, textAlign: 'center', padding: '12px' }}>
            No forum posts available
          </div>
        )}
      </div>
    </BaseWidget>
  );
};
