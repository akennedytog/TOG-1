'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, states } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { joinWaitlist } from '@/lib/supabase';
import { 
  Baby, 
  Shield, 
  GraduationCap, 
  Calculator, 
  FileText, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Star,
  Heart,
  Sparkles,
  Users,
  Wallet,
  ChevronRight,
  Quote
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await joinWaitlist({
        email,
        state: state || undefined,
        due_date: dueDate || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-50/80 backdrop-blur-xl border-b border-warm-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-warm-900">BabyNest</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-warm-600 hover:text-primary-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-warm-600 hover:text-primary-600 transition-colors font-medium">How it Works</a>
              <a href="#testimonials" className="text-warm-600 hover:text-primary-600 transition-colors font-medium">Reviews</a>
              <a href="#pricing" className="text-warm-600 hover:text-primary-600 transition-colors font-medium">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/40 to-primary-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-accent-200/30 to-accent-100/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Now in Beta — Join 500+ Happy Parents</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-warm-900 mb-6 leading-tight animate-slide-up">
              Navigate Parenthood's
              <br />
              <span className="text-gradient">Financial Journey</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-warm-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Your warm, AI-powered companion for new parent finances. We guide you through 
              insurance, 529 plans, taxes, and legal tasks — so you can focus on cuddles and milestones.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Card className="p-6 sm:p-8 shadow-soft-lg border-accent-100/50">
                  <div className="space-y-4">
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
                          Your State
                        </label>
                        <Select value={state} onValueChange={setState}>
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
                    
                    {error && (
                      <div className="flex items-center gap-2 text-accent-700 text-sm bg-accent-50 p-3 rounded-xl">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      isLoading={loading}
                    >
                      Get Early Access Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    <p className="text-xs text-warm-500 text-center">
                      No credit card required. Join 500+ parents on the waitlist.
                    </p>
                  </div>
                </Card>
              </form>
            ) : (
              <Card className="max-w-md mx-auto p-8 text-center shadow-soft-lg border-primary-200 animate-scale-in">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-warm-900 mb-2">You're on the list!</h3>
                <p className="text-warm-600">
                  We'll email you when BabyNest is ready. Thanks for trusting us with your family's journey!
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-y border-warm-100 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Parents Helped', value: '500+', icon: Users },
              { label: 'Tasks Completed', value: '2,400+', icon: CheckCircle2 },
              { label: 'Money Saved', value: '$1.2M+', icon: Wallet },
              { label: 'States Covered', value: '50', icon: Heart },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-warm-900">{stat.value}</div>
                <div className="text-warm-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              <Heart className="w-3 h-3" />
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Everything You Need for Peace of Mind
            </h2>
            <p className="text-lg text-warm-600 max-w-2xl mx-auto">
              From insurance deadlines to 529 plans, we guide you through every financial decision 
              with warmth and clarity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Smart Timeline',
                description: 'Never miss a deadline. We track time-sensitive tasks like insurance enrollment windows and 529 contribution deadlines.',
                color: 'bg-blue-50 text-blue-600 border-blue-100',
              },
              {
                icon: Shield,
                title: 'Insurance Decoder',
                description: 'Upload your insurance card and our AI explains your coverage. Know exactly what is covered and what you need to do.',
                color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              },
              {
                icon: GraduationCap,
                title: '529 Plan Guide',
                description: 'State-specific 529 recommendations. Compare plans, understand tax benefits, and optimize your contributions.',
                color: 'bg-violet-50 text-violet-600 border-violet-100',
              },
              {
                icon: Calculator,
                title: 'Tax Optimization',
                description: 'Maximize child tax credits, dependent care benefits, and state-specific deductions. Keep more of your money.',
                color: 'bg-amber-50 text-amber-600 border-amber-100',
              },
              {
                icon: FileText,
                title: 'Legal Checklist',
                description: 'Wills, guardianship, and trusts simplified. State-specific requirements and document templates included.',
                color: 'bg-rose-50 text-rose-600 border-rose-100',
              },
              {
                icon: Heart,
                title: 'AI Assistant',
                description: 'Ask anything about baby finances. Our AI knows the rules for your state and gives personalized guidance.',
                color: 'bg-accent-50 text-accent-600 border-accent-100',
              },
            ].map((feature, index) => (
              <Card key={feature.title} className="group hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-warm-900 mb-2">{feature.title}</h3>
                  <p className="text-warm-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-padding bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-3 h-3" />
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              How BabyNest Works
            </h2>
            <p className="text-lg text-warm-600">Three simple steps to financial peace of mind</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Share Your Story',
                description: 'Tell us your state, due date, and what matters most to your family. We personalize everything to your unique situation.',
                icon: Heart,
              },
              {
                step: '02',
                title: 'Get Your Timeline',
                description: 'See exactly what you need to do and when. Tasks are prioritized by urgency and financial impact on your family.',
                icon: Clock,
              },
              {
                step: '03',
                title: 'Navigate with Confidence',
                description: 'Follow step-by-step guides, use our AI assistant for questions, and track your progress as you go.',
                icon: Sparkles,
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
                )}
                
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-6 shadow-glow group-hover:scale-105 transition-transform">
                  <item.icon className="w-10 h-10" />
                </div>
                <div className="text-5xl font-bold text-primary-200 mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-warm-900 mb-3">{item.title}</h3>
                <p className="text-warm-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              <Star className="w-3 h-3" />
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Loved by New Parents
            </h2>
            <p className="text-lg text-warm-600">See what families are saying about BabyNest</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote: "BabyNest saved us $3,000 in tax credits we didn't even know existed. The timeline feature kept us on track during those sleep-deprived early weeks!",
                author: "Sarah M.",
                role: "Mom of twins, California",
                rating: 5,
              },
              {
                quote: "As a first-time dad, I was overwhelmed by all the financial decisions. BabyNest made everything feel manageable and even enjoyable.",
                author: "Brian Reedy",
                role: "First-time dad, Florida",
                rating: 5,
              },
              {
                quote: "The 529 plan comparison alone was worth it. We found a much better option for our state that will save us thousands over the years.",
                author: "Emily R.",
                role: "Mom of two, New York",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary-300 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-warm-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-warm-900">{testimonial.author}</div>
                      <div className="text-sm text-warm-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-gradient-to-b from-cream-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              <Wallet className="w-3 h-3" />
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Simple, Parent-Friendly Pricing
            </h2>
            <p className="text-lg text-warm-600">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                description: 'Basic timeline and general guidance',
                features: [
                  'Generic task checklist',
                  'Limited AI chat (5 questions/month)',
                  'Basic 529 information',
                  'Community access',
                ],
                cta: 'Get Started',
                variant: 'secondary' as const,
              },
              {
                name: 'Pro',
                price: '$9.99',
                period: '/month',
                description: 'Everything you need for new parent finances',
                features: [
                  'State-specific task timeline',
                  'Unlimited AI chat',
                  'Insurance card scanner',
                  'Document vault',
                  '529 plan comparisons',
                  'Tax optimization tips',
                ],
                cta: 'Start Free Trial',
                variant: 'primary' as const,
                popular: true,
              },
              {
                name: 'Family',
                price: '$14.99',
                period: '/month',
                description: 'For families with multiple children',
                features: [
                  'Everything in Pro',
                  'Multiple children profiles',
                  'Grandparent gifting calculator',
                  'Family sharing (5 members)',
                  'Priority support',
                ],
                cta: 'Start Free Trial',
                variant: 'secondary' as const,
              },
            ].map((plan) => (
              <Card 
                key={plan.name}
                className={`relative ${plan.popular ? 'ring-2 ring-primary-500 shadow-soft-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-soft">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-warm-900">{plan.name}</h3>
                  <div className="mt-4 mb-2">
                    <span className="text-4xl font-bold text-warm-900">{plan.price}</span>
                    <span className="text-warm-500">{plan.period}</span>
                  </div>
                  <p className="text-warm-600 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <span className="text-warm-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={plan.name === 'Free' ? '/auth/signup' : '/pricing'} className="w-full">
                    <Button 
                      variant={plan.variant}
                      className="w-full"
                      size="lg"
                    >
                      {plan.cta}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-warm-100 text-warm-700 rounded-full text-sm font-semibold mb-4">
              <AlertCircle className="w-3 h-3" />
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Common Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is BabyNest only for expecting parents?",
                a: "Not at all! While we're designed with new parents in mind, BabyNest helps families at any stage. Whether you're planning, expecting, or already have children, our tools adapt to your needs."
              },
              {
                q: "How does the AI assistant work?",
                a: "Our AI is trained on financial regulations, tax laws, and insurance requirements across all 50 states. It uses your specific situation (state, due date, income) to provide personalized guidance."
              },
              {
                q: "Is my financial data secure?",
                a: "Absolutely. We use bank-level encryption and never sell your data. We're committed to keeping your family's information private and secure."
              },
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes! You can cancel your subscription at any time with no penalties. Your access continues until the end of your billing period."
              },
            ].map((faq, index) => (
              <Card key={index} className="hover:shadow-soft-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-bold text-warm-900 mb-2">{faq.q}</h3>
                  <p className="text-warm-600 text-sm leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join 500+ families who are taking control of their financial future with confidence and warmth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-primary-700 hover:bg-primary-50"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white/10"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-900 text-warm-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Baby className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BabyNest</span>
              </div>
              <p className="text-warm-400 max-w-sm leading-relaxed">
                Your warm, AI-powered companion for navigating parenthood's financial journey. 
                Trusted by 500+ families.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-warm-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm">
              © 2026 BabyNest. Made with <Heart className="w-4 h-4 inline text-accent-500" /> for new parents.
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-warm-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-warm-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-warm-400 hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}