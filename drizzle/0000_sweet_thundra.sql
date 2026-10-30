CREATE TYPE "public"."approval_via" AS ENUM('link', 'manual');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('laptop', 'phone', 'tablet', 'other');--> statement-breakpoint
CREATE TYPE "public"."item_kind" AS ENUM('service', 'part');--> statement-breakpoint
CREATE TYPE "public"."lock_type" AS ENUM('none', 'pin', 'password', 'pattern');--> statement-breakpoint
CREATE TYPE "public"."payment_kind" AS ENUM('payment', 'refund');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'transfer', 'qris', 'other');--> statement-breakpoint
CREATE TYPE "public"."print_format" AS ENUM('thermal_58', 'thermal_80', 'a4');--> statement-breakpoint
CREATE TYPE "public"."stock_reason" AS ENUM('purchase', 'ticket_use', 'ticket_return', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."subscription_action" AS ENUM('extend', 'reset_owner_password');--> statement-breakpoint
CREATE TYPE "public"."ticket_event_type" AS ENUM('created', 'status_changed', 'assigned', 'diagnosis_updated', 'note', 'estimate_approved', 'estimate_rejected', 'invoice_created', 'invoice_reopened', 'payment_recorded', 'secret_viewed', 'wa_opened');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('received', 'diagnosing', 'awaiting_approval', 'in_progress', 'waiting_parts', 'ready', 'picked_up', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'technician', 'super_admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limits_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"tenant_id" uuid,
	"role" "user_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_super_admin_tenant_check" CHECK (("users"."role" = 'super_admin') = ("users"."tenant_id" IS NULL))
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone_wa" varchar(20) NOT NULL,
	"notes" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "parts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sku" varchar(40),
	"name" varchar(120) NOT NULL,
	"cost_price" bigint DEFAULT 0 NOT NULL,
	"sell_price" bigint DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parts_cost_price_check" CHECK ("parts"."cost_price" >= 0),
	CONSTRAINT "parts_sell_price_check" CHECK ("parts"."sell_price" >= 0),
	CONSTRAINT "parts_stock_check" CHECK ("parts"."stock" >= 0),
	CONSTRAINT "parts_min_stock_check" CHECK ("parts"."min_stock" >= 0)
);
--> statement-breakpoint
ALTER TABLE "parts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"ticket_id" uuid NOT NULL,
	"kind" "payment_kind" NOT NULL,
	"method" "payment_method" NOT NULL,
	"amount" bigint NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" varchar(200),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_check" CHECK ("payments"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"qty_change" integer NOT NULL,
	"reason" "stock_reason" NOT NULL,
	"ticket_id" uuid,
	"unit_cost" bigint,
	"note" varchar(200),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movements_qty_change_check" CHECK ("stock_movements"."qty_change" <> 0),
	CONSTRAINT "stock_movements_ticket_id_check" CHECK ("stock_movements"."reason" NOT IN ('ticket_use', 'ticket_return') OR "stock_movements"."ticket_id" IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscription_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"action" "subscription_action" NOT NULL,
	"active_until_before" timestamp with time zone,
	"active_until_after" timestamp with time zone,
	"amount_paid" bigint,
	"note" varchar(300),
	"actor_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"phone_wa" varchar(20) NOT NULL,
	"address" varchar(300),
	"timezone" varchar(40) DEFAULT 'Asia/Jakarta' NOT NULL,
	"ticket_prefix" varchar(5) DEFAULT 'SRV' NOT NULL,
	"ticket_seq" integer DEFAULT 0 NOT NULL,
	"invoice_seq" integer DEFAULT 0 NOT NULL,
	"default_warranty_days" integer DEFAULT 30 NOT NULL,
	"service_terms" text DEFAULT '1. Data dan kondisi unit pada tanda terima ini sudah diperiksa bersama dan dinyatakan benar oleh pelanggan.
2. Perbaikan berbiaya dikerjakan setelah estimasi disetujui pelanggan.
3. Pelanggan bertanggung jawab mencadangkan data sebelum unit diserahkan; toko tidak bertanggung jawab atas kehilangan data selama servis.
4. Garansi hanya berlaku untuk pekerjaan yang tercantum pada nota, selama masa garansi pada nota.
5. Pengambilan unit dilakukan setelah pembayaran lunas dengan menunjukkan tanda terima atau nomor tiket.' NOT NULL,
	"print_format" "print_format" DEFAULT 'thermal_58' NOT NULL,
	"require_signature" boolean DEFAULT true NOT NULL,
	"technicians_can_claim" boolean DEFAULT false NOT NULL,
	"billing_code" smallint NOT NULL,
	"trial_ends_at" timestamp with time zone NOT NULL,
	"active_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_timezone_check" CHECK ("tenants"."timezone" IN ('Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura')),
	CONSTRAINT "tenants_ticket_prefix_check" CHECK ("tenants"."ticket_prefix" ~ '^[A-Z]{2,5}$'),
	CONSTRAINT "tenants_default_warranty_days_check" CHECK ("tenants"."default_warranty_days" BETWEEN 0 AND 365),
	CONSTRAINT "tenants_billing_code_check" CHECK ("tenants"."billing_code" BETWEEN 1 AND 999)
);
--> statement-breakpoint
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ticket_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"ticket_id" uuid NOT NULL,
	"type" "ticket_event_type" NOT NULL,
	"from_status" "ticket_status",
	"to_status" "ticket_status",
	"note" varchar(1000),
	"is_public" boolean DEFAULT false NOT NULL,
	"actor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ticket_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"ticket_id" uuid NOT NULL,
	"kind" "item_kind" NOT NULL,
	"part_id" uuid,
	"description" varchar(150) NOT NULL,
	"qty" integer NOT NULL,
	"unit_price" bigint NOT NULL,
	"unit_cost" bigint,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_items_part_id_check" CHECK ("ticket_items"."kind" = 'part' OR "ticket_items"."part_id" IS NULL),
	CONSTRAINT "ticket_items_qty_check" CHECK ("ticket_items"."qty" BETWEEN 1 AND 99),
	CONSTRAINT "ticket_items_unit_price_check" CHECK ("ticket_items"."unit_price" >= 0)
);
--> statement-breakpoint
ALTER TABLE "ticket_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"number" varchar(20) NOT NULL,
	"public_token" varchar(32) NOT NULL,
	"customer_id" uuid NOT NULL,
	"status" "ticket_status" DEFAULT 'received' NOT NULL,
	"assigned_to" uuid,
	"device_type" "device_type" NOT NULL,
	"brand" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"serial_or_imei" varchar(50),
	"complaint" varchar(1000) NOT NULL,
	"condition_notes" varchar(500),
	"accessories" text[] DEFAULT '{}' NOT NULL,
	"accessories_note" varchar(200),
	"lock_type" "lock_type" DEFAULT 'none' NOT NULL,
	"lock_secret_enc" text,
	"signature_svg" text,
	"terms_accepted_at" timestamp with time zone NOT NULL,
	"due_date" date,
	"diagnosis" varchar(2000),
	"discount_amount" bigint DEFAULT 0 NOT NULL,
	"warranty_days" integer NOT NULL,
	"estimate_approved_total" bigint,
	"estimate_approved_at" timestamp with time zone,
	"estimate_approval_via" "approval_via",
	"cancel_reason" varchar(300),
	"invoice_number" varchar(20),
	"invoiced_at" timestamp with time zone,
	"picked_up_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_public_token_unique" UNIQUE("public_token"),
	CONSTRAINT "tickets_lock_secret_check" CHECK ("tickets"."lock_type" <> 'none' OR "tickets"."lock_secret_enc" IS NULL),
	CONSTRAINT "tickets_discount_amount_check" CHECK ("tickets"."discount_amount" >= 0),
	CONSTRAINT "tickets_warranty_days_check" CHECK ("tickets"."warranty_days" BETWEEN 0 AND 365)
);
--> statement-breakpoint
ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_logs" ADD CONSTRAINT "subscription_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_logs" ADD CONSTRAINT "subscription_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_events" ADD CONSTRAINT "ticket_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_events" ADD CONSTRAINT "ticket_events_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_events" ADD CONSTRAINT "ticket_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_items" ADD CONSTRAINT "ticket_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_items" ADD CONSTRAINT "ticket_items_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_items" ADD CONSTRAINT "ticket_items_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_items" ADD CONSTRAINT "ticket_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_tenant_role_idx" ON "users" USING btree ("tenant_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "users_tenant_owner_unique" ON "users" USING btree ("tenant_id") WHERE "users"."role" = 'owner';--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_tenant_phone_unique" ON "customers" USING btree ("tenant_id","phone_wa");--> statement-breakpoint
CREATE INDEX "customers_tenant_name_idx" ON "customers" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "parts_tenant_sku_unique" ON "parts" USING btree ("tenant_id","sku") WHERE "parts"."sku" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "parts_tenant_name_idx" ON "parts" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE INDEX "payments_tenant_paid_at_idx" ON "payments" USING btree ("tenant_id","paid_at");--> statement-breakpoint
CREATE INDEX "payments_ticket_idx" ON "payments" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "stock_movements_tenant_part_created_idx" ON "stock_movements" USING btree ("tenant_id","part_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "stock_movements_tenant_reason_created_idx" ON "stock_movements" USING btree ("tenant_id","reason","created_at");--> statement-breakpoint
CREATE INDEX "subscription_logs_tenant_created_idx" ON "subscription_logs" USING btree ("tenant_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ticket_events_ticket_created_idx" ON "ticket_events" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE INDEX "ticket_items_ticket_idx" ON "ticket_items" USING btree ("ticket_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_tenant_number_unique" ON "tickets" USING btree ("tenant_id","number");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_tenant_invoice_number_unique" ON "tickets" USING btree ("tenant_id","invoice_number");--> statement-breakpoint
CREATE INDEX "tickets_tenant_status_created_idx" ON "tickets" USING btree ("tenant_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "tickets_tenant_assigned_idx" ON "tickets" USING btree ("tenant_id","assigned_to");--> statement-breakpoint
CREATE INDEX "tickets_tenant_customer_idx" ON "tickets" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "tickets_tenant_picked_up_idx" ON "tickets" USING btree ("tenant_id","picked_up_at");