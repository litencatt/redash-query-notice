const ps = PropertiesService.getScriptProperties();
const sheetId     = ps.getProperty("SHEET_ID");
const redashUrl   = ps.getProperty("REDASH_URL");
const redashToken = ps.getProperty("REDASH_USER_TOKEN");
const slackToken  = ps.getProperty("SLACK_TOKEN");

const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

function notify() {
  const result = [];

  // spread のconfig sheetからqueryIds取得
  const s = SpreadsheetApp.openById(sheetId);
  const sheet = s.getSheetByName("config");
  const startRow = 2;
  const numColumn = sheet.getLastColumn();
  const slackChannel = sheet.getSheetValues(startRow, 1, 1, 1)[0][0];
  const notifyAt     = sheet.getSheetValues(startRow, 2, 1, 1)[0][0];
  const queryIds     = sheet.getSheetValues(startRow, 3, 3, numColumn - 1)[0];

  // redash api実行
  const fields = [];
  queryIds.forEach((queryId) => {
    queryId = parseInt(queryId, 10);
    const res = UrlFetchApp.fetch(`${redashUrl}/api/queries/${queryId}/results.json?api_key=${redashToken}`);
    const parsedResult = JSON.parse(res.getContentText()).query_result.data.rows[0];
    Object.keys(parsedResult).forEach((key) => {
      fields.push({
        type: "mrkdwn",
        text: `*${key}*\n${parsedResult[key]}`,
      });
    });
  });

  const message = [
    {
      type: "section",
      fields,
    },
  ];

  // slack通知
  UrlFetchApp.fetch("https://slack.com/api/channels.join", {
    method: "post",
    payload: {
      token: slackToken,
      channel: slackChannel,
    },
  });

  UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", {
    method: "post",
    payload: {
      token: slackToken,
      channel: slackChannel,
      text: "Redash Query Notice",
      blocks: JSON.stringify(message),
    },
  });
}
