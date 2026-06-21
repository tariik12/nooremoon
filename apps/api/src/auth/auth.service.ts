import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException, ForbiddenException, Inject, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { OtpCode } from '../users/entities/otp-code.entity';
import { SocialAccount } from '../users/entities/social-account.entity';
import { Role } from '../rbac/entities/role.entity';
import { EmailService } from '../email/email.service';
import { REDIS_CLIENT } from '../common/redis/redis.module';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { SocialProfile } from './strategies/google.strategy';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken) private readonly rtRepo: Repository<RefreshToken>,
    @InjectRepository(OtpCode) private readonly otpRepo: Repository<OtpCode>,
    @InjectRepository(SocialAccount) private readonly socialRepo: Repository<SocialAccount>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // ── Registration ──────────────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const customerRole = await this.roleRepo.findOne({ where: { name: 'customer' } });
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.userRepo.save(
      this.userRepo.create({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        phone: dto.phone ?? null,
        roleId: customerRole?.id ?? null,
        isEmailVerified: false,
        isActive: true,
      }),
    );

    const token = uuidv4();
    await this.otpRepo.save(
      this.otpRepo.create({
        userId: user.id,
        phoneOrEmail: dto.email,
        code: token,
        type: 'email_verify',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24hrs
      }),
    );

    await this.emailService.sendVerificationEmail(dto.email, token);
    return { message: 'Registration successful. Please check your email to verify your account.' };
  }

  // ── Email verification ────────────────────────────────────────────────────
  async verifyEmail(token: string): Promise<{ message: string }> {
    const otp = await this.otpRepo.findOne({
      where: { code: token, type: 'email_verify', usedAt: IsNull() },
    });

    if (!otp || otp.usedAt || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.otpRepo.update(otp.id, { usedAt: new Date() });

    const user = await this.userRepo.findOne({ where: { id: otp.userId! } });
    if (!user) throw new BadRequestException('User not found');

    await this.userRepo.update(user.id, { isEmailVerified: true });

    const name = user.firstName ?? '';
    await this.emailService.sendWelcomeEmail(user.email, name);
    return { message: 'Email verified successfully.' };
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: { role: true },
    });

    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new ForbiddenException('Account is disabled');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      await this.trackFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });
    const tokens = await this.generateTokenPair(user.id, user.roleId);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  // ── Refresh token ─────────────────────────────────────────────────────────
  async refresh(rawToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; roleId: string | null };
    try {
      payload = this.jwt.verify(rawToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-fallback'),
      }) as typeof payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.rtRepo.find({
      where: { userId: payload.sub, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
    });

    let matchedToken: RefreshToken | null = null;
    for (const t of tokens) {
      if (await bcrypt.compare(rawToken, t.tokenHash)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) throw new UnauthorizedException('Refresh token not found or revoked');

    await this.rtRepo.update(matchedToken.id, { revokedAt: new Date() });
    return this.generateTokenPair(payload.sub, payload.roleId);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout(userId: string, rawToken: string): Promise<void> {
    const tokens = await this.rtRepo.find({
      where: { userId, revokedAt: IsNull() },
    });
    for (const t of tokens) {
      if (await bcrypt.compare(rawToken, t.tokenHash)) {
        await this.rtRepo.update(t.id, { revokedAt: new Date() });
        break;
      }
    }
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { email } });
    const msg = { message: 'If this email is registered, a reset link has been sent.' };
    if (!user) return msg;

    const token = uuidv4();
    await this.otpRepo.save(
      this.otpRepo.create({
        userId: user.id,
        phoneOrEmail: email,
        code: token,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      }),
    );

    await this.emailService.sendPasswordResetEmail(email, token);
    return msg;
  }

  // ── Reset password ────────────────────────────────────────────────────────
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const otp = await this.otpRepo.findOne({
      where: { code: token, type: 'password_reset' },
    });

    if (!otp || otp.usedAt || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.userRepo.update(otp.userId!, { passwordHash });
    await this.otpRepo.update(otp.id, { usedAt: new Date() });
    await this.rtRepo.update({ userId: otp.userId! }, { revokedAt: new Date() });

    return { message: 'Password updated successfully.' };
  }

  // ── OTP request ───────────────────────────────────────────────────────────
  async otpRequest(phoneOrEmail: string): Promise<{ message: string }> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const isEmail = phoneOrEmail.includes('@');

    const user = await this.userRepo.findOne({ where: isEmail ? { email: phoneOrEmail } : { phone: phoneOrEmail } });

    await this.otpRepo.save(
      this.otpRepo.create({
        userId: user?.id ?? null,
        phoneOrEmail,
        code,
        type: 'login_otp',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      }),
    );

    if (isEmail) {
      await this.emailService.sendOtpEmail(phoneOrEmail, code);
    } else {
      await this.sendSms(phoneOrEmail, `Your OTP code is: ${code}`);
    }

    return { message: 'OTP sent.' };
  }

  // ── OTP verify ────────────────────────────────────────────────────────────
  async otpVerify(
    phoneOrEmail: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: Partial<User> }> {
    const attemptsKey = `otp_attempts:${phoneOrEmail}`;
    const attempts = await this.redis.incr(attemptsKey);
    if (attempts === 1) await this.redis.expire(attemptsKey, 600);
    if (attempts > 3) throw new ForbiddenException('Too many OTP attempts. Request a new code.');

    const otp = await this.otpRepo.findOne({
      where: { phoneOrEmail, code, type: 'login_otp' },
      order: { createdAt: 'DESC' },
    });

    if (!otp || otp.usedAt || otp.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.otpRepo.update(otp.id, { usedAt: new Date() });
    await this.redis.del(attemptsKey);

    const isEmail = phoneOrEmail.includes('@');
    let user = await this.userRepo.findOne({
      where: isEmail ? { email: phoneOrEmail } : { phone: phoneOrEmail },
    });

    if (!user) {
      const customerRole = await this.roleRepo.findOne({ where: { name: 'customer' } });
      user = await this.userRepo.save(
        this.userRepo.create({
          email: isEmail ? phoneOrEmail : `${phoneOrEmail}@otp.placeholder`,
          phone: isEmail ? null : phoneOrEmail,
          roleId: customerRole?.id ?? null,
          isEmailVerified: isEmail,
          isActive: true,
        }),
      );
    }

    const tokens = await this.generateTokenPair(user.id, user.roleId);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  // ── Social (Google / Facebook) ────────────────────────────────────────────
  async handleSocialLogin(
    profile: SocialProfile,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let socialAccount = await this.socialRepo.findOne({
      where: { provider: profile.provider, providerId: profile.providerId },
    });

    let user: User;

    if (socialAccount) {
      user = await this.userRepo.findOne({ where: { id: socialAccount.userId } }) as User;
    } else {
      // Find existing user by email or create new
      let existingUser = profile.email
        ? await this.userRepo.findOne({ where: { email: profile.email } })
        : null;

      if (!existingUser) {
        const customerRole = await this.roleRepo.findOne({ where: { name: 'customer' } });
        existingUser = await this.userRepo.save(
          this.userRepo.create({
            email: profile.email,
            passwordHash: null,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatarUrl: profile.avatarUrl,
            roleId: customerRole?.id ?? null,
            isEmailVerified: true,
            isActive: true,
          }),
        );
      }

      user = existingUser;
      await this.socialRepo.save(
        this.socialRepo.create({
          userId: user.id,
          provider: profile.provider,
          providerId: profile.providerId,
        }),
      );
    }

    return this.generateTokenPair(user.id, user.roleId);
  }

  // ── Current user ──────────────────────────────────────────────────────────
  async getMe(userId: string): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { role: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.sanitizeUser(user);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private async generateTokenPair(
    userId: string,
    roleId: string | null,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, roleId };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET', 'dev-fallback-secret-change-in-production'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m') as any,
    });

    const rawRefreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-fallback'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d') as any,
    });

    const tokenHash = await bcrypt.hash(rawRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.rtRepo.save(
      this.rtRepo.create({ userId, tokenHash, expiresAt, revokedAt: null }),
    );

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private async trackFailedLogin(user: User): Promise<void> {
    const key = `login_fail:${user.id}`;
    const fails = await this.redis.incr(key);
    if (fails === 1) await this.redis.expire(key, 15 * 60);
    if (fails >= 5) {
      await this.userRepo.update(user.id, { isActive: false });
      this.logger.warn(`Account ${user.email} locked after 5 failed login attempts`);
    }
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash: _pw, ...rest } = user;
    return rest;
  }

  private async sendSms(phone: string, message: string): Promise<void> {
    const apiKey = this.config.get<string>('SYSSMS_API_KEY');
    if (!apiKey) {
      this.logger.debug(`[SMS SKIPPED] To: ${phone} | ${message}`);
      return;
    }
    this.logger.log(`Sending SMS to ${phone}`);
  }
}
