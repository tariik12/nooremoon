export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    RETURN_REQUESTED = "return_requested"
}
export declare enum ExchangeStatus {
    REQUESTED = "requested",
    APPROVED = "approved",
    REJECTED = "rejected",
    COMPLETED = "completed"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    COD = "cod",
    STRIPE = "stripe",
    BKASH = "bkash",
    EPS = "eps",
    GIFT_CARD = "gift_card",
    LOYALTY_POINTS = "loyalty_points"
}
export declare enum NotificationEvent {
    ORDER_PLACED = "order_placed",
    ORDER_SHIPPED = "order_shipped",
    ORDER_DELIVERED = "order_delivered",
    ORDER_CANCELLED = "order_cancelled",
    LOW_STOCK = "low_stock",
    NEW_EXCHANGE_REQUEST = "new_exchange_request",
    NEW_MESSAGE = "new_message"
}
export declare enum ConversationStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare enum LoyaltyTransactionType {
    EARNED = "earned",
    REDEEMED = "redeemed",
    EXPIRED = "expired",
    ADMIN_ADJUSTMENT = "admin_adjustment"
}
