const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { createJWT } = require('../utils/authHelper');
dotenv.config();

describe('Auth Utils', () => {
    let user;

    beforeAll(() => {
        user = {
            _id: "669fb799d22cf89ef1ba3307",
            admin: true
        };
    });

    describe('createJWT', () => {
        it('create a valid JWT for a user', () => {
            const token = createJWT(user);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should be an object', () => {
            const token = createJWT(user);
            const decoded = jwt.decode(token);
            expect(typeof decoded).toBe('object');
        });
    });
});