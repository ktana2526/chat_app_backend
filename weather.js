const axios = require("axios");

const cityName = 'Tokyo';
const apiKey = process.env.OPEN_WEATHER_API_KEY; // API KEYは環境変数で指定
const openWeatherUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + apiKey

// OpenWeatherMapアクセスクラス
module.exports = class OpenWeatherMap {
  // 天候情報を取得する
  static getWeather(){
    return new Promise(((resolve,reject)=>{
        axios.get(openWeatherUrl)
        .then(res =>{
          const weather = res.data.weather[0].main;
          const result = weatherDescriptionMap.has(weather) ? weatherDescriptionMap.get(weather) + "です。" : 'その他(' + weather + ')です。';
          resolve(result);
        })
        .catch(e => reject(e));
      }));
  }
}

// OpenWeatherMapから取得した天候情報を日本語に変換するための辞書
// https://openweathermap.org/weather-conditions
const weatherDescriptionMap = new Map(
  [
    ['Clear','晴れ'],
    ['Clouds','曇り'],
    ['Rain','雨'],
    ['Snow','雪'],
    ['Thunderstorm','雷雨'],
  ]
);
