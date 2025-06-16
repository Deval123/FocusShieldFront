// En ES Modules
export default {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    testMatch: ['**/tests/**/*.test.js'],
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"]
};

// // En ES CommonJS
// module.exports = {
//     testEnvironment: 'jsdom',
//     moduleFileExtensions: ['js'],
//     transform: {}
// };
