import { Config } from "./config";
import { Redash } from "./redash";
import { Scheduler } from "./scheduler";
import { Slack } from "./slack";

const ps = PropertiesService.getScriptProperties();
Config.sheetId = ps.getProperty("SHEET_ID");
Redash.redashUrl = ps.getProperty("REDASH_URL");
Redash.redashToken = ps.getProperty("REDASH_USER_TOKEN");
Slack.notifyUrl = ps.getProperty("SLACK_INCOMING_WEBHOOK_URL");
Slack.sheetUrl = `https://docs.google.com/spreadsheets/d/${Config.sheetId}/edit`;
Slack.footer = "<https://github.com/litencatt/redash-query-notice|Redash query notice>";

function notify() {
  const now = new Date();

  for (const task of Config.getTasks()) {
    const enabled = task[Config.enabledColumn];
    const execAt = task[Config.execAtColumn];
    if (!Scheduler.isExecute(now, enabled, execAt)) {
      continue;
    }

    let res = null;
    switch (task[Config.srcServiceColumn]) {
      case "redash":
        res = Redash.run(task);
        break;
      default:
        return;
    }

    Slack.postMessaage(res);
  }
}
