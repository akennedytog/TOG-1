import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type NewsletterInsert = Database['public']['Tables']['newsletter_subscribers']['Insert'];
type NewsletterUpdate = Database['public']['Tables']['newsletter_subscribers']['Update'];

// Simple rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000;

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    
    const { allowed } = checkRateLimit(ip);
    
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed in Supabase
    const { data: existing } = await getSupabase()
      .from('newsletter_subscribers')
      .select('id, subscribed')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      const existingSub = existing as { id: string; subscribed: boolean };
      if (existingSub.subscribed) {
        return NextResponse.json(
          { success: true, message: 'You\'re already subscribed!' },
          { status: 200 }
        );
      } else {
        // Resubscribe
        const updatePayload: NewsletterUpdate = {
          subscribed: true,
          subscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await getSupabase()
          .from('newsletter_subscribers')
          .update(updatePayload)
          .eq('id', existingSub.id);

        if (updateError) throw updateError;

        return NextResponse.json(
          { success: true, message: 'Welcome back! You\'re resubscribed.' },
          { status: 200 }
        );
      }
    }

    // Add new subscriber to Supabase
    const insertPayload: NewsletterInsert = {
      email: normalizedEmail,
      subscribed: true,
      subscribed_at: new Date().toISOString(),
      source: 'blog_page',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await getSupabase()
      .from('newsletter_subscribers')
      .insert(insertPayload);

    if (insertError) {
      if (insertError.message.includes('unique constraint')) {
        return NextResponse.json(
          { success: true, message: 'You\'re already subscribed!' },
          { status: 200 }
        );
      }
      throw insertError;
    }

    console.log(`[Newsletter] New subscriber: ${normalizedEmail}`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed! Welcome to BabyNest newsletter.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Newsletter] API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

// Get subscriber count
export async function GET(request: NextRequest) {
  const { count, error } = await getSupabase()
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('subscribed', true);

  if (error) {
    return NextResponse.json({ error: 'Failed to get count' }, { status: 500 });
  }

  return NextResponse.json({
    subscriberCount: count || 0,
    message: 'Newsletter API is working'
  });
}
