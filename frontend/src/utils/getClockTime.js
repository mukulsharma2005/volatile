import React from 'react'

const getClockTime = (t) => {
    if (t) {
        const dateObject = new Date(t);
        const timeString = dateObject.toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return timeString
    }
}


export default getClockTime
