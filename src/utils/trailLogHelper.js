// utils.js (or any other suitable filename)
const parseDate = (dateString) => {
    // Parse the date string based on the expected format
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("/");
    const [hour, minute, second] = timePart.split(":");
    // Adjust the format to match MM/DD/YYYY for Date parsing
    return new Date(`${month}/${day}/${year} ${hour}:${minute}:${second}`);
};

const filterPastEntries = (logs) => {
    const now = new Date();
    return logs.filter((log) => {
        // Split the log entry into date/time and event parts
        const [dateTimePart] = log.split("\n");
        // Parse the date/time from the log entry
        const logDate = parseDate(dateTimePart);
        // Filter and keep only the logs where the date is in the past
        return logDate < now;
    });
};

module.exports = { filterPastEntries };
