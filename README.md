# Automated Payment Follow-Up & Dunning Pipeline

**n8n + Stripe + HubSpot + SendGrid + Twilio**

Multi-step dunning automation monitoring unpaid Stripe invoices and executing escalating follow-ups across email and SMS. Handles pre-due reminders, multi-step overdue sequences, payment recovery detection, and weekly revenue recovery reporting.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Stripe Invoice Monitoring                        │
│        Webhook Events + Daily Cron Scan of Open Invoices            │
└───────────────────────────┬────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Invoice Classification                           │
│     Days Overdue · Amount · Customer Tier · Previous Follow-Ups     │
└──────────┬───────────────────────┬──────────────────────────────────┘
           │                       │
      Not Yet Due              Overdue
           │                       │
           ▼                       ▼
┌─────────────────────┐  ┌────────────────────────────────────────────┐
│  Pre-Due Reminder   │  │           Dunning Sequence Engine          │
│  (3 days before)    │  │  Day 1 → Day 3 → Day 7 → Day 14 → Day 30 │
│  Email only         │  │  Email → Email+SMS → Account Manager      │
└─────────────────────┘  └──────────┬────────────────────────────────┘
                                    │
                          ┌─────────┴──────────┐
                          │                    │
                    Payment Received      Still Unpaid
                          │                    │
                          ▼                    ▼
                   Stop Sequence         Continue/Write-off
                   Send Confirmation     Notify Finance
```

## What It Does

1. **Monitor** — Watches Stripe for unpaid invoices via webhooks + daily cron scan
2. **Classify** — Determines overdue status, customer tier, and last follow-up date
3. **Execute** — Runs configurable multi-step dunning sequence with channel escalation
4. **Recover** — Detects payments and automatically stops the follow-up sequence
5. **Report** — Generates weekly revenue recovery analytics

## Dunning Sequence

| Step | Timing | Channel | Template |
|------|--------|---------|----------|
| Pre-Due | 3 days before due | Email | Friendly reminder |
| Day 1 | 1 day overdue | Email | Payment past due |
| Day 3 | 3 days overdue | Email + SMS | Urgent reminder |
| Day 7 | 7 days overdue | Email + SMS | Final notice |
| Day 14 | 14 days overdue | Account Manager call | Personal outreach |
| Day 30 | 30 days overdue | Finance team | Collections / write-off |

## Setup

### 1. n8n Workflow

Import `workflow/payment-dunning-pipeline.json` into your n8n instance.

### 2. Environment Variables

```bash
cp .env.example .env
```

### 3. Configure Credentials

- **Stripe** — API key with `invoices:read` and `customers:read` permissions
- **HubSpot** — API key for CRM contact/deal lookups
- **SendGrid** — API key with template IDs for each dunning step
- **Twilio** — SMS credentials for escalation messages
- **Slack** — Webhook for finance team notifications

### 4. SendGrid Templates

Create these transactional templates in SendGrid:

| Template | Purpose |
|----------|---------|
| `TEMPLATE_PRE_DUE` | Friendly pre-due reminder |
| `TEMPLATE_DAY_1` | Past due email |
| `TEMPLATE_DAY_3` | Urgent email + SMS trigger |
| `TEMPLATE_DAY_7` | Final notice email |
| `TEMPLATE_PAYMENT_RECEIVED` | Payment confirmation |

### 5. Stripe Webhook

Configure Stripe webhook to send these events to n8n:
- `invoice.payment_failed`
- `invoice.payment_succeeded`
- `invoice.updated`

### 6. Dashboard

```bash
cd dashboard
npm install
npm start
# Open http://localhost:4200
```

## Monetization Potential

| Tier | Price | Features |
|------|-------|----------|
| Starter | $99/mo | 100 invoices/mo, email-only dunning |
| Business | $249/mo | 1000 invoices/mo, email + SMS + CRM |
| Enterprise | $599/mo | Unlimited, custom sequences, API, analytics |

## Tech Stack

- **n8n** — Workflow orchestration
- **Stripe API** — Invoice monitoring and payment status
- **HubSpot CRM** — Customer data and account manager assignment
- **SendGrid** — Transactional email delivery
- **Twilio** — SMS escalation messages
- **Slack** — Finance team notifications
- **Angular 21 + Tailwind** — Analytics dashboard
