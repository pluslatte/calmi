# ActivityPub Object デシリアライゼーションテスト必要ケース一覧

## 1. Core Types (コアタイプ)

| カテゴリ | Type | 必須プロパティ | オプショナルプロパティ例 | テスト目的 |
|---------|------|--------------|---------------------|-----------|
| 基本 | Object | なし (ActivityPub は id, type を要求) | id, type, name, content | 最小限の Object |
| 基本 | Link | href | id, name, mediaType, rel | Link タイプの検証 |
| Activity | Activity | なし | actor, object, target | 基本的な Activity |
| Activity | IntransitiveActivity | なし | actor, target (objectなし) | object のない Activity |
| Collection | Collection | なし | totalItems, items, first, last | Collection の基本 |
| Collection | OrderedCollection | なし | totalItems, orderedItems | 順序付き Collection |
| Collection | CollectionPage | なし | partOf, next, prev | ページング |
| Collection | OrderedCollectionPage | なし | startIndex, partOf | 順序付きページング |

## 2. Activity Types (アクティビティタイプ)

| Type | 継承元 | 用途 | 必須テストプロパティ |
|------|--------|------|-------------------|
| Accept | Activity | 受け入れ | actor, object |
| Add | Activity | 追加 | actor, object, target |
| Announce | Activity | アナウンス | actor, object |
| Arrive | IntransitiveActivity | 到着 | actor, location |
| Block | Activity | ブロック | actor, object |
| Create | Activity | 作成 | actor, object |
| Delete | Activity | 削除 | actor, object |
| Dislike | Activity | 嫌い | actor, object |
| Flag | Activity | フラグ | actor, object |
| Follow | Activity | フォロー | actor, object |
| Ignore | Activity | 無視 | actor, object |
| Invite | Offer | 招待 | actor, object, target |
| Join | Activity | 参加 | actor, object |
| Leave | Activity | 離脱 | actor, object |
| Like | Activity | いいね | actor, object |
| Listen | Activity | 聴く | actor, object |
| Move | Activity | 移動 | actor, object, origin, target |
| Offer | Activity | オファー | actor, object |
| Question | IntransitiveActivity | 質問 | oneOf or anyOf |
| Reject | Activity | 拒否 | actor, object |
| Read | Activity | 読む | actor, object |
| Remove | Activity | 削除 | actor, object, origin |
| TentativeAccept | Accept | 仮受け入れ | actor, object |
| TentativeReject | Reject | 仮拒否 | actor, object |
| Travel | IntransitiveActivity | 移動 | actor, origin, target |
| Undo | Activity | 取り消し | actor, object |
| Update | Activity | 更新 | actor, object |
| View | Activity | 閲覧 | actor, object |

## 3. Actor Types (アクタータイプ)

| Type | 説明 | テストケース |
|------|------|------------|
| Application | アプリケーション | 基本プロパティ + name |
| Group | グループ | 基本プロパティ + name |
| Organization | 組織 | 基本プロパティ + name |
| Person | 人 | 基本プロパティ + name |
| Service | サービス | 基本プロパティ + name |

## 4. Object Types (オブジェクトタイプ)

| Type | 継承元 | 説明 | 特殊プロパティ |
|------|--------|------|--------------|
| Article | Object | 記事 | content, attributedTo |
| Audio | Document | 音声 | url, mediaType, duration |
| Document | Object | ドキュメント | url, mediaType |
| Event | Object | イベント | startTime, endTime |
| Image | Document | 画像 | url, mediaType, width, height |
| Note | Object | 短文 | content |
| Page | Document | Webページ | url |
| Place | Object | 場所 | latitude, longitude, radius, units |
| Profile | Object | プロファイル | describes |
| Relationship | Object | 関係 | subject, relationship, object |
| Tombstone | Object | 削除済み | formerType, deleted |
| Video | Document | 動画 | url, duration, mediaType |

## 5. 特殊プロパティケース

| テストケース | 説明 | 例 |
|------------|------|-----|
| 多言語対応 (nameMap) | 複数言語での name | `{"en": "Hello", "ja": "こんにちは"}` |
| 多言語対応 (contentMap) | 複数言語での content | `{"en": "Content", "ja": "内容"}` |
| URL配列 | 複数の URL | `["http://example.com/1", "http://example.com/2"]` |
| オブジェクト/リンク混在 | Link と Object の混在 | `[{type: "Link"}, {type: "Object"}]` |
| @context 文字列 | 単一コンテキスト | `"https://www.w3.org/ns/activitystreams"` |
| @context 配列 | 複数コンテキスト | `["https://...", {...}]` |
| 日付形式 (RFC3339) | ISO8601形式 | `"2023-01-01T12:00:00Z"` |
| 日付形式 (秒なし) | 秒の省略 | `"2023-01-01T12:00Z"` |
| 双方向テキスト | RTL/LTR混在 | Unicode制御文字を含む |
| 拡張プロパティ | カスタムプロパティ | `{"custom:prop": "value"}` |

## 6. エッジケースとエラーケース

| テストケース | 説明 | 期待動作 |
|------------|------|---------|
| 空の Object | `{"type": "Object"}` | 成功 (すべて optional) |
| type なし Object | `{"name": "Test"}` | 成功 or エラー (実装依存) |
| 不明な type | `{"type": "UnknownType"}` | 継続処理 (拡張として扱う) |
| null プロパティ | `{"name": null}` | 省略と同等 |
| 配列の空 | `{"items": []}` | null と同等 |
| 不正な日付形式 | `{"published": "invalid"}` | エラー |
| 不正な IRI | `{"id": "not-a-uri"}` | エラー |

## 参考資料

- [ActivityStreams 2.0 Core](https://www.w3.org/TR/activitystreams-core/)
- [ActivityStreams 2.0 Vocabulary](https://www.w3.org/TR/activitystreams-vocabulary/)
