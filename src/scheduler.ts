export class Scheduler {
    public static isExecute(now: Date, enabled: string, execAt: Date) {
        if (!enabled) {
            return false;
        }

        const nowH = `0${now.getHours()}`.slice(-2);
        const nowM = `00${now.getMinutes()}`.slice(-2);
        const execH = `0${execAt.getHours()}`.slice(-2);
        const execM = `00${execAt.getMinutes()}`.slice(-2);
        if (execH !== nowH || execM !== nowM) {
          return false;
        }

        return true;
    }
}
