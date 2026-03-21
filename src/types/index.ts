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
  cover_image_url: string | null;
  cover_theme: 'light' | 'dark';
  contributor_page_allowance?: 1 | 2;
  manager_token: string | null;
}

export interface Book {
  id: string;
  created_at: string;
  vault_id: string;
  status: BookStatus;
  design_theme: string;
  pdf_url: string | null;
  delivery_address: DeliveryAddress | null;
  stripe_payment_intent_id: string | null;
  pod_order_id: string | null;
}

export type BookStatus = 'collecting' | 'review' | 'purchased' | 'printing' | 'delivered';

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type PageTemplate =
  | 'full-image-caption'
  | 'image-top-text-bottom'
  | 'text-top-image-bottom'
  | 'side-by-side-left'
  | 'side-by-side-right'
  | 'text-only'
  | 'custom';

export interface PageLayout {
  template: PageTemplate;
  customSplit?: {
    direction: 'horizontal' | 'vertical';
    ratio: number; // 0.3 to 0.7 — fraction allocated to the image area
  };
  imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  textAlignment?: 'left' | 'center' | 'right';
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
  page_order?: number | null;
  page_layout?: PageLayout | null;
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

export interface GoldenPayload {
  book_id: string;
  client_id: string;
  missionary_name: string;
  mission_name: string;
  service_dates: string;
  cover_image_url: string;
  design_theme: 'museum_archive_elegant';
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
  page_layout?: PageLayout;
  content: {
    contributor_name: string;
    relation: string;
    message: string;
    image_urls: string[];
  };
}

export interface VaultWithBook extends Vault {
  books: Pick<Book, 'id' | 'status'>[];
}

export type SubmissionStatus = Submission['status'];
