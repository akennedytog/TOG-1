import { Metadata } from 'next';
import { StripePricing } from '@/components/StripePricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Baby,
  CheckCircle2,
  Shield,
  MessageCircle,
  CreditCard,
  FileText,
  Calculator,
  Users,
  Gift,
  Headphones,
  ArrowRight,
  Star,
  Heart,
  Sparkles,
  HelpCircle,
  Wallet,
  RefreshCw,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing - BabyNest',
  description: 'Choose the perfect plan for your family. Start free and upgrade when you\'re ready.',
  openGraph: {
    title: 'BabyNest Pricing - Simple, Parent-Friendly Plans',
    description: 'Start free. Upgrade when you\'re ready.',
  },
};

// Feature comparison data
const features = [
  { name: 'State-specific task timeline', pro: true, family: true, icon: CheckCircle2 },
  { name: 'Unlimited AI chat', pro: true, family: true, icon: MessageCircle },
  { name: 'Insurance card scanner', pro: true, family: true, icon: CreditCard },
  { name: 'Document vault', pro: true, family: true, icon: FileText },
  { name: '529 plan comparisons', pro: true, family: true, icon: Calculator },
  { name: 'Tax optimization tips', pro: true, family: true, icon: Calculator },
  { name: 'Multiple children profiles', pro: false, family: true, icon: Users },
  { name: 'Grandparent gifting calculator', pro: false, family: true, icon: Gift },
  { name: 'Family sharing (5 members)', pro: false, family: true, icon: Users },
  { name: 'Priority support', pro: false, family: true, icon: Headphones },
];

const faqs = [
  {
    question: 'Can I switch between monthly and yearly billing?',
    answer: 'Yes! You can switch between monthly and yearly billing at any time. When you switch to yearly, you\'ll immediately start saving 17%. If you switch to monthly, the change takes effect at your next billing cycle.',
  },
  {
    question: 'What happens if I need to cancel?',
    answer: 'You can cancel your subscription at any time with no penalties. Your access continues until the end of your current billing period, so you can still use all features until then.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a 14-day free trial for both Pro and Family plans. No credit card required to start. You\'ll only be charged if you decide to continue after the trial.',
  },
  {
    question: 'Can I upgrade from Pro to Family later?',
    answer: 'Absolutely! You can upgrade your plan at any time. We\'ll prorate the difference, so you only pay for the time remaining in your billing cycle.',
  },
  {
    question: 'How does family sharing work?',
    answer: 'Family plans allow up to 5 family members to access BabyNest. Each member gets their own login and can see shared children\' profiles while maintaining privacy for personal tasks.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Yes. We use bank-level 256-bit encryption and never store your full financial documents. We\'re SOC 2 compliant and never sell your data to third parties.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with BabyNest for any reason, contact us within 30 days for a full refund, no questions asked.',
  },
];

export default function PricingPage() {
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
              <Link href="/#features" className="text-warm-600 hover:text-primary-600 transition-colors font-medium">Features</Link>
              <Link href="/#how-it-works" className="text-warm-600 hover:text-primary-600 transition-colors font-medium">How it Works</Link>
              <Link href="/#testimonials" className="text-warm-600 hover:text-primary-600 transition-colors font-medium">Reviews</Link>
              <Link href="/pricing" className="text-primary-600 font-medium">Pricing</Link>
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
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/40 to-primary-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-accent-200/30 to-accent-100/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Start Free for 14 Days</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-warm-900 mb-6 leading-tight">
              Simple Pricing for
              <br />
              <span className="text-gradient">Growing Families</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-warm-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Start free and upgrade when you're ready. No hidden fees, no surprises. 
              Just the tools you need to navigate parenthood with confidence.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-warm-600">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
                <Shield className="w-4 h-4 text-primary-500" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
                <RefreshCw className="w-4 h-4 text-primary-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
                <Star className="w-4 h-4 text-amber-500" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards - Using StripePricing Component */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Pass undefined props since this is public pricing page */}
            <StripePricing />
          </div>
        </div>
      </section>

      {/* Annual Savings Banner - Extra spacing */}
      <section className="py-16 mb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wallet className="w-5 h-5" />
                  <span className="font-semibold">Save 17% with Annual Billing</span>
                </div>
                <p className="text-primary-100 text-sm">
                  Pro: $99/year (vs $119.88) • Family: $149/year (vs $179.88)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              <CheckCircle2 className="w-3 h-3" />
              Compare Plans
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-warm-600">See what's included in each plan</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="grid grid-cols-3 bg-warm-50 border-b border-warm-200">
                <div className="p-4 sm:p-6 font-semibold text-warm-700">Feature</div>
                <div className="p-4 sm:p-6 text-center font-bold text-warm-900 bg-primary-50/50">
                  <div className="text-primary-600">Pro</div>
                  <div className="text-sm font-normal text-warm-600">$9.99/mo</div>
                </div>
                <div className="p-4 sm:p-6 text-center font-bold text-warm-900 bg-gradient-to-b from-accent-50/50 to-accent-100/30">
                  <div className="text-accent-600 flex items-center justify-center gap-1">
                    Family
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-sm font-normal text-warm-600">$14.99/mo</div>
                </div>
              </div>
              
              <div className="divide-y divide-warm-100">
                {features.map((feature) => (
                  <div key={feature.name} className="grid grid-cols-3 hover:bg-warm-50/50 transition-colors">
                    <div className="p-4 sm:p-6 flex items-center gap-3">
                      <feature.icon className="w-5 h-5 text-warm-400 flex-shrink-0" />
                      <span className="text-warm-700 text-sm sm:text-base">{feature.name}</span>
                    </div>
                    <div className="p-4 sm:p-6 flex items-center justify-center bg-primary-50/30">
                      {feature.pro ? (
                        <CheckCircle2 className="w-5 h-5 text-primary-500" />
                      ) : (
                        <span className="text-warm-300">—</span>
                      )}
                    </div>
                    <div className="p-4 sm:p-6 flex items-center justify-center bg-accent-50/20">
                      {feature.family ? (
                        <CheckCircle2 className="w-5 h-5 text-accent-500" />
                      ) : (
                        <span className="text-warm-300">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section - More spacing */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-cream-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-warm-100 text-warm-700 rounded-full text-sm font-semibold mb-4">
              <HelpCircle className="w-3 h-3" />
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-warm-600">Everything you need to know about pricing</p>
          </div>

          <div className="space-y-6 mb-16">
            {faqs.map((faq) => (
              <Card key={faq.question} className="hover:shadow-soft-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className="font-bold text-warm-900 mb-3 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </h3>
                  <p className="text-warm-600 leading-relaxed pl-7">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-16 border-y border-warm-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-lg font-semibold text-warm-700">Trusted by 500+ families</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Lock, title: 'SOC 2 Compliant', desc: 'Enterprise security' },
                { icon: RefreshCw, title: 'Cancel Anytime', desc: 'No commitments' },
                { icon: Star, title: '30-Day Guarantee', desc: 'Full refunds' },
                { icon: Heart, title: 'Parent-First', desc: 'Built for families' },
              ].map((badge) => (
                <div key={badge.title} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-3 group-hover:scale-110 transition-transform">
                    <badge.icon className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-warm-900 text-sm">{badge.title}</div>
                  <div className="text-warm-500 text-xs">{badge.desc}</div>
                </div>
              ))}
            </div>
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
            Join hundreds of families who are taking control of their financial future. 
            Start your free 14-day trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-primary-700 hover:bg-primary-50"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/#features">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-primary-200">
            No credit card required. Cancel anytime.
          </p>
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
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
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
