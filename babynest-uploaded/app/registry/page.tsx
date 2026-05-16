'use client';

import { useEffect, useState } from 'react';
import { RegistryTracker } from '@/components/RegistryTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegistryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUserId(user.id);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-warm-100">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-500" />
            Baby Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegistryTracker userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}
