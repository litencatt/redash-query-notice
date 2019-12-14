const ps = PropertiesService.getScriptProperties();
const sheetId     = ps.getProperty("SHEET_ID");
const redashUrl   = ps.getProperty("REDASH_URL");
const redashToken = ps.getProperty("REDASH_USER_TOKEN");
const slackUrl    = ps.getProperty("SLACK_INCOMING_WEBHOOK_URL");

const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

function notify() {
  // Setup to read columns from spread sheat
  const s = SpreadsheetApp.openById(sheetId);
  const sheet = s.getSheetByName("config");
  const startRow = 2;
  const numColumn = sheet.getLastColumn();

  // Get notify_at from spread sheat
  const notifyAt  = sheet.getSheetValues(startRow, 2, 1, 1)[0][0];

  // Get query Ids from spread sheat
  const queryIds  = sheet.getSheetValues(startRow, 3, 3, numColumn - 2)[0];

  // Control execution timing
  const now = new Date();
  const nowH = `0${now.getHours()}`.slice(-2);
  const nowM = `00${now.getMinutes()}`.slice(-2);
  const notifyH = `0${notifyAt.getHours()}`.slice(-2);
  const notifyM = `00${notifyAt.getMinutes()}`.slice(-2);
  if (notifyH !== nowH || notifyM !== nowM) {
    return;
  }

  // Exec redash API
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

  // Notify to slack
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
