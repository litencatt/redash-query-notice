import { Redash } from "./redash";
import { Scheduler } from "./scheduler";
import { Slack } from "./slack";

const ps = PropertiesService.getScriptProperties();
const sheetId = ps.getProperty("SHEET_ID");
const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

const redashUrl = ps.getProperty("REDASH_URL");
const redashToken = ps.getProperty("REDASH_USER_TOKEN");

const slackUrl = ps.getProperty("SLACK_INCOMING_WEBHOOK_URL");

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
  const execAtColumn = 1;
  const titleColumn = 2;
  const idsColumn = 3;

  const now = new Date();
  const redash = new Redash(redashUrl, redashToken);

  for (const task of data) {
    const enabled = task[enabledColumn];
    const execAt = task[execAtColumn];
    if (!Scheduler.isExecute(now, enabled, execAt)) {
      continue;
    }

    // const srcService = task[srcServiceColumn];
    let title = null;
    let fields = null;
    const srcService = "redash";
    switch (srcService) {
      case "redash":
        title = task[titleColumn];
        const queryIds = task[idsColumn].split("\n");
        fields = redash.run(queryIds);
        break;
      default:
        return;
    }

    const footer = "<https://github.com/litencatt/redash-query-notice|Redash query notice>";
    const payload = {
      attachments: [
        {
          color: "good",
          title,
          title_link: sheetUrl,
          fields,
          footer,
        },
      ],
    };
    Slack.postMessaage(slackUrl, payload);
  }
}
