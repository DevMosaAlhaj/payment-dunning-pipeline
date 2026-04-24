# Demo Script: Payment Follow-Up & Dunning Pipeline

**Target**: 3-4 minute Loom walkthrough

---

## Opening (15 seconds)

"Hey, I'm Mosa Ahmad — Integration Engineer. This is an automated payment follow-up and dunning pipeline that monitors unpaid Stripe invoices and runs escalating multi-step reminder sequences across email and SMS until payment is recovered."

## 1. The Problem (30 seconds)

- Show a spreadsheet of unpaid invoices
- "5-15% of invoiced revenue is written off as bad debt. Staff spends 3-8 hours per week chasing payments manually, follow-ups are inconsistent, and some customers get reminded while others slip through the cracks."

## 2. The Dashboard (45 seconds)

- Open the Angular dashboard at localhost:4200
- Show the invoice overview: total outstanding, recovery rate, active sequences
- Show the invoice table with overdue days and current dunning step
- Highlight the recovery timeline

## 3. Live Dunning Flow (60 seconds)

- Show a test invoice becoming overdue in Stripe
- Switch to n8n editor — show the daily cron triggering
- Walk through: Fetch → Classify → Route → Execute step
- Show the dunning step router branching to different channels
- Switch to email — show the SendGrid template with dynamic fields
- Show the Twilio SMS for Day 3 escalation

## 4. Payment Recovery (30 seconds)

- Simulate a payment on an overdue invoice
- Show the webhook catching the `invoice.payment_succeeded` event
- Show the sequence automatically stopping
- Show the payment confirmation email sent

## 5. Weekly Report (20 seconds)

- Show the weekly recovery report format
- Stats: total recovered, outstanding, by aging bucket
- Sent to Slack finance channel every Monday

## 6. The n8n Workflow (20 seconds)

- Full workflow view in n8n editor
- Highlight: dual trigger (webhook + cron), dunning step router, multi-channel escalation

## Closing (15 seconds)

"This recovers 15-30% of revenue that would otherwise be written off. The full source code is on my GitHub. If you need a payment automation pipeline, reach out."

---

## Screenshots Checklist

- [ ] Dashboard overview with stats
- [ ] Invoice table with dunning steps
- [ ] Recovery timeline visualization
- [ ] n8n workflow editor (full view)
- [ ] SendGrid email template (pre-due)
- [ ] SendGrid email template (overdue Day 7)
- [ ] Twilio SMS notification
- [ ] Payment recovery webhook
- [ ] Weekly report in Slack
- [ ] HubSpot engagement log
