// Check to see if password contains both letters and number
function isValidPassword(password) {
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
    return regex.test(password);
}

module.exports = { isValidPassword }