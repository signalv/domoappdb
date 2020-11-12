
const jsonDateReviver = (key, value) => {
    const regexISO = /^\d{4}-(0[1-9]|1[0-2])-([12]\d|0[1-9]|3[01])([T\s](([01]\d|2[0-3])\:[0-5]\d|24\:00)(\:[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3])\:?([0-5]\d)?)?)?$/
    // for all our string types check if their value matches ISO 8601 dates.
    if (typeof value === "string") {
        const a = regexISO.exec(value);
        // matches ISO 8601 date, return a Date obj
        if (a) {
            return new Date(value);
        }
    }

    // return all the values we're not parsing so the JSON.parse can handle them.
    return value;
}

export const parseWithDate = function (json) {
    try {
        const res = JSON.parse(json, jsonDateReviver);
        return res;
    } catch (e) {
        // original error thrown doesnt have an error message, rethrow with a message
        throw new Error("JSON content could not be parsed");
    }
}
export const useDateParser = function (reset) {
    if (typeof reset != "undefined") {
        if (JSON._parseSaved) {
            JSON.parse = JSON._parseSaved;
            JSON._parseSaved = null;
        }
    } else {
        if (!JSON._parseSaved) {
            JSON._parseSaved = JSON.parse;
            JSON.parse = parseWithDate;
        }
    }
}