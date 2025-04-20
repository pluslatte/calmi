import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';

// window.matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// 日付を固定
beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-04-20T10:00:00Z'));
});

afterEach(() => {
    vi.useRealTimers();
});