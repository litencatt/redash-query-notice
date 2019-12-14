export class Redash {
    private redashUrl: string
    private redashToken: string

    constructor(url: string, token: string) {
        this.redashUrl = url
        this.redashToken = token
    }

    public request(queryId: number) {
        const res = UrlFetchApp.fetch(`${this.redashUrl}/api/queries/${queryId}/results.json?api_key=${this.redashToken}`);
        return JSON.parse(res.getContentText()).query_result.data;
    }
}
