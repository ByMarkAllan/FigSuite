# FigSuite v1.1 — Prize data-model review

The SQL migration in \`supabase/migrations/2026110501_prize_draft_hold.sql\` is **prepared, not automatically applied**. It creates a private, default-deny namespace where every contest is permanently \`draft_review\`, every payout is a \`preview_not_payable\`, and every approval has \`activation_granted=false\`.

No table is exposed to the public API; no user or browser receives write privileges; no transfer-capable function exists. Before applying a migration, operators must review its effects against Supabase schema, permissions, backups, and existing migrations. Production real-money support requires an entirely separate, legally reviewed migration and service.

Award slots and sponsor-funding references are documentation artifacts, not certified funds. No real contest enrollment, winner verification, tax, KYC or disbursement path is implemented here.
