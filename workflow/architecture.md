# Architecture: Payment Follow-Up & Dunning Pipeline

## Data Flow

```
Stripe ──► Webhook / Daily Cron ──► Fetch Open Invoices
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │ Classify Invoice │
                                 │ Days Overdue     │
                                 │ Customer Tier    │
                                 │ Last Follow-up   │
                                 └────────┬────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                    Pre-Due (T-3d)    Overdue         Payment Received
                          │               │               │
                          ▼               ▼               ▼
                   SendGrid Email   Dunning Engine   Stop Sequence
                                      ┌─────┐
                                      │Day 1│──► Email
                                      │Day 3│──► Email + SMS
                                      │Day 7│──► Email + SMS
                                      │D14  │──► Account Mgr
                                      │D30  │──► Collections
                                      └─────┘
                                          │
                                          ▼
                                    HubSpot Log
                                          │
                                          ▼
                                   Weekly Report Cron
                                   ──► Slack Digest
```

## Node Inventory

| # | Node | Type | Purpose |
|---|------|------|---------|
| 1 | Stripe Webhook | Webhook | Receives Stripe invoice events |
| 2 | Daily Invoice Scan | Cron (9am) | Fetches all open invoices from Stripe |
| 3 | Fetch Invoice Details | HTTP Request | Gets full invoice + customer data |
| 4 | Check Payment Status | HTTP Request | Verifies current payment state |
| 5 | Calculate Overdue | Code | Computes days overdue, next step |
| 6 | HubSpot Lookup | HTTP Request | Gets customer tier + account manager |
| 7 | Pre-Due Check | Switch | Routes pre-due vs overdue |
| 8 | Send Pre-Due Email | HTTP Request | SendGrid template email |
| 9 | Dunning Step Router | Switch | Routes by overdue day (1/3/7/14/30) |
| 10 | Day 1 Email | HTTP Request | SendGrid past-due email |
| 11 | Day 3 Email + SMS | HTTP Request | SendGrid email + Twilio SMS |
| 12 | Day 7 Final Notice | HTTP Request | SendGrid + Twilio urgent |
| 13 | Day 14 Manager Alert | HTTP Request | HubSpot notification + Slack |
| 14 | Day 30 Collections | HTTP Request | Slack finance alert + write-off |
| 15 | Payment Recovery | Webhook | Stops sequence on payment success |
| 16 | Log to HubSpot | HTTP Request | Creates engagement note |
| 17 | Weekly Report | Cron (Mon 10am) | Generates recovery stats |
| 18 | Send Report | HTTP Request | Posts weekly digest to Slack |

## Dunning Logic (Code Node)

```javascript
const invoice = $input.first().json;
const dueDate = new Date(invoice.due_date * 1000);
const now = new Date();
const diffMs = now - dueDate;
const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

let step = 'not_due';
if (daysOverdue < 0 && daysOverdue >= -3) step = 'pre_due';
else if (daysOverdue === 1) step = 'day_1';
else if (daysOverdue === 3) step = 'day_3';
else if (daysOverdue === 7) step = 'day_7';
else if (daysOverdue === 14) step = 'day_14';
else if (daysOverdue >= 30) step = 'day_30';

return [{
  json: {
    ...invoice,
    daysOverdue,
    dunningStep: step,
    nextAction: step === 'not_due' ? 'wait' : 'execute'
  }
}];
```

## HubSpot Engagement Schema

| Field | Value |
|-------|-------|
| type | NOTE |
| body | `[Dunning] Step: {{ step }}, Invoice: {{ invoice_number }}, Amount: {{ amount }}` |
| associations | contact (customer), deal (if linked) |
