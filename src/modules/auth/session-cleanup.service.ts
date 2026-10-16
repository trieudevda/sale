import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthSession } from './entities/auth-session.entity';

@Injectable()
export class SessionCleanupService {
  constructor(
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
  ) {}

  @Cron('0 * * * * *', { waitForCompletion: true })
  async cleanup(): Promise<void> {
    const cutoff = new Date(Date.now() - 5 * 60_000);

    await this.sessions.query(
      `DELETE FROM auth_sessions
       WHERE expires_at < ?
       ORDER BY expires_at
       LIMIT 1000`,
      [cutoff],
    );
  }
}
