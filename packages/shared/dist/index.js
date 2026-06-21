"use strict";
// Fixed workflow state enums — represent business process stages identical
// for every deployment. Never add UserRole, TierName, Category, or any
// admin-managed value here.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyTransactionType = exports.ConversationStatus = exports.NotificationEvent = exports.PaymentMethod = exports.PaymentStatus = exports.ExchangeStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["RETURN_REQUESTED"] = "return_requested";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var ExchangeStatus;
(function (ExchangeStatus) {
    ExchangeStatus["REQUESTED"] = "requested";
    ExchangeStatus["APPROVED"] = "approved";
    ExchangeStatus["REJECTED"] = "rejected";
    ExchangeStatus["COMPLETED"] = "completed";
})(ExchangeStatus || (exports.ExchangeStatus = ExchangeStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["COD"] = "cod";
    PaymentMethod["STRIPE"] = "stripe";
    PaymentMethod["BKASH"] = "bkash";
    PaymentMethod["EPS"] = "eps";
    PaymentMethod["GIFT_CARD"] = "gift_card";
    PaymentMethod["LOYALTY_POINTS"] = "loyalty_points";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var NotificationEvent;
(function (NotificationEvent) {
    NotificationEvent["ORDER_PLACED"] = "order_placed";
    NotificationEvent["ORDER_SHIPPED"] = "order_shipped";
    NotificationEvent["ORDER_DELIVERED"] = "order_delivered";
    NotificationEvent["ORDER_CANCELLED"] = "order_cancelled";
    NotificationEvent["LOW_STOCK"] = "low_stock";
    NotificationEvent["NEW_EXCHANGE_REQUEST"] = "new_exchange_request";
    NotificationEvent["NEW_MESSAGE"] = "new_message";
})(NotificationEvent || (exports.NotificationEvent = NotificationEvent = {}));
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["OPEN"] = "open";
    ConversationStatus["IN_PROGRESS"] = "in_progress";
    ConversationStatus["RESOLVED"] = "resolved";
    ConversationStatus["CLOSED"] = "closed";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
var LoyaltyTransactionType;
(function (LoyaltyTransactionType) {
    LoyaltyTransactionType["EARNED"] = "earned";
    LoyaltyTransactionType["REDEEMED"] = "redeemed";
    LoyaltyTransactionType["EXPIRED"] = "expired";
    LoyaltyTransactionType["ADMIN_ADJUSTMENT"] = "admin_adjustment";
})(LoyaltyTransactionType || (exports.LoyaltyTransactionType = LoyaltyTransactionType = {}));
