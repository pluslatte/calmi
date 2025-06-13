import { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => {
    return {
        name: 'calmi-client',
        short_name: 'calmi',
        description: 'Web client of calmi, Misskey proxy',
        start_url: '/',
        display: 'standalone',
        background_color: '#282828',
        theme_color: '#458588',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
};

export default manifest;