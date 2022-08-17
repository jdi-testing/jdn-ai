// eslint-disable-next-line @typescript-eslint/no-var-requires
const {TestEnvironment} = require('jest-environment-jsdom');

module.exports = {
  "globals": {
    "__REDUX_LOG_ENABLE__": false,
  },
  "testEnvironment": TestEnvironment,
  "setupFilesAfterEnv": ['./jest.setup.js'],
  "transform": {
    "^.+\\.svg$": "jest-transform-stub",
    "^.+\\.(js|jsx)?$": "babel-jest",
    "^.+\\.(ts|tsx)?$": "ts-jest"
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!antd|@ant-design|rc-.+?|@babel/runtime).+(js|jsx)$"
  ],
  "testPathIgnorePatterns": [
    "__mocks__"
  ]
};
