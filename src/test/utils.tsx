import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

// テスト用のラッパーコンポーネント
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <MantineProvider defaultColorScheme="dark">
            {children}
        </MantineProvider>
    );
};

// カスタムレンダー関数
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// react-testing-libraryのすべてをエクスポート
export * from '@testing-library/react';

// renderメソッドを上書き
export { customRender as render };