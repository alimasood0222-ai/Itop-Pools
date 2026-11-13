# iTop Pools website chatbot: setup guide

For the GoHighLevel developer setting up the website chatbot (Conversation AI) for iTop Pools.

The bot has two jobs:

1. Answer questions about the business, using the knowledge base file.
2. Collect the same details as the website's quote form and save them to a GHL contact, so a chat lead looks and behaves exactly like a form lead.

## The files

| File | What to do with it |
|---|---|
| `itop-pools-knowledge-base.md` | Upload to the bot's **Knowledge Base**. It is generated from the website's own data (hours, prices, all 22 models, process, warranty, financing, permits, 42 FAQs). If the uploader doesn't accept `.md`, rename it to `.txt`, or paste it into a Google Doc and export a PDF. |
| `itop-pools-bot-setup.md` (this file) | Setup notes. Paste the **Bot instructions** section below into the bot's prompt or instructions field. |

You can also add a web crawl of `https://itoppools.com` as a second source once the new site is live on that domain. The file stays the main source, because it's written for the bot and includes the rules.

When the website changes (hours, prices, FAQs), Ali regenerates the file with `npm run chatbot-kb` and sends you a new copy. Replace the old file in the knowledge base rather than adding a second one, so the bot never sees two versions.

## Bot instructions

Paste this into the bot's instructions:

```text
You are the website assistant for iTop Pools, an authorized Barrier Reef fiberglass pool dealer in Jacksonville, Florida (6510 Columbia Park Drive, Suite 206; phone and text (904) 685-2555; open Mon–Fri 8 AM–6 PM and Sat 9 AM–1 PM).

YOUR TWO JOBS
1. Answer questions about iTop Pools, our pools, prices, process, warranty, financing, permits and service area, using only the knowledge base. Keep answers short (2–4 sentences), friendly and plain. Link to the matching page on itoppools.com when it helps.
2. Help visitors request their free site visit and 3D design by collecting their details, the same way the website form does.

HOW TO COLLECT DETAILS
- Offer it naturally, for example after answering a question about cost, models or timing: "Want a free site visit and 3D design of your yard? I can set that up here in a minute."
- Ask one or two questions at a time, never a long list. Accept answers in any order and don't re-ask for something they already told you.
- Must have: first name and a mobile phone number (10 digits, US). Everything else is optional; if they don't know or don't want to say, move on.
- Collect, in roughly this order:
  1. First name (and last name if they offer it)
  2. Mobile phone
  3. Email (optional)
  4. Best way to reach them: call, text or email
  5. What they want to build (one or more): new pool, spa, pavers and deck, outdoor kitchen, screen enclosure, remodel
  6. A pool model in mind, or "help me choose", plus any must-haves: tanning ledge, spa, heat pump, LED lighting, water features, automation, salt system
  7. Timing: as soon as possible, 3–6 months, 6–12 months, or just exploring
  8. Budget: under $60k, $60k–$80k, $80k–$100k, or $100k+
  9. Project address: street, city, ZIP (state is FL unless they say otherwise)
  10. Is the home in an HOA: yes, no, not sure
  11. What's in the yard now: open yard, old pool, enclosure, patio
  12. Anything else we should know
- Text reminders: ask "Can we text you appointment reminders? Message and data rates may apply, and you can reply STOP anytime. It's not required to get a quote." Save yes only if they clearly say yes. Never assume yes.
- Before saving, read the details back in one short summary and ask them to confirm. Then save them and say: "You're all set. A member of our crew will call you to book your free site visit, then you'll get your 3D design and a firm written price."
- If they'd rather talk, give (904) 685-2555 and still offer to take their name and number so the team calls them.

RULES
- Only state facts from the knowledge base. If something isn't covered (an exact price, a start date, availability, a specific past project), say the crew will confirm it and offer to take their details.
- Never quote a price for their project. Give the published ranges (fiberglass about $58,000–$85,000 installed, before deck, enclosure and fencing) and offer the free site visit for a firm written price.
- Never promise dates, approvals or financing. iTop Pools is not a lender.
- Never tell anyone to drain a pool; tell them to call us first.
- Outside our usual area (Duval, St. Johns, Clay counties): don't refuse. Take their details and say the team will confirm.
- Complaints, warranty claims or anything urgent: ask them to call (904) 685-2555 during office hours and take their details for a callback.
- Don't ask for payment details, Social Security numbers, dates of birth or other sensitive data.
```

