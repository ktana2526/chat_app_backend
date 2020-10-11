require('dotenv').config();

// 環境変数から起動ポート番号を取得(取得できない場合は3001番で起動)
const port = process.env.PORT || 3001

// Koa.js
const Koa = require('koa');
const app = new Koa();
// リクエストボディをjsonに変換する
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());
// CORSを許可する
const cros = require('@koa/cors');
app.use(cros());
// ルーティング
const route = require('koa-route');

// サービス(ロジック)層
const ChatService = require('./service.js');
const service = new ChatService();

// ルーティングを設定(/chat)
app.use(route.post('/chat', async (ctx,next) => {
  await service.doChatResponse(ctx.request.body).then((result) => {
    ctx.body = result;
  }).catch((e) => {
    // エラー発生時はスタックトレースを表示し、500を返す
    console.error(e.stack);
    ctx.status = 500;
  });
}));

// ルーティングを設定(/history/list)
app.use(route.get('/history/list', async (ctx,next) => {
  await service.doHistoryResponse().then((result) => {
    ctx.body = result;
  })
  .catch((e) => {
    // エラー発生時はスタックトレースを表示し、500を返す
    console.error(e.stack);
    ctx.status = 500;
  });
}));

// ルーティングを設定(/history/delete)
app.use(route.get('/history/delete', async (ctx,next) => {
  await service.deleteHistory().then((result) => {
    ctx.body = result;
  })
  .catch((e) => {
    // エラー発生時はスタックトレースを表示し、500を返す
    console.error(e.stack);
    ctx.status = 500;
  });
}));

// サーバーを起動
app.listen(port, () => {
    console.log('Application started');
});
