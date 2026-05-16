// Stripe constants - CLIENT-SAFE
// No secret keys or server-only Stripe SDK imports here

export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  PRO_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || process.env.STRIPE_PRICE_PRO_YEARLY || '',
  FAMILY_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY || process.env.STRIPE_PRICE_FAMILY_MONTHLY || '',
  FAMILY_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY || process.env.STRIPE_PRICE_FAMILY_YEARLY || '',
};

// Plan details
export const PLANS = {
  pro: {
    name: 'Pro',
    description: 'Everything you need for new parent finances',
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    features: [
      'State-specific task timeline',
      'Unlimited AI chat',
      'Insurance card scanner',
      'Document vault',
      '529 plan comparisons',
      'Tax optimization tips',
    ],
  },
  family: {
    name: 'Family',
    description: 'For families with multiple children',
    monthlyPrice: 14.99,
    yearlyPrice: 149,
    features: [
      'Everything in Pro',
      'Multiple children profiles',
      'Grandparent gifting calculator',
      'Family sharing (5 members)',
      'Priority support',
    ],
  },
};

export type PlanType = 'pro' | 'family';
export type BillingPeriod = 'monthly' | 'yearly';
