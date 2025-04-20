/**
 * Misskeyのタイムラインタイプを表す型
 * 
 * - home: ホームタイムライン（フォローしているユーザーの投稿）
 * - social: ソーシャルタイムライン（ホーム + インスタンスに関連する投稿）
 * - local: ローカルタイムライン（インスタンス内の投稿）
 * - global: グローバルタイムライン（連合されたすべての投稿）
 */
export type TimelineType = 'home' | 'social' | 'local' | 'global';

export type TabType = TimelineType | 'notifications';