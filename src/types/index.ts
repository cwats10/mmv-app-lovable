// ============================================================
// Core Data Interfaces — mirrors gemini.md schemas exactly
// ============================================================

export interface Profile {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subscription_status: 'active' | 'inactive' | 'trialing';
  stripe_customer_id: string | null;
  referral_code: string;
  referred_by: string | null;
  is_admin: boolean;
  reward_balance: number;
}

export interface Vault {
  id: string;
  created_at: string;
  owner_id: string;
  missionary_name: string;
  mission_name: string;
  mission_start: string | null;
  mission_end: string | null;
  vault_type: 'pre' | 'post';
  submission_token: string;
  manager_token: string;
  cover_image_url: string | null;
  archived_at: string | null;
}

export type DesignTier = 'classic' | 'heirloom';

export interface Book {
  id: string;
  created_at: string;
  vault_id: string;
  status: 'collecting' | 'review' | 'purchased' | 'printing' | 'delivered';
  design_theme: string;
  design_tier: DesignTier;
  extra_copies: number;
  pdf_url: string | null;
  delivery_address: DeliveryAddress | null;
  stripe_payment_intent_id: string | null;
  pod_order_id: string | null;
  locked_at: string | null;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type ImagePosition = 'top' | 'float-left' | 'float-right' | 'center' | 'bottom';

export interface ImageLayout {
  position: ImagePosition;
}

export interface Submission {
  id: string;
  created_at: string;
  vault_id: string;
  book_id: string | null;
  contributor_name: string;
  relation: string;
  message: string;
  media_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  image_layout: ImageLayout | null;
  archived_at: string | null;
}

export interface Referral {
  id: string;
  created_at: string;
  referrer_id: string;
  referred_email: string;
  referred_user_id: string | null;
  status: 'pending' | 'converted' | 'rewarded';
  reward_amount: number;
}

// Golden Payload — matches gemini.md exactly
export interface GoldenPayload {
  book_id: string;
  client_id: string;
  missionary_name: string;
  mission_name: string;
  service_dates: string;
  cover_image_url: string;
  design_theme: 'museum_archive_elegant';
  book_inches?: 10 | 11 | 12;
  pages: GoldenPage[];
  metadata: {
    total_pages: number;
    vault_type: 'pre_mission' | 'post_mission';
    delivery_address: DeliveryAddress;
  };
}

export interface GoldenPage {
  page_number: number;
  template_type: 'cover' | 'standard_text_only' | 'standard_text_with_image';
  image_layout?: ImageLayout | null;
  content: {
    contributor_name: string;
    relation: string;
    message: string;
    image_urls: string[];
  };
}

// Vault with joined data
export interface VaultWithBook extends Vault {
  books: Pick<Book, 'id' | 'status'>[];
}

export type SubmissionStatus = Submission['status'];
export type BookStatus = Book['status'];
export type VaultType = Vault['vault_type'];
