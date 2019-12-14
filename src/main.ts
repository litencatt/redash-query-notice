import {Slack} from './slack'
import { Redash } from './redash';

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
  const data = sheet.getSheetValues(startRow, startColumn, numRows - 1, numColumns);

  // Column number assigned to the task
  const enabledColumn = 0;
  const notifyAtColumn = 1;
  const idsColumn = 2;

  // Get now time strings
  const now = new Date();
  const nowH = `0${now.getHours()}`.slice(-2);
  const nowM = `00${now.getMinutes()}`.slice(-2);

  const redash = new Redash(redashUrl, redashToken);
  const slack = new Slack();

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
      const res = redash.request(parseInt(queryId, 10))
      Object.keys(res).forEach((key) => {
        fields.push({
          title: key,
          value: res[key],
          short: true,
        });
      });
    });

    // Notify to Slack
    const payload = {
      attachments: [
        {
          color: "good",
          title: "Redash Query Notice",
          title_link: sheetUrl,
          fields: fields,
          footer: "<https://github.com/litencatt/redash-query-notice|Code URL>",
        },
      ],
    };

    const res = slack.postMessaage(slackUrl, payload);
  }
}
