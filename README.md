# chat_app_backend

## 概要
Webアプリケーション開発課題(Botとのチャットアプリケーション)のサーバーサイドの実装です。  
以下のフレームワークを使用しています。
- node.js (v12.19.0)
- koa.js (v2.13.0)

## 前提条件
1. 実行環境に以下のインストールが必要です。
- PostgreSQL (12.4-1-windows-x64 で動作確認済み)
- node.js (v12.19.0 で動作確認済み)

2. 以下のユーザ登録が必要です。
- OpenWeatherMap  
https://openweathermap.org/

## 実行方法
ローカル環境へのインストールおよび起動方法は以下の通りです。

1. 任意のフォルダにプロジェクトを展開します。
```
$ git clone https://github.com/ktana2526/chat_app_backend  
$ cd chat_app_backend
```

2. 必要なパッケージをインストールします。(npm install)
```
$ npm install
```

3. DBに必要なテーブルを作成します。
```
CREATE TABLE history (
	id SERIAL PRIMARY KEY,
	user_input VARCHAR,
	bot_response VARCHAR,
	response_timestamp TIMESTAMP WITH TIME ZONE
);
```

4. 環境変数の設定ファイル(.env)を設定します。
chat_app_backend フォルダの直下に.envファイルを作成してください。
```
# DB(postgres)の接続文字列(例ではtestという名称のデータベースを指定)
DB_CONNSTR=postgresql://postgres:password@localhost:5432/test

# OpenWeatherMapのAPI key
OPEN_WEATHER_API_KEY=xxxxxxxxxxxxxxx

# 起動ポート(未指定の場合は3001番で起動)
PORT=5000
```

5. アプリケーションを起動します。
```
$ node app
```

## APIインターフェース仕様

#### 1. Botとの会話
Botの応答文字列を生成し返却します。  
応答したデータの履歴をデーターベースに保存します。  

##### URL

```
POST /chat
```
##### Request
```
{
  "user_input": "こんにちは" // ユーザーが入力した文字列
}
```

##### Response
```
{
  "user_input": "こんにちは", // ユーザーが入力した文字列
  "bot_response": "こんにちは。", // Botが応答した文字列
  "response_timestamp": "2020-10-12T23:27:31+09:00" // レスポンスを返した時刻(日本標準時)
}
```

##### Botの応答パターン
ユーザー入力に応じて、以下のパターンの応答を行います。  
※入力の表記の揺れには対応していません。

1. 固定応答
    - ユーザー入力: こんにちは
    - Bot応答: こんにちは。
2. 現在時刻
    - ユーザー入力: 今何時？
    - Bot応答: 10時10分です。
        - リクエストを受け付けた時点の現在時刻(JST)を応答する
3. 天気
    - ユーザー入力: 今日の東京の天気は？
    - Bot応答: 晴れです。
        - 天気情報の取得にはOpenWeatherMapを使用

また、上記以外の入力に対しては、以下の応答を行います。

4. 不正な入力への応答
    - ユーザー入力: わかりますか？
    - Bot応答: わかりません。(質問文は正しいですか？)

#### 2. 履歴一覧の取得
過去に応答したデータの履歴をデーターベースより取得し返却します。  

##### URL

```
GET /history/list
```
##### Request
リクエスト時のパラメータは無し

###### Response
最新のものから10件の履歴を、`response_timestamp` の降順で返却します。
```
[
  {
    "user_input": "わかりますか？",
    "bot_response": "わかりません。(質問文は正しいですか？)",
    "response_timestamp": "2020-10-12T23:23:12+09:00"
  },
  {
    "user_input": "今日の東京の天気は？",
    "bot_response": "曇りです。",
    "response_timestamp": "2020-10-12T23:23:06+09:00"
  },
  {
    "user_input": "今何時？",
    "bot_response": "23時23分です。",
    "response_timestamp": "2020-10-12T23:23:01+09:00"
  },
  {
    "user_input": "こんにちは",
    "bot_response": "こんにちは。",
    "response_timestamp": "2020-10-12T23:22:55+09:00"
  },
  ...
]
```

#### 3. 履歴の削除
応答の履歴をデーターベースから削除します。  

##### URL

```
GET /history/delete
```
##### Request
リクエスト時のパラメータは無し

###### Response
削除した履歴の件数を返却します。
```
{
    "row_count": 14, // 削除件数
    "response_timestamp": "2020-10-12T23:25:42+09:00"
}
```
