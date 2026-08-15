/**
 * GENERATED FILE — do not edit by hand.
 *
 * Supabase types for the `public` schema of the MasseurMatch project.
 *
 * Regenerate against the remote project:
 *   SUPABASE_PROJECT_ID=<project-ref> pnpm --filter @masseurmatch/db generate
 *
 * …or against a local stack (`supabase start`):
 *   pnpm --filter @masseurmatch/db generate:local
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          action_type: string | null
          actor_profile_id: string | null
          admin_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          target_id: string | null
          target_profile_id: string | null
          target_table: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          action_type?: string | null
          actor_profile_id?: string | null
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_profile_id?: string | null
          target_table: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string | null
          actor_profile_id?: string | null
          admin_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_profile_id?: string | null
          target_table?: string
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "admin_actions_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_content: {
        Row: {
          blog_posts: Json
          cities: Json
          id: string
          keywords: Json
          updated_at: string
        }
        Insert: {
          blog_posts?: Json
          cities?: Json
          id?: string
          keywords?: Json
          updated_at?: string
        }
        Update: {
          blog_posts?: Json
          cities?: Json
          id?: string
          keywords?: Json
          updated_at?: string
        }
        Relationships: []
      }
      admin_email_campaigns: {
        Row: {
          audience: Json
          body_html: string
          body_text: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string | null
          from_address: string | null
          id: string
          name: string
          reply_to: string | null
          scheduled_for: string
          send_category: string
          status: string
          subject: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          audience?: Json
          body_html: string
          body_text?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          from_address?: string | null
          id?: string
          name: string
          reply_to?: string | null
          scheduled_for?: string
          send_category: string
          status?: string
          subject: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          audience?: Json
          body_html?: string
          body_text?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          from_address?: string | null
          id?: string
          name?: string
          reply_to?: string | null
          scheduled_for?: string
          send_category?: string
          status?: string
          subject?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "admin_email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          created_by: string | null
          description: string | null
          from_address: string | null
          id: string
          is_active: boolean
          name: string
          reply_to: string | null
          send_category: string
          subject: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          from_address?: string | null
          id?: string
          is_active?: boolean
          name: string
          reply_to?: string | null
          send_category?: string
          subject: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          from_address?: string | null
          id?: string
          is_active?: boolean
          name?: string
          reply_to?: string | null
          send_category?: string
          subject?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_profile_analysis_runs: {
        Row: {
          analysis_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_summary: Json
          model: string | null
          profile_id: string
          provider: string | null
          result: Json
          status: string
        }
        Insert: {
          analysis_type: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_summary?: Json
          model?: string | null
          profile_id: string
          provider?: string | null
          result?: Json
          status?: string
        }
        Update: {
          analysis_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_summary?: Json
          model?: string | null
          profile_id?: string
          provider?: string | null
          result?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_analysis_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_analysis_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_analysis_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_analysis_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_analysis_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_coach_daily_snapshots: {
        Row: {
          average_search_position: number | null
          completed_fields: Json
          contact_clicks_1d: number
          contact_clicks_30d: number
          contact_clicks_7d: number
          contact_rate_pct: number | null
          content_analysis: Json
          content_score: number
          conversion_score: number
          created_at: string
          email_payload: Json
          email_preheader: string | null
          email_subject: string | null
          favorites_7d: number
          generated_at: string
          id: string
          inquiries_7d: number
          local_demand_score: number | null
          local_demand_trend: string | null
          market_analysis: Json
          missing_fields: Json
          photo_analysis: Json
          previous_profile_score: number | null
          profile_id: string
          profile_score: number
          profile_views_1d: number
          profile_views_30d: number
          profile_views_7d: number
          profile_views_change_pct: number | null
          recommendation_list: Json
          recommended_headline: string | null
          score_change: number
          snapshot_date: string
          strongest_keyword: string | null
          subscription_tier: string | null
          top_recommendation_action: string | null
          top_recommendation_impact: string | null
          top_recommendation_key: string | null
          top_recommendation_reason: string | null
          top_recommendation_title: string | null
          trial_day: number | null
          trial_days_remaining: number | null
          trial_status: string | null
          trust_score: number
          trust_signals: Json
          visibility_score: number
          weakest_section: string | null
        }
        Insert: {
          average_search_position?: number | null
          completed_fields?: Json
          contact_clicks_1d?: number
          contact_clicks_30d?: number
          contact_clicks_7d?: number
          contact_rate_pct?: number | null
          content_analysis?: Json
          content_score?: number
          conversion_score?: number
          created_at?: string
          email_payload?: Json
          email_preheader?: string | null
          email_subject?: string | null
          favorites_7d?: number
          generated_at?: string
          id?: string
          inquiries_7d?: number
          local_demand_score?: number | null
          local_demand_trend?: string | null
          market_analysis?: Json
          missing_fields?: Json
          photo_analysis?: Json
          previous_profile_score?: number | null
          profile_id: string
          profile_score?: number
          profile_views_1d?: number
          profile_views_30d?: number
          profile_views_7d?: number
          profile_views_change_pct?: number | null
          recommendation_list?: Json
          recommended_headline?: string | null
          score_change?: number
          snapshot_date?: string
          strongest_keyword?: string | null
          subscription_tier?: string | null
          top_recommendation_action?: string | null
          top_recommendation_impact?: string | null
          top_recommendation_key?: string | null
          top_recommendation_reason?: string | null
          top_recommendation_title?: string | null
          trial_day?: number | null
          trial_days_remaining?: number | null
          trial_status?: string | null
          trust_score?: number
          trust_signals?: Json
          visibility_score?: number
          weakest_section?: string | null
        }
        Update: {
          average_search_position?: number | null
          completed_fields?: Json
          contact_clicks_1d?: number
          contact_clicks_30d?: number
          contact_clicks_7d?: number
          contact_rate_pct?: number | null
          content_analysis?: Json
          content_score?: number
          conversion_score?: number
          created_at?: string
          email_payload?: Json
          email_preheader?: string | null
          email_subject?: string | null
          favorites_7d?: number
          generated_at?: string
          id?: string
          inquiries_7d?: number
          local_demand_score?: number | null
          local_demand_trend?: string | null
          market_analysis?: Json
          missing_fields?: Json
          photo_analysis?: Json
          previous_profile_score?: number | null
          profile_id?: string
          profile_score?: number
          profile_views_1d?: number
          profile_views_30d?: number
          profile_views_7d?: number
          profile_views_change_pct?: number | null
          recommendation_list?: Json
          recommended_headline?: string | null
          score_change?: number
          snapshot_date?: string
          strongest_keyword?: string | null
          subscription_tier?: string | null
          top_recommendation_action?: string | null
          top_recommendation_impact?: string | null
          top_recommendation_key?: string | null
          top_recommendation_reason?: string | null
          top_recommendation_title?: string | null
          trial_day?: number | null
          trial_days_remaining?: number | null
          trial_status?: string | null
          trust_score?: number
          trust_signals?: Json
          visibility_score?: number
          weakest_section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_coach_daily_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_coach_daily_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_coach_daily_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_coach_daily_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_coach_daily_snapshots_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_coach_email_preferences: {
        Row: {
          created_at: string
          daily_email_enabled: boolean
          include_ai_rewrite: boolean
          include_market_insights: boolean
          include_performance: boolean
          include_trial_status: boolean
          last_queued_at: string | null
          last_sent_at: string | null
          profile_id: string
          send_time_local: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_email_enabled?: boolean
          include_ai_rewrite?: boolean
          include_market_insights?: boolean
          include_performance?: boolean
          include_trial_status?: boolean
          last_queued_at?: string | null
          last_sent_at?: string | null
          profile_id: string
          send_time_local?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_email_enabled?: boolean
          include_ai_rewrite?: boolean
          include_market_insights?: boolean
          include_performance?: boolean
          include_trial_status?: boolean
          last_queued_at?: string | null
          last_sent_at?: string | null
          profile_id?: string
          send_time_local?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_coach_email_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_coach_email_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_coach_email_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_coach_email_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_coach_email_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_content_drafts: {
        Row: {
          accepted_at: string | null
          created_at: string
          field: string
          id: string
          model: string | null
          profile_id: string
          provider: string | null
          rationale: string | null
          source_text: string | null
          status: string
          suggested_keywords: string[]
          suggested_text: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          field: string
          id?: string
          model?: string | null
          profile_id: string
          provider?: string | null
          rationale?: string | null
          source_text?: string | null
          status?: string
          suggested_keywords?: string[]
          suggested_text: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          field?: string
          id?: string
          model?: string | null
          profile_id?: string
          provider?: string | null
          rationale?: string | null
          source_text?: string | null
          status?: string
          suggested_keywords?: string[]
          suggested_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_content_drafts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_content_drafts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_content_drafts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_content_drafts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_content_drafts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_optimization_runs: {
        Row: {
          after_state: Json
          applied_at: string | null
          applied_fields: string[]
          before_state: Json
          created_at: string
          error_message: string | null
          estimated_impact: Json
          id: string
          model: string | null
          profile_id: string
          provider: string | null
          status: string
        }
        Insert: {
          after_state?: Json
          applied_at?: string | null
          applied_fields?: string[]
          before_state?: Json
          created_at?: string
          error_message?: string | null
          estimated_impact?: Json
          id?: string
          model?: string | null
          profile_id: string
          provider?: string | null
          status?: string
        }
        Update: {
          after_state?: Json
          applied_at?: string | null
          applied_fields?: string[]
          before_state?: Json
          created_at?: string
          error_message?: string | null
          estimated_impact?: Json
          id?: string
          model?: string | null
          profile_id?: string
          provider?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_optimization_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_optimization_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_optimization_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_optimization_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_optimization_runs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_photo_scores: {
        Row: {
          analysis_mode: string
          analyzed_at: string
          background_score: number
          composition_score: number
          created_at: string
          id: string
          improvements: Json
          lighting_score: number
          model: string | null
          overall_score: number
          photo_id: string
          pose_score: number
          predicted_ctr_lift_pct: number | null
          professionalism_score: number
          profile_id: string
          provider: string | null
          recommendation: string | null
          recommended_primary: boolean
          sharpness_score: number
          smile_score: number
          strengths: Json
          thumbnail_score: number
          updated_at: string
        }
        Insert: {
          analysis_mode?: string
          analyzed_at?: string
          background_score?: number
          composition_score?: number
          created_at?: string
          id?: string
          improvements?: Json
          lighting_score?: number
          model?: string | null
          overall_score?: number
          photo_id: string
          pose_score?: number
          predicted_ctr_lift_pct?: number | null
          professionalism_score?: number
          profile_id: string
          provider?: string | null
          recommendation?: string | null
          recommended_primary?: boolean
          sharpness_score?: number
          smile_score?: number
          strengths?: Json
          thumbnail_score?: number
          updated_at?: string
        }
        Update: {
          analysis_mode?: string
          analyzed_at?: string
          background_score?: number
          composition_score?: number
          created_at?: string
          id?: string
          improvements?: Json
          lighting_score?: number
          model?: string | null
          overall_score?: number
          photo_id?: string
          pose_score?: number
          predicted_ctr_lift_pct?: number | null
          professionalism_score?: number
          profile_id?: string
          provider?: string | null
          recommendation?: string | null
          recommended_primary?: boolean
          sharpness_score?: number
          smile_score?: number
          strengths?: Json
          thumbnail_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_photo_scores_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "profile_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_photo_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_photo_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_photo_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_photo_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_photo_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_profile_reports: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          model: string | null
          narrative: string | null
          period_end: string
          period_start: string
          period_type: string
          profile_id: string
          provider: string | null
          summary: Json
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          model?: string | null
          narrative?: string | null
          period_end: string
          period_start: string
          period_type: string
          profile_id: string
          provider?: string | null
          summary?: Json
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          model?: string | null
          narrative?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          profile_id?: string
          provider?: string | null
          summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ai_profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          city: string | null
          city_slug: string | null
          created_at: string
          event_name: string
          event_source: string | null
          id: string
          ip_hash: string | null
          metadata: Json
          page_path: string | null
          profile_id: string | null
          referrer: string | null
          session_id: string | null
          source_page: string | null
          state: string | null
          therapist_profile_id: string | null
          user_agent: string | null
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          city?: string | null
          city_slug?: string | null
          created_at?: string
          event_name: string
          event_source?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json
          page_path?: string | null
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source_page?: string | null
          state?: string | null
          therapist_profile_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          city?: string | null
          city_slug?: string | null
          created_at?: string
          event_name?: string
          event_source?: string | null
          id?: string
          ip_hash?: string | null
          metadata?: Json
          page_path?: string | null
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source_page?: string | null
          state?: string | null
          therapist_profile_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_id: string | null
          created_at: string
          end_time: string | null
          ends_at: string | null
          id: string
          location_type: string | null
          notes: string | null
          profile_id: string | null
          service_type: string | null
          start_time: string | null
          starts_at: string | null
          status: string
          therapist_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          end_time?: string | null
          ends_at?: string | null
          id?: string
          location_type?: string | null
          notes?: string | null
          profile_id?: string | null
          service_type?: string | null
          start_time?: string | null
          starts_at?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          end_time?: string | null
          ends_at?: string | null
          id?: string
          location_type?: string | null
          notes?: string | null
          profile_id?: string | null
          service_type?: string | null
          start_time?: string | null
          starts_at?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          action_type: string | null
          admin_id: string | null
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          metadata: Json | null
          reason: string | null
          target_id: string | null
          target_profile_id: string | null
          target_type: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          action_type?: string | null
          admin_id?: string | null
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_profile_id?: string | null
          target_type?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string | null
          admin_id?: string | null
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_profile_id?: string | null
          target_type?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      background_jobs: {
        Row: {
          attempts: number
          created_at: string
          id: string
          job_type: string
          payload: Json
          processed_at: string | null
          scheduled_for: string
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          job_type: string
          payload?: Json
          processed_at?: string | null
          scheduled_for?: string
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          job_type?: string
          payload?: Json
          processed_at?: string | null
          scheduled_for?: string
          status?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          body: string | null
          content: string
          created_at: string
          excerpt: string
          id: string
          published_at: string
          seo_description: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          content: string
          created_at?: string
          excerpt: string
          id?: string
          published_at?: string
          seo_description: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          published_at?: string
          seo_description?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_analytics: {
        Row: {
          created_at: string | null
          id: string
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          price: number | null
          profile_id: string | null
          session_duration_minutes: number | null
          session_type: string | null
          technique: string | null
          user_ip: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          price?: number | null
          profile_id?: string | null
          session_duration_minutes?: number | null
          session_type?: string | null
          technique?: string | null
          user_ip?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          price?: number | null
          profile_id?: string | null
          session_duration_minutes?: number | null
          session_type?: string | null
          technique?: string | null
          user_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "booking_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_inquiries: {
        Row: {
          admin_notes: string | null
          ai_conversation: Json | null
          appointment_id: string | null
          client_email: string | null
          client_hotel: string | null
          client_name: string | null
          client_phone: string | null
          confirmed_date: string | null
          confirmed_time: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          intelligence_report: Json | null
          intelligence_status: string
          message: string | null
          preferred_date: string | null
          preferred_time: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_type: string | null
          sheets_row_id: string | null
          source: string | null
          status: string
          therapist_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          ai_conversation?: Json | null
          appointment_id?: string | null
          client_email?: string | null
          client_hotel?: string | null
          client_name?: string | null
          client_phone?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intelligence_report?: Json | null
          intelligence_status?: string
          message?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type?: string | null
          sheets_row_id?: string | null
          source?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          ai_conversation?: Json | null
          appointment_id?: string | null
          client_email?: string | null
          client_hotel?: string | null
          client_name?: string | null
          client_phone?: string | null
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intelligence_report?: Json | null
          intelligence_status?: string
          message?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type?: string | null
          sheets_row_id?: string | null
          source?: string | null
          status?: string
          therapist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "booking_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_inquiries_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      bruno_agent_config: {
        Row: {
          business_name: string
          exact_address: string
          hours: string
          id: number
          location_general: string
          min_notice_min: number
          payment: string
          prep_buffer_min: number
          rate_30: number
          rate_60: number
          rate_75: number
          rate_90: number
          updated_at: string
        }
        Insert: {
          business_name?: string
          exact_address?: string
          hours?: string
          id?: number
          location_general?: string
          min_notice_min?: number
          payment?: string
          prep_buffer_min?: number
          rate_30?: number
          rate_60?: number
          rate_75?: number
          rate_90?: number
          updated_at?: string
        }
        Update: {
          business_name?: string
          exact_address?: string
          hours?: string
          id?: number
          location_general?: string
          min_notice_min?: number
          payment?: string
          prep_buffer_min?: number
          rate_30?: number
          rate_60?: number
          rate_75?: number
          rate_90?: number
          updated_at?: string
        }
        Relationships: []
      }
      bruno_conversations: {
        Row: {
          created_at: string
          id: number
          inbound: string | null
          phone: string | null
          reply: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          inbound?: string | null
          phone?: string | null
          reply?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          inbound?: string | null
          phone?: string | null
          reply?: string | null
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          plan_id: string | null
          profile_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          therapist_profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          plan_id?: string | null
          profile_id: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          plan_id?: string | null
          profile_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "checkout_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          description: string | null
          hero: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string | null
          slug: string | null
          state: string | null
          state_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hero?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          slug?: string | null
          state?: string | null
          state_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hero?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          slug?: string | null
          state?: string | null
          state_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_favorites: {
        Row: {
          client_user_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          profile_id: string | null
          therapist_id: string | null
          therapist_profile_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_user_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          therapist_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_user_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          profile_id?: string | null
          therapist_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          admin_notes: string | null
          category: string | null
          complainant_id: string | null
          created_at: string | null
          description: string | null
          id: string
          message: string | null
          profile_id: string | null
          reported_profile_id: string | null
          reporter_email: string | null
          reporter_id: string | null
          resolved_at: string | null
          respondent_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string | null
          complainant_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          message?: string | null
          profile_id?: string | null
          reported_profile_id?: string | null
          reporter_email?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          respondent_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string | null
          complainant_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          message?: string | null
          profile_id?: string | null
          reported_profile_id?: string | null
          reporter_email?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          respondent_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_events: {
        Row: {
          created_at: string
          id: string
          ip_hash: string | null
          method: string
          profile_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          method: string
          profile_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          method?: string
          profile_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "contact_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inquiries: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          message: string
          preferred_contact: string
          profile_id: string
          status: string
          therapist_id: string | null
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          message: string
          preferred_contact?: string
          profile_id: string
          status?: string
          therapist_id?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          message?: string
          preferred_contact?: string
          profile_id?: string
          status?: string
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "contact_inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inquiries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_preferences: {
        Row: {
          allow_email: boolean | null
          allow_phone: boolean | null
          allow_whatsapp: boolean | null
          auto_reply_message: string | null
          created_at: string
          id: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          allow_email?: boolean | null
          allow_phone?: boolean | null
          allow_whatsapp?: boolean | null
          auto_reply_message?: string | null
          created_at?: string
          id?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          allow_email?: boolean | null
          allow_phone?: boolean | null
          allow_whatsapp?: boolean | null
          auto_reply_message?: string | null
          created_at?: string
          id?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_preferences_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "contact_preferences_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_preferences_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_preferences_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_preferences_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_a_id: string | null
          participant_b_id: string | null
          profile_id: string | null
          therapist_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          participant_a_id?: string | null
          participant_b_id?: string | null
          profile_id?: string | null
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          participant_a_id?: string | null
          participant_b_id?: string | null
          profile_id?: string | null
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_collection_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_summary: Json
          id: string
          markets_failed: number
          markets_requested: number
          markets_succeeded: number
          metadata: Json
          rows_ingested: number
          run_id: string | null
          started_at: string
          status: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_summary?: Json
          id?: string
          markets_failed?: number
          markets_requested?: number
          markets_succeeded?: number
          metadata?: Json
          rows_ingested?: number
          run_id?: string | null
          started_at: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_summary?: Json
          id?: string
          markets_failed?: number
          markets_requested?: number
          markets_succeeded?: number
          metadata?: Json
          rows_ingested?: number
          run_id?: string | null
          started_at?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      demand_radar_ads_historical_metrics: {
        Row: {
          avg_monthly_searches: number | null
          city: string
          collected_at: string
          competition: string | null
          competition_index: number | null
          geo_target_id: string
          high_top_of_page_bid_micros: number | null
          id: number
          keyword: string
          low_top_of_page_bid_micros: number | null
          monthly_json: Json | null
          run_id: string
          state: string
        }
        Insert: {
          avg_monthly_searches?: number | null
          city: string
          collected_at: string
          competition?: string | null
          competition_index?: number | null
          geo_target_id: string
          high_top_of_page_bid_micros?: number | null
          id?: never
          keyword: string
          low_top_of_page_bid_micros?: number | null
          monthly_json?: Json | null
          run_id: string
          state: string
        }
        Update: {
          avg_monthly_searches?: number | null
          city?: string
          collected_at?: string
          competition?: string | null
          competition_index?: number | null
          geo_target_id?: string
          high_top_of_page_bid_micros?: number | null
          id?: never
          keyword?: string
          low_top_of_page_bid_micros?: number | null
          monthly_json?: Json | null
          run_id?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_radar_ads_historical_metrics_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "demand_radar_collection_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_radar_collection_runs: {
        Row: {
          api_requests_attempted: number
          api_requests_failed: number
          api_requests_succeeded: number
          completed_at: string | null
          id: string
          methodology_version: string
          mode: string
          notes: string | null
          started_at: string
          status: string
        }
        Insert: {
          api_requests_attempted?: number
          api_requests_failed?: number
          api_requests_succeeded?: number
          completed_at?: string | null
          id: string
          methodology_version: string
          mode: string
          notes?: string | null
          started_at: string
          status: string
        }
        Update: {
          api_requests_attempted?: number
          api_requests_failed?: number
          api_requests_succeeded?: number
          completed_at?: string | null
          id?: string
          methodology_version?: string
          mode?: string
          notes?: string | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      demand_radar_market_interest: {
        Row: {
          category: string
          city: string
          collected_at: string
          data_quality: string
          dma_geo_code: string | null
          dma_name: string | null
          geo_index: number | null
          geo_match_confidence: number | null
          geo_percentile: number | null
          id: number
          keyword: string
          run_id: string
          source_request_id: string | null
          state: string
        }
        Insert: {
          category: string
          city: string
          collected_at: string
          data_quality: string
          dma_geo_code?: string | null
          dma_name?: string | null
          geo_index?: number | null
          geo_match_confidence?: number | null
          geo_percentile?: number | null
          id?: never
          keyword: string
          run_id: string
          source_request_id?: string | null
          state: string
        }
        Update: {
          category?: string
          city?: string
          collected_at?: string
          data_quality?: string
          dma_geo_code?: string | null
          dma_name?: string | null
          geo_index?: number | null
          geo_match_confidence?: number | null
          geo_percentile?: number | null
          id?: never
          keyword?: string
          run_id?: string
          source_request_id?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_radar_market_interest_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "demand_radar_collection_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_radar_spike_alert_deliveries: {
        Row: {
          city: string
          confidence: number | null
          created_at: string
          demand_score_id: string
          error: string | null
          id: string
          profile_id: string
          provider_message_id: string | null
          recipient_email: string
          run_id: string | null
          sent_at: string | null
          spike_score: number
          state: string
          status: string
        }
        Insert: {
          city: string
          confidence?: number | null
          created_at?: string
          demand_score_id: string
          error?: string | null
          id?: string
          profile_id: string
          provider_message_id?: string | null
          recipient_email: string
          run_id?: string | null
          sent_at?: string | null
          spike_score: number
          state: string
          status?: string
        }
        Update: {
          city?: string
          confidence?: number | null
          created_at?: string
          demand_score_id?: string
          error?: string | null
          id?: string
          profile_id?: string
          provider_message_id?: string | null
          recipient_email?: string
          run_id?: string | null
          sent_at?: string | null
          spike_score?: number
          state?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_radar_spike_alert_deliveries_demand_score_id_fkey"
            columns: ["demand_score_id"]
            isOneToOne: false
            referencedRelation: "demand_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_radar_spike_alert_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "demand_radar_spike_alert_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_radar_spike_alert_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_radar_spike_alert_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_radar_spike_alert_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_radar_trend_metrics: {
        Row: {
          baseline_median: number | null
          category: string
          city: string | null
          collected_at: string
          data_quality: string
          geo_code: string
          id: number
          keyword: string
          latest_index: number | null
          persistence: number | null
          previous_7_avg: number | null
          recent_7_avg: number | null
          robust_z: number | null
          run_id: string
          sample_points: number
          scope: string
          source_request_id: string | null
          spike_score: number | null
          spike_status: string
          state: string | null
          velocity: number | null
          wow_pct: number | null
        }
        Insert: {
          baseline_median?: number | null
          category: string
          city?: string | null
          collected_at: string
          data_quality: string
          geo_code: string
          id?: never
          keyword: string
          latest_index?: number | null
          persistence?: number | null
          previous_7_avg?: number | null
          recent_7_avg?: number | null
          robust_z?: number | null
          run_id: string
          sample_points: number
          scope: string
          source_request_id?: string | null
          spike_score?: number | null
          spike_status: string
          state?: string | null
          velocity?: number | null
          wow_pct?: number | null
        }
        Update: {
          baseline_median?: number | null
          category?: string
          city?: string | null
          collected_at?: string
          data_quality?: string
          geo_code?: string
          id?: never
          keyword?: string
          latest_index?: number | null
          persistence?: number | null
          previous_7_avg?: number | null
          recent_7_avg?: number | null
          robust_z?: number | null
          run_id?: string
          sample_points?: number
          scope?: string
          source_request_id?: string | null
          spike_score?: number | null
          spike_status?: string
          state?: string | null
          velocity?: number | null
          wow_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "demand_radar_trend_metrics_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "demand_radar_collection_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_scores: {
        Row: {
          baseline_index: number
          city: string
          city_key: string | null
          collected_at: string | null
          competition_index: number | null
          confidence: number | null
          created_at: string
          expires_at: string | null
          growth_pct: number | null
          id: string
          is_sample: boolean | null
          methodology_version: string
          neighborhood: string | null
          neighborhood_key: string | null
          persistence_score: number
          region_code: string | null
          region_name: string | null
          run_id: string | null
          sample_size: number
          score: number
          score_components: Json
          search_volume_index: number
          source: string | null
          spike_score: number
          state: string
          state_key: string | null
          trend: string
          velocity_score: number
          week_start: string
        }
        Insert: {
          baseline_index?: number
          city: string
          city_key?: string | null
          collected_at?: string | null
          competition_index?: number | null
          confidence?: number | null
          created_at?: string
          expires_at?: string | null
          growth_pct?: number | null
          id?: string
          is_sample?: boolean | null
          methodology_version?: string
          neighborhood?: string | null
          neighborhood_key?: string | null
          persistence_score?: number
          region_code?: string | null
          region_name?: string | null
          run_id?: string | null
          sample_size?: number
          score: number
          score_components?: Json
          search_volume_index?: number
          source?: string | null
          spike_score?: number
          state: string
          state_key?: string | null
          trend?: string
          velocity_score?: number
          week_start: string
        }
        Update: {
          baseline_index?: number
          city?: string
          city_key?: string | null
          collected_at?: string | null
          competition_index?: number | null
          confidence?: number | null
          created_at?: string
          expires_at?: string | null
          growth_pct?: number | null
          id?: string
          is_sample?: boolean | null
          methodology_version?: string
          neighborhood?: string | null
          neighborhood_key?: string | null
          persistence_score?: number
          region_code?: string | null
          region_name?: string | null
          run_id?: string | null
          sample_size?: number
          score?: number
          score_components?: Json
          search_volume_index?: number
          source?: string | null
          spike_score?: number
          state?: string
          state_key?: string | null
          trend?: string
          velocity_score?: number
          week_start?: string
        }
        Relationships: []
      }
      email_decisions: {
        Row: {
          approved_at: string | null
          campaign_id: string | null
          category: string
          consent_snapshot: Json
          created_at: string
          eligible_after: string | null
          email_type: string
          expires_at: string | null
          frequency_snapshot: Json
          id: string
          idempotency_key: string
          metadata: Json
          personalization_payload: Json
          priority: number
          profile_id: string | null
          reason: string
          recommended_at: string
          status: string
          trigger_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          campaign_id?: string | null
          category: string
          consent_snapshot?: Json
          created_at?: string
          eligible_after?: string | null
          email_type: string
          expires_at?: string | null
          frequency_snapshot?: Json
          id?: string
          idempotency_key: string
          metadata?: Json
          personalization_payload?: Json
          priority: number
          profile_id?: string | null
          reason: string
          recommended_at?: string
          status?: string
          trigger_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          campaign_id?: string | null
          category?: string
          consent_snapshot?: Json
          created_at?: string
          eligible_after?: string | null
          email_type?: string
          expires_at?: string | null
          frequency_snapshot?: Json
          id?: string
          idempotency_key?: string
          metadata?: Json
          personalization_payload?: Json
          priority?: number
          profile_id?: string | null
          reason?: string
          recommended_at?: string
          status?: string
          trigger_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_decisions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "admin_email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_decisions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "email_decisions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_decisions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_decisions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_decisions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      email_deliveries: {
        Row: {
          bounced_at: string | null
          clicked_at: string | null
          complained_at: string | null
          created_at: string
          decision_id: string
          delivered_at: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          metadata: Json
          opened_at: string | null
          profile_id: string | null
          provider: string
          provider_message_id: string | null
          queue_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bounced_at?: string | null
          clicked_at?: string | null
          complained_at?: string | null
          created_at?: string
          decision_id: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json
          opened_at?: string | null
          profile_id?: string | null
          provider?: string
          provider_message_id?: string | null
          queue_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bounced_at?: string | null
          clicked_at?: string | null
          complained_at?: string | null
          created_at?: string
          decision_id?: string
          delivered_at?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          metadata?: Json
          opened_at?: string | null
          profile_id?: string | null
          provider?: string
          provider_message_id?: string | null
          queue_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_deliveries_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "email_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "email_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_deliveries_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "lifecycle_email_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      email_provider_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          provider: string
          provider_event_id: string | null
          recipient_email: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          provider?: string
          provider_event_id?: string | null
          recipient_email?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          provider?: string
          provider_event_id?: string | null
          recipient_email?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          attempts: number
          created_at: string
          id: string
          payload: Json
          recipient_email: string
          scheduled_for: string
          sent_at: string | null
          status: string
          workflow_key: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          payload?: Json
          recipient_email: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          workflow_key?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          payload?: Json
          recipient_email?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          workflow_key?: string | null
        }
        Relationships: []
      }
      email_suppressions: {
        Row: {
          created_at: string
          details: Json
          email: string
          id: string
          is_active: boolean
          reason: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json
          email: string
          id?: string
          is_active?: boolean
          reason: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json
          email?: string
          id?: string
          is_active?: boolean
          reason?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_workflows: {
        Row: {
          body_html: string
          created_at: string
          id: string
          is_active: boolean
          subject: string
          updated_at: string
          workflow_key: string
        }
        Insert: {
          body_html: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject: string
          updated_at?: string
          workflow_key: string
        }
        Update: {
          body_html?: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject?: string
          updated_at?: string
          workflow_key?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          profile_id: string | null
          therapist_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id?: string | null
          therapist_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string | null
          therapist_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_masters: {
        Row: {
          city: string | null
          created_at: string | null
          display_order: number | null
          ends_at: string | null
          featured_by: string | null
          id: string
          is_active: boolean | null
          profile_id: string | null
          starts_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          display_order?: number | null
          ends_at?: string | null
          featured_by?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          starts_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          display_order?: number | null
          ends_at?: string | null
          featured_by?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_masters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verifications: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          metadata: Json | null
          profile_id: string | null
          provider: string | null
          status: string
          stripe_session_id: string | null
          stripe_verification_report_id: string | null
          stripe_verification_session_id: string | null
          updated_at: string
          user_id: string | null
          verification_method: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          metadata?: Json | null
          profile_id?: string | null
          provider?: string | null
          status?: string
          stripe_session_id?: string | null
          stripe_verification_report_id?: string | null
          stripe_verification_session_id?: string | null
          updated_at?: string
          user_id?: string | null
          verification_method?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          metadata?: Json | null
          profile_id?: string | null
          provider?: string | null
          status?: string
          stripe_session_id?: string | null
          stripe_verification_report_id?: string | null
          stripe_verification_session_id?: string | null
          updated_at?: string
          user_id?: string | null
          verification_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_profile_data: {
        Row: {
          created_at: string | null
          id: string
          payload: Json | null
          profile_id: string | null
          source_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload?: Json | null
          profile_id?: string | null
          source_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json | null
          profile_id?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      imported_reviews: {
        Row: {
          created_at: string | null
          id: string
          imported_at: string | null
          is_public: boolean | null
          migration_id: string | null
          profile_id: string | null
          public_label: string
          rating: number | null
          review_date: string | null
          review_notes: string | null
          review_text: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_anonymized: boolean | null
          reviewer_name: string | null
          source_platform: string | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          imported_at?: string | null
          is_public?: boolean | null
          migration_id?: string | null
          profile_id?: string | null
          public_label?: string
          rating?: number | null
          review_date?: string | null
          review_notes?: string | null
          review_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_anonymized?: boolean | null
          reviewer_name?: string | null
          source_platform?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          imported_at?: string | null
          is_public?: boolean | null
          migration_id?: string | null
          profile_id?: string | null
          public_label?: string
          rating?: number | null
          review_date?: string | null
          review_notes?: string | null
          review_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_anonymized?: boolean | null
          reviewer_name?: string | null
          source_platform?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_reviews_migration_id_fkey"
            columns: ["migration_id"]
            isOneToOne: false
            referencedRelation: "profile_migrations"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_analytics: {
        Row: {
          created_at: string | null
          id: string
          inquiry_type: string | null
          profile_id: string | null
          session_id: string | null
          session_type: string | null
          technique_requested: string | null
          user_city: string | null
          user_ip: string | null
          user_state: string | null
          user_zip: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquiry_type?: string | null
          profile_id?: string | null
          session_id?: string | null
          session_type?: string | null
          technique_requested?: string | null
          user_city?: string | null
          user_ip?: string | null
          user_state?: string | null
          user_zip?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquiry_type?: string | null
          profile_id?: string | null
          session_id?: string | null
          session_type?: string | null
          technique_requested?: string | null
          user_city?: string | null
          user_ip?: string | null
          user_state?: string | null
          user_zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "inquiry_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_alerts: {
        Row: {
          acknowledged: boolean | null
          action_taken: string | null
          alert_type: string
          change_percentage: number | null
          created_at: string | null
          id: string
          keyword: string
          previous_score: number | null
          sent: boolean | null
          sent_via: string[] | null
          trigger_date: string | null
          trigger_score: number | null
        }
        Insert: {
          acknowledged?: boolean | null
          action_taken?: string | null
          alert_type: string
          change_percentage?: number | null
          created_at?: string | null
          id?: string
          keyword: string
          previous_score?: number | null
          sent?: boolean | null
          sent_via?: string[] | null
          trigger_date?: string | null
          trigger_score?: number | null
        }
        Update: {
          acknowledged?: boolean | null
          action_taken?: string | null
          alert_type?: string
          change_percentage?: number | null
          created_at?: string | null
          id?: string
          keyword?: string
          previous_score?: number | null
          sent?: boolean | null
          sent_via?: string[] | null
          trigger_date?: string | null
          trigger_score?: number | null
        }
        Relationships: []
      }
      keyword_content_map: {
        Row: {
          content_type: string | null
          content_url: string | null
          created_at: string | null
          current_ranking: number | null
          id: string
          is_current: boolean | null
          keyword: string
          last_updated: string | null
          target_ranking: number | null
          traffic_impact: number | null
        }
        Insert: {
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          current_ranking?: number | null
          id?: string
          is_current?: boolean | null
          keyword: string
          last_updated?: string | null
          target_ranking?: number | null
          traffic_impact?: number | null
        }
        Update: {
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          current_ranking?: number | null
          id?: string
          is_current?: boolean | null
          keyword?: string
          last_updated?: string | null
          target_ranking?: number | null
          traffic_impact?: number | null
        }
        Relationships: []
      }
      keyword_insights: {
        Row: {
          action_recommended: string | null
          avg_competition: number | null
          blog_post_id: string | null
          content_created: boolean | null
          content_ideas: string[] | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          insight_type: string
          keyword: string
          last_updated: string | null
          page_updated: boolean | null
          priority: string | null
          recommendation: string | null
          related_keyword_date: string | null
          status: string | null
          title: string | null
          top_cities: string[] | null
          total_searches: number | null
          updated_at: string | null
        }
        Insert: {
          action_recommended?: string | null
          avg_competition?: number | null
          blog_post_id?: string | null
          content_created?: boolean | null
          content_ideas?: string[] | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          keyword: string
          last_updated?: string | null
          page_updated?: boolean | null
          priority?: string | null
          recommendation?: string | null
          related_keyword_date?: string | null
          status?: string | null
          title?: string | null
          top_cities?: string[] | null
          total_searches?: number | null
          updated_at?: string | null
        }
        Update: {
          action_recommended?: string | null
          avg_competition?: number | null
          blog_post_id?: string | null
          content_created?: boolean | null
          content_ideas?: string[] | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          keyword?: string
          last_updated?: string | null
          page_updated?: boolean | null
          priority?: string | null
          recommendation?: string | null
          related_keyword_date?: string | null
          status?: string | null
          title?: string | null
          top_cities?: string[] | null
          total_searches?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      keyword_trends: {
        Row: {
          city: string
          competition_level: string | null
          created_at: string | null
          date: string
          day_over_day_change: number | null
          id: string
          keyword: string
          keyword_id: string
          month_avg: number | null
          peak_date: string | null
          peak_detected: boolean | null
          score: number
          search_volume: number | null
          state: string
          trend_direction: string | null
          updated_at: string | null
          week: number | null
          week_avg: number | null
          week_over_week_change: number | null
          year: number | null
        }
        Insert: {
          city: string
          competition_level?: string | null
          created_at?: string | null
          date: string
          day_over_day_change?: number | null
          id?: string
          keyword: string
          keyword_id: string
          month_avg?: number | null
          peak_date?: string | null
          peak_detected?: boolean | null
          score: number
          search_volume?: number | null
          state: string
          trend_direction?: string | null
          updated_at?: string | null
          week?: number | null
          week_avg?: number | null
          week_over_week_change?: number | null
          year?: number | null
        }
        Update: {
          city?: string
          competition_level?: string | null
          created_at?: string | null
          date?: string
          day_over_day_change?: number | null
          id?: string
          keyword?: string
          keyword_id?: string
          month_avg?: number | null
          peak_date?: string | null
          peak_detected?: boolean | null
          score?: number
          search_volume?: number | null
          state?: string
          trend_direction?: string | null
          updated_at?: string | null
          week?: number | null
          week_avg?: number | null
          week_over_week_change?: number | null
          year?: number | null
        }
        Relationships: []
      }
      keywords: {
        Row: {
          category: string | null
          created_at: string
          id: string
          keyword: string | null
          label: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          keyword?: string | null
          label?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          keyword?: string | null
          label?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lifecycle_email_log: {
        Row: {
          campaign_key: string | null
          created_at: string
          decision_id: string | null
          error_message: string | null
          flow_key: string | null
          id: string
          metadata: Json | null
          provider: string | null
          provider_id: string | null
          provider_message_id: string | null
          queue_id: string | null
          recipient_email: string | null
          segment: string | null
          send_category: string | null
          status: string | null
          subject: string | null
          suppression_reason: string | null
          template_key: string | null
          user_id: string | null
        }
        Insert: {
          campaign_key?: string | null
          created_at?: string
          decision_id?: string | null
          error_message?: string | null
          flow_key?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_id?: string | null
          provider_message_id?: string | null
          queue_id?: string | null
          recipient_email?: string | null
          segment?: string | null
          send_category?: string | null
          status?: string | null
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_key?: string | null
          created_at?: string
          decision_id?: string | null
          error_message?: string | null
          flow_key?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_id?: string | null
          provider_message_id?: string | null
          queue_id?: string | null
          recipient_email?: string | null
          segment?: string | null
          send_category?: string | null
          status?: string | null
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_email_log_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "email_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_email_queue: {
        Row: {
          body_html: string | null
          body_text: string | null
          campaign_key: string | null
          created_at: string
          decision_id: string | null
          error_message: string | null
          flow_key: string | null
          from_address: string | null
          id: string
          idempotency_key: string | null
          max_retries: number
          payload: Json
          processing_started_at: string | null
          provider_id: string | null
          provider_message_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          reply_to: string | null
          retry_count: number
          scheduled_for: string | null
          segment: string | null
          send_category: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          suppression_reason: string | null
          template_key: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          campaign_key?: string | null
          created_at?: string
          decision_id?: string | null
          error_message?: string | null
          flow_key?: string | null
          from_address?: string | null
          id?: string
          idempotency_key?: string | null
          max_retries?: number
          payload?: Json
          processing_started_at?: string | null
          provider_id?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          reply_to?: string | null
          retry_count?: number
          scheduled_for?: string | null
          segment?: string | null
          send_category?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          campaign_key?: string | null
          created_at?: string
          decision_id?: string | null
          error_message?: string | null
          flow_key?: string | null
          from_address?: string | null
          id?: string
          idempotency_key?: string | null
          max_retries?: number
          payload?: Json
          processing_started_at?: string | null
          provider_id?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          reply_to?: string | null
          retry_count?: number
          scheduled_for?: string | null
          segment?: string | null
          send_category?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          suppression_reason?: string | null
          template_key?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_email_queue_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "email_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_preferences: {
        Row: {
          marketing_opt_in: boolean
          newsletter_opt_in: boolean
          source: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          marketing_opt_in?: boolean
          newsletter_opt_in?: boolean
          source?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          marketing_opt_in?: boolean
          newsletter_opt_in?: boolean
          source?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          read_at: string | null
          sender_id: string | null
          sender_user_id: string | null
        }
        Insert: {
          body?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string | null
          sender_user_id?: string | null
        }
        Update: {
          body?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string | null
          sender_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_campaign_contacts: {
        Row: {
          campaign_id: string
          contact_id: string
          created_at: string
          id: string
          queued_at: string | null
          replied_at: string | null
          sent_at: string | null
          skip_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          contact_id: string
          created_at?: string
          id?: string
          queued_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          skip_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          queued_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          skip_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "messaging_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "messaging_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_campaigns: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          default_message: string | null
          id: string
          metadata: Json
          name: string
          sending_window_end: string
          sending_window_start: string
          short_sms_message: string | null
          started_at: string | null
          status: string
          transport_preference: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          default_message?: string | null
          id?: string
          metadata?: Json
          name: string
          sending_window_end?: string
          sending_window_start?: string
          short_sms_message?: string | null
          started_at?: string | null
          status?: string
          transport_preference?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          default_message?: string | null
          id?: string
          metadata?: Json
          name?: string
          sending_window_end?: string
          sending_window_start?: string
          short_sms_message?: string | null
          started_at?: string | null
          status?: string
          transport_preference?: string
          updated_at?: string
        }
        Relationships: []
      }
      messaging_contacts: {
        Row: {
          city: string | null
          created_at: string
          id: string
          knotty_enabled: boolean
          last_activity_at: string | null
          last_inbound_at: string | null
          last_outbound_at: string | null
          lifecycle_status: string
          metadata: Json
          name: string | null
          opted_out: boolean
          opted_out_at: string | null
          opted_out_reason: string | null
          phone_e164: string
          profile_url: string | null
          source: string | null
          state: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          knotty_enabled?: boolean
          last_activity_at?: string | null
          last_inbound_at?: string | null
          last_outbound_at?: string | null
          lifecycle_status?: string
          metadata?: Json
          name?: string | null
          opted_out?: boolean
          opted_out_at?: string | null
          opted_out_reason?: string | null
          phone_e164: string
          profile_url?: string | null
          source?: string | null
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          knotty_enabled?: boolean
          last_activity_at?: string | null
          last_inbound_at?: string | null
          last_outbound_at?: string | null
          lifecycle_status?: string
          metadata?: Json
          name?: string | null
          opted_out?: boolean
          opted_out_at?: string | null
          opted_out_reason?: string | null
          phone_e164?: string
          profile_url?: string | null
          source?: string | null
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      messaging_conversations: {
        Row: {
          contact_id: string
          created_at: string
          current_channel: string
          id: string
          knotty_enabled: boolean
          last_inbound_at: string | null
          last_message_at: string | null
          last_outbound_at: string | null
          receiving_number: string
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          current_channel?: string
          id?: string
          knotty_enabled?: boolean
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_outbound_at?: string | null
          receiving_number: string
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          current_channel?: string
          id?: string
          knotty_enabled?: boolean
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_outbound_at?: string | null
          receiving_number?: string
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "messaging_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_messages: {
        Row: {
          body: string
          campaign_id: string | null
          channel: string
          contact_id: string
          conversation_id: string
          created_at: string
          delivered_at: string | null
          delivery_status: string
          direction: string
          error_code: string | null
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          idempotency_key: string | null
          metadata: Json
          received_at: string | null
          sender_type: string
          sent_at: string | null
          updated_at: string
        }
        Insert: {
          body: string
          campaign_id?: string | null
          channel?: string
          contact_id: string
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          direction: string
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          received_at?: string | null
          sender_type: string
          sent_at?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          campaign_id?: string | null
          channel?: string
          contact_id?: string
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string
          direction?: string
          error_code?: string | null
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          received_at?: string | null
          sender_type?: string
          sent_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "messaging_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "messaging_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "messaging_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_queue: {
        Row: {
          attempts: number
          body: string
          campaign_id: string | null
          contact_id: string
          conversation_id: string | null
          created_at: string
          delivered_at: string | null
          failed_at: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          message_id: string | null
          priority: number
          scheduled_for: string
          sent_at: string | null
          short_sms_body: string | null
          status: string
          transport_preference: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          body: string
          campaign_id?: string | null
          contact_id: string
          conversation_id?: string | null
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          id?: string
          idempotency_key: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          message_id?: string | null
          priority?: number
          scheduled_for?: string
          sent_at?: string | null
          short_sms_body?: string | null
          status?: string
          transport_preference?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          body?: string
          campaign_id?: string | null
          contact_id?: string
          conversation_id?: string | null
          created_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          id?: string
          idempotency_key?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          message_id?: string | null
          priority?: number
          scheduled_for?: string
          sent_at?: string | null
          short_sms_body?: string | null
          status?: string
          transport_preference?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "messaging_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_queue_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "messaging_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_queue_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "messaging_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_queue_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messaging_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_settings: {
        Row: {
          created_at: string
          default_send_interval_seconds: number
          global_pause: boolean
          id: string
          inbound_since: string
          knotty_enabled: boolean
          receiving_number: string
          transport_mode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_send_interval_seconds?: number
          global_pause?: boolean
          id?: string
          inbound_since?: string
          knotty_enabled?: boolean
          receiving_number?: string
          transport_mode?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_send_interval_seconds?: number
          global_pause?: boolean
          id?: string
          inbound_since?: string
          knotty_enabled?: boolean
          receiving_number?: string
          transport_mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      mfa_pending: {
        Row: {
          backup_codes: string[]
          created_at: string | null
          expires_at: string
          id: string
          totp_secret: string
          user_id: string
        }
        Insert: {
          backup_codes: string[]
          created_at?: string | null
          expires_at: string
          id?: string
          totp_secret: string
          user_id: string
        }
        Update: {
          backup_codes?: string[]
          created_at?: string | null
          expires_at?: string
          id?: string
          totp_secret?: string
          user_id?: string
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_type: string
          actor_admin_id: string | null
          created_at: string
          detail: string | null
          id: string
          reason: string
          resolved_at: string | null
          target_profile_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          actor_admin_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          reason: string
          resolved_at?: string | null
          target_profile_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          actor_admin_id?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          reason?: string
          resolved_at?: string | null
          target_profile_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "moderation_actions_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          admin_reason: string | null
          ai_response: Json | null
          content_id: string | null
          content_type: string
          created_at: string
          field_name: string | null
          id: string
          item_type: string | null
          moderation_provider: string | null
          moderation_reason: string | null
          notes: string | null
          payload: Json | null
          photo_id: string | null
          priority: number | null
          profile_id: string | null
          queue_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          snapshot: Json | null
          source: string | null
          status: string
          target_id: string | null
          therapist_profile_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_reason?: string | null
          ai_response?: Json | null
          content_id?: string | null
          content_type: string
          created_at?: string
          field_name?: string | null
          id?: string
          item_type?: string | null
          moderation_provider?: string | null
          moderation_reason?: string | null
          notes?: string | null
          payload?: Json | null
          photo_id?: string | null
          priority?: number | null
          profile_id?: string | null
          queue_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          snapshot?: Json | null
          source?: string | null
          status?: string
          target_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_reason?: string | null
          ai_response?: Json | null
          content_id?: string | null
          content_type?: string
          created_at?: string
          field_name?: string | null
          id?: string
          item_type?: string | null
          moderation_provider?: string | null
          moderation_reason?: string | null
          notes?: string | null
          payload?: Json | null
          photo_id?: string | null
          priority?: number | null
          profile_id?: string | null
          queue_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          snapshot?: Json | null
          source?: string | null
          status?: string
          target_id?: string | null
          therapist_profile_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          city: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          channel: string | null
          created_at: string | null
          destination: string | null
          error_message: string | null
          id: string
          notification_id: string | null
          payload: Json | null
          provider: string | null
          provider_message_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          destination?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          payload?: Json | null
          provider?: string | null
          provider_message_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          destination?: string | null
          error_message?: string | null
          id?: string
          notification_id?: string | null
          payload?: Json | null
          provider?: string | null
          provider_message_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number | null
          amount_cents: number | null
          appointment_id: string | null
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          provider: string | null
          provider_transaction_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          therapist_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          amount_cents?: number | null
          appointment_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          amount_cents?: number | null
          appointment_id?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          therapist_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_moderations: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          flagged_at: string | null
          id: string
          photo_id: string | null
          reason: string | null
          reviewed_at: string | null
          status: string | null
          therapist_id: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          flagged_at?: string | null
          id?: string
          photo_id?: string | null
          reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          therapist_id?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          flagged_at?: string | null
          id?: string
          photo_id?: string | null
          reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          therapist_id?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      profile_documents: {
        Row: {
          created_at: string | null
          document_type: string | null
          id: string
          profile_id: string | null
          status: string | null
          storage_path: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          id?: string
          profile_id?: string | null
          status?: string | null
          storage_path?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          id?: string
          profile_id?: string | null
          status?: string | null
          storage_path?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      profile_migrations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email: string
          id: string
          imported_rating: number | null
          imported_review_count: number | null
          imported_reviews: number | null
          is_verified: boolean | null
          migration_notes: string | null
          platform: string
          profile_id: string | null
          source_url: string
          status: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          imported_rating?: number | null
          imported_review_count?: number | null
          imported_reviews?: number | null
          is_verified?: boolean | null
          migration_notes?: string | null
          platform: string
          profile_id?: string | null
          source_url: string
          status?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          imported_rating?: number | null
          imported_review_count?: number | null
          imported_reviews?: number | null
          is_verified?: boolean | null
          migration_notes?: string | null
          platform?: string
          profile_id?: string | null
          source_url?: string
          status?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_migrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_migrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_migrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_migrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_migrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          moderation_reason: string | null
          moderation_status: string | null
          profile_id: string | null
          sort_order: number | null
          storage_path: string | null
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          moderation_reason?: string | null
          moderation_status?: string | null
          profile_id?: string | null
          sort_order?: number | null
          storage_path?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          moderation_reason?: string | null
          moderation_status?: string | null
          profile_id?: string | null
          sort_order?: number | null
          storage_path?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reports: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          id: string
          ip_hash: string | null
          profile_id: string
          profile_name: string | null
          profile_slug: string | null
          reason: string
          reporter_email: string | null
          reporter_user_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          profile_id: string
          profile_name?: string | null
          profile_slug?: string | null
          reason: string
          reporter_email?: string | null
          reporter_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          profile_id?: string
          profile_name?: string | null
          profile_slug?: string | null
          reason?: string
          reporter_email?: string | null
          reporter_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reviews: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          moderation_notes: string | null
          profile_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          moderation_notes?: string | null
          profile_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          moderation_notes?: string | null
          profile_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_sections: {
        Row: {
          created_at: string
          id: string
          is_complete: boolean
          is_editable: boolean
          is_visible: boolean
          section_key: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_complete?: boolean
          is_editable?: boolean
          is_visible?: boolean
          section_key: string
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_complete?: boolean
          is_editable?: boolean
          is_visible?: boolean
          section_key?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_status_debug_log: {
        Row: {
          attempted_value: string | null
          id: number
          logged_at: string | null
          metadata: Json | null
          normalized_to: string | null
          old_value: string | null
          profile_id: string | null
        }
        Insert: {
          attempted_value?: string | null
          id?: number
          logged_at?: string | null
          metadata?: Json | null
          normalized_to?: string | null
          old_value?: string | null
          profile_id?: string | null
        }
        Update: {
          attempted_value?: string | null
          id?: number
          logged_at?: string | null
          metadata?: Json | null
          normalized_to?: string | null
          old_value?: string | null
          profile_id?: string | null
        }
        Relationships: []
      }
      profile_status_invalid_log: {
        Row: {
          attempted_value: string | null
          id: number
          logged_at: string | null
          profile_id: string | null
        }
        Insert: {
          attempted_value?: string | null
          id?: number
          logged_at?: string | null
          profile_id?: string | null
        }
        Update: {
          attempted_value?: string | null
          id?: number
          logged_at?: string | null
          profile_id?: string | null
        }
        Relationships: []
      }
      profile_view_analytics: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          referrer: string | null
          session_id: string | null
          source: string | null
          user_ip: string | null
          viewer_city: string | null
          viewer_state: string | null
          viewer_zip: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_ip?: string | null
          viewer_city?: string | null
          viewer_state?: string | null
          viewer_zip?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string | null
          user_ip?: string | null
          viewer_city?: string | null
          viewer_state?: string | null
          viewer_zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_view_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profile_view_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_view_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_view_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_view_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          _tier: string | null
          accepts_all_genders: boolean | null
          accessibility_features: string[] | null
          account_status: string
          add_ons: Json | null
          additional_services: string[] | null
          admin_notes: string | null
          affiliations: string[] | null
          age_conduct_attested_at: string | null
          approved_at: string | null
          approved_by: string | null
          areas_served: string[] | null
          availability_note: string | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number
          banned_reason: string | null
          bio: string | null
          body_type: string | null
          booking_link: string | null
          booking_platform: string | null
          booking_url: string | null
          boost_score: number | null
          business_hours: Json | null
          business_trips: Json | null
          canonical_city_slug: string | null
          certifications: string | null
          city: string | null
          completion_percentage: number | null
          completion_score: number | null
          contact_clicks: number
          country: string | null
          created_at: string
          current_period_end: string | null
          current_status: string | null
          custom_faq: Json | null
          day_of_week_discount: Json | null
          display_name: string | null
          education: string | null
          education_entries: Json | null
          email: string | null
          email_address: string | null
          featured_until: string | null
          full_name: string | null
          gender: string | null
          headline: string | null
          height_inches: number | null
          id: string
          identity_verified_at: string | null
          incall: boolean | null
          incall_amenities: string[] | null
          incall_details: string | null
          incall_price: number | null
          inquiry_count: number | null
          is_active: boolean | null
          is_banned: boolean | null
          is_demo: boolean
          is_featured: boolean | null
          is_suspended: boolean | null
          is_verified_email: boolean | null
          is_verified_identity: boolean | null
          is_verified_phone: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          keyword_slugs: string[] | null
          languages: string[] | null
          languages_spoken: string[] | null
          last_active_at: string | null
          last_seen_at: string | null
          latitude: number | null
          lgbtq_affirming: boolean
          location_marker_type: string | null
          location_type: string | null
          longitude: number | null
          map_enabled: boolean | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          mobile_extras: string[] | null
          mobile_hours: Json | null
          modalities: string[] | null
          modality: string | null
          moderation_notes: string | null
          moderation_status: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall: boolean | null
          outcall_details: string | null
          outcall_price: number | null
          outcall_radius: number | null
          outcall_radius_miles: number | null
          payment_methods: string[] | null
          phone: string | null
          phone_number: string | null
          photo_limit: number | null
          photo_url: string | null
          presentation_video_url: string | null
          price_max: number | null
          price_min: number | null
          pricing_sessions: Json | null
          primary_area: string | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_completeness: number | null
          profile_completion_score: number | null
          profile_status: string | null
          profile_views: number | null
          promotions: Json | null
          rate_disclaimers: string[] | null
          rates: Json | null
          rating_average: number | null
          referral_bonus_expires_at: string | null
          referral_bonus_months: number
          referral_bonus_tier: string | null
          regular_discounts: Json | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_count: number
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          segments: string[] | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_categories: string[] | null
          service_radius_km: number | null
          service_radius_miles: number | null
          session_duration: number | null
          session_lengths: number[] | null
          show_email: boolean
          show_phone: boolean
          slug: string | null
          social_media: Json | null
          specialties: string[] | null
          specialty: string | null
          start_date: string | null
          start_year: number | null
          starting_price: number | null
          starting_rate: number | null
          state: string | null
          status: string | null
          street_reference: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_verification_session_id: string | null
          studio_amenities: string[] | null
          studio_hours: Json | null
          submitted_at: string | null
          subscription_cancel_at_period_end: boolean | null
          subscription_current_period_end: string | null
          subscription_current_period_start: string | null
          subscription_plan: string | null
          subscription_status: string | null
          subscription_tier: string | null
          suspension_reason: string | null
          tagline: string | null
          terms_accepted_at: string | null
          tier: string | null
          training: string | null
          travel_destination: string | null
          travel_schedule: Json | null
          traveling: boolean | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          view_count: number | null
          visibility_level: number | null
          visibility_status: string | null
          visiting: boolean | null
          website: string | null
          weekly_special: Json | null
          weight_lb: number | null
          whatsapp: string | null
          whatsapp_number: string | null
          years_experience: number | null
          zip_code: string | null
        }
        Insert: {
          _tier?: string | null
          accepts_all_genders?: boolean | null
          accessibility_features?: string[] | null
          account_status?: string
          add_ons?: Json | null
          additional_services?: string[] | null
          admin_notes?: string | null
          affiliations?: string[] | null
          age_conduct_attested_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          availability_note?: string | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_link?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          boost_score?: number | null
          business_hours?: Json | null
          business_trips?: Json | null
          canonical_city_slug?: string | null
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number
          country?: string | null
          created_at?: string
          current_period_end?: string | null
          current_status?: string | null
          custom_faq?: Json | null
          day_of_week_discount?: Json | null
          display_name?: string | null
          education?: string | null
          education_entries?: Json | null
          email?: string | null
          email_address?: string | null
          featured_until?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id: string
          identity_verified_at?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
          incall_details?: string | null
          incall_price?: number | null
          inquiry_count?: number | null
          is_active?: boolean | null
          is_banned?: boolean | null
          is_demo?: boolean
          is_featured?: boolean | null
          is_suspended?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          last_seen_at?: string | null
          latitude?: number | null
          lgbtq_affirming?: boolean
          location_marker_type?: string | null
          location_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          mobile_extras?: string[] | null
          mobile_hours?: Json | null
          modalities?: string[] | null
          modality?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_details?: string | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          photo_limit?: number | null
          photo_url?: string | null
          presentation_video_url?: string | null
          price_max?: number | null
          price_min?: number | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completeness?: number | null
          profile_completion_score?: number | null
          profile_status?: string | null
          profile_views?: number | null
          promotions?: Json | null
          rate_disclaimers?: string[] | null
          rates?: Json | null
          rating_average?: number | null
          referral_bonus_expires_at?: string | null
          referral_bonus_months?: number
          referral_bonus_tier?: string | null
          regular_discounts?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          segments?: string[] | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          service_radius_km?: number | null
          service_radius_miles?: number | null
          session_duration?: number | null
          session_lengths?: number[] | null
          show_email?: boolean
          show_phone?: boolean
          slug?: string | null
          social_media?: Json | null
          specialties?: string[] | null
          specialty?: string | null
          start_date?: string | null
          start_year?: number | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          status?: string | null
          street_reference?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
          studio_amenities?: string[] | null
          studio_hours?: Json | null
          submitted_at?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          terms_accepted_at?: string | null
          tier?: string | null
          training?: string | null
          travel_destination?: string | null
          travel_schedule?: Json | null
          traveling?: boolean | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_level?: number | null
          visibility_status?: string | null
          visiting?: boolean | null
          website?: string | null
          weekly_special?: Json | null
          weight_lb?: number | null
          whatsapp?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Update: {
          _tier?: string | null
          accepts_all_genders?: boolean | null
          accessibility_features?: string[] | null
          account_status?: string
          add_ons?: Json | null
          additional_services?: string[] | null
          admin_notes?: string | null
          affiliations?: string[] | null
          age_conduct_attested_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          availability_note?: string | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_link?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          boost_score?: number | null
          business_hours?: Json | null
          business_trips?: Json | null
          canonical_city_slug?: string | null
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number
          country?: string | null
          created_at?: string
          current_period_end?: string | null
          current_status?: string | null
          custom_faq?: Json | null
          day_of_week_discount?: Json | null
          display_name?: string | null
          education?: string | null
          education_entries?: Json | null
          email?: string | null
          email_address?: string | null
          featured_until?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string
          identity_verified_at?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
          incall_details?: string | null
          incall_price?: number | null
          inquiry_count?: number | null
          is_active?: boolean | null
          is_banned?: boolean | null
          is_demo?: boolean
          is_featured?: boolean | null
          is_suspended?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          last_seen_at?: string | null
          latitude?: number | null
          lgbtq_affirming?: boolean
          location_marker_type?: string | null
          location_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          mobile_extras?: string[] | null
          mobile_hours?: Json | null
          modalities?: string[] | null
          modality?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_details?: string | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          photo_limit?: number | null
          photo_url?: string | null
          presentation_video_url?: string | null
          price_max?: number | null
          price_min?: number | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completeness?: number | null
          profile_completion_score?: number | null
          profile_status?: string | null
          profile_views?: number | null
          promotions?: Json | null
          rate_disclaimers?: string[] | null
          rates?: Json | null
          rating_average?: number | null
          referral_bonus_expires_at?: string | null
          referral_bonus_months?: number
          referral_bonus_tier?: string | null
          regular_discounts?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          segments?: string[] | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          service_radius_km?: number | null
          service_radius_miles?: number | null
          session_duration?: number | null
          session_lengths?: number[] | null
          show_email?: boolean
          show_phone?: boolean
          slug?: string | null
          social_media?: Json | null
          specialties?: string[] | null
          specialty?: string | null
          start_date?: string | null
          start_year?: number | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          status?: string | null
          street_reference?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
          studio_amenities?: string[] | null
          studio_hours?: Json | null
          submitted_at?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          terms_accepted_at?: string | null
          tier?: string | null
          training?: string | null
          travel_destination?: string | null
          travel_schedule?: Json | null
          traveling?: boolean | null
          updated_at?: string
          user_id?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_level?: number | null
          visibility_status?: string | null
          visiting?: boolean | null
          website?: string | null
          weekly_special?: Json | null
          weight_lb?: number | null
          whatsapp?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      provider_travel: {
        Row: {
          created_at: string | null
          destination_city: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          profile_id: string | null
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          destination_city?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          destination_city?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string | null
          created_at: string | null
          endpoint: string | null
          id: string
          is_active: boolean | null
          keys: Json | null
          p256dh: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean | null
          keys?: Json | null
          p256dh?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean | null
          keys?: Json | null
          p256dh?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ranking_events: {
        Row: {
          city: string | null
          created_at: string | null
          device_type: string | null
          event_name: string | null
          event_type: string | null
          id: string
          intent: string
          metadata: Json | null
          neighborhood: string | null
          position_in_results: number | null
          profile_id: string | null
          recommendation_source: string | null
          session_id: string | null
          therapist_id: string | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          device_type?: string | null
          event_name?: string | null
          event_type?: string | null
          id?: string
          intent?: string
          metadata?: Json | null
          neighborhood?: string | null
          position_in_results?: number | null
          profile_id?: string | null
          recommendation_source?: string | null
          session_id?: string | null
          therapist_id?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          device_type?: string | null
          event_name?: string | null
          event_type?: string | null
          id?: string
          intent?: string
          metadata?: Json | null
          neighborhood?: string | null
          position_in_results?: number | null
          profile_id?: string | null
          recommendation_source?: string | null
          session_id?: string | null
          therapist_id?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_events_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          premium_months_earned: number
          referral_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          premium_months_earned?: number
          referral_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          premium_months_earned?: number
          referral_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_signups: {
        Row: {
          created_at: string
          id: string
          paid_at: string | null
          payment_fingerprint: string | null
          payment_status: string
          qualified_at: string | null
          referral_code_id: string
          referred_user_id: string
          referrer_user_id: string
          revocation_reason: string | null
          revoked_at: string | null
          reward_months: number
          rewarded_at: string | null
          risk_reasons: string[]
          risk_score: number
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_fingerprint?: string | null
          payment_status?: string
          qualified_at?: string | null
          referral_code_id: string
          referred_user_id: string
          referrer_user_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          reward_months?: number
          rewarded_at?: string | null
          risk_reasons?: string[]
          risk_score?: number
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_fingerprint?: string | null
          payment_status?: string
          qualified_at?: string | null
          referral_code_id?: string
          referred_user_id?: string
          referrer_user_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          reward_months?: number
          rewarded_at?: string | null
          risk_reasons?: string[]
          risk_score?: number
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_signups_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_email: string | null
          client_id: string | null
          content: string | null
          created_at: string
          helpful_count: number
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          profile_id: string | null
          rating: number | null
          review_date: string | null
          review_text: string | null
          reviewer_name: string | null
          source_platform: string | null
          status: string | null
          therapist_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_id?: string | null
          content?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
          source_platform?: string | null
          status?: string | null
          therapist_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_id?: string | null
          content?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          profile_id?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: string | null
          source_platform?: string | null
          status?: string | null
          therapist_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      runtime_config: {
        Row: {
          is_secret: boolean
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          is_secret?: boolean
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          is_secret?: boolean
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          city: string | null
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          state: string | null
          user_ip: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          state?: string | null
          user_ip?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          state?: string | null
          user_ip?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          client_user_id: string | null
          created_at: string
          filters: Json | null
          id: string
          query: string | null
          result_count: number | null
          results_count: number | null
          searched_at: string
          user_id: string | null
        }
        Insert: {
          client_user_id?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string | null
          result_count?: number | null
          results_count?: number | null
          searched_at?: string
          user_id?: string | null
        }
        Update: {
          client_user_id?: string | null
          created_at?: string
          filters?: Json | null
          id?: string
          query?: string | null
          result_count?: number | null
          results_count?: number | null
          searched_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          allow_public_profiles: boolean
          billing_email: string
          id: string
          key: string | null
          legal_email: string
          maintenance_mode: boolean
          max_elite_photos: number
          max_free_photos: number
          max_pro_photos: number
          max_standard_photos: number
          require_identity_verification: boolean
          require_manual_profile_review: boolean
          require_photo_review: boolean
          require_text_verification: boolean
          signup_enabled: boolean
          support_email: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          allow_public_profiles?: boolean
          billing_email?: string
          id?: string
          key?: string | null
          legal_email?: string
          maintenance_mode?: boolean
          max_elite_photos?: number
          max_free_photos?: number
          max_pro_photos?: number
          max_standard_photos?: number
          require_identity_verification?: boolean
          require_manual_profile_review?: boolean
          require_photo_review?: boolean
          require_text_verification?: boolean
          signup_enabled?: boolean
          support_email?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          allow_public_profiles?: boolean
          billing_email?: string
          id?: string
          key?: string | null
          legal_email?: string
          maintenance_mode?: boolean
          max_elite_photos?: number
          max_free_photos?: number
          max_pro_photos?: number
          max_standard_photos?: number
          require_identity_verification?: boolean
          require_manual_profile_review?: boolean
          require_photo_review?: boolean
          require_text_verification?: boolean
          signup_enabled?: boolean
          support_email?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      sms_follow_up_alerts: {
        Row: {
          client_phone: string
          created_at: string | null
          id: string
          last_inbound_at: string | null
          last_outbound_at: string
          our_phone: string
          profile_id: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          client_phone: string
          created_at?: string | null
          id?: string
          last_inbound_at?: string | null
          last_outbound_at: string
          our_phone: string
          profile_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          client_phone?: string
          created_at?: string | null
          id?: string
          last_inbound_at?: string | null
          last_outbound_at?: string
          our_phone?: string
          profile_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_follow_up_alerts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sms_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          body: string
          booking_inquiry_id: string | null
          created_at: string | null
          direction: string
          from_number: string
          id: string
          intent: string | null
          is_manual: boolean
          profile_id: string | null
          status: string | null
          to_number: string
          twilio_sid: string | null
        }
        Insert: {
          body: string
          booking_inquiry_id?: string | null
          created_at?: string | null
          direction: string
          from_number: string
          id?: string
          intent?: string | null
          is_manual?: boolean
          profile_id?: string | null
          status?: string | null
          to_number: string
          twilio_sid?: string | null
        }
        Update: {
          body?: string
          booking_inquiry_id?: string | null
          created_at?: string | null
          direction?: string
          from_number?: string
          id?: string
          intent?: string | null
          is_manual?: boolean
          profile_id?: string | null
          status?: string | null
          to_number?: string
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_booking_inquiry_id_fkey"
            columns: ["booking_inquiry_id"]
            isOneToOne: false
            referencedRelation: "booking_inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "sms_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_profiles: {
        Row: {
          alert_phone: string | null
          arrival_date: string | null
          availability_mode: string
          couples_available: boolean
          created_at: string | null
          custom_instructions: string | null
          departure_date: string | null
          id: string
          outcall_area: string | null
          outcall_available: boolean
          pricing_60: string | null
          pricing_90: string | null
          pricing_couples: string | null
          profile_id: string
          ready_to_reply: boolean
          twilio_number: string | null
          updated_at: string | null
        }
        Insert: {
          alert_phone?: string | null
          arrival_date?: string | null
          availability_mode?: string
          couples_available?: boolean
          created_at?: string | null
          custom_instructions?: string | null
          departure_date?: string | null
          id?: string
          outcall_area?: string | null
          outcall_available?: boolean
          pricing_60?: string | null
          pricing_90?: string | null
          pricing_couples?: string | null
          profile_id: string
          ready_to_reply?: boolean
          twilio_number?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_phone?: string | null
          arrival_date?: string | null
          availability_mode?: string
          couples_available?: boolean
          created_at?: string | null
          custom_instructions?: string | null
          departure_date?: string | null
          id?: string
          outcall_area?: string | null
          outcall_available?: boolean
          pricing_60?: string | null
          pricing_90?: string | null
          pricing_couples?: string | null
          profile_id?: string
          ready_to_reply?: boolean
          twilio_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          event_type: string
          failed_at: string | null
          id: string
          payload: Json
          processed_at: string
          processing_error: string | null
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          failed_at?: string | null
          id?: string
          payload: Json
          processed_at?: string
          processing_error?: string | null
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          failed_at?: string | null
          id?: string
          payload?: Json
          processed_at?: string
          processing_error?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string
          can_feature: boolean
          can_publish: boolean
          code: string
          created_at: string
          currency: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_photos: number
          name: string
          price_cents: number
          priority_rank: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          can_feature?: boolean
          can_publish?: boolean
          code: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_photos?: number
          name: string
          price_cents?: number
          priority_rank?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          can_feature?: boolean
          can_publish?: boolean
          code?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_photos?: number
          name?: string
          price_cents?: number
          priority_rank?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          profile_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          profile_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          profile_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          body: string
          created_at: string
          external_id: string | null
          id: string
          sender_id: string
          sender_role: string
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          external_id?: string | null
          id?: string
          sender_id: string
          sender_role?: string
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          external_id?: string | null
          id?: string
          sender_id?: string
          sender_role?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          call_customer_number: string | null
          call_direction: string | null
          call_duration_seconds: number | null
          call_ended_at: string | null
          call_ended_reason: string | null
          call_recording_consent_granted: boolean
          call_recording_url: string | null
          call_started_at: string | null
          call_summary: string | null
          call_transcript: string | null
          category: string
          created_at: string
          id: string
          import_migration_id: string | null
          priority: string
          profile_id: string | null
          resolved_at: string | null
          source: string
          status: string
          subject: string
          updated_at: string
          user_id: string
          vapi_call_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          call_customer_number?: string | null
          call_direction?: string | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_ended_reason?: string | null
          call_recording_consent_granted?: boolean
          call_recording_url?: string | null
          call_started_at?: string | null
          call_summary?: string | null
          call_transcript?: string | null
          category?: string
          created_at?: string
          id?: string
          import_migration_id?: string | null
          priority?: string
          profile_id?: string | null
          resolved_at?: string | null
          source?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
          vapi_call_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          call_customer_number?: string | null
          call_direction?: string | null
          call_duration_seconds?: number | null
          call_ended_at?: string | null
          call_ended_reason?: string | null
          call_recording_consent_granted?: boolean
          call_recording_url?: string | null
          call_started_at?: string | null
          call_summary?: string | null
          call_transcript?: string | null
          category?: string
          created_at?: string
          id?: string
          import_migration_id?: string | null
          priority?: string
          profile_id?: string | null
          resolved_at?: string | null
          source?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_import_migration_id_fkey"
            columns: ["import_migration_id"]
            isOneToOne: false
            referencedRelation: "profile_migrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      text_verifications: {
        Row: {
          attempt_count: number
          code: string | null
          created_at: string
          expires_at: string | null
          id: string
          phone: string | null
          profile_id: string | null
          provider: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sent_at: string | null
          status: string
          submitted_text: string | null
          updated_at: string
          user_id: string | null
          verification_code: string | null
          verified_at: string | null
        }
        Insert: {
          attempt_count?: number
          code?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          phone?: string | null
          profile_id?: string | null
          provider?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status?: string
          submitted_text?: string | null
          updated_at?: string
          user_id?: string | null
          verification_code?: string | null
          verified_at?: string | null
        }
        Update: {
          attempt_count?: number
          code?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          phone?: string | null
          profile_id?: string | null
          provider?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          status?: string
          submitted_text?: string | null
          updated_at?: string
          user_id?: string | null
          verification_code?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "text_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "text_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "text_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "text_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "text_verifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_availability: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string | null
          id: string
          is_available: boolean
          profile_id: string | null
          start_time: string | null
          therapist_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          is_available?: boolean
          profile_id?: string | null
          start_time?: string | null
          therapist_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string | null
          id?: string
          is_available?: boolean
          profile_id?: string | null
          start_time?: string | null
          therapist_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "therapist_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_availability_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_availability_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_learning_scores: {
        Row: {
          city: string | null
          contact_clicks: number | null
          contact_rate: number | null
          created_at: string | null
          ctr: number | null
          id: string
          impressions: number | null
          intent: string | null
          intent_conversion_rate: number
          profile_clicks: number | null
          profile_id: string | null
          score: number | null
          score_30d: number
          score_7d: number
          therapist_id: string | null
          updated_at: string | null
          weighted_score: number | null
        }
        Insert: {
          city?: string | null
          contact_clicks?: number | null
          contact_rate?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          intent?: string | null
          intent_conversion_rate?: number
          profile_clicks?: number | null
          profile_id?: string | null
          score?: number | null
          score_30d?: number
          score_7d?: number
          therapist_id?: string | null
          updated_at?: string | null
          weighted_score?: number | null
        }
        Update: {
          city?: string | null
          contact_clicks?: number | null
          contact_rate?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          intent?: string | null
          intent_conversion_rate?: number
          profile_clicks?: number | null
          profile_id?: string | null
          score?: number | null
          score_30d?: number
          score_7d?: number
          therapist_id?: string | null
          updated_at?: string | null
          weighted_score?: number | null
        }
        Relationships: []
      }
      therapist_locations: {
        Row: {
          city: string
          city_slug: string
          country: string
          created_at: string
          id: string
          is_primary: boolean
          is_visible: boolean
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          state: string | null
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          city: string
          city_slug: string
          country?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          is_visible?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          state?: string | null
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          city?: string
          city_slug?: string
          country?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          is_visible?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          state?: string | null
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      therapist_photos: {
        Row: {
          alt_text: string | null
          approval_status: string
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          is_primary: boolean
          main_profile_id: string | null
          mime_type: string | null
          moderation_confidence: number | null
          moderation_notes: string | null
          photo_type: string | null
          profile_id: string | null
          public_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sort_order: number
          status: string | null
          storage_path: string
          therapist_profile_id: string
          updated_at: string
          user_id: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          approval_status?: string
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean
          main_profile_id?: string | null
          mime_type?: string | null
          moderation_confidence?: number | null
          moderation_notes?: string | null
          photo_type?: string | null
          profile_id?: string | null
          public_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number
          status?: string | null
          storage_path: string
          therapist_profile_id: string
          updated_at?: string
          user_id?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          approval_status?: string
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          is_primary?: boolean
          main_profile_id?: string | null
          mime_type?: string | null
          moderation_confidence?: number | null
          moderation_notes?: string | null
          photo_type?: string | null
          profile_id?: string | null
          public_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sort_order?: number
          status?: string | null
          storage_path?: string
          therapist_profile_id?: string
          updated_at?: string
          user_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_photos_main_profile_id_fkey"
            columns: ["main_profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "therapist_photos_main_profile_id_fkey"
            columns: ["main_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_photos_main_profile_id_fkey"
            columns: ["main_profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_photos_main_profile_id_fkey"
            columns: ["main_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_photos_main_profile_id_fkey"
            columns: ["main_profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_pricing: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          duration_minutes: number
          id: string
          is_visible: boolean
          price_cents: number
          profile_id: string | null
          session_type: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_visible?: boolean
          price_cents: number
          profile_id?: string | null
          session_type: string
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_visible?: boolean
          price_cents?: number
          profile_id?: string | null
          session_type?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_pricing_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "therapist_pricing_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_pricing_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_pricing_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_pricing_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_profiles: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      therapist_services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_visible: boolean
          profile_id: string | null
          service_name: string
          sort_order: number
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          profile_id?: string | null
          service_name: string
          sort_order?: number
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_visible?: boolean
          profile_id?: string | null
          service_name?: string
          sort_order?: number
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "therapist_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          profile_id: string | null
          provider: string | null
          provider_subscription_id: string | null
          status: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          profile_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          profile_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          bio: string | null
          city: string | null
          city_id: string | null
          contact_email: string | null
          created_at: string
          display_name: string | null
          gallery: string[] | null
          gay_friendly: boolean | null
          id: string
          incall: boolean | null
          inclusive: boolean | null
          keyword_slugs: string[]
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          modalities: string[]
          outcall: boolean | null
          phone: string | null
          photo_url: string | null
          price_range: string | null
          profile_completeness: number | null
          segments: string[]
          slug: string | null
          state: string | null
          status: string | null
          tier: string
          updated_at: string
          user_id: string | null
          view_count: number
          website: string | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          city_id?: string | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          gallery?: string[] | null
          gay_friendly?: boolean | null
          id?: string
          incall?: boolean | null
          inclusive?: boolean | null
          keyword_slugs?: string[]
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          modalities?: string[]
          outcall?: boolean | null
          phone?: string | null
          photo_url?: string | null
          price_range?: string | null
          profile_completeness?: number | null
          segments?: string[]
          slug?: string | null
          state?: string | null
          status?: string | null
          tier?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
          website?: string | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          city_id?: string | null
          contact_email?: string | null
          created_at?: string
          display_name?: string | null
          gallery?: string[] | null
          gay_friendly?: boolean | null
          id?: string
          incall?: boolean | null
          inclusive?: boolean | null
          keyword_slugs?: string[]
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          modalities?: string[]
          outcall?: boolean | null
          phone?: string | null
          photo_url?: string | null
          price_range?: string | null
          profile_completeness?: number | null
          segments?: string[]
          slug?: string | null
          state?: string | null
          status?: string | null
          tier?: string
          updated_at?: string
          user_id?: string | null
          view_count?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapists_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_feedback_responses: {
        Row: {
          additional_comments: string | null
          best_contact_time: string | null
          confidentiality_acknowledged: boolean
          contact_requested: boolean
          continue_likelihood: string
          created_at: string
          email: string
          email_notification_id: string | null
          email_notification_status: string
          email_notified_at: string | null
          first_name: string
          id: string
          improvement_request: string | null
          ip_hash: string | null
          most_useful: string
          overall_rating: string
          phone: string | null
          preferred_contact_method: string | null
          problems_or_missing: string | null
          profile_experience: string
          seo_understanding: string
          user_agent: string | null
        }
        Insert: {
          additional_comments?: string | null
          best_contact_time?: string | null
          confidentiality_acknowledged?: boolean
          contact_requested?: boolean
          continue_likelihood: string
          created_at?: string
          email: string
          email_notification_id?: string | null
          email_notification_status?: string
          email_notified_at?: string | null
          first_name: string
          id?: string
          improvement_request?: string | null
          ip_hash?: string | null
          most_useful: string
          overall_rating: string
          phone?: string | null
          preferred_contact_method?: string | null
          problems_or_missing?: string | null
          profile_experience: string
          seo_understanding: string
          user_agent?: string | null
        }
        Update: {
          additional_comments?: string | null
          best_contact_time?: string | null
          confidentiality_acknowledged?: boolean
          contact_requested?: boolean
          continue_likelihood?: string
          created_at?: string
          email?: string
          email_notification_id?: string | null
          email_notification_status?: string
          email_notified_at?: string | null
          first_name?: string
          id?: string
          improvement_request?: string | null
          ip_hash?: string | null
          most_useful?: string
          overall_rating?: string
          phone?: string | null
          preferred_contact_method?: string | null
          problems_or_missing?: string | null
          profile_experience?: string
          seo_understanding?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      upgrade_opportunities: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          opportunity_type: string
          reason: string | null
          score: number
          status: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          opportunity_type: string
          reason?: string | null
          score?: number
          status?: string
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          opportunity_type?: string
          reason?: string | null
          score?: number
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_mfa: {
        Row: {
          backup_codes: string[]
          enabled_at: string
          id: string
          totp_secret: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes: string[]
          enabled_at: string
          id?: string
          totp_secret: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[]
          enabled_at?: string
          id?: string
          totp_secret?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          marketing_enabled: boolean | null
          phone_e164: string | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing_enabled?: boolean | null
          phone_e164?: string | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          marketing_enabled?: boolean | null
          phone_e164?: string | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_suspensions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          duration_days: number | null
          ends_at: string | null
          id: string
          reason: string | null
          reason_detail: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          reason?: string | null
          reason_detail?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          reason?: string | null
          reason_detail?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      vapi_sms_sessions: {
        Row: {
          assistant_id: string
          created_at: string
          from_number: string
          id: string
          last_chat_id: string
          to_number: string
          updated_at: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          from_number: string
          id?: string
          last_chat_id: string
          to_number: string
          updated_at?: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          from_number?: string
          id?: string
          last_chat_id?: string
          to_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      visibility_addons: {
        Row: {
          addon_type: string
          city_slug: string | null
          created_at: string
          ends_at: string | null
          id: string
          priority_rank: number
          starts_at: string
          status: string
          therapist_profile_id: string
          updated_at: string
        }
        Insert: {
          addon_type: string
          city_slug?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          priority_rank?: number
          starts_at?: string
          status?: string
          therapist_profile_id: string
          updated_at?: string
        }
        Update: {
          addon_type?: string
          city_slug?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          priority_rank?: number
          starts_at?: string
          status?: string
          therapist_profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_events: {
        Row: {
          created_at: string
          email: string | null
          event_name: string
          id: string
          metadata: Json
          normalized_email: string | null
          page_path: string | null
          referrer: string | null
          source: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_name: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          page_path?: string | null
          referrer?: string | null
          source?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_name?: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          page_path?: string | null
          referrer?: string | null
          source?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      waitlist_rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string
          fingerprint: string
          id: string | null
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          fingerprint: string
          id?: string | null
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          fingerprint?: string
          id?: string | null
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          campaign: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          metadata: Json
          normalized_email: string | null
          page_path: string | null
          referrer: string | null
          role: string
          source: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          campaign?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          page_path?: string | null
          referrer?: string | null
          role?: string
          source?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          campaign?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json
          normalized_email?: string | null
          page_path?: string | null
          referrer?: string | null
          role?: string
          source?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      waitlist_voice_ai: {
        Row: {
          created_at: string
          id: string
          plan_tier: string
          profile_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_tier?: string
          profile_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_tier?: string
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_voice_ai_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "ai_profile_coach_source"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "waitlist_voice_ai_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_voice_ai_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles_private"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_voice_ai_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_voice_ai_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_therapists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_profile_coach_source: {
        Row: {
          accepts_all_genders: boolean | null
          affiliations: string[] | null
          approved_photo_count: number | null
          areas_served: string[] | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          average_search_position: number | null
          bio: string | null
          business_trips: Json | null
          certifications: string | null
          city: string | null
          completion_percentage: number | null
          completion_score: number | null
          contact_clicks: number | null
          contact_clicks_1d: number | null
          contact_clicks_30d: number | null
          contact_clicks_7d: number | null
          country: string | null
          current_period_end: string | null
          display_name: string | null
          education_entries: Json | null
          favorites_7d: number | null
          featured_until: string | null
          headline: string | null
          incall: boolean | null
          incall_amenities: string[] | null
          incall_price: number | null
          inquiries_7d: number | null
          inquiry_count: number | null
          is_featured: boolean | null
          is_verified_email: boolean | null
          is_verified_identity: boolean | null
          is_verified_phone: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          languages: string[] | null
          languages_spoken: string[] | null
          last_seen_at: string | null
          lgbtq_affirming: boolean | null
          local_demand_score: number | null
          local_demand_trend: string | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          mobile_extras: string[] | null
          modalities: string[] | null
          neighborhood: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall: boolean | null
          outcall_price: number | null
          payment_methods: string[] | null
          photo_url: string | null
          pricing_sessions: Json | null
          products_used: string[] | null
          profile_completeness: number | null
          profile_completion_score: number | null
          profile_id: string | null
          profile_status: string | null
          profile_views: number | null
          profile_views_1d: number | null
          profile_views_30d: number | null
          profile_views_7d: number | null
          rates: Json | null
          recipient_email: string | null
          review_count: number | null
          service_categories: string[] | null
          session_lengths: number[] | null
          slug: string | null
          specialties: string[] | null
          starting_price: number | null
          starting_rate: number | null
          state: string | null
          studio_amenities: string[] | null
          subscription_current_period_end: string | null
          subscription_current_period_start: string | null
          subscription_status: string | null
          subscription_tier: string | null
          tagline: string | null
          training: string | null
          travel_schedule: Json | null
          updated_at: string | null
          verification_status: string | null
          view_count: number | null
          visibility_status: string | null
          years_experience: number | null
        }
        Insert: {
          accepts_all_genders?: boolean | null
          affiliations?: string[] | null
          approved_photo_count?: never
          areas_served?: string[] | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          average_search_position?: never
          bio?: string | null
          business_trips?: Json | null
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number | null
          contact_clicks_1d?: never
          contact_clicks_30d?: never
          contact_clicks_7d?: never
          country?: string | null
          current_period_end?: string | null
          display_name?: never
          education_entries?: Json | null
          favorites_7d?: never
          featured_until?: string | null
          headline?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
          incall_price?: number | null
          inquiries_7d?: never
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_seen_at?: string | null
          lgbtq_affirming?: boolean | null
          local_demand_score?: never
          local_demand_trend?: never
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          mobile_extras?: string[] | null
          modalities?: string[] | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          photo_url?: string | null
          pricing_sessions?: Json | null
          products_used?: string[] | null
          profile_completeness?: number | null
          profile_completion_score?: number | null
          profile_id?: string | null
          profile_status?: string | null
          profile_views?: number | null
          profile_views_1d?: never
          profile_views_30d?: never
          profile_views_7d?: never
          rates?: Json | null
          recipient_email?: never
          review_count?: number | null
          service_categories?: string[] | null
          session_lengths?: number[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          studio_amenities?: string[] | null
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          training?: string | null
          travel_schedule?: Json | null
          updated_at?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_status?: string | null
          years_experience?: number | null
        }
        Update: {
          accepts_all_genders?: boolean | null
          affiliations?: string[] | null
          approved_photo_count?: never
          areas_served?: string[] | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          average_search_position?: never
          bio?: string | null
          business_trips?: Json | null
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number | null
          contact_clicks_1d?: never
          contact_clicks_30d?: never
          contact_clicks_7d?: never
          country?: string | null
          current_period_end?: string | null
          display_name?: never
          education_entries?: Json | null
          favorites_7d?: never
          featured_until?: string | null
          headline?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
          incall_price?: number | null
          inquiries_7d?: never
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_seen_at?: string | null
          lgbtq_affirming?: boolean | null
          local_demand_score?: never
          local_demand_trend?: never
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          mobile_extras?: string[] | null
          modalities?: string[] | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          photo_url?: string | null
          pricing_sessions?: Json | null
          products_used?: string[] | null
          profile_completeness?: number | null
          profile_completion_score?: number | null
          profile_id?: string | null
          profile_status?: string | null
          profile_views?: number | null
          profile_views_1d?: never
          profile_views_30d?: never
          profile_views_7d?: never
          rates?: Json | null
          recipient_email?: never
          review_count?: number | null
          service_categories?: string[] | null
          session_lengths?: number[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          studio_amenities?: string[] | null
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          training?: string | null
          travel_schedule?: Json | null
          updated_at?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      provider_profiles_private: {
        Row: {
          _tier: string | null
          accepts_all_genders: boolean | null
          accessibility_features: string[] | null
          account_status: string | null
          add_ons: Json | null
          additional_services: string[] | null
          admin_notes: string | null
          affiliations: string[] | null
          age_conduct_attested_at: string | null
          approved_at: string | null
          approved_by: string | null
          areas_served: string[] | null
          availability_note: string | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          banned_reason: string | null
          bio: string | null
          body_type: string | null
          booking_link: string | null
          booking_platform: string | null
          booking_url: string | null
          boost_score: number | null
          business_hours: Json | null
          business_trips: Json | null
          canonical_city_slug: string | null
          certifications: string | null
          city: string | null
          completion_percentage: number | null
          completion_score: number | null
          contact_clicks: number | null
          country: string | null
          created_at: string | null
          current_period_end: string | null
          current_status: string | null
          custom_faq: Json | null
          day_of_week_discount: Json | null
          display_name: string | null
          education: string | null
          education_entries: Json | null
          email: string | null
          email_address: string | null
          featured_until: string | null
          full_name: string | null
          gender: string | null
          headline: string | null
          height_inches: number | null
          id: string | null
          identity_verified_at: string | null
          incall: boolean | null
          incall_amenities: string[] | null
          incall_details: string | null
          incall_price: number | null
          inquiry_count: number | null
          is_active: boolean | null
          is_banned: boolean | null
          is_demo: boolean | null
          is_featured: boolean | null
          is_suspended: boolean | null
          is_verified_email: boolean | null
          is_verified_identity: boolean | null
          is_verified_phone: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          keyword_slugs: string[] | null
          languages: string[] | null
          languages_spoken: string[] | null
          last_active_at: string | null
          last_seen_at: string | null
          latitude: number | null
          lgbtq_affirming: boolean | null
          location_marker_type: string | null
          location_type: string | null
          longitude: number | null
          map_enabled: boolean | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          mobile_extras: string[] | null
          mobile_hours: Json | null
          modalities: string[] | null
          modality: string | null
          moderation_notes: string | null
          moderation_status: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall: boolean | null
          outcall_details: string | null
          outcall_price: number | null
          outcall_radius: number | null
          outcall_radius_miles: number | null
          payment_methods: string[] | null
          phone: string | null
          phone_number: string | null
          photo_limit: number | null
          photo_url: string | null
          presentation_video_url: string | null
          price_max: number | null
          price_min: number | null
          pricing_sessions: Json | null
          primary_area: string | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_completeness: number | null
          profile_completion_score: number | null
          profile_status: string | null
          profile_views: number | null
          promotions: Json | null
          rate_disclaimers: string[] | null
          rates: Json | null
          rating_average: number | null
          regular_discounts: Json | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string | null
          segments: string[] | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_categories: string[] | null
          service_radius_km: number | null
          service_radius_miles: number | null
          session_duration: number | null
          session_lengths: number[] | null
          show_email: boolean | null
          show_phone: boolean | null
          slug: string | null
          social_media: Json | null
          specialties: string[] | null
          specialty: string | null
          start_date: string | null
          start_year: number | null
          starting_price: number | null
          starting_rate: number | null
          state: string | null
          status: string | null
          street_reference: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_verification_session_id: string | null
          studio_amenities: string[] | null
          studio_hours: Json | null
          submitted_at: string | null
          subscription_cancel_at_period_end: boolean | null
          subscription_current_period_end: string | null
          subscription_current_period_start: string | null
          subscription_plan: string | null
          subscription_status: string | null
          subscription_tier: string | null
          suspension_reason: string | null
          tagline: string | null
          terms_accepted_at: string | null
          tier: string | null
          training: string | null
          travel_destination: string | null
          travel_schedule: Json | null
          traveling: boolean | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          view_count: number | null
          visibility_level: number | null
          visibility_status: string | null
          visiting: boolean | null
          website: string | null
          weekly_special: Json | null
          weight_lb: number | null
          whatsapp: string | null
          whatsapp_number: string | null
          years_experience: number | null
          zip_code: string | null
        }
        Insert: {
          _tier?: string | null
          accepts_all_genders?: boolean | null
          accessibility_features?: string[] | null
          account_status?: string | null
          add_ons?: Json | null
          additional_services?: string[] | null
          admin_notes?: string | null
          affiliations?: string[] | null
          age_conduct_attested_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          availability_note?: string | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_link?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          boost_score?: number | null
          business_hours?: Json | null
          business_trips?: Json | null
          canonical_city_slug?: string | null
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number | null
          country?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_status?: string | null
          custom_faq?: Json | null
          day_of_week_discount?: Json | null
          display_name?: string | null
          education?: string | null
          education_entries?: Json | null
          email?: string | null
          email_address?: string | null
          featured_until?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          identity_verified_at?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
          incall_details?: string | null
          incall_price?: number | null
          inquiry_count?: number | null
          is_active?: boolean | null
          is_banned?: boolean | null
          is_demo?: boolean | null
          is_featured?: boolean | null
          is_suspended?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          last_seen_at?: string | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          location_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          mobile_extras?: string[] | null
          mobile_hours?: Json | null
          modalities?: string[] | null
          modality?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_details?: string | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          photo_limit?: number | null
          photo_url?: string | null
          presentation_video_url?: string | null
          price_max?: number | null
          price_min?: number | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completeness?: number | null
          profile_completion_score?: number | null
          profile_status?: string | null
          profile_views?: number | null
          promotions?: Json | null
          rate_disclaimers?: string[] | null
          rates?: Json | null
          rating_average?: number | null
          regular_discounts?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          segments?: string[] | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          service_radius_km?: number | null
          service_radius_miles?: number | null
          session_duration?: number | null
          session_lengths?: number[] | null
          show_email?: boolean | null
          show_phone?: boolean | null
          slug?: string | null
          social_media?: Json | null
          specialties?: string[] | null
          specialty?: string | null
          start_date?: string | null
          start_year?: number | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          status?: string | null
          street_reference?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
          studio_amenities?: string[] | null
          studio_hours?: Json | null
          submitted_at?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          terms_accepted_at?: string | null
          tier?: string | null
          training?: string | null
          travel_destination?: string | null
          travel_schedule?: Json | null
          traveling?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_level?: number | null
          visibility_status?: string | null
          visiting?: boolean | null
          website?: string | null
          weekly_special?: Json | null
          weight_lb?: number | null
          whatsapp?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Update: {
          _tier?: string | null
          accepts_all_genders?: boolean | null
          accessibility_features?: string[] | null
          account_status?: string | null
          add_ons?: Json | null
          additional_services?: string[] | null
          admin_notes?: string | null
          affiliations?: string[] | null
          age_conduct_attested_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          areas_served?: string[] | null
          availability_note?: string | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          banned_reason?: string | null
          bio?: string | null
          body_type?: string | null
          booking_link?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          boost_score?: number | null
          business_hours?: Json | null
          business_trips?: Json | null
          canonical_city_slug?: string | null
          certifications?: string | null
          city?: string | null
          completion_percentage?: number | null
          completion_score?: number | null
          contact_clicks?: number | null
          country?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_status?: string | null
          custom_faq?: Json | null
          day_of_week_discount?: Json | null
          display_name?: string | null
          education?: string | null
          education_entries?: Json | null
          email?: string | null
          email_address?: string | null
          featured_until?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          identity_verified_at?: string | null
          incall?: boolean | null
          incall_amenities?: string[] | null
          incall_details?: string | null
          incall_price?: number | null
          inquiry_count?: number | null
          is_active?: boolean | null
          is_banned?: boolean | null
          is_demo?: boolean | null
          is_featured?: boolean | null
          is_suspended?: boolean | null
          is_verified_email?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_phone?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          languages_spoken?: string[] | null
          last_active_at?: string | null
          last_seen_at?: string | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          location_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          mobile_extras?: string[] | null
          mobile_hours?: Json | null
          modalities?: string[] | null
          modality?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          neighborhood?: string | null
          neighborhood_name?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall?: boolean | null
          outcall_details?: string | null
          outcall_price?: number | null
          outcall_radius?: number | null
          outcall_radius_miles?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_number?: string | null
          photo_limit?: number | null
          photo_url?: string | null
          presentation_video_url?: string | null
          price_max?: number | null
          price_min?: number | null
          pricing_sessions?: Json | null
          primary_area?: string | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completeness?: number | null
          profile_completion_score?: number | null
          profile_status?: string | null
          profile_views?: number | null
          promotions?: Json | null
          rate_disclaimers?: string[] | null
          rates?: Json | null
          rating_average?: number | null
          regular_discounts?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string | null
          segments?: string[] | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          service_categories?: string[] | null
          service_radius_km?: number | null
          service_radius_miles?: number | null
          session_duration?: number | null
          session_lengths?: number[] | null
          show_email?: boolean | null
          show_phone?: boolean | null
          slug?: string | null
          social_media?: Json | null
          specialties?: string[] | null
          specialty?: string | null
          start_date?: string | null
          start_year?: number | null
          starting_price?: number | null
          starting_rate?: number | null
          state?: string | null
          status?: string | null
          street_reference?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_verification_session_id?: string | null
          studio_amenities?: string[] | null
          studio_hours?: Json | null
          submitted_at?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_current_period_start?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          suspension_reason?: string | null
          tagline?: string | null
          terms_accepted_at?: string | null
          tier?: string | null
          training?: string | null
          travel_destination?: string | null
          travel_schedule?: Json | null
          traveling?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_level?: number | null
          visibility_status?: string | null
          visiting?: boolean | null
          website?: string | null
          weekly_special?: Json | null
          weight_lb?: number | null
          whatsapp?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      public_imported_reviews: {
        Row: {
          created_at: string | null
          id: string | null
          imported_at: string | null
          profile_id: string | null
          public_label: string | null
          rating: number | null
          review_date: string | null
          review_text: string | null
          reviewer_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          imported_at?: string | null
          profile_id?: string | null
          public_label?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: never
        }
        Update: {
          created_at?: string | null
          id?: string | null
          imported_at?: string | null
          profile_id?: string | null
          public_label?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string | null
          reviewer_name?: never
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          add_ons: Json | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          body_type: string | null
          business_hours: Json | null
          canonical_city_slug: string | null
          city: string | null
          contact_clicks: number | null
          created_at: string | null
          custom_faq: Json | null
          display_name: string | null
          full_name: string | null
          has_website: boolean | null
          has_whatsapp: boolean | null
          headline: string | null
          height_inches: number | null
          id: string | null
          incall_price: number | null
          is_banned: boolean | null
          is_featured: boolean | null
          is_suspended: boolean | null
          languages: string[] | null
          latitude: number | null
          lgbtq_affirming: boolean | null
          longitude: number | null
          massage_techniques: string[] | null
          modalities: string[] | null
          neighborhood: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall_price: number | null
          outcall_radius_miles: number | null
          photo_url: string | null
          presentation_video_url: string | null
          pricing_sessions: Json | null
          profile_completeness: number | null
          profile_views: number | null
          review_count: number | null
          service_categories: string[] | null
          show_email: boolean | null
          show_phone: boolean | null
          slug: string | null
          specialties: string[] | null
          start_year: number | null
          starting_price: number | null
          state: string | null
          status: string | null
          subscription_status: string | null
          subscription_tier: string | null
          travel_schedule: Json | null
          updated_at: string | null
          verification_status: string | null
          visibility_status: string | null
          weight_lb: number | null
          years_experience: number | null
        }
        Insert: {
          add_ons?: Json | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          body_type?: string | null
          business_hours?: Json | null
          canonical_city_slug?: string | null
          city?: string | null
          contact_clicks?: number | null
          created_at?: string | null
          custom_faq?: Json | null
          display_name?: string | null
          full_name?: string | null
          has_website?: never
          has_whatsapp?: never
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          incall_price?: number | null
          is_banned?: boolean | null
          is_featured?: boolean | null
          is_suspended?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          longitude?: number | null
          massage_techniques?: string[] | null
          modalities?: string[] | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall_price?: number | null
          outcall_radius_miles?: number | null
          photo_url?: string | null
          presentation_video_url?: string | null
          pricing_sessions?: Json | null
          profile_completeness?: number | null
          profile_views?: number | null
          review_count?: number | null
          service_categories?: string[] | null
          show_email?: boolean | null
          show_phone?: boolean | null
          slug?: string | null
          specialties?: string[] | null
          start_year?: number | null
          starting_price?: number | null
          state?: string | null
          status?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          travel_schedule?: Json | null
          updated_at?: string | null
          verification_status?: string | null
          visibility_status?: string | null
          weight_lb?: number | null
          years_experience?: number | null
        }
        Update: {
          add_ons?: Json | null
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          body_type?: string | null
          business_hours?: Json | null
          canonical_city_slug?: string | null
          city?: string | null
          contact_clicks?: number | null
          created_at?: string | null
          custom_faq?: Json | null
          display_name?: string | null
          full_name?: string | null
          has_website?: never
          has_whatsapp?: never
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          incall_price?: number | null
          is_banned?: boolean | null
          is_featured?: boolean | null
          is_suspended?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          longitude?: number | null
          massage_techniques?: string[] | null
          modalities?: string[] | null
          neighborhood?: string | null
          offers_incall?: boolean | null
          offers_outcall?: boolean | null
          outcall_price?: number | null
          outcall_radius_miles?: number | null
          photo_url?: string | null
          presentation_video_url?: string | null
          pricing_sessions?: Json | null
          profile_completeness?: number | null
          profile_views?: number | null
          review_count?: number | null
          service_categories?: string[] | null
          show_email?: boolean | null
          show_phone?: boolean | null
          slug?: string | null
          specialties?: string[] | null
          start_year?: number | null
          starting_price?: number | null
          state?: string | null
          status?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          travel_schedule?: Json | null
          updated_at?: string | null
          verification_status?: string | null
          visibility_status?: string | null
          weight_lb?: number | null
          years_experience?: number | null
        }
        Relationships: []
      }
      public_therapists: {
        Row: {
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          body_type: string | null
          booking_platform: string | null
          booking_url: string | null
          city: string | null
          country: string | null
          display_name: string | null
          email_address: string | null
          full_name: string | null
          gender: string | null
          headline: string | null
          height_inches: number | null
          id: string | null
          incall_price: number | null
          is_featured: boolean | null
          is_verified_identity: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          keyword_slugs: string[] | null
          languages: string[] | null
          latitude: number | null
          lgbtq_affirming: boolean | null
          location_marker_type: string | null
          longitude: number | null
          map_enabled: boolean | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          modalities: string[] | null
          moderation_status: string | null
          neighborhood: string | null
          outcall_price: number | null
          payment_methods: string[] | null
          phone: string | null
          photo_url: string | null
          pricing_sessions: Json | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_completion_score: number | null
          profile_status: string | null
          promotions: Json | null
          review_count: number | null
          segments: string[] | null
          service_categories: string[] | null
          slug: string | null
          specialties: string[] | null
          starting_price: number | null
          state: string | null
          subscription_tier: string | null
          tagline: string | null
          updated_at: string | null
          verification_status: string | null
          view_count: number | null
          visibility_status: string | null
          website: string | null
          weight_lb: number | null
          whatsapp_number: string | null
          years_experience: number | null
          zip_code: string | null
        }
        Insert: {
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          body_type?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          city?: string | null
          country?: string | null
          display_name?: string | null
          email_address?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          incall_price?: number | null
          is_featured?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          modalities?: string[] | null
          moderation_status?: string | null
          neighborhood?: string | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          photo_url?: string | null
          pricing_sessions?: Json | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completion_score?: number | null
          profile_status?: string | null
          promotions?: Json | null
          review_count?: number | null
          segments?: string[] | null
          service_categories?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          state?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          updated_at?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_status?: string | null
          website?: string | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Update: {
          available_now?: boolean | null
          available_now_expires?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          body_type?: string | null
          booking_platform?: string | null
          booking_url?: string | null
          city?: string | null
          country?: string | null
          display_name?: string | null
          email_address?: string | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          height_inches?: number | null
          id?: string | null
          incall_price?: number | null
          is_featured?: boolean | null
          is_verified_identity?: boolean | null
          is_verified_photos?: boolean | null
          is_verified_profile?: boolean | null
          keyword_slugs?: string[] | null
          languages?: string[] | null
          latitude?: number | null
          lgbtq_affirming?: boolean | null
          location_marker_type?: string | null
          longitude?: number | null
          map_enabled?: boolean | null
          massage_setup?: string[] | null
          massage_techniques?: string[] | null
          modalities?: string[] | null
          moderation_status?: string | null
          neighborhood?: string | null
          outcall_price?: number | null
          payment_methods?: string[] | null
          phone?: string | null
          photo_url?: string | null
          pricing_sessions?: Json | null
          products_sold?: string[] | null
          products_used?: string[] | null
          profile_completion_score?: number | null
          profile_status?: string | null
          promotions?: Json | null
          review_count?: number | null
          segments?: string[] | null
          service_categories?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          starting_price?: number | null
          state?: string | null
          subscription_tier?: string | null
          tagline?: string | null
          updated_at?: string | null
          verification_status?: string | null
          view_count?: number | null
          visibility_status?: string | null
          website?: string | null
          weight_lb?: number | null
          whatsapp_number?: string | null
          years_experience?: number | null
          zip_code?: string | null
        }
        Relationships: []
      }
      therapist_analytics_daily: {
        Row: {
          event_count: number | null
          event_date: string | null
          event_name: string | null
          therapist_profile_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_email_cancel_campaign: {
        Args: { p_admin_user_id: string; p_campaign_id: string }
        Returns: number
      }
      admin_email_center_snapshot: {
        Args: { p_limit?: number; p_query?: string }
        Returns: Json
      }
      admin_email_create_campaign: {
        Args: {
          p_admin_user_id: string
          p_body_html: string
          p_body_text: string
          p_cities: string[]
          p_from_address: string
          p_name: string
          p_plans: string[]
          p_profile_statuses: string[]
          p_reply_to: string
          p_scheduled_for: string
          p_send_category: string
          p_states: string[]
          p_subject: string
          p_template_id: string
          p_user_ids: string[]
        }
        Returns: Json
      }
      admin_email_save_template: {
        Args: {
          p_admin_user_id: string
          p_body_html: string
          p_body_text: string
          p_description: string
          p_from_address: string
          p_id: string
          p_name: string
          p_reply_to: string
          p_send_category: string
          p_subject: string
        }
        Returns: string
      }
      ai_profile_coach_build_snapshot: {
        Args: { p_profile_id: string; p_snapshot_date?: string }
        Returns: string
      }
      ai_profile_coach_queue_due_emails: { Args: never; Returns: number }
      ai_profile_coach_render_email: {
        Args: { p_snapshot_id: string }
        Returns: string
      }
      assert_service_role_caller: { Args: never; Returns: undefined }
      award_qualified_referral: {
        Args: { p_signup_id: string }
        Returns: boolean
      }
      calculate_keyword_stats: {
        Args: { p_keyword: string }
        Returns: {
          avg_score: number
          current_score: number
          day_over_day_change: number
          days_tracked: number
          keyword: string
          month_over_month_change: number
          peak_score: number
          week_over_week_change: number
        }[]
      }
      can_send_marketing_email: {
        Args: { p_email: string; p_send_time?: string; p_user_id: string }
        Returns: {
          eligible: boolean
          reason: string
        }[]
      }
      claim_lifecycle_queue_batch: {
        Args: { p_limit?: number }
        Returns: {
          body_html: string | null
          body_text: string | null
          campaign_key: string | null
          created_at: string
          decision_id: string | null
          error_message: string | null
          flow_key: string | null
          from_address: string | null
          id: string
          idempotency_key: string | null
          max_retries: number
          payload: Json
          processing_started_at: string | null
          provider_id: string | null
          provider_message_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          reply_to: string | null
          retry_count: number
          scheduled_for: string | null
          segment: string | null
          send_category: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          suppression_reason: string | null
          template_key: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "lifecycle_email_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_referral_signup: {
        Args: { p_referral_code: string; p_referred_user_id: string }
        Returns: boolean
      }
      current_user_role: { Args: never; Returns: string }
      ensure_referral_code: {
        Args: { p_user_id: string }
        Returns: {
          code: string
          premium_months_earned: number
          referral_count: number
        }[]
      }
      ensure_therapist_profile_for_profile: {
        Args: { p_profile_id: string }
        Returns: string
      }
      expire_referral_bonus_for_user: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      finalize_qualified_referrals: { Args: never; Returns: number }
      generate_keyword_insights: {
        Args: never
        Returns: {
          insights_created: number
        }[]
      }
      get_insight_recommendations: {
        Args: { p_priority?: string }
        Returns: {
          action: string
          created_at: string
          insight_type: string
          keyword: string
          priority: string
        }[]
      }
      get_profile_view_analytics: {
        Args: { p_profile_id: string; p_since: string }
        Returns: Json
      }
      get_referral_dashboard: { Args: { p_user_id: string }; Returns: Json }
      get_referral_summary: { Args: { p_user_id: string }; Returns: Json }
      get_top_trending_keywords: {
        Args: { p_days?: number; p_limit?: number }
        Returns: {
          current_score: number
          keyword: string
          peak_detected: boolean
          trend_direction: string
          week_avg: number
        }[]
      }
      increment_profile_contact_clicks: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      invoke_edge_function: {
        Args: { p_body?: Json; p_function_name: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_major_us_holiday: { Args: { p_date: string }; Returns: boolean }
      log_email_provider_event: {
        Args: {
          p_event_type: string
          p_payload?: Json
          p_provider: string
          p_provider_event_id: string
          p_recipient_email: string
        }
        Returns: string
      }
      make_referral_code: { Args: never; Returns: string }
      mark_insight_completed: {
        Args: { p_action_taken?: string; p_insight_id: string }
        Returns: boolean
      }
      messaging_claim_next_queue: {
        Args: { p_worker_id: string }
        Returns: {
          body: string
          campaign_id: string
          contact_id: string
          contact_name: string
          contact_timezone: string
          conversation_id: string
          idempotency_key: string
          phone_e164: string
          queue_id: string
          short_sms_body: string
          transport_preference: string
        }[]
      }
      mm_column_exists: {
        Args: { target_column: string; target_table: string }
        Returns: boolean
      }
      mm_constraint_allows: {
        Args: {
          column_name: string
          table_name: string
          value_to_check: string
        }
        Returns: boolean
      }
      process_paid_referral: {
        Args: {
          p_referred_user_id: string
          p_stripe_invoice_id: string
          p_stripe_subscription_id: string
        }
        Returns: boolean
      }
      process_stripe_identity_requires_input: {
        Args: { p_last_error_reason?: string; p_stripe_session_id: string }
        Returns: undefined
      }
      process_stripe_identity_verified: {
        Args: { p_stripe_session_id: string; p_user_id: string }
        Returns: undefined
      }
      process_stripe_payment_intent_failed: {
        Args: { p_provider_transaction_id: string }
        Returns: undefined
      }
      process_stripe_payment_intent_succeeded: {
        Args: { p_appointment_id?: string; p_provider_transaction_id: string }
        Returns: undefined
      }
      publish_verified_identity_profile: {
        Args: { p_user_id: string }
        Returns: {
          _tier: string | null
          accepts_all_genders: boolean | null
          accessibility_features: string[] | null
          account_status: string
          add_ons: Json | null
          additional_services: string[] | null
          admin_notes: string | null
          affiliations: string[] | null
          age_conduct_attested_at: string | null
          approved_at: string | null
          approved_by: string | null
          areas_served: string[] | null
          availability_note: string | null
          available_now: boolean | null
          available_now_expires: string | null
          avatar_url: string | null
          average_rating: number
          banned_reason: string | null
          bio: string | null
          body_type: string | null
          booking_link: string | null
          booking_platform: string | null
          booking_url: string | null
          boost_score: number | null
          business_hours: Json | null
          business_trips: Json | null
          canonical_city_slug: string | null
          certifications: string | null
          city: string | null
          completion_percentage: number | null
          completion_score: number | null
          contact_clicks: number
          country: string | null
          created_at: string
          current_period_end: string | null
          current_status: string | null
          custom_faq: Json | null
          day_of_week_discount: Json | null
          display_name: string | null
          education: string | null
          education_entries: Json | null
          email: string | null
          email_address: string | null
          featured_until: string | null
          full_name: string | null
          gender: string | null
          headline: string | null
          height_inches: number | null
          id: string
          identity_verified_at: string | null
          incall: boolean | null
          incall_amenities: string[] | null
          incall_details: string | null
          incall_price: number | null
          inquiry_count: number | null
          is_active: boolean | null
          is_banned: boolean | null
          is_demo: boolean
          is_featured: boolean | null
          is_suspended: boolean | null
          is_verified_email: boolean | null
          is_verified_identity: boolean | null
          is_verified_phone: boolean | null
          is_verified_photos: boolean | null
          is_verified_profile: boolean | null
          keyword_slugs: string[] | null
          languages: string[] | null
          languages_spoken: string[] | null
          last_active_at: string | null
          last_seen_at: string | null
          latitude: number | null
          lgbtq_affirming: boolean
          location_marker_type: string | null
          location_type: string | null
          longitude: number | null
          map_enabled: boolean | null
          massage_setup: string[] | null
          massage_techniques: string[] | null
          mobile_extras: string[] | null
          mobile_hours: Json | null
          modalities: string[] | null
          modality: string | null
          moderation_notes: string | null
          moderation_status: string | null
          neighborhood: string | null
          neighborhood_name: string | null
          offers_incall: boolean | null
          offers_outcall: boolean | null
          outcall: boolean | null
          outcall_details: string | null
          outcall_price: number | null
          outcall_radius: number | null
          outcall_radius_miles: number | null
          payment_methods: string[] | null
          phone: string | null
          phone_number: string | null
          photo_limit: number | null
          photo_url: string | null
          presentation_video_url: string | null
          price_max: number | null
          price_min: number | null
          pricing_sessions: Json | null
          primary_area: string | null
          products_sold: string[] | null
          products_used: string[] | null
          profile_completeness: number | null
          profile_completion_score: number | null
          profile_status: string | null
          profile_views: number | null
          promotions: Json | null
          rate_disclaimers: string[] | null
          rates: Json | null
          rating_average: number | null
          referral_bonus_expires_at: string | null
          referral_bonus_months: number
          referral_bonus_tier: string | null
          regular_discounts: Json | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_count: number
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          segments: string[] | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          service_categories: string[] | null
          service_radius_km: number | null
          service_radius_miles: number | null
          session_duration: number | null
          session_lengths: number[] | null
          show_email: boolean
          show_phone: boolean
          slug: string | null
          social_media: Json | null
          specialties: string[] | null
          specialty: string | null
          start_date: string | null
          start_year: number | null
          starting_price: number | null
          starting_rate: number | null
          state: string | null
          status: string | null
          street_reference: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_verification_session_id: string | null
          studio_amenities: string[] | null
          studio_hours: Json | null
          submitted_at: string | null
          subscription_cancel_at_period_end: boolean | null
          subscription_current_period_end: string | null
          subscription_current_period_start: string | null
          subscription_plan: string | null
          subscription_status: string | null
          subscription_tier: string | null
          suspension_reason: string | null
          tagline: string | null
          terms_accepted_at: string | null
          tier: string | null
          training: string | null
          travel_destination: string | null
          travel_schedule: Json | null
          traveling: boolean | null
          updated_at: string
          user_id: string | null
          verification_status: string | null
          view_count: number | null
          visibility_level: number | null
          visibility_status: string | null
          visiting: boolean | null
          website: string | null
          weekly_special: Json | null
          weight_lb: number | null
          whatsapp: string | null
          whatsapp_number: string | null
          years_experience: number | null
          zip_code: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      qualify_paid_referral: {
        Args: {
          p_payment_fingerprint?: string
          p_referred_user_id: string
          p_risk_reasons?: string[]
          p_risk_score?: number
          p_stripe_charge_id: string
          p_stripe_invoice_id: string
          p_stripe_subscription_id: string
        }
        Returns: string
      }
      queue_lifecycle_email: {
        Args: {
          p_body_html: string
          p_body_text?: string
          p_campaign_key: string
          p_flow_key: string
          p_from_address?: string
          p_idempotency_key?: string
          p_payload?: Json
          p_recipient_email: string
          p_recipient_name: string
          p_reply_to?: string
          p_scheduled_for?: string
          p_segment: string
          p_send_category: string
          p_subject: string
          p_template_key: string
          p_user_id: string
        }
        Returns: {
          queue_id: string
          reason: string
          status: string
        }[]
      }
      refresh_knotty_learning_scores: { Args: never; Returns: undefined }
      revoke_referral_reward: {
        Args: { p_reason: string; p_stripe_charge_id: string }
        Returns: boolean
      }
      run_lifecycle_campaign_jobs: { Args: never; Returns: undefined }
      run_lifecycle_queue_worker: { Args: never; Returns: undefined }
      search_public_therapists: {
        Args: {
          radius_miles?: number
          result_limit?: number
          result_offset?: number
          search_city_slug?: string
          search_lat?: number
          search_lng?: number
        }
        Returns: {
          canonical_city_slug: string
          city: string
          country: string
          display_name: string
          distance_miles: number
          headline: string
          id: string
          latitude: number
          longitude: number
          offers_incall: boolean
          offers_outcall: boolean
          priority_rank: number
          slug: string
          state: string
        }[]
      }
      slugify: { Args: { value: string }; Returns: string }
      sync_profile_identity_verification: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      sync_stripe_subscription: {
        Args: {
          p_current_period_end: string
          p_photo_limit: number
          p_stripe_customer_id: string
          p_stripe_subscription_id: string
          p_subscription_status?: string
          p_tier: string
          p_user_id: string
          p_visibility_level: number
        }
        Returns: undefined
      }
      unsubscribe_marketing_email: {
        Args: { p_email: string }
        Returns: undefined
      }
      update_profile_completion_score: {
        Args: { profile_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
