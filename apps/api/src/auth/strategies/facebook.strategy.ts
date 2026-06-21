import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import type { SocialProfile } from './google.strategy';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('FACEBOOK_APP_ID') || 'NOT_CONFIGURED',
      clientSecret: config.get<string>('FACEBOOK_APP_SECRET') || 'NOT_CONFIGURED',
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:3001/api/v1/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name', 'picture'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: null, user: SocialProfile) => void,
  ): void {
    const user: SocialProfile = {
      provider: 'facebook',
      providerId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      firstName: profile.name?.givenName ?? null,
      lastName: profile.name?.familyName ?? null,
      avatarUrl: (profile.photos as Array<{ value: string }> | undefined)?.[0]?.value ?? null,
    };
    done(null, user);
  }
}
