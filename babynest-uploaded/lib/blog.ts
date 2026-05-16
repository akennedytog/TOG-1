import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export type BlogCategory = 
  | 'Financial Tips' 
  | 'Insurance Guide' 
  | '529 Plans' 
  | 'Tax Tips' 
  | 'Product Reviews';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: BlogCategory;
  excerpt: string;
  image: string;
  published: boolean;
  content: string;
  contentHtml: string;
  readingTime: number;
  tags?: string[];
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

export function getBlogSlugs(): string[] {
  try {
    if (!fs.existsSync(postsDirectory)) {
      return [];
    }
    return fs.readdirSync(postsDirectory)
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    if (data.published === false) {
      return null;
    }
    
    const processedContent = await remark()
      .use(html)
      .process(content);
    const contentHtml = processedContent.toString();
    
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    return {
      slug,
      title: data.title || '',
      date: data.date || '',
      author: data.author || 'BabyNest Team',
      category: data.category || 'Financial Tips',
      excerpt: data.excerpt || '',
      image: data.image || '/blog/default.jpg',
      published: data.published !== false,
      content,
      contentHtml,
      readingTime,
      tags: data.tags || [],
    };
  } catch {
    return null;
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const slugs = getBlogSlugs();
  const posts = await Promise.all(
    slugs.map((slug) => getBlogPostBySlug(slug))
  );
  
  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
}

export async function getBlogPostsByCategory(category: BlogCategory): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((post) => post.category === category);
}

export function getAllCategories(): BlogCategory[] {
  return [
    'Financial Tips',
    'Insurance Guide', 
    '529 Plans',
    'Tax Tips',
    'Product Reviews',
  ];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function generateRSSFeed(posts: BlogPost[]): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://babynest.app';
  
  const rssItems = posts.map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category><![CDATA[${post.category}]]></category>
      <description><![CDATA[${post.excerpt}]]></description>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
    </item>
  `).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BabyNest Blog - Financial Guide for New Parents</title>
    <link>${siteUrl}/blog</link>
    <description>Expert advice on baby finances, insurance, 529 plans, taxes, and more.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;
}

export function generateBlogSchema(post: BlogPost): Record<string, any> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://babynest.app';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image.startsWith('http') ? post.image : `${siteUrl}${post.image}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BabyNest',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
  };
}
