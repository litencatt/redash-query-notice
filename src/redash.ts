export class Redash {
    public static redashUrl: string;
    public static redashToken: string;

    public static run(task: any[]) {
        const title = task[this.titleColumn];
        const queryIds = task[this.idsColumn].split("\n");

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

        return {title, fields};
    }

    public static request(queryId: number) {
        const url = `${this.redashUrl}/api/queries/${queryId}/results.json?api_key=${this.redashToken}`;
        const res = UrlFetchApp.fetch(url);
        return JSON.parse(res.getContentText()).query_result.data;
    }

    private static titleColumn = 3;
    private static idsColumn = 4;
}
