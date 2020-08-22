export class Slack {
    public static postMessaage(notifyUrl: string, payload: any) {
        const res = UrlFetchApp.fetch(notifyUrl, {
            method: "post",
            contentType: "application/json",
            payload: JSON.stringify(payload),
        });

        return res.getContentText();
    }
}
