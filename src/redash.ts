export class Redash {
    private redashUrl: string;
    private redashToken: string;

    constructor(url: string, token: string) {
        this.redashUrl = url;
        this.redashToken = token;
    }

    public run(queryIds: any[]) {
        const fields = [];
        queryIds.forEach((queryId) => {
          const data = this.request(parseInt(queryId, 10));
          const columns = data.columns.map((column) => column.name);
          const values = [];
          const rows = data.rows;
          rows.forEach((row) => {
            values.push(columns.map((rowKey) => row[rowKey]).join());
          });

          fields.push({
            title: columns.join(),
            value: values.join("\n"),
            short: true,
          });
        });

        return fields;
    }

    private request(queryId: number) {
        const url = `${this.redashUrl}/api/queries/${queryId}/results.json?api_key=${this.redashToken}`;
        const res = UrlFetchApp.fetch(url);
        return JSON.parse(res.getContentText()).query_result.data;
    }
}
