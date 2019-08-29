const ps = PropertiesService.getScriptProperties();
const sheetId     = ps.getProperty("SHEET_ID");
const redashUrl   = ps.getProperty("REDASH_URL");
const redashToken = ps.getProperty("REDASH_USER_TOKEN");
const slackToken  = ps.getProperty("SLACK_TOKEN");
const slackUrl    = ps.getProperty("SLACK_URL");

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
  const queryIds     = sheet.getSheetValues(startRow, 3, 3, numColumn - 2)[0];

  // redash api実行
  const fields = [];
  queryIds.forEach((queryId) => {
    queryId = parseInt(queryId, 10);
    const res = UrlFetchApp.fetch(`${redashUrl}/api/queries/${queryId}/results.json?api_key=${redashToken}`);
    const parsedResult = JSON.parse(res.getContentText()).query_result.data.rows[0];
    Object.keys(parsedResult).forEach((key) => {
      fields.push({
        title: key,
        value: parsedResult[key],
        short: true,
      });
    });
  });

  const attachments = [
    {
      color: "section",
      fields,
    },
  ];

  // slack通知
  const payload = {
    text: "Redash Query Notice",
    attachments: [
      {
        color: "good",
        fields,
      },
    ],
  };

  UrlFetchApp.fetch(slackUrl, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  });
}
