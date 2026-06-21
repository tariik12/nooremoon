import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const KOTHA_API = 'https://app.syssolution.net/api/v1';
const CAMPAIGN_ID = 3;

export interface IvrOrderPayload {
  id: string;
  orderNumber: string;
  customerPhone: string;
  customerName: string;
  addressLine: string;
  totalCents: number;
  shippingCents: number;
}

@Injectable()
export class KothaIvrService {
  private readonly logger = new Logger(KothaIvrService.name);

  constructor(private readonly config: ConfigService) {}

  async triggerOrderConfirmation(order: IvrOrderPayload): Promise<string | null> {
    const apiKey = this.config.get<string>('KOTHA_API_KEY');
    if (!apiKey) {
      this.logger.warn('KOTHA_API_KEY not set — skipping IVR call');
      return null;
    }

    const totalDisplay = (order.totalCents / 100).toFixed(0);
    const shippingDisplay = (order.shippingCents / 100).toFixed(0);

    try {
      const res = await fetch(`${KOTHA_API}/ivr/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kotha-Api-Key': apiKey,
        },
        body: JSON.stringify({
          campaign_id: CAMPAIGN_ID,
          phone: order.customerPhone,
          external_ref: `ord_${order.id}`,
          variables: {
            customer_name: order.customerName,
            order_id: order.orderNumber,
            amount: totalDisplay,
            shipping: shippingDisplay,
            address: order.addressLine,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`Kotha IVR trigger failed: ${res.status} ${body}`);
        return null;
      }

      const data = (await res.json()) as { call_request_id: string };
      this.logger.log(`IVR call queued for order ${order.orderNumber}: ${data.call_request_id}`);
      return data.call_request_id;
    } catch (err) {
      this.logger.error(`Kotha IVR network error: ${(err as Error).message}`);
      return null;
    }
  }
}
