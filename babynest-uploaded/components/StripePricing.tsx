'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { PLANS, PlanType, BillingPeriod } from '@/lib/stripe-constants';
import { cn } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripePricingProps {
  userId?: string;
  email?: string;
  currentPlan?: PlanType;
}

export function StripePricing({ userId, email, currentPlan }: StripePricingProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | undefined) => {
    if (!priceId) {
      console.error('Price ID not configured');
      return;
    }
    
    setLoading(priceId);

    try {
      // If no userId/email, redirect to signup
      if (!userId || !email) {
        window.location.href = '/auth/signup';
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId,
          email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(null);
    }
  };

  const getPriceId = (plan: PlanType) => {
    if (plan === 'pro') {
      return billingPeriod === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY;
    } else {
      return billingPeriod === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY;
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              billingPeriod === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              billingPeriod === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Yearly
            <span className="ml-1.5 text-xs text-green-600">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {(Object.keys(PLANS) as PlanType[]).map((plan) => {
          const planData = PLANS[plan];
          const isCurrent = currentPlan === plan;
          const price = billingPeriod === 'monthly' ? planData.monthlyPrice : planData.yearlyPrice;
          const priceId = getPriceId(plan);

          return (
            <Card
              key={plan}
              className={cn(
                'relative',
                isCurrent && 'border-2 border-primary-500',
                plan === 'pro' && !isCurrent && 'border-2 border-primary-500'
              )}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle>
                  <div className="flex items-center justify-between">
                    <span>{planData.name}</span>
                    <span className="text-3xl font-bold">
                      ${price}
                      <span className="text-base font-normal text-gray-500">
                        /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </span>
                  </div>
                </CardTitle>
                <p className="text-gray-600">{planData.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {planData.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? 'outline' : 'primary'}
                  className="w-full"
                  size="lg"
                  disabled={isCurrent || (loading === priceId && !!priceId)}
                  onClick={() => handleSubscribe(priceId)}
                >
                  {loading === priceId ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : !priceId ? (
                    'Coming Soon'
                  ) : (
                    `Get ${planData.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-500">
        Cancel anytime. No long-term contracts.
      </p>
    </div>
  );
}
