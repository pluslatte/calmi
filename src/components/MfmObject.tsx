'use client'

import { Anchor, Blockquote, Code, Text, Box } from "@mantine/core";
import * as mfm from 'mfm-js';
import React, { ReactElement, ReactNode } from "react";
import EmojiNode from "./EmojiNode";
import DOMPurify from 'dompurify';

export default function MfmObject({ mfmNodes, assets }: { mfmNodes: mfm.MfmNode[]; assets: { host: string | null; emojis?: { [key: string]: string | undefined } } }) {
    const preserveLineBreaks = (text: string): React.ReactNode[] => {
        return text.split('\n').map((line, i, arr) => {
            return (
                <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                </React.Fragment>
            );
        });
    }

    // テキストコンテンツのみを再帰的に取得する補助関数
    const getTextContent = (node: mfm.MfmNode): string => {
        if (node.type === 'text') {
            // テキストノードの内容をDOMPurifyでサニタイズ
            return DOMPurify.sanitize(node.props.text, { ALLOWED_TAGS: [] }); // タグを全て除去し、プレーンテキストのみ許可
        } else if ('children' in node && Array.isArray(node.children)) {
            return node.children.map(getTextContent).join('');
        } else if (node.type === 'unicodeEmoji') {
            return node.props.emoji;
        } else if (node.type === 'mention') {
            return `@${DOMPurify.sanitize(node.props.username, { ALLOWED_TAGS: [] })}`;
        } else if (node.type === 'hashtag') {
            return `#${DOMPurify.sanitize(node.props.hashtag, { ALLOWED_TAGS: [] })}`;
        } else if (node.type === 'inlineCode') {
            return DOMPurify.sanitize(node.props.code, { ALLOWED_TAGS: [] });
        } else if (node.type === 'search') {
            return `🔍 ${DOMPurify.sanitize(node.props.query, { ALLOWED_TAGS: [] })}`;
        }
        return '';
    }

    // 子ノードを処理する補助関数
    const renderNodes = (nodes: mfm.MfmNode[]): ReactElement => {
        return (
            <React.Fragment>
                {nodes.map((node, index) => (
                    <React.Fragment key={index}>{nodeComponent(node)}</React.Fragment>
                ))}
            </React.Fragment>
        );
    }

    // ノードに特殊なコンポーネント（絵文字など）が含まれているかチェック
    const hasSpecialComponent = (node: mfm.MfmNode): boolean => {
        if (node.type === 'emojiCode') {
            return true;
        }
        if ('children' in node && Array.isArray(node.children)) {
            return node.children.some(hasSpecialComponent);
        }
        return false;
    }

    // 引用ブロックがMFMノードに含まれているかチェック
    const hasQuoteNode = (nodes: mfm.MfmNode[]): boolean => {
        return nodes.some(node =>
            node.type === 'quote' ||
            ('children' in node && Array.isArray(node.children) && hasQuoteNode(node.children))
        );
    }

    const nodeComponent = (node: mfm.MfmNode): ReactElement | string => {
        switch (node.type) {
            case "bold": {
                // 特殊コンポーネントがあるかチェック
                if (hasSpecialComponent(node)) {
                    return <Box component="span" style={{ fontWeight: 'bold' }}>{renderNodes(node.children)}</Box>;
                }
                // 単純なテキストならまとめて処理
                const fullText = getTextContent(node);
                return <Box component="span" style={{ fontWeight: 'bold' }}>{fullText}</Box>;
            }
            case "italic": {
                if (hasSpecialComponent(node)) {
                    return <Box component="span" style={{ fontStyle: 'italic' }}>{renderNodes(node.children)}</Box>;
                }
                const fullText = getTextContent(node);
                return <Box component="span" style={{ fontStyle: 'italic' }}>{fullText}</Box>;
            }
            case "strike": {
                if (hasSpecialComponent(node)) {
                    return <Box component="span" style={{ textDecoration: 'line-through' }}>{renderNodes(node.children)}</Box>;
                }
                const fullText = getTextContent(node);
                return <Box component="span" style={{ textDecoration: 'line-through' }}>{fullText}</Box>;
            }
            case "small": {
                if (hasSpecialComponent(node)) {
                    return <Box component="span" style={{ fontSize: '0.75em' }}>{renderNodes(node.children)}</Box>;
                }
                const fullText = getTextContent(node);
                return <Box component="span" style={{ fontSize: '0.75em' }}>{fullText}</Box>;
            }
            case "inlineCode": {
                // インラインコードもサニタイズ
                const sanitizedCode = DOMPurify.sanitize(node.props.code, { ALLOWED_TAGS: [] });
                return <Code>{sanitizedCode}</Code>;
            }
            case "text": {
                // テキストノードをサニタイズ
                const sanitizedText = DOMPurify.sanitize(node.props.text, { ALLOWED_TAGS: [] });
                return <React.Fragment>{preserveLineBreaks(sanitizedText)}</React.Fragment>;
            }
            case "emojiCode":
                // ここが重要：絵文字ノードは必ず専用コンポーネントを使用する
                return <EmojiNode name={node.props.name} assets={assets} />;
            case "unicodeEmoji":
                return node.props.emoji;
            case "mention": {
                const sanitizedUsername = DOMPurify.sanitize(node.props.username, { ALLOWED_TAGS: [] });
                return <Box component="span" style={{ color: 'cyan' }}>{`@${sanitizedUsername}`}</Box>;
            }
            case "hashtag": {
                const sanitizedHashtag = DOMPurify.sanitize(node.props.hashtag, { ALLOWED_TAGS: [] });
                return <Box component="span" style={{ color: 'cyan' }}>{`#${sanitizedHashtag}`}</Box>;
            }
            case "url": {
                // URLをサニタイズして、JavaScriptプロトコルなどの危険なURLを防止
                const sanitizedUrl = DOMPurify.sanitize(node.props.url);
                // さらに、javascriptなどの危険なプロトコルを明示的に拒否
                const url = sanitizedUrl.startsWith('javascript:') || sanitizedUrl.startsWith('data:') 
                    ? '#' : sanitizedUrl;
                
                return (
                    <Anchor href={url} target="_blank" rel="noopener noreferrer" inline={true} style={{
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                        lineBreak: "anywhere",
                        whiteSpace: "pre-wrap break-spaces"
                    }}>
                        {DOMPurify.sanitize(node.props.url, { ALLOWED_TAGS: [] })}
                    </Anchor >
                );
            }
            case "link": {
                // リンクURLもサニタイズ
                const sanitizedUrl = DOMPurify.sanitize(node.props.url);
                // 危険なプロトコルを拒否
                const url = sanitizedUrl.startsWith('javascript:') || sanitizedUrl.startsWith('data:') 
                    ? '#' : sanitizedUrl;
                
                return (
                    <Anchor href={url} target="_blank" rel="noopener noreferrer" inline={true} style={{
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                        lineBreak: "anywhere",
                        whiteSpace: "pre-wrap break-spaces"
                    }}>
                        {renderNodes(node.children)}
                    </Anchor>
                );
            }
            case "quote":
                // 引用ブロックを直接返すのではなく、div要素でラップする
                return (
                    <Box component="div" className="mfm-quote-wrapper">
                        <Blockquote>
                            {renderNodes(node.children)}
                        </Blockquote>
                    </Box>
                );
            case "search": {
                const sanitizedQuery = DOMPurify.sanitize(node.props.query, { ALLOWED_TAGS: [] });
                return <Box component="span">{`🔍 ${sanitizedQuery}`}</Box>;
            }
            case "plain":
                return renderNodes(node.children);
            case "blockCode":
            case "mathBlock":
            case "center":
            case "mathInline":
            case "fn":
                return <Box component="span" style={{ color: 'red' }}>{`Unsupported node: ${node.type}`}</Box>;
            default:
                return <Box component="span" style={{ color: 'red' }}>{`Unknown node: ${(node as any).type}`}</Box>;
        }
    }

    // 引用ブロックが含まれている場合は div でラップ、それ以外は span でラップ
    const containerComponent = hasQuoteNode(mfmNodes) ? 'div' : 'span';

    return (
        <Box component={containerComponent} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {mfmNodes.map((node, index) => (
                <React.Fragment key={index}>
                    {nodeComponent(node)}
                </React.Fragment>
            ))}
        </Box>
    );
}