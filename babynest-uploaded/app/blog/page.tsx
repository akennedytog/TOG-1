'use client';

import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, CheckCircle } from 'lucide-react';
import { blogPosts, categories } from '@/lib/blog-data';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👶</span>
              </div>
              <span className="text-xl font-bold text-warm-900">BabyNest</span>
            </Link>
            
            <Link href="/blog" className="text-warm-600 hover:text-primary-600">
              Blog
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-warm-900 mb-4">
            BabyNest Blog
          </h1>
          <p className="text-lg text-warm-600 max-w-2xl mx-auto">
            Expert advice on baby finances, insurance, and preparing for parenthood.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Badge variant="secondary" className="px-4 py-2 cursor-pointer hover:bg-primary-100">
            All Posts
          </Badge>
          {categories.map(category => (
            <Badge key={category} variant="outline" className="px-4 py-2 cursor-pointer hover:bg-warm-100">
              {category}
            </Badge>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <span className="text-6xl">
                    {post.category === 'Financial Tips' && '💰'}
                    {post.category === '529 Plans' && '🎓'}
                    {post.category === 'Insurance Guide' && '🏥'}
                  </span>
                </div>
                
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <span className="text-xs text-warm-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime} min read
                    </span>
                  </div>
                  
                  <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-warm-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-sm text-warm-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    
                    <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-warm-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <NewsletterCTA />
      </div>
    </div>
  );
}

// Newsletter Component
function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks for subscribing! Check your inbox for confirmation.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <Card className="mt-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-none">
      <CardContent className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Get Baby Financial Tips Weekly</h2>
        <p className="text-primary-100 mb-6 max-w-xl mx-auto">
          Join 5,000+ parents receiving practical advice on saving money, 
          navigating insurance, and planning for your family's future.
        </p>
        
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-white">
            <CheckCircle className="w-5 h-5" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="px-4 py-3 rounded-lg text-warm-900 flex-1"
            />
            <Button 
              type="submit" 
              variant="secondary" 
              disabled={status === 'loading'}
              className="bg-white text-primary-600 hover:bg-primary-50 disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        )}
        
        {status === 'error' && (
          <p className="text-sm text-red-200 mt-4">{message}</p>
        )}
        
        {status !== 'success' && status !== 'error' && (
          <p className="text-sm text-primary-200 mt-4">No spam. Unsubscribe anytime.</p>
        )}
      </CardContent>
    </Card>
  );
}
