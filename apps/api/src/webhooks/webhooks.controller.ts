import { Controller, Post, Req, Res, Headers, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';

interface KothaPayload {
  data: {
    external_ref: string;
    result?: 'confirmed' | 'cancelled' | 'transferred';
    status?: string;
    phone: string;
    call_request_id: string;
  };
}

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('kotha-ivr')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleKothaIvr(
    @Req() req: any,
    @Res() res: any,
    @Headers('x-kotha-signature') signatureHeader: string,
  ) {
    // Always respond quickly — Kotha retries if we take >10s
    const secret = this.config.get<string>('KOTHA_WEBHOOK_SECRET');

    if (secret) {
      const rawBody = (req as any).rawBody as Buffer | undefined;
      if (!rawBody) {
        this.logger.error('Raw body not available for HMAC verification');
        return res.status(400).json({ ok: false, error: 'raw body unavailable' });
      }
      const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
      const received = signatureHeader?.replace('sha256=', '') ?? '';
      if (expected !== received) {
        this.logger.warn('Kotha webhook signature mismatch');
        return res.status(401).json({ ok: false, error: 'bad signature' });
      }
    }

    let payload: KothaPayload;
    try {
      payload = typeof req.body === 'object' ? req.body : JSON.parse(req.body.toString());
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid json' });
    }

    const { external_ref, result, status } = payload.data ?? {};
    if (!external_ref) {
      return res.status(400).json({ ok: false, error: 'missing external_ref' });
    }

    // external_ref format: "ord_<uuid>"
    const orderId = external_ref.replace(/^ord_/, '');
    this.logger.log(`Kotha IVR callback: order=${orderId} result=${result} status=${status}`);

    // Process async — respond immediately
    res.json({ ok: true });

    // Handle result after response is sent
    setImmediate(async () => {
      try {
        if (result === 'confirmed') {
          await this.ordersService.confirmOrderByIvr(orderId);
        } else if (result === 'cancelled') {
          await this.ordersService.cancelOrderByIvr(orderId, 'customer_cancelled');
        } else if (result === 'transferred') {
          // Escalated to CS — log only, no status change
          this.logger.log(`Order ${orderId} escalated to CS via IVR`);
        } else if (status === 'no_answer' || status === 'failed') {
          await this.ordersService.cancelOrderByIvr(orderId, 'no_answer');
        }
      } catch (err) {
        this.logger.error(`IVR webhook processing error for ${orderId}: ${(err as Error).message}`);
      }
    });
  }
}
