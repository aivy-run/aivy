export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          target: number
          created_at: string
          type: string
          author: string
          id: number
        }
        Insert: {
          target: number
          created_at?: string
          type?: string
          author?: string
          id?: number
        }
        Update: {
          target?: number
          created_at?: string
          type?: string
          author?: string
          id?: number
        }
      }
      comments: {
        Row: {
          commentable_id: number
          body: string
          parent_id: number | null
          created_at: string
          commentable_type: string
          likes: number
          author: string
          id: number
        }
        Insert: {
          commentable_id: number
          body: string
          parent_id?: number | null
          created_at?: string
          commentable_type?: string
          likes?: number
          author?: string
          id?: number
        }
        Update: {
          commentable_id?: number
          body?: string
          parent_id?: number | null
          created_at?: string
          commentable_type?: string
          likes?: number
          author?: string
          id?: number
        }
      }
      contests: {
        Row: {
          title: string | null
          description: string | null
          id: number
        }
        Insert: {
          title?: string | null
          description?: string | null
          id?: number
        }
        Update: {
          title?: string | null
          description?: string | null
          id?: number
        }
      }
      image_posts: {
        Row: {
          title: string
          description: string | null
          tags: string[]
          contest_id: number | null
          author: string
          created_at: string | null
          likes: number
          zoning: string
          views: number
          images: number
          updated_at: string
          bookmarks: number
          published: boolean
          id: number
          comments: number
        }
        Insert: {
          title: string
          description?: string | null
          tags: string[]
          contest_id?: number | null
          author?: string
          created_at?: string | null
          likes?: number
          zoning?: string
          views?: number
          images?: number
          updated_at?: string
          bookmarks?: number
          published?: boolean
          id?: number
          comments?: number
        }
        Update: {
          title?: string
          description?: string | null
          tags?: string[]
          contest_id?: number | null
          author?: string
          created_at?: string | null
          likes?: number
          zoning?: string
          views?: number
          images?: number
          updated_at?: string
          bookmarks?: number
          published?: boolean
          id?: number
          comments?: number
        }
      }
      image_posts_information: {
        Row: {
          post_id: number
          prompt: string | null
          index: number
          negative_prompt: string | null
          model: string | null
          steps: number | null
          cfg_scale: number | null
          sampler: string | null
          seed: string | null
          embedding: string | null
          hypernetwork: string | null
          vae: string | null
          id: number
        }
        Insert: {
          post_id: number
          prompt?: string | null
          index: number
          negative_prompt?: string | null
          model?: string | null
          steps?: number | null
          cfg_scale?: number | null
          sampler?: string | null
          seed?: string | null
          embedding?: string | null
          hypernetwork?: string | null
          vae?: string | null
          id?: number
        }
        Update: {
          post_id?: number
          prompt?: string | null
          index?: number
          negative_prompt?: string | null
          model?: string | null
          steps?: number | null
          cfg_scale?: number | null
          sampler?: string | null
          seed?: string | null
          embedding?: string | null
          hypernetwork?: string | null
          vae?: string | null
          id?: number
        }
      }
      likes: {
        Row: {
          target: number
          created_at: string
          author: string
          type: string
          id: number
        }
        Insert: {
          target: number
          created_at?: string
          author?: string
          type?: string
          id?: number
        }
        Update: {
          target?: number
          created_at?: string
          author?: string
          type?: string
          id?: number
        }
      }
      muted_users: {
        Row: {
          target: string
          author: string
          id: number
        }
        Insert: {
          target: string
          author?: string
          id?: number
        }
        Update: {
          target?: string
          author?: string
          id?: number
        }
      }
      note_posts: {
        Row: {
          id: number
          updated_at: string | null
          author: string
          title: string
          body: string
          published: boolean
          created_at: string
          slug: string
          likes: number
          bookmarks: number
          comments: number
          tags: string[]
          prompts: string[]
        }
        Insert: {
          id?: number
          updated_at?: string | null
          author?: string
          title?: string
          body?: string
          published?: boolean
          created_at?: string
          slug?: string
          likes?: number
          bookmarks?: number
          comments?: number
          tags?: string[]
          prompts?: string[]
        }
        Update: {
          id?: number
          updated_at?: string | null
          author?: string
          title?: string
          body?: string
          published?: boolean
          created_at?: string
          slug?: string
          likes?: number
          bookmarks?: number
          comments?: number
          tags?: string[]
          prompts?: string[]
        }
      }
      notifications: {
        Row: {
          target_user: string | null
          target_image_post: number | null
          type: string
          target_comment: number | null
          created_at: string
          read: boolean
          author: string
          id: number
        }
        Insert: {
          target_user?: string | null
          target_image_post?: number | null
          type: string
          target_comment?: number | null
          created_at?: string
          read?: boolean
          author?: string
          id?: number
        }
        Update: {
          target_user?: string | null
          target_image_post?: number | null
          type?: string
          target_comment?: number | null
          created_at?: string
          read?: boolean
          author?: string
          id?: number
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string
          username: string
          twitter: string | null
          introduction: string | null
          created_at: string
          uid: string
          follows: number
          followers: number
          zoning: string[]
        }
        Insert: {
          id: string
          updated_at: string
          username: string
          twitter?: string | null
          introduction?: string | null
          created_at?: string
          uid?: string
          follows?: number
          followers?: number
          zoning?: string[]
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string
          twitter?: string | null
          introduction?: string | null
          created_at?: string
          uid?: string
          follows?: number
          followers?: number
          zoning?: string[]
        }
      }
      relationship: {
        Row: {
          target: string
          created_at: string
          id: number
          uid: string
        }
        Insert: {
          target: string
          created_at?: string
          id?: number
          uid?: string
        }
        Update: {
          target?: string
          created_at?: string
          id?: number
          uid?: string
        }
      }
      tags: {
        Row: {
          name: string
          created_at: string
          used: number
        }
        Insert: {
          name: string
          created_at?: string
          used?: number
        }
        Update: {
          name?: string
          created_at?: string
          used?: number
        }
      }
    }
    Views: {
      random_image_posts: {
        Row: {
          id: number | null
          created_at: string | null
          title: string | null
          description: string | null
          author: string | null
          tags: string[] | null
          likes: number | null
          zoning: string | null
          views: number | null
          images: number | null
          updated_at: string | null
          bookmarks: number | null
          published: boolean | null
        }
        Insert: {
          id?: number | null
          created_at?: string | null
          title?: string | null
          description?: string | null
          author?: string | null
          tags?: string[] | null
          likes?: number | null
          zoning?: string | null
          views?: number | null
          images?: number | null
          updated_at?: string | null
          bookmarks?: number | null
          published?: boolean | null
        }
        Update: {
          id?: number | null
          created_at?: string | null
          title?: string | null
          description?: string | null
          author?: string | null
          tags?: string[] | null
          likes?: number | null
          zoning?: string | null
          views?: number | null
          images?: number | null
          updated_at?: string | null
          bookmarks?: number | null
          published?: boolean | null
        }
      }
      random_tags: {
        Row: {
          created_at: string | null
          name: string | null
          used: number | null
        }
        Insert: {
          created_at?: string | null
          name?: string | null
          used?: number | null
        }
        Update: {
          created_at?: string | null
          name?: string | null
          used?: number | null
        }
      }
    }
    Functions: {
      increase_image_post_view: {
        Args: { target: number }
        Returns: undefined
      }
      profiles_valid_id_regex: {
        Args: { max_length: number; min_length: number }
        Returns: string
      }
      search_image_posts: {
        Args: { query: string }
        Returns: Record<string, unknown>[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

