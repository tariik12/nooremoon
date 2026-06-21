import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/admin', cors: { origin: process.env.SOCKET_CORS_ORIGIN || '*' } })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  emitLowStock(payload: { productId: string; productName: string; variantId: string; sku: string; stockQty: number }) {
    this.server.emit('low_stock', payload);
  }

  emitNewOrder(payload: { orderId: string; orderNumber: string; totalCents: number }) {
    this.server.emit('new_order', payload);
  }

  emitOrderStatusChanged(payload: { orderId: string; orderNumber: string; status: string }) {
    this.server.emit('order_status_changed', payload);
  }

  emitNewExchangeRequest(payload: { requestId: string; orderId: string }) {
    this.server.emit('new_exchange_request', payload);
  }
}
