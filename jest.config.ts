import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\.\./src/(.*)\.js$': '<rootDir>/src/$1.ts',
    '^\.\./\.\./src/(.*)\.js$': '<rootDir>/src/$1.ts',
    '^\.\./\.\./src/websocket/(.*)\.js$': '<rootDir>/src/websocket/$1.ts',
    '^\.\./\.\./src/websocket/tournamentServer\.js$': '<rootDir>/src/websocket/tournamentServer.ts',
    '^\.\./websocket/(.*)\.js$': '<rootDir>/src/websocket/$1.ts',
    '^\.\./services/(.*)\.js$': '<rootDir>/src/services/$1.ts',
    '^@supabase/supabase-js$': '<rootDir>/tests/__mocks__/@supabase/supabase-js.ts'
  },
  collectCoverage: false,
  clearMocks: true
};

export default config;
