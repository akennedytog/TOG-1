'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettings } from '@/components/NotificationSettings';
import { FamilySharingManager } from '@/components/FamilySharingManager';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Bell, Users, Shield, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse-soft">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-warm-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-warm-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-warm-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="bg-white border border-warm-100 w-full justify-start">
            <TabsTrigger 
              value="notifications" 
              className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="family" 
              className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Family Sharing
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="data-[state=active]:bg-primary-500 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-500" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettings userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family" className="mt-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" />
                  Family Sharing
                </CardTitle>
                <CardDescription>
                  Invite family members to access and contribute to your BabyNest account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FamilySharingManager userId={user?.id} userEmail={user?.email} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  Subscription
                </CardTitle>
                <CardDescription>
                  Manage your BabyNest subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-warm-600">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Subscription management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
