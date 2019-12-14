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
  const startColumn = 1;
  const numColumns = sheet.getLastColumn();
  const numRows = sheet.getLastRow();

  // Get now time string
  const now = new Date();
  const nowH = `0${now.getHours()}`.slice(-2);
  const nowM = `00${now.getMinutes()}`.slice(-2);

  // Column number assigned to the task
  const enabledColumn = 0;
  const notifyAtColumn = 1;
  const idsColumn = 2;
  const webhookColumn = 3;

  const data = sheet.getSheetValues(startRow, startColumn, numRows, numColumns);

  for (const task of data) {
    const enabled = task[enabledColumn];
    const notifyAt = task[notifyAtColumn];
    const queryIds = task[idsColumn].split("\n");

    if (!enabled) {
      continue;
    }

    // Control execution timing
    const notifyH = `0${notifyAt.getHours()}`.slice(-2);
    const notifyM = `00${notifyAt.getMinutes()}`.slice(-2);
    if (notifyH !== nowH || notifyM !== nowM) {
      continue;
    }

    // Execute redash API
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
}
