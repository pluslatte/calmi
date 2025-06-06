declare module 'next-pwa' {
    import { NextConfig } from 'next';

    type PWAConfig = {
        dest?: string;
        disable?: boolean;
        register?: boolean;
        scope?: string;
        sw?: string;
        skipWaiting?: boolean;
        runtimeCaching?: any[];
        publicExcludes?: string[];
        buildExcludes?: string[] | RegExp | ((path: string) => boolean)[];
        dynamicStartUrl?: boolean;
        reloadOnOnline?: boolean;
        fallbacks?: {
            document?: string;
            image?: string;
            audio?: string;
            video?: string;
            font?: string;
        };
    };

    function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;

    export = withPWA;
}