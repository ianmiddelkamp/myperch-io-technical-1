module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
	setupFilesAfterEnv: [
		'<rootDir>/test/_setup/database.testSetup.ts',
	],
};