'use client'

import { useMisskeyApiClient } from "@/app/MisskeyApiClientContext";
import { Anchor, Blockquote, Code, Text } from "@mantine/core";
import * as mfm from 'mfm-js';
import React, { ReactElement } from "react";
import EmojiNode from "./EmojiNode";

export default function MfmObject({ mfmNodes, assets }: { mfmNodes: mfm.MfmNode[]; assets: { host: string | null; emojis?: { [key: string]: string | undefined } } }) {
    const misskeyApiClient = useMisskeyApiClient();

    const nodeComponent = (node: mfm.MfmNode): ReactElement | ReactElement[] => {
        switch (node.type) {
            case "bold":
                return node.children.map((child, index) => (
                    <Text fw="bold" span key={index}>
                        {nodeComponent(child)}
                    </Text>
                ));
            case "italic":
                return node.children.map((child, index) => (
                    <Text fs="italic" span key={index}>
                        {nodeComponent(child)}
                    </Text>
                ));
            case "strike":
                return node.children.map((child, index) => (
                    <Text td="line-through" span key={index}>
                        {nodeComponent(child)}
                    </Text>
                ));
            case "small":
                return node.children.map((child, index) => (
                    <Text size="xs" span key={index}>
                        {nodeComponent(child)}
                    </Text>
                ));
            case "inlineCode":
                return (
                    <Code>{node.props.code}</Code>
                );
            case "text":
                return (
                    <Text span>{node.props.text}</Text>
                );
            case "emojiCode":
                return (
                    <EmojiNode name={node.props.name} assets={assets} />
                );
            case "unicodeEmoji":
                return (
                    <Text span>{node.props.emoji}</Text>
                );
            case "mention":
                return (
                    <Text span c="blue">
                        {`@${node.props.username}`}
                    </Text>
                );
            case "hashtag":
                return (
                    <Text span c="blue">
                        {`#${node.props.hashtag}`}
                    </Text>
                );
            case "url":
                return (
                    <Anchor href={node.props.url} target="_blank" rel="noopener noreferer">
                        {node.props.url}
                    </Anchor>
                );
            case "link":
                return (
                    <Anchor href={node.props.url} target="_blank" rel="noopener noreferer">
                        {node.children.map((child, index) => (
                            <React.Fragment key={index}>
                                {nodeComponent(child)}
                            </React.Fragment>
                        ))}
                    </Anchor>
                );
            case "quote":
                return (
                    <Blockquote>
                        {node.children.map((child, index) => (
                            <React.Fragment key={index}>
                                {nodeComponent(child)}
                            </React.Fragment>
                        ))}
                    </Blockquote>
                );
            case "search":
                return (
                    <Text span>{`🔍 ${node.props.query}`}</Text>
                );
            case "plain":
                return node.children.map((child, index) => (
                    <React.Fragment key={index}>
                        {nodeComponent(child)}
                    </React.Fragment>
                ));
            case "blockCode":
            case "mathBlock":
            case "center":
            case "mathInline":
            case "fn":
        }

        return (
            <Text span c="red">
                {`Unsupported node!!!: ${node.type}`}
            </Text>
        );
    }

    return (mfmNodes.map((node, index) => (
        <React.Fragment key={index}>
            {nodeComponent(node)}
        </React.Fragment>
    )));
}