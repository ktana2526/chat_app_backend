// DB(postgres)
const { Pool } = require('pg');
const connectionString = process.env.DB_CONNSTR;
const pool = new Pool({ connectionString });

const moment = require('moment-timezone');

// OpenWeatherMap操作用ロジッククラス
const openWeatherMap = require('./weather.js');

module.exports = class ChatService {

  // chatコマンド受信時の処理
  doChatResponse(body){
    return new Promise(((resolve,reject) => {
      switch (body.user_input)
      {
        case 'こんにちは':
          var bot_response = 'こんにちは。';
          var json = this.createChatReponseJSON(body.user_input,bot_response);
          this.saveResponse(json);
          resolve(json);
          break;

        case '今何時？':
          // JSTで時刻を取得
          var date = moment().tz("Asia/Tokyo");
          var bot_response = date.get('hour') + '時' + date.get('minute') + '分です。';
          var json = this.createChatReponseJSON(body.user_input,bot_response);
          this.saveResponse(json);
          resolve(json);
          break;

        case '今日の東京の天気は？':
          // openWeatherMapに天候情報の問い合わせを行う
          openWeatherMap.getWeather().then((result) => {
            var bot_response = result;
            var json = this.createChatReponseJSON(body.user_input,bot_response);
            this.saveResponse(json);
            resolve(json);
          }).catch((e) => {
              reject(e);
          });
          break;

        default:
          var bot_response = 'わかりません。(質問文は正しいですか？)';
          json = this.createChatReponseJSON(body.user_input,bot_response);
          this.saveResponse(json);
          resolve(json);
      }
    }));
  }

  // history/listコマンド受信時の処理
  doHistoryResponse()
  {
    return new Promise(((resolve,reject) => {
      var query = {
          text: 'SELECT * FROM history ORDER BY response_timestamp DESC LIMIT 10'
      }
      pool.query(query).then((result) => resolve(this.createHistoryReponseJSON(result.rows))).catch(e => reject(e));
    }));
  }

  // history/deleteコマンド受信時の処理
  deleteHistory()
  {
    return new Promise(((resolve,reject) => {
      var query = {
          text: 'DELETE FROM history'
      }
      pool.query(query).then((result) => resolve(this.createHistoryDeleteJSON(result.rowCount))).catch(e => reject(e));
    }));
  }

  // chatコマンド返信用のJSONを作成する
  createChatReponseJSON(user_input,bot_response){
    var response = {
      "user_input": user_input,
      "bot_response": bot_response,
      "response_timestamp": moment().tz("Asia/Tokyo").format(),
     }
    return response;
  }

  // history/list コマンド返信用のJSONを作成する
  createHistoryReponseJSON(rows)
  {
    var json = [];
    rows.forEach((row) =>
    {
      json.push(
        {
          "user_input": row.user_input,
          "bot_response": row.bot_response,
          "response_timestamp": moment(row.response_timestamp).tz("Asia/Tokyo").format(),
        }
      );
    });

    return json;
  }

  // history/delete コマンド返信用のJSONを作成する
  createHistoryDeleteJSON(rowCount){
    var response = {
      "row_count": rowCount,
      "response_timestamp": moment().tz("Asia/Tokyo").format(),
     }
    return response;
  }

  // 送信電文(JSON)をデータベースに保存する
  saveResponse(json)
  {    
    var query = {
      text: 'INSERT INTO history(user_input, bot_response,response_timestamp) VALUES($1, $2, $3)',
      values: [json.user_input, json.bot_response, json.response_timestamp],
    }

    pool.query(query).catch(e => console.error(e.stack));
  }
}
