## Redash Query Notice
### Usage
1. npx clasp login
1. npx clasp clasp create --rootDir ./src
1. npx clasp push
1. npx clasp open

### GAS Script Property
- `SHEET_ID`
- `REDASH_URL`
- `REDASH_UER_TOKEN`
- `SLACK_INCOMING_WEBHOOK_URL`

### `config` sheet columns on Spreadsheet

enable | execAt(HH:mm) | title | query IDs
-- | -- | -- | --
✅  | 10:00 | display title 1| 1
🧃  | 12:30 | display title 2 | 1<br>2<br>10
