export class Slack {
    public static sheetUrl: string;
    public static notifyUrl: string;
    public static footer: string;

    public static postMessaage(r: Result) {
        const payload = {
            attachments: [
              {
                color: "good",
                title: r.title,
                title_link: this.sheetUrl,
                fields: r.fields,
                footer: this.footer,
              },
            ],
          };

        const res = UrlFetchApp.fetch(this.notifyUrl, {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify(payload),
        });

        return res.getContentText();
    }
}
