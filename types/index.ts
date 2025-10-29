
export type Article = {
  id: string;
  author_id: string;
  slug: string;
  title: string;
  abstract: string | null;
  tags: string[] | null;
  filename: string;
  file_url: string;
  views: number;
  likes: number;
  is_featured?: boolean;
  created_at: string;
  published: boolean;
  approved?: boolean;
  rejection_reason?: string | null;
  payment_done: boolean;
  type?: 'Article' | 'Research Paper' | 'Case Notes' | 'Legislative Comments' | 'Book Reviews'; 
  thumbnail_url?: string | null;
  utr_number?: string | null;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
    profession?: string | null;
  };
};

export type Database = {
  public: {
    tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          abstract: string;
          content: string | null;
          tags: string[] | null;
          views: number;
          likes: number;
          file_url: string;
          is_featured: boolean;
          published: boolean;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          abstract?: string;
          content?: string | null;
          tags?: string[] | null;
          views?: number;
          likes?: number;
          file_url?: string;
          is_featured?: boolean;
          published?: boolean;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          abstract?: string;
          content?: string | null;
          tags?: string[] | null;
          views?: number;
          likes?: number;
          file_url?: string;
          is_featured?: boolean;
          published?: boolean;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
    };
    views: {
      [_ in never]: never;
    };
    functions: {
      [_ in never]: never;
    };
  };
};
