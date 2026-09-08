# Project Brief — KalaCart Web

*Frozen reference: 2026-09-08*

## Summary
KalaCart is a direct-linkage marketplace and administrative platform supporting Indian artisans (SIH26090, Ministry of Social Justice & Empowerment). It connects rural and indigenous craftspeople directly with conscious consumers and institutional buyers, cutting out exploitative middlemen.

## Core Mandates
1. **Direct Linkage:** No direct payment gateway or in-app cart/checkout. Buyers submit structured inquiries and connect directly with artisans via WhatsApp/Call/Email.
2. **Companion Architecture:** The web app acts as the public discovery portal and admin review desk. It shares a common Supabase database with a companion Android app used by field artisans.
3. **Data Seam:** The web UI is built against a typed mock data layer first (`src/lib/data/`), designed for drop-in replacement with Supabase without modifying components.
4. **Design Polish as North Star:** High aesthetic standard celebrating authentic Indian crafts, avoiding generic AI-artisan cliches.

*Full specification lives in [PRD.md](../PRD.md).*
