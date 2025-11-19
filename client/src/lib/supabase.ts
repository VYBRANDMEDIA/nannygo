import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pahcjsgqrikbpedlpifs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhaGNqc2dxcmlrYnBlZGxwaWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDg4OTIsImV4cCI6MjA3ODY4NDg5Mn0.wxhagyajynmsi1hkQ9rukilZulTo099Bu9R1Z4jzKJc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  bio: string | null;
  role: 'parent' | 'nanny' | 'admin';
  avatar_url: string | null;
  photos: string[] | null;
  video_url: string | null;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
};

export type NannyProfile = {
  id: string;
  profile_id: string;
  hourly_rate: number | null;
  years_experience: number;
  max_children: number;
  tags: string[] | null;
  is_available: boolean;
  subscription_status: 'inactive' | 'active' | 'trial' | 'cancelled';
  subscription_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  parent_id: string;
  nanny_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  address: string;
  notes: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
