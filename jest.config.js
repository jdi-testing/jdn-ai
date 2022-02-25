module.exports = {
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ['./jest.setup.js'],
  "transform": {
    "^.+\\.svg$": "jest-transform-stub",
    "^.+\\.(js|jsx)?$": "babel-jest",
    "^.+\\.(ts|tsx)?$": "ts-jest"
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!antd|@ant-design|rc-.+?|@babel/runtime).+(js|jsx)$"
  ]
};
