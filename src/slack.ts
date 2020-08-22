export class Slack {
    public static postMessaage(notifyUrl: string, sheetUrl: string, fields: any) {
        const payload = {
            attachments: [
                {
                    color: "good",
                    title: "Redash Query Notice",
                    title_link: sheetUrl,
                    fields,
                    footer: "<https://github.com/litencatt/redash-query-notice|Code URL>",
                },
            ],
        };

        const res = UrlFetchApp.fetch(notifyUrl, {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify(payload),
        });

        return res.getContentText();
    }
}
