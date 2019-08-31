import {Slack} from './slack'
import { Redash } from './redash';


const ps = PropertiesService.getScriptProperties();
const sheetId     = ps.getProperty("SHEET_ID");
const redashUrl   = ps.getProperty("REDASH_URL");
const redashToken = ps.getProperty("REDASH_USER_TOKEN");
const slackUrl    = ps.getProperty("SLACK_INCOMING_WEBHOOK_URL");

const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

function notify() {
  // spread のconfig sheetからqueryIds取得
  const s = SpreadsheetApp.openById(sheetId);
  const sheet = s.getSheetByName("config");
  const startRow = 2;
  const numColumn = sheet.getLastColumn();
  const notifyAt  = sheet.getSheetValues(startRow, 2, 1, 1)[0][0];
  const queryIds  = sheet.getSheetValues(startRow, 3, 3, numColumn - 2)[0];

  const now = new Date();
  const nowH = `0${now.getHours()}`.slice(-2);
  const nowM = `00${now.getMinutes()}`.slice(-2);
  const notifyH = `0${notifyAt.getHours()}`.slice(-2);
  const notifyM = `00${notifyAt.getMinutes()}`.slice(-2);
  if (notifyH !== nowH || notifyM !== nowM) {
    return;
  }

  // redash api実行
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

  const slack = new Slack();
  const res = slack.postMessaage(slackUrl, payload);
}
