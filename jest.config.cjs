module.exports = {
  "globals": {
    "__REDUX_LOG_ENABLE__": false,
    "__DEV_ENVIRONMENT__": false,
  },
  "testEnvironment": "jest-environment-jsdom",
  "setupFilesAfterEnv": ['./jest.setup.js'],
  "transform": {
    "^.+\\.svg$": "jest-transform-stub",
    "^.+\\.(js|jsx)?$": "babel-jest",
    "^.+\\.(ts|tsx)?$": "ts-jest"
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!(@sindresorhus|antd|@ant-design|rc-.+?|@babel/runtime))/.+(js|jsx)$"
  ],
  "testPathIgnorePatterns": [
    "__mocks__"
  ]
};
