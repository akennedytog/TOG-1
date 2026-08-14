import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if env vars are set
const hasConfig = !!(supabaseUrl && supabaseKey);
export const supabase = hasConfig ? createClient(supabaseUrl, supabaseKey) : null;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published_at: string;
  tags: string[];
  image_url?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar_url?: string;
  featured: boolean;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonial_quote?: string;
  published: boolean;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });
  return data || [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('featured', true);
  return data || [];
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('case_studies')
    .select('*')
    .eq('published', true);
  return data || [];
}
