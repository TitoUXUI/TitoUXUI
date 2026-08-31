// Tipos escritos a mano reflejando el esquema SQL en supabase/migrations/.
// Si preferis generarlos automaticamente: `supabase gen types typescript`.
//
// Nota: se usa "type" (no "interface") para las filas porque el cliente de
// supabase-js exige que cada tabla sea estructuralmente asignable a
// Record<string, unknown>, algo que TypeScript solo reconoce en "type
// literals", no en "interfaces" (que no tienen index signature implicita).

export type AppRole = "lider" | "colaborador" | "anciano";
export type EventType = "reunion" | "campamento" | "evento";
export type EventStatus = "programado" | "cancelado";
export type RsvpStatus = "confirmado" | "no_puedo";
export type TaskStatus = "pendiente" | "completada";
export type WallPostType = "anuncio" | "oracion";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: AppRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Teen = {
  id: string;
  full_name: string;
  birth_date: string;
  active: boolean;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TeenSensitiveInfo = {
  teen_id: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_relationship: string;
  health_notes: string | null;
  parental_consent: boolean;
  parental_consent_date: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  location: string | null;
  start_at: string;
  end_at: string | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRsvp = {
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  responded_at: string;
};

export type EventStage = {
  id: string;
  event_id: string;
  title: string;
  starts_at: string;
  sort_order: number;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  event_id: string | null;
  assigned_to: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type WallPost = {
  id: string;
  type: WallPostType;
  title: string | null;
  content: string;
  author_id: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type MinistryPage = {
  id: true;
  content: string;
  updated_by: string | null;
  updated_at: string;
};

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  user_agent: string | null;
  created_at: string;
};

export type MonthlyReport = {
  period_start: string;
  period_end: string;
  events_total: number;
  events_programados: number;
  events_cancelados: number;
  events_by_type: Record<string, number>;
  rsvps_confirmados: number;
  rsvps_no_puede: number;
  tasks_completadas: number;
  tasks_pendientes_visibles: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; Relationships: [] };
      teens: { Row: Teen; Insert: Partial<Teen>; Update: Partial<Teen>; Relationships: [] };
      teen_sensitive_info: {
        Row: TeenSensitiveInfo;
        Insert: Partial<TeenSensitiveInfo>;
        Update: Partial<TeenSensitiveInfo>;
        Relationships: [];
      };
      events: { Row: EventRow; Insert: Partial<EventRow>; Update: Partial<EventRow>; Relationships: [] };
      event_rsvps: {
        Row: EventRsvp;
        Insert: Partial<EventRsvp>;
        Update: Partial<EventRsvp>;
        Relationships: [];
      };
      event_stages: {
        Row: EventStage;
        Insert: Partial<EventStage>;
        Update: Partial<EventStage>;
        Relationships: [];
      };
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task>; Relationships: [] };
      wall_posts: { Row: WallPost; Insert: Partial<WallPost>; Update: Partial<WallPost>; Relationships: [] };
      ministry_page: {
        Row: MinistryPage;
        Insert: Partial<MinistryPage>;
        Update: Partial<MinistryPage>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: Partial<PushSubscriptionRow>;
        Update: Partial<PushSubscriptionRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      monthly_report: {
        Args: { p_month: string };
        Returns: MonthlyReport[];
      };
      current_role: { Args: Record<string, never>; Returns: AppRole };
      is_lider: { Args: Record<string, never>; Returns: boolean };
      is_active_user: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      app_role: AppRole;
      event_type: EventType;
      event_status: EventStatus;
      rsvp_status: RsvpStatus;
      task_status: TaskStatus;
      wall_post_type: WallPostType;
    };
    CompositeTypes: Record<string, never>;
  };
};