## Saving the details to GHL

Use the bot's **Add Contact Info** action to save the details as the conversation goes. GHL's help article says it supports standard fields and supported custom field types. For anything it can't save directly, use the bot's **Trigger workflow** action and set fields with **Update Contact Field** in that workflow.

### Use the same fields as the website form

The website form already sends these keys to your inbound webhook. Point the bot at the **same custom fields** you mapped for the form. That way one contact record, one pipeline and one notification flow serve both the form and the chat.

| Detail | Form key | GHL field | Values the form sends |
|---|---|---|---|
| First name | `first_name` | Standard: First Name | |
| Last name | `last_name` | Standard: Last Name | |
| Mobile phone | `phone` | Standard: Phone | +1 and 10 digits |
| Email | `email` | Standard: Email | |
| Street | `address1` | Standard: Street Address | |
| City | `city` | Standard: City | |
| State | `state` | Standard: State | `FL` by default |
| ZIP | `postal_code` | Standard: Postal Code | |
| Best way to reach | `contact_pref` | Custom | `Call`, `Text`, `Email` |
| Project | `project` | Custom | `pool`, `spa`, `pavers`, `kitchen`, `enclosure`, `remodel` (comma-separated if several) |
| Pool model | `model` | Custom | model ID such as `bondi`, or `none` for help me choose |
| Must-haves | `must_haves` | Custom | `Tanning ledge`, `Spa`, `Heat pump`, `LED lighting`, `Water features`, `Automation`, `Salt system` |
| Timing | `timing` | Custom | `asap`, `3-6`, `6-12`, `later` |
| Budget | `budget` | Custom | `u60`, `60-80`, `80-100`, `100+` |
| HOA | `hoa` | Custom | `Yes`, `No`, `Not sure` |
| Yard today | `existing` | Custom | `Open yard`, `Old pool`, `Enclosure`, `Patio` |
| Notes | `notes` | Custom | free text |
| Text reminders consent | `sms_consent` | Custom (checkbox) | `true` only on a clear yes |

If the bot can only save readable labels (such as "3–6 months" instead of `3-6`), that's fine. Tell Ali, and the website can send the same labels, so both sources match.

### Telling chat leads apart

- Add the tag **`website chat lead`** when the bot saves a contact. The form uses `source: website_form`, so you can filter and report on the two separately.
- Run the same steps as a completed form: create or update the contact, create the opportunity and notify Fabio. Trigger them from the bot (a **Trigger workflow** action after the confirmation step) or from the tag being added.
- If a visitor gives only a name and phone and then leaves, treat it like the form's `contact_only` stage: save the contact, tag it **`partial lead`** and don't notify.

## Before going live

Run these test chats and check the contact in GHL after each:

1. Ask the opening hours, the price of a fiberglass pool, the largest model and whether permits are handled. The answers should match the website.
2. Ask something not covered, such as "can you start next Monday?" The bot should say the crew will confirm and offer to take details.
3. Go through the full details flow. The contact should have every field, the `website chat lead` tag, an opportunity and Fabio's notification.
4. Give only a name and phone, then stop. The contact should be saved and tagged `partial lead`, with no notification.
5. Say no to text reminders. `sms_consent` should stay unchecked.
6. Ask for a price for "my 30-foot pool with a spa". The bot should give the range and offer the site visit, not a number.

Delete the test contacts afterwards.
