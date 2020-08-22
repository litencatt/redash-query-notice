import { Redash } from "./redash";
import { Scheduler } from "./scheduler";
import { Slack } from "./slack";

const ps = PropertiesService.getScriptProperties();
const sheetId     = ps.getProperty("SHEET_ID");
const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

const redashUrl   = ps.getProperty("REDASH_URL");
const redashToken = ps.getProperty("REDASH_USER_TOKEN");

const slackUrl    = ps.getProperty("SLACK_INCOMING_WEBHOOK_URL");

function notify() {
  // Setup to read columns from spread sheat
  const s = SpreadsheetApp.openById(sheetId);
  const sheet = s.getSheetByName("config");
  const startRow = 2;
  const startColumn = 1;
  const numRows = sheet.getLastRow();
  const numColumns = sheet.getLastColumn();
  const data = sheet.getSheetValues(startRow, startColumn, numRows - 1, numColumns);

  // Column number assigned to the task
  const enabledColumn = 0;
  const notifyAtColumn = 1;
  const idsColumn = 2;

  const now = new Date();
  const redash = new Redash(redashUrl, redashToken);

  for (const task of data) {
    const enabled = task[enabledColumn];
    const notifyAt = task[notifyAtColumn];
    if (!Scheduler.isExecute(now, enabled, notifyAt)) {
      continue;
    }

    // const srcService = task[srcServiceColumn];
    let fields = null;
    const srcService = "redash";
    switch (srcService) {
      case "redash":
        const queryIds = task[idsColumn].split("\n");
        fields = redash.run(queryIds);
        break;
      default:
        return;
    }

    Slack.postMessaage(slackUrl, sheetUrl, fields);
  }
}
