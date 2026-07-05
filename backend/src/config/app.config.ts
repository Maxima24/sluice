import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env.schema';

/**
 * Typed accessor over ConfigService so consumers read `Env`-typed keys
 * instead of raw strings.
 */
@Injectable()
export class AppConfig {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.config.get(key, { infer: true }) as Env[K];
  }

  get isProd(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /** '*' → allow all; otherwise a comma-separated allow-list. */
  get corsOrigins(): string[] | true {
    const raw = this.get('CORS_ORIGINS');
    if (raw === '*') return true;
    return raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }
}
