'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { clearCart } from '@/store/cartSlice';
import { formatPrice } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const SHIPPING_FREE_THRESHOLD = 15000;
const SHIPPING_FLAT = 800;

type PaymentMethod = 'cod' | 'stripe' | 'bkash';
type Step = 'form' | 'ivr_waiting' | 'payment' | 'bkash_payment';

interface AddressForm {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyAddress: AddressForm = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', postalCode: '', country: 'Bangladesh',
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, subtotalCents, sessionId } = useSelector((s: RootState) => s.cart);

  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [orderNumber, setOrderNumber] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [ivrStatus, setIvrStatus] = useState('queued');
  const [ivrError, setIvrError] = useState('');
  const [ivrElapsed, setIvrElapsed] = useState(0);
  const [fallbackConfirming, setFallbackConfirming] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shippingCents = subtotalCents >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT;
  const totalCents = subtotalCents + shippingCents;

  const getSid = () =>
    sessionId || (typeof window !== 'undefined' ? localStorage.getItem('cart_session_id') ?? '' : '');

  useEffect(() => {
    if (items.length === 0 && step === 'form') router.replace('/shopping-bag');
  }, [items, router, step]);

  // Count seconds elapsed while waiting for IVR
  useEffect(() => {
    if (step !== 'ivr_waiting') return;
    timerRef.current = setInterval(() => setIvrElapsed((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  // Poll IVR status while waiting
  useEffect(() => {
    if (step !== 'ivr_waiting' || !orderNumber) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API}/orders/${orderNumber}/ivr-status`);
        if (!res.ok) return;
        const data = await res.json();
        const status = data.ivrStatus as string;
        setIvrStatus(status);

        if (status === 'confirmed' || status === 'auto_confirmed') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          const pm = data.paymentMethod as string;
          if (pm === 'cod') {
            router.push(`/orders/${orderNumber}`);
          } else if (pm === 'stripe') {
            setStep('payment');
          } else if (pm === 'bkash') {
            setStep('bkash_payment');
          } else {
            router.push(`/orders/${orderNumber}`);
          }
        } else if (status === 'customer_cancelled' || status === 'no_answer' || status === 'cancelled') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setIvrError(
            status === 'no_answer'
              ? 'We couldn\'t reach you. Your order has been cancelled.'
              : 'You cancelled the order via phone. You can place a new order.',
          );
        }
      } catch {
        // network hiccup — keep polling
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, orderNumber, router]);

  function setField(field: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!address.fullName.trim()) return 'Full name is required';
    if (!address.phone.trim()) return 'Phone number is required';
    if (!address.addressLine1.trim()) return 'Address is required';
    if (!address.city.trim()) return 'City is required';
    if (!address.country.trim()) return 'Country is required';
    return null;
  }

  async function handlePlaceOrder() {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setPlacing(true);

    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSid(),
          address: {
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || undefined,
            city: address.city,
            state: address.state || undefined,
            postalCode: address.postalCode || undefined,
            country: address.country,
          },
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).message ?? 'Failed to place order');
      }

      const data = await res.json();
      dispatch(clearCart());
      setOrderNumber(data.order.orderNumber);
      if (data.clientSecret) setClientSecret(data.clientSecret as string);

      // Always go to IVR waiting screen first
      setStep('ivr_waiting');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPlacing(false);
    }
  }

  // ── IVR waiting screen ──────────────────────────────────────────────
  async function handleFallbackConfirm() {
    setFallbackConfirming(true);
    try {
      const res = await fetch(`${API}/orders/${orderNumber}/ivr-fallback-confirm`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIvrStatus(data.ivrStatus);
      }
    } catch {
      // ignore — polling will pick it up
    } finally {
      setFallbackConfirming(false);
    }
  }

  if (step === 'ivr_waiting') {
    return (
      <IvrWaitingScreen
        orderNumber={orderNumber}
        phone={address.phone}
        ivrStatus={ivrStatus}
        error={ivrError}
        paymentMethod={paymentMethod}
        totalCents={totalCents}
        elapsed={ivrElapsed}
        fallbackConfirming={fallbackConfirming}
        onFallbackConfirm={handleFallbackConfirm}
        onRetry={() => router.push('/')}
      />
    );
  }

  // ── Stripe payment screen ───────────────────────────────────────────
  if (step === 'payment') {
    return (
      <StripePaymentStep
        orderNumber={orderNumber}
        clientSecret={clientSecret}
        totalCents={totalCents}
      />
    );
  }

  // ── bKash payment screen ────────────────────────────────────────────
  if (step === 'bkash_payment') {
    return (
      <BkashPaymentStep orderNumber={orderNumber} totalCents={totalCents} />
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/shopping-bag" className="text-[12px] text-[#6b6b6b] hover:text-[#111] transition-colors flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Bag
        </Link>
        <span className="text-[#e5e5e5]">/</span>
        <h1 className="text-[18px] font-semibold text-[#111]">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* LEFT — Address + Payment */}
        <div className="space-y-6">

          {/* Shipping address */}
          <section className="bg-white border border-[#e5e5e5] rounded-sm p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#111] mb-5">
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *" value={address.fullName} onChange={(v) => setField('fullName', v)} placeholder="Noore Moon" />
                <Field label="Phone *" value={address.phone} onChange={(v) => setField('phone', v)} placeholder="+880 1XXX-XXXXXX" type="tel" />
              </div>
              <Field label="Address Line 1 *" value={address.addressLine1} onChange={(v) => setField('addressLine1', v)} placeholder="House, Road, Block" />
              <Field label="Address Line 2" value={address.addressLine2} onChange={(v) => setField('addressLine2', v)} placeholder="Apartment, floor, landmark (optional)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City *" value={address.city} onChange={(v) => setField('city', v)} placeholder="Dhaka" />
                <Field label="State / Division" value={address.state} onChange={(v) => setField('state', v)} placeholder="Dhaka Division" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Postal Code" value={address.postalCode} onChange={(v) => setField('postalCode', v)} placeholder="1200" />
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Country *</label>
                  <select
                    value={address.country}
                    onChange={(e) => setField('country', e.target.value)}
                    className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] text-[#111] bg-white focus:outline-none focus:border-[#111] transition-colors"
                  >
                    <option>Bangladesh</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>India</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-white border border-[#e5e5e5] rounded-sm p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#111] mb-5">
              Payment Method
            </h2>
            <div className="space-y-3">
              <PaymentOption
                active={paymentMethod === 'cod'}
                onSelect={() => setPaymentMethod('cod')}
                icon="💵"
                label="Cash on Delivery"
                description="Pay in cash when your order arrives"
              />
              <PaymentOption
                active={paymentMethod === 'stripe'}
                onSelect={() => setPaymentMethod('stripe')}
                icon="💳"
                label="Credit / Debit Card"
                description="Visa, Mastercard, Amex — secured by Stripe"
              />
              <PaymentOption
                active={paymentMethod === 'bkash'}
                onSelect={() => setPaymentMethod('bkash')}
                icon="📱"
                label="bKash"
                description="Pay instantly with your bKash account"
              />
            </div>

            <div className="mt-4 bg-[#f0f7ff] border border-[#bcd8f5] rounded-sm px-4 py-3">
              <p className="text-[12px] text-[#2c6fad] flex items-start gap-2">
                <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.38 2 2 0 0 1 3.04 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
                </svg>
                After placing your order, you&apos;ll receive a confirmation call to verify your name, address, and order amount.
                {paymentMethod === 'cod' && ' Once confirmed, your order goes into processing.'}
                {paymentMethod !== 'cod' && ' Once confirmed, you\'ll proceed to payment.'}
              </p>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="bg-[#fff5f5] border border-[#fecaca] rounded-sm px-4 py-3">
              <p className="text-[13px] text-[#cc0000]">{error}</p>
            </div>
          )}

          {/* Place order */}
          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full bg-[#111] text-white text-[13px] uppercase tracking-widest py-4 rounded-sm hover:bg-[#333] disabled:opacity-50 transition-colors font-semibold"
          >
            {placing
              ? 'Placing Order…'
              : paymentMethod === 'cod'
                ? 'Place Order — Cash on Delivery'
                : paymentMethod === 'stripe'
                  ? 'Place Order — Credit / Debit Card'
                  : 'Place Order — bKash'}
          </button>
        </div>

        {/* RIGHT — Order summary */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e5e5e5] rounded-sm p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#111] mb-4">
              Your Order ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>

            <div className="space-y-3 mb-5">
              {items.map((item) => {
                const img = item.product?.imageUrl
                  ? item.product.imageUrl.startsWith('/')
                    ? `${API.replace('/api/v1', '')}${item.product.imageUrl}`
                    : item.product.imageUrl
                  : null;
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-12 h-16 shrink-0 bg-[#f7f7f7] rounded-sm overflow-hidden">
                      {img ? (
                        <Image src={img} alt={item.product?.name ?? ''} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full bg-[#ebebeb]" />
                      )}
                      <span className="absolute -top-1 -right-1 bg-[#111] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[#111] font-medium line-clamp-2 leading-tight">{item.product?.name}</p>
                      <p className="text-[10px] text-[#aaa] mt-0.5">
                        {[item.variant?.size, item.variant?.colour].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <p className="text-[12px] text-[#111] font-medium shrink-0">{formatPrice(item.totalCents)}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#f0f0f0] pt-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#6b6b6b]">Subtotal</span>
                <span className="text-[#111]">{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b6b6b]">Shipping</span>
                {shippingCents === 0
                  ? <span className="text-[#1a5c4a] font-medium">Free</span>
                  : <span className="text-[#111]">{formatPrice(shippingCents)}</span>}
              </div>
              <div className="flex justify-between font-semibold text-[15px] pt-2 border-t border-[#f0f0f0]">
                <span>Total</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#aaa]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secure 256-bit SSL checkout
          </div>
        </div>
      </div>
    </div>
  );
}

// ── IVR Waiting Screen ───────────────────────────────────────────────────────

function IvrWaitingScreen({
  orderNumber, phone, ivrStatus, error, paymentMethod, totalCents,
  elapsed, fallbackConfirming, onFallbackConfirm, onRetry,
}: {
  orderNumber: string;
  phone: string;
  ivrStatus: string;
  error: string;
  paymentMethod: PaymentMethod;
  totalCents: number;
  elapsed: number;
  fallbackConfirming: boolean;
  onFallbackConfirm: () => void;
  onRetry: () => void;
}) {
  const isError = !!error;
  const isConfirmed = ivrStatus === 'confirmed' || ivrStatus === 'auto_confirmed';
  const showFallback = elapsed >= 30 && !isConfirmed && !isError;

  return (
    <div className="max-w-[500px] mx-auto px-4 py-16">
      <div className="bg-white border border-[#e5e5e5] rounded-sm p-8 text-center">

        {isError ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#fff5f5] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cc0000" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h2 className="text-[18px] font-semibold text-[#111] mb-2">Order Cancelled</h2>
            <p className="text-[13px] text-[#6b6b6b] mb-6">{error}</p>
            <button
              onClick={onRetry}
              className="w-full bg-[#111] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#333] transition-colors"
            >
              Back to Shop
            </button>
          </>
        ) : isConfirmed ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a5c4a" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-[18px] font-semibold text-[#111] mb-2">Confirmed!</h2>
            <p className="text-[13px] text-[#6b6b6b] mb-3">Order {orderNumber}</p>
            <Link
              href={`/orders/track?orderNumber=${orderNumber}`}
              className="text-[11px] underline underline-offset-2 text-[#1a5fa8]"
            >
              Track this order →
            </Link>
          </>
        ) : (
          <>
            {/* Animated phone ring */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-[#e3f0ff] animate-ping opacity-60" />
              <div className="relative w-20 h-20 rounded-full bg-[#e3f0ff] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a5fa8" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.38 2 2 0 0 1 3.04 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
                </svg>
              </div>
            </div>

            <h2 className="text-[18px] font-semibold text-[#111] mb-2">Calling You Now</h2>
            <p className="text-[13px] text-[#6b6b6b] mb-1">
              We&apos;re calling <span className="font-medium text-[#111]">{phone}</span> to confirm your order.
            </p>
            <p className="text-[12px] text-[#aaa] mb-6">
              Order <span className="font-mono">{orderNumber}</span> — {formatPrice(totalCents)}
            </p>

            <div className="bg-[#f7f7f7] border border-[#e5e5e5] rounded-sm p-4 text-left mb-6 space-y-1.5 text-[13px]">
              <p className="text-[11px] uppercase tracking-widest text-[#aaa] font-medium mb-2">During the call, listen for:</p>
              <p className="text-[#444]">✓ Your name & delivery address</p>
              <p className="text-[#444]">✓ Total amount: <strong>{formatPrice(totalCents)}</strong></p>
              {paymentMethod === 'cod' && (
                <p className="text-[#444]">✓ Press <strong>1</strong> to confirm, <strong>2</strong> to cancel</p>
              )}
              {paymentMethod !== 'cod' && (
                <p className="text-[#444]">✓ Press <strong>1</strong> to confirm &amp; proceed to payment</p>
              )}
            </div>

            {showFallback ? (
              <div className="mt-2">
                <p className="text-[12px] text-[#6b6b6b] mb-3">
                  Already pressed <strong>1</strong> to confirm?
                </p>
                <button
                  onClick={onFallbackConfirm}
                  disabled={fallbackConfirming}
                  className="w-full bg-[#1a5c4a] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#144a3a] disabled:opacity-50 transition-colors font-semibold"
                >
                  {fallbackConfirming ? 'Confirming…' : 'Yes, I Confirmed — Continue'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#aaa]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a5fa8] animate-pulse inline-block" />
                Waiting for confirmation… {elapsed > 0 && `(${elapsed}s)`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] text-[#111] placeholder-[#bbb] focus:outline-none focus:border-[#111] transition-colors"
      />
    </div>
  );
}

function PaymentOption({
  active, onSelect, icon, label, description,
}: {
  active: boolean; onSelect: () => void;
  icon: string; label: string; description: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3.5 border rounded-sm transition-colors text-left ${
        active ? 'border-[#111] bg-[#fafafa]' : 'border-[#e5e5e5] hover:border-[#999]'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
        active ? 'border-[#111]' : 'border-[#ccc]'
      }`}>
        {active && <div className="w-2 h-2 rounded-full bg-[#111]" />}
      </div>
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-[13px] font-medium text-[#111]">{label}</p>
        <p className="text-[11px] text-[#6b6b6b]">{description}</p>
      </div>
    </button>
  );
}

function StripePaymentStep({
  orderNumber, clientSecret, totalCents,
}: {
  orderNumber: string;
  clientSecret: string;
  totalCents: number;
}) {
  const router = useRouter();
  return (
    <div className="max-w-[500px] mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-[#e5e5e5] rounded-sm p-8">
        <div className="text-3xl mb-4">💳</div>
        <h2 className="text-[18px] font-semibold text-[#111] mb-2">Complete Payment</h2>
        <p className="text-[13px] text-[#6b6b6b] mb-2">
          Order <span className="font-mono font-medium text-[#111]">{orderNumber}</span>
        </p>
        <p className="text-[22px] font-semibold text-[#111] mb-6">{formatPrice(totalCents)}</p>
        {clientSecret ? (
          <p className="text-[12px] text-[#6b6b6b] mb-6">
            Stripe card entry will be integrated here. Client secret is ready.
          </p>
        ) : (
          <p className="text-[12px] text-[#6b6b6b] mb-6">
            Your order is confirmed. Configure Stripe live keys to enable card payments.
          </p>
        )}
        <button
          onClick={() => router.push(`/orders/${orderNumber}`)}
          className="w-full bg-[#111] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#333] transition-colors"
        >
          View Order
        </button>
      </div>
    </div>
  );
}

function BkashPaymentStep({
  orderNumber, totalCents,
}: {
  orderNumber: string;
  totalCents: number;
}) {
  const router = useRouter();
  return (
    <div className="max-w-[500px] mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-[#e5e5e5] rounded-sm p-8">
        <div className="text-3xl mb-4">📱</div>
        <h2 className="text-[18px] font-semibold text-[#111] mb-2">Complete bKash Payment</h2>
        <p className="text-[13px] text-[#6b6b6b] mb-2">
          Order <span className="font-mono font-medium text-[#111]">{orderNumber}</span>
        </p>
        <p className="text-[22px] font-semibold text-[#111] mb-4">{formatPrice(totalCents)}</p>
        <div className="bg-[#fff0f5] border border-[#ffb3cc] rounded-sm px-4 py-3 mb-6 text-left">
          <p className="text-[12px] text-[#c0006b] font-medium mb-1">bKash Payment Instructions</p>
          <p className="text-[12px] text-[#c0006b]">
            A bKash payment request will be sent to your registered number. Open bKash, go to &quot;Payment Requests&quot; and confirm.
          </p>
        </div>
        <button
          onClick={() => router.push(`/orders/${orderNumber}`)}
          className="w-full bg-[#c0006b] text-white text-[12px] uppercase tracking-widest py-3 rounded-sm hover:bg-[#a30059] transition-colors"
        >
          View Order
        </button>
      </div>
    </div>
  );
}
