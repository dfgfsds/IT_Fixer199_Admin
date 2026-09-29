export interface Blog {
  id: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  title: string;
  subtitle?: string;
  description?: string;
  content?: string;
  banner_url?: string;
  author?: string;
  likes?: number;
  meta_tags?: string;
  meta_keywords?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_tag?: string;
  robots_tag?: string;
  url_description?: string;
  og_tags?: string;
  twitter_tags?: string;
  image_src_tags?: string;
  schema?: string;
  url_slug?: string;
}

export interface BlogFormData {
  title: string;
  subtitle: string;
  description: string;
  content: string;
  banner_url: string;
  author: string;
  likes: number;
  meta_tags: string;
  meta_keywords: string;
  meta_title: string;
  meta_description: string;
  canonical_tag: string;
  robots_tag: string;
  url_description: string;
  og_tags: string;
  twitter_tags: string;
  image_src_tags: string;
  schema: string;
  url_slug: string;
}
