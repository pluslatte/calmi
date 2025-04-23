import { NextRequest, NextResponse } from 'next/server';

// リモートインスタンスから絵文字データを取得するプロキシAPI
export async function GET(request: NextRequest) {
    try {
        // クエリパラメータの取得
        const searchParams = request.nextUrl.searchParams;
        const host = searchParams.get('host');
        const name = searchParams.get('name');

        // パラメータのバリデーション
        if (!host || !name) {
            return NextResponse.json(
                { error: 'Missing required parameters: host and name' },
                { status: 400 }
            );
        }

        // ホスト名のバリデーション（セキュリティ対策）
        if (!/^[a-z0-9][a-z0-9-_.]+\.[a-z0-9]+$/.test(host)) {
            return NextResponse.json(
                { error: 'Invalid host format' },
                { status: 400 }
            );
        }

        // まずMisskeyのAPIを試す
        try {
            const misskeyResponse = await fetch(`https://${host}/api/emoji?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'calmi-emoji-proxy/1.0'
                },
            });

            if (misskeyResponse.ok) {
                const data = await misskeyResponse.json();
                if (data.url) {
                    // 成功した場合はJSON応答を返す
                    return NextResponse.json({
                        url: data.url,
                        name: data.name || name,
                        source: 'misskey'
                    });
                }
            }
        } catch (error) {
            console.error(`Misskey emoji API failed for ${host}:`, error);
        }

        // Mastodonのカスタム絵文字APIを試す
        try {
            const mastodonResponse = await fetch(`https://${host}/api/v1/custom_emojis`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'calmi-emoji-proxy/1.0'
                },
            });

            if (mastodonResponse.ok) {
                const emojis = await mastodonResponse.json();
                const foundEmoji = emojis.find((emoji: any) => emoji.shortcode === name);

                if (foundEmoji && foundEmoji.url) {
                    return NextResponse.json({
                        url: foundEmoji.url,
                        name: foundEmoji.shortcode || name,
                        source: 'mastodon'
                    });
                }
            }
        } catch (error) {
            console.error(`Mastodon emoji API failed for ${host}:`, error);
        }

        // 両方とも失敗した場合
        return NextResponse.json(
            { error: `Could not find emoji :${name}: on ${host}` },
            { status: 404 }
        );
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}