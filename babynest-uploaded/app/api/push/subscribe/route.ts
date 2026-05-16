import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization - only create client when needed
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    
    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    // Try to get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '')
    );

    if (user) {
      userId = user.id;
    } else {
      // Fallback: try to get user from Supabase session cookie
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        userId = session.user.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse the subscription data
    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: 'Missing required fields: endpoint, keys.p256dh, keys.auth' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const { data: existingSub } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', endpoint)
      .single();

    if (existingSub) {
      // Update existing subscription with new user (in case user changed)
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          user_id: userId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSub.id);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
    } else {
      // Insert new subscription
      const { error: insertError } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          enabled: true,
        });

      if (insertError) {
        console.error('Error inserting subscription:', insertError);
        return NextResponse.json(
          { error: 'Failed to save subscription' },
          { status: 500 }
        );
      }
    }

    // Update notification_preferences to enable push
    const { error: prefsError } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        push_enabled: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (prefsError) {
      console.error('Error updating preferences:', prefsError);
      // Don't fail the request, subscription is saved
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully',
    });

  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get current user's subscription status
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('enabled', true);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscribed: subscriptions && subscriptions.length > 0,
      subscriptions: subscriptions?.length || 0,
    });

  } catch (error) {
    console.error('Push subscription check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
