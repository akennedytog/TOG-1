import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, ArrowLeft, Share2, Twitter, Facebook } from 'lucide-react';
import { blogPosts, getRelatedPosts } from '@/lib/blog-data';

// Generate static params for all blog posts
export function generateStaticParams() {
  return blogPosts.map(post => ({
    slug: post.slug,
  }));
}

// Generate metadata for each post
export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | BabyNest Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      authors: [post.author],
      publishedTime: post.date,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👶</span>
              </div>
              <span className="text-xl font-bold text-warm-900">BabyNest</span>
            </Link>
            
            <Link href="/blog" className="flex items-center gap-2 text-warm-600 hover:text-primary-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </header>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-warm-500">•</span>
            <span className="text-warm-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-warm-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-warm-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between py-6 border-y border-warm-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {post.author.charAt(0)}
              </div>
              
              <div>
                <p className="font-medium text-warm-900">{post.author}</p>
                <p className="text-sm text-warm-500">
                  {format(new Date(post.date), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Twitter className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Facebook className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="h-64 md:h-96 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mb-12">
          <span className="text-8xl">
            {post.category === 'Financial Tips' && '💰'}
            {post.category === '529 Plans' && '🎓'}
            {post.category === 'Insurance Guide' && '🏥'}
          </span>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-warm-800 leading-relaxed whitespace-pre-wrap font-mono text-sm md:text-base">
            {post.content}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-warm-100">
          <h3 className="text-sm font-medium text-warm-500 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <Card className="mt-12 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-none">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Enjoyed this article?</h2>
            <p className="text-primary-100 mb-6">
              Get weekly financial tips for new parents delivered to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-lg text-warm-900 flex-1"
              />
              <Button variant="secondary" className="bg-white text-primary-600 hover:bg-primary-50">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-warm-900 mb-6">Related Articles</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map(related => (
                <Link key={related.slug} href={`/blog/${related.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="mb-2">{related.category}</Badge>
                      <h3 className="font-semibold text-warm-900 mb-2">{related.title}</h3>
                      <p className="text-sm text-warm-600 line-clamp-2">{related.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
