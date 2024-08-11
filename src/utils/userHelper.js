/**
 * Checks if a password is valid based on specific criteria.
 * The password must contain at least one letter (a-z or A-Z) and at least one number (0-9).
 *
 * @param {string} password - The password to be validated.
 * @returns {boolean} - Returns true if the password is valid, otherwise false.
 */
function isValidPassword(password) {
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
    return regex.test(password);
}

module.exports = { isValidPassword }