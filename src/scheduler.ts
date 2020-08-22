export class Scheduler {
    public static isExecute(now: Date, enabled: string, notifyAt: Date) {
        if (!enabled) {
            return false;
        }

        const nowH = `0${now.getHours()}`.slice(-2);
        const nowM = `00${now.getMinutes()}`.slice(-2);
        const notifyH = `0${notifyAt.getHours()}`.slice(-2);
        const notifyM = `00${notifyAt.getMinutes()}`.slice(-2);
        if (notifyH !== nowH || notifyM !== nowM) {
          return false;
        }

        return true;
    }
}
