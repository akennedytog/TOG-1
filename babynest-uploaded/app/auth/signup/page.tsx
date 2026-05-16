'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, states } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Baby, Eye, EyeOff, AlertCircle, CheckCircle2, Heart, Sparkles, ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [state, setState] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            state: state,
            due_date: dueDate,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setSuccess(true);
        // Create profile
        const userEmail = data.user.email;
        if (!userEmail) {
          throw new Error('Email is required to create a profile');
        }
        
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: userEmail,
          full_name: fullName,
          state: state,
          due_date: dueDate,
        });

        // Redirect to onboarding after short delay
        setTimeout(() => {
          router.push('/onboarding');
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-primary-50 to-cream-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-500 rounded-3xl mb-6 shadow-glow animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-warm-900 mb-4">Welcome to BabyNest! 💚</h1>
          <p className="text-warm-600 mb-8 text-lg">
            Your account is ready. We're excited to help you navigate this beautiful journey.
          </p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-primary-50/30 to-cream-50 py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-warm-600 hover:text-primary-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-glow">
            <Baby className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-warm-900 mb-2">Create your account</h1>
          <p className="text-warm-600">Start your family's financial journey with confidence</p>
        </div>

        <Card className="shadow-soft-lg border-warm-100">
          <CardHeader className="bg-gradient-to-r from-cream-100 to-cream-50 border-b border-warm-100 rounded-t-2xl">
            <CardTitle className="text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Get personalized financial guidance for your family
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">
                  Full Name
                </label>
                <Input
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-warm-700 mb-2">
                    State
                  </label>
                  <Select
                    value={state}
                    onValueChange={setState}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.filter(s => s.value).map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-warm-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-warm-500 mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-accent-50 text-accent-700 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base"
                size="lg"
                isLoading={loading}
              >
                <Heart className="w-4 h-4 mr-2" />
                Create Account
              </Button>

              <p className="text-xs text-warm-500 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                By signing up, you agree to our Terms and Privacy Policy
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-warm-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
