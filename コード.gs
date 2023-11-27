// スクリプトプロパティでトークンキーを管理
const prop = PropertiesService.getScriptProperties().getProperties();
const ACCESS_TOKEN = prop.ACCESS_TOKEN;
// LINE developersのメッセージ送受信設定に記載のアクセストークン
// const ACCESS_TOKEN = 'ここにAPIトークンを入力';
function doPost(e) {
  // WebHookで受信した応答用Token
  var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
  // ユーザーIDを取得
  var userId = JSON.parse(e.postData.contents).events[0].source.userId;
  // ユーザー情報取得のためのURL
  var userUrl = 'https://api.line.me/v2/bot/profile/' + userId;
  // ユーザー情報を取得
  var response = UrlFetchApp.fetch(userUrl, {
    'headers': {
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
  });
  var userData = JSON.parse(response.getContentText());
  // ユーザーネームを取得
  var userName = userData.displayName;
  // ユーザーのメッセージを取得
  var userMessage = JSON.parse(e.postData.contents).events[0].message.text;
  // 応答メッセージ用のAPI URL
  var url = 'https://api.line.me/v2/bot/message/reply';
  //応答メッセージ
  var resMessage;
  var frexMessageSimulator;
  var altText;
  //入力チェック結果
  var chFlg = 0;
  //記録先シート
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wSheet = ss.getSheetByName('todo');
  //最新行を取得
  const lastRow = wSheet.getLastRow();
  var nRow= lastRow+1;
  //本日日付を取得
  var date = new Date();
  var today = Utilities.formatDate( date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  //入力チェック
  if(userMessage.match(/^\$show\nraw$/)){
    chFlg = 4;
    var range = wSheet.getRange(4,1,lastRow-3,5);
    var values = range.getValues();
    resMessage = '☆\t発案者\n\tやること\n\t予算\n\t時期\n\t所要時間\n';
    let rowNum = 1;
    for(let rows of values){
      resMessage += '------------------------------\n';
      resMessage += String(rowNum) + '.';
      for(let v of rows.slice(0,5)){
        if(String(v) === '' || String(v) === '?' || String(v) === '？'){
          v = '-'
        }
        resMessage += '\t' + String(v) + '\n';}
      rowNum++;
    }
  }else if(userMessage.match(/^\$show$/)){
    chFlg = 3;
    altText = 'やりたいことリスト';
    var range = wSheet.getRange(4,1,lastRow-3,5);
    var values = range.getValues();
    let rowNum = 1;
    let taskList = [];
    for(let rows of values){
      const taskDetails = rows.slice(0,5);
      const proposer = String(taskDetails[0]);
      const thingToDo = String(taskDetails[1]);
      const budget = '￥' + ((String(taskDetails[2]) !== '' && String(taskDetails[2]) !== '?' && String(taskDetails[2]) !== '？') ? String(taskDetails[2]) : '-');
      const when = (String(taskDetails[3]) !== '' && String(taskDetails[3]) !== '?' && String(taskDetails[3]) !== '？') ? String(taskDetails[3]) : '-';
      const duration = String(taskDetails[4]);
      taskList.push(
        {
          "type": "bubble",
          "size": "deca",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": '(' + String(rowNum),
                "position": "absolute",
                "offsetBottom": "20px",
                "offsetEnd": "13px",
                "color": "#1DB446",
                "size": "xs"
              },
              {
                "type": "text",
                "text": thingToDo,
                "weight": "bold",
                "size": "lg",
                "color": "#1DB446",
                "adjustMode": "shrink-to-fit"
              },
              {
                "type": "box",
                "layout": "vertical",
                "margin": "lg",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                      {
                        "type": "text",
                        "text": "予算:",
                        "size": "md",
                        "color": "#555555",
                        "flex": 1,
                        "weight": "bold"
                      },
                      {
                        "type": "text",
                        "text": budget,
                        "size": "md",
                        "color": "#111111",
                        "flex": 4,
                        "adjustMode": "shrink-to-fit"
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                      {
                        "type": "text",
                        "text": "時期:",
                        "size": "md",
                        "color": "#555555",
                        "flex": 1,
                        "weight": "bold"
                      },
                      {
                        "type": "text",
                        "text": when,
                        "size": "md",
                        "color": "#111111",
                        "flex": 4,
                        "adjustMode": "shrink-to-fit"
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                      {
                        "type": "text",
                        "text": "時間:",
                        "size": "md",
                        "color": "#FF6B6E",
                        "flex": 1,
                        "weight": "bold"
                      },
                      {
                        "type": "text",
                        "text": duration,
                        "size": "md",
                        "color": "#111111",
                        "flex": 4,
                       "adjustMode": "shrink-to-fit"
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                      {
                        "type": "text",
                        "text": "発案者:",
                        "size": "xxs",
                        "color": "#aaaaaa",
                        "flex": 1
                      },
                      {
                        "type": "text",
                        "text": proposer,
                        "size": "xxs",
                        "color": "#888888",
                        "flex": 4,
                        "adjustMode": "shrink-to-fit"
                      }
                    ]
                  }
                ]
              }
            ],
            "backgroundColor": "#F8F8F8",
            "paddingTop": "15px",
            "paddingBottom": "18px",
            "paddingStart": "20px",
            "paddingEnd": "10px"
          },
          "styles": {
            "footer": {
              "separator": false
            }
          }
        }
      );
      rowNum++;
    }
    frexMessageSimulator = {
      "type": "carousel",
      "contents": taskList,
    };
  }else if(userMessage.match(/^\$remove\n[0-9]{1,4}/)){
    if(Number(userMessage.substring(8)) != 0 && Number(userMessage.substring(8)) <= lastRow - 3){
      resMessage = 'やりたいことを削除しました';
      var clearRow = Number(userMessage.substring(8)) + 3;
      chFlg = 2;
    }else{
      resMessage = '指定した番号がリストにありません'
    }
  }else if(userMessage.match(/^\$/)){
    userMessage = userMessage.substring(1);
    userMessage = userMessage.split(/\n/)
    if(userMessage.length === 4 && (String(userMessage[3]) === "半日") || (String(userMessage[3]) === "終日") || (String(userMessage[3]) === "複数日") || (String(userMessage[3]) === "不明")){
      //応答メッセージをセット
      resMessage = `${userName}さんのやりたいことを記録しました！`;
      chFlg = 1;
    }else{
      resMessage = "正しい形式で入力してください\n\n◎やることを記録\n\$[やること]　改行↲\n[予算(無記でも可)]　改行↲\n[時期(無記でも可)]　改行↲\n[所要時間(半日or終日or複数日or不明の形式で)]\n\n◎リストを表示\n\$show\n\n◎やることを削除\n\$remove　改行↲\n[リストで表示された番号で指定(半角数字)]\n\n※\$は全て半角"
    }   
  }else{
    // resMessage = "文頭に「$(半角)」を付けてください";
    resMessage = null
  }
  //入力チェックOKの場合、スプレッドシートへ内容を記録
  if(chFlg === 1){
    //記録
    wSheet.getRange(nRow, 1).setValue(userName);
    wSheet.getRange(nRow, 2).setValue(userMessage[0]);
    wSheet.getRange(nRow, 3).setValue(userMessage[1]);
    wSheet.getRange(nRow, 4).setValue(userMessage[2]);
    wSheet.getRange(nRow, 5).setValue(userMessage[3]);
    wSheet.getRange(nRow, 6).setValue(today);
  }else if(chFlg === 2){
    //削除
    wSheet.getRange(clearRow,1,1,6).deleteCells(SpreadsheetApp.Dimension.ROWS)
  }
  var textType = [{
    'type': 'text',
    'text': resMessage,
  }]
  var flexType =[{
        'type':'flex', //ここの宣言が必須
        'altText':altText,
        //↓このcontentsの部分にSimulatorのJSONをコピー
        'contents': frexMessageSimulator,   
  }]
  var message = chFlg === 3 ? flexType : textType;
  UrlFetchApp.fetch(url, {
  'headers': {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + ACCESS_TOKEN,
  },
  'method': 'post',
  'payload': JSON.stringify({
    'replyToken': replyToken,
    'messages': message,
  }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}