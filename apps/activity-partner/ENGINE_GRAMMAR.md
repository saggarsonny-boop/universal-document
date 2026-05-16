---
engine: Adaptive AI Activity Companion (AAC)
id: hiveactivitypartner
name_display: Adaptive AI Activity Companion (AAC)
domain: activitypartner.hive.baby
domain_aliases:
  - activitypartner.hive.baby
repo: saggarsonny-boop/hivebaby:apps/hive-activity-partner
owner: saggarsonny-boop

version: 0.2.0
status: building
tier: 1
schema: b2b-enterprise-ai-portal
stack: [nextjs, typescript, clerk, neon, anthropic, stripe]
premium: true

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: enterprise, professional, high-trust
cost_profile: medium_marginal

api_models:
  - role: enterprise_assistant
    model_id: claude-3-opus-20240229
  - role: safety_scan
    model_id: claude-3-haiku-20240307

env_vars_required:
  - DATABASE_URL
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - CLERK_SECRET_KEY
  - NEXT_PUBLIC_APP_URL
  - ANTHROPIC_API_KEY
  - STRIPE_SECRET_KEY
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

health_check: /api/health

vercel_project: hive-activity-partner
vercel_root_directory: apps/hive-activity-partner
deployment_protection: off
auto_deploy_branch: main

visibility: public
commercial_surface: enterprise_saas
production_state: building
last_audit_at: 2026-05-15
---

# ENGINE GRAMMAR — Adaptive AI Activity Companion (AAC)

## Engine Identity
- **Name:** Adaptive AI Activity Companion (AAC)
- **Domain:** activitypartner.hive.baby
- **Repo:** saggarsonny-boop/hivebaby (subdir `apps/hive-activity-partner/`)
- **Status:** Building
- **Stack:** Next.js + TypeScript + Clerk + Neon PostgreSQL + Anthropic + Stripe

## Purpose
The Adaptive AI Activity Companion (AAC) is a B2B enterprise AI-assistant portal with seat-license billing.
It provides organizations with a highly sophisticated, deployable AI companion configured for their specific vertical (e.g., Clinical, Practice, Corporate).

The engine was originally conceived as a consumer social app, but has been officially pivoted to a B2B Enterprise SAAS platform.

## Commercial Surface
- **Stripe Products:**
  - Base Enterprise Platform (Annual contract)
  - AAC Seat Licenses (Per user, scalable)
- The billing API dynamically provisions Stripe Checkout sessions.

## Safety architecture
- Enterprise-grade tenant isolation via Clerk organizations + Neon RLS (where applicable).
- All AI chat requests pass through Anthropic's safety filters + internal roleplay restrictions.

## Core Features
1. **B2B Portal:** Central hub for enterprise clients to manage their AAC deployment.
2. **Vertical Demos:** Embedded environments (Clinic, Practice) that showcase the AAC's domain-specific capabilities.
3. **Seat Licensing:** Automated billing pipeline via Stripe for seat expansion.
4. **Enterprise Chat Surface:** Production-grade Anthropic interface with robust streaming and state management.

## Deployment Notes
- Auto-deploy on push to `main` (after PR merges)
- Cloudflare CNAME → cname.vercel-dns.com (`activitypartner.hive.baby`)
- Vercel Deployment Protection: off
