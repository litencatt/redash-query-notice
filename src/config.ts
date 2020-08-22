export class Config {
    public static sheetId: string;
    public static configSheetName = "config";
    public static enabledColumn = 0;
    public static execAtColumn = 1;
    public static srcServiceColumn = 2;

    public static getTasks() {
        const s = SpreadsheetApp.openById(this.sheetId);
        const sheet = s.getSheetByName(this.configSheetName);
        const numRows = sheet.getLastRow();
        const numColumns = sheet.getLastColumn();

        return sheet.getSheetValues(this.startRow, this.startColumn, numRows - 1, numColumns);
    }

    private static startRow = 2;
    private static startColumn = 1;
}
