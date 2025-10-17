import getClockTime from "./getClockTime";

const getPresence = (t) => {
    if (t) {
        const dateObject = new Date(t);
        const now = new Date();
        const diff = (now.getTime() - dateObject.getTime()) / 1000;
        const days = Math.floor(diff / (24 * 60 * 60)); // Use floor for full days passed
        const timeToReturn = getClockTime(dateObject);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        let dayToReturn;

        if (days < 7) {
            if (days === 0) {
                dayToReturn = "today";
            } else if (days === 1) {
                dayToReturn = "yesterday";
            } else {
                dayToReturn = dateObject.toLocaleString('en-US', { weekday: 'long' });
            }
        }
        else if (dateObject >= startOfYear) {
            const month = dateObject.toLocaleString("en-US", { month: "long" });
            const day = dateObject.getDate();
            dayToReturn = `${day}, ${month}`;
        } else {
            const day = dateObject.getDate().toString().padStart(2, '0');
            const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObject.getFullYear().toString().slice(-2);
            dayToReturn = `${day}/${month}/${year}`;
        }

        return `last seen ${dayToReturn} at ${timeToReturn}`;
    }
}

export default getPresence
