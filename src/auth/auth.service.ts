import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import path from 'node:path';
import { Config } from 'node-json-db';
import { JsonDB } from 'node-json-db';

const ALLOWED_USERS_PATH = '/allowedUsers';
const AUTH_DB_FILE = path.resolve(__dirname, '..', '..', 'auth-db');

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly db: JsonDB;

  constructor() {
    this.db = new JsonDB(new Config(AUTH_DB_FILE, true, false, '/'));
  }

  async onModuleInit(): Promise<void> {
    await this.ensureAllowedUsersExists();
  }

  private async ensureAllowedUsersExists(): Promise<void> {
    try {
      await this.db.getData(ALLOWED_USERS_PATH);
    } catch {
      await this.db.push(ALLOWED_USERS_PATH, []);
      this.logger.log(
        `Initialized allowed-users store at auth-db.json (path: ${ALLOWED_USERS_PATH})`,
      );
    }
  }

  async isUserAllowed(telegramUserId: number): Promise<boolean> {
    const allowedIds = await this.db.getObjectDefault<number[]>(
      ALLOWED_USERS_PATH,
      [],
    );

    return allowedIds.includes(telegramUserId);
  }

  async addAllowedUser(telegramUserId: number): Promise<void> {
    const allowed = await this.db.getObjectDefault<number[]>(
      ALLOWED_USERS_PATH,
      [],
    );

    if (allowed.includes(telegramUserId)) return;

    await this.db.push(`${ALLOWED_USERS_PATH}[]`, telegramUserId, false);
  }
}
