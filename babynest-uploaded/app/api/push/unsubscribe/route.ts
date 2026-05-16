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
    
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Parse the endpoint to remove (optional)
    const body = await request.json().catch(() => ({}));
    const { endpoint } = body;

    if (endpoint) {
      // Remove specific subscription
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint);

      if (deleteError) {
        console.error('Error removing subscription:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove subscription' },
          { status: 500 }
        );
      }
    } else {
      // Remove all subscriptions for this user
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error removing subscriptions:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove subscriptions' },
          { status: 500 }
        );
      }
    }

    // Update notification_preferences to disable push
    const { error: prefsError } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        push_enabled: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (prefsError) {
      console.error('Error updating preferences:', prefsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed successfully',
    });

  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
