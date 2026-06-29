import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '8080', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  DOCKER_NETWORK: process.env.DOCKER_NETWORK || 'saas_orchestrator_net',
  DOCKER_BASE_IMAGE: process.env.DOCKER_BASE_IMAGE || 'node:20-alpine',
  BUILD_DIR: process.env.BUILD_DIR || '/tmp/saas-builds',
  TEMPLATES_DIR: process.env.TEMPLATES_DIR || '/app/templates/base',
  MODULES_DIR: process.env.MODULES_DIR || '/app/modules',

};
