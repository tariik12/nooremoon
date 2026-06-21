import {
  Controller, Post, Get, Body, Req, Res, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OtpRequestDto, OtpVerifyDto } from './dto/otp.dto';
import { ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { SocialProfile } from './strategies/google.strategy';

interface AuthRequest extends Request {
  user: { id: string; roleId: string | null } | SocialProfile;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Registration & email verification ─────────────────────────────────────
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  // ── Email + password ──────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: AuthRequest, @Body() dto: RefreshTokenDto) {
    const user = req.user as { id: string };
    return this.authService.logout(user.id, dto.refreshToken);
  }

  // ── Password reset ────────────────────────────────────────────────────────
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 900000 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  // ── OTP ───────────────────────────────────────────────────────────────────
  @Post('otp/request')
  @Throttle({ default: { limit: 3, ttl: 600000 } })
  otpRequest(@Body() dto: OtpRequestDto) {
    return this.authService.otpRequest(dto.phoneOrEmail);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  otpVerify(@Body() dto: OtpVerifyDto) {
    return this.authService.otpVerify(dto.phoneOrEmail, dto.code);
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: AuthRequest, @Res() res: Response) {
    const tokens = await this.authService.handleSocialLogin(req.user as SocialProfile);
    const redirectUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(redirectUrl);
  }

  // ── Facebook OAuth ────────────────────────────────────────────────────────
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookAuth() {
    // Passport redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req: AuthRequest, @Res() res: Response) {
    const tokens = await this.authService.handleSocialLogin(req.user as SocialProfile);
    const redirectUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(redirectUrl);
  }

  // ── Current user ──────────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthRequest) {
    const user = req.user as { id: string };
    return this.authService.getMe(user.id);
  }
}
