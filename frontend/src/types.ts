export interface NewsItem {
  id: string;
  title: string;
  timestamp: string;
  source: string;
  status: 'confirmed' | 'rumor' | 'debunked';
}
