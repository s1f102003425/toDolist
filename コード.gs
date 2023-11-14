// LINE developersのメッセージ送受信設定に記載のアクセストークン
const ACCESS_TOKEN = 'ifwD6Ld47FPMvu528gnGL884k38nlOXrM9p7Z30UScGnqceqch0qqjFA5osCq1zJIpGQImiO2hWP9vJTKLqoFrhwbMOw14bEkMpZzzmnTVW8MdNLHcis9pJMf9ttp6MM4lMaBzkaZNRDxlhXmu+CggdB04t89/1O/w1cDnyilFU=';
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
  if(userMessage.match(/^\$show/)){
    chFlg = 3
    var range = wSheet.getRange(4,1,lastRow-3,5);
    var values = range.getValues();
    resMessage = '0.\t発案者\n\tやること\n\t予算\n\t時期\n\t所要時間\n';
    let rowNum = 1;
    for(let rows of values){
      resMessage += '\n';
      resMessage += String(rowNum) + '.';
      for(let v of rows.slice(0,5)){
        if(String(v) === ''){
          v = '?'
        }
        resMessage += '\t' + String(v) + '\n';}
      rowNum++;
    }
    Logger.log(values)
    console.log(values)
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
    // wSheet.getRange(clearRow,1,1,6).clearContent()
    // lastRow = wSheet.getLastRow(); 
    // const data = wSheet.getRange(clearRow+1,1,lastRow-clearRow,6).getValues();
    // wSheet.getRange(clearRow,1,lastRow-clearRow+1,6).setValues(data);
    // wSheet.getRange(lastRow,1,1,6).clearContent();
  }
  UrlFetchApp.fetch(url, {
  'headers': {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + ACCESS_TOKEN,
  },
  'method': 'post',
  'payload': JSON.stringify({
    'replyToken': replyToken,
    'messages': [{
      'type': 'text',
      'text': resMessage,
      //'text': userMessage,
    }],
  }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}