export default function maskEmail(email) {
    const maskedEmailArray = email.split("@");
    if (maskedEmailArray[0].length <= 4) {
        return maskedEmailArray[0] + "********" + "@" + maskedEmailArray[1];
    } else {
        return maskedEmailArray[0].slice(0, 4) + "****" + "@" + maskedEmailArray[1];
    }
}