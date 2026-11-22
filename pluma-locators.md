# Pluma (app.pluma.ai) — Playwright locators

I extracted these on 2026-11-21 while signed in, looking only at visible interactive elements on each page (no forms were submitted).
Use each locator as `page.<locator>`, for example `page.getByRole('button', { name: 'New document' })`.

Locator priority: `getByTestId` → `getByRole` + accessible name → `getByLabel` → `getByPlaceholder` → `#id` → CSS + `.nth()`.
The app has **no `data-testid` attributes**. Locators that use CSS + `.nth()` are fragile, and a ⚠ marks the ones I'd ask the devs to label.
Names that show data (counts, dates, document titles) change over time. Use a regex or `exact: false` for those.

---

## Shared layout (every page under `/app/*` and `/settings`)

### Sidebar
| Element | Locator |
|---|---|
| Logo "BETA" link | `getByRole('link', { name: 'BETA' })` |
| Workspace switcher ("Main Workspace") ⚠ | `locator('button').nth(2)` |
| WORKSPACE section toggle | `getByRole('button', { name: 'WORKSPACE' })` |
| Dashboard | `getByRole('link', { name: 'Dashboard' })` |
| Article Generator | `getByRole('link', { name: 'Article Generator' })` |
| Brand Voice | `getByRole('link', { name: 'Brand Voice' })` |
| Topical Map | `getByRole('link', { name: 'Topical Map' })` |
| Calendar | `getByRole('link', { name: 'Calendar' })` |
| LLM Brand Ranking | `getByRole('link', { name: 'LLM Brand Ranking' })` |
| Pluma Art | `getByRole('link', { name: 'Pluma Art' })` |
| Pluma Humanize | `getByRole('link', { name: 'Pluma Humanize' })` |
| SEO & GEO section toggle | `getByRole('button', { name: 'SEO & GEO' })` |
| Link Network | `getByRole('link', { name: 'Link Network' })` |
| Backlinks Analytics | `getByRole('link', { name: 'Backlinks Analytics' })` |
| Keyword Intelligence | `getByRole('link', { name: 'Keyword Intelligence' })` |
| LIBRARY section toggle | `getByRole('button', { name: 'LIBRARY' })` |
| Templates | `getByRole('link', { name: 'Templates' })` |
| Settings | `getByRole('link', { name: 'Settings' })` |
| Rewards | `getByRole('link', { name: 'Rewards' })` |
| Bottom-of-sidebar user/profile button ⚠ | `locator('button').nth(6)` |

### Header
| Element | Locator |
|---|---|
| Trial banner "Upgrade Now" | `getByRole('button', { name: 'Upgrade Now' })` |
| Video/help icon next to the page title (nested icon buttons) ⚠ | `locator('button.flex.items-center').nth(4)` / `locator('button.flex.justify-center').nth(1)` / `locator('button.inline-flex.items-center').nth(0)` |

---

## /app/dashboard — Dashboard
| Element | Locator |
|---|---|
| Dismiss setup | `getByRole('button', { name: 'Dismiss Setup x' })` |
| Checklist: Create Document | `locator('#createDocument')` |
| Checklist: Finish setting document | `locator('#finishDocument')` |
| Checklist: title/approve document | `locator('#titleDocument')` |
| "Done" | `getByRole('button', { name: 'Done' })` |
| "Link" (link your domain) | `getByRole('button', { name: 'Link' })` |
| Add domain | `getByRole('button', { name: 'Add domain' })` |
| "+" (new item) | `getByRole('button', { name: '+' })` |
| Recent document card (data) | `getByRole('link', { name: /UnTitled last update/ })` |
| Recent document title button (data) | `getByRole('button', { name: 'UnTitled' })` |

## /app/documents — Documents (Article Generator)
| Element | Locator |
|---|---|
| New document | `getByRole('button', { name: 'New document' })` |
| Search | `getByPlaceholder('Search document...')` |
| Status filter | `getByRole('button', { name: 'Status' })` |
| Source filter | `getByRole('button', { name: 'Source' })` |
| Draft | `getByRole('button', { name: 'Draft' })` |
| In Review | `getByRole('button', { name: 'In Review' })` |
| Completed | `getByRole('button', { name: 'Completed' })` |
| Published | `getByRole('button', { name: 'Published' })` |
| Reset filter | `getByRole('button', { name: 'Reset filter' })` |

## /app/brand-voice — Brand Voice
| Element | Locator |
|---|---|
| New Voice | `getByRole('button', { name: 'New Voice' })` |
| Search | `getByPlaceholder('Search...')` |

## /app/tools/topical_map — Topical Map
| Element | Locator |
|---|---|
| New Topic Research | `getByRole('button', { name: 'New Topic Research' })` |
| Search | `getByPlaceholder('Search...')` |

## /app/calendar — Calendar
| Element | Locator |
|---|---|
| Board view | `getByRole('button', { name: 'Board' })` |
| More view | `getByRole('button', { name: 'More view' })` |
| Search tasks | `getByPlaceholder('Search tasks by name...')` |
| Filters | `getByRole('button', { name: 'Filters' })` |
| Add Task | `getByRole('button', { name: 'Add Task' })` |
| DRAFT column | `getByRole('button', { name: /^DRAFT \d+/ })` |
| DRAFT column add ⚠ | `locator('button.rounded-md.p-1').nth(0)` |
| IN PROGRESS column | `getByRole('button', { name: /^IN PROGRESS \d+/ })` |
| IN PROGRESS column add ⚠ | `locator('button.rounded-md.p-1').nth(1)` |
| IN REVIEW column | `getByRole('button', { name: /^IN REVIEW \d+/ })` |
| IN REVIEW column add ⚠ | `locator('button.rounded-md.p-1').nth(2)` |
| COMPLETED column | `getByRole('button', { name: /^COMPLETED \d+/ })` |
| COMPLETED column add ⚠ | `locator('button.rounded-md.p-1').nth(3)` |
| Unlabelled button (h-9) ⚠ | `locator('button.flex.h-9')` |

## /app/llm-rank — LLM Brand Ranking
| Element | Locator |
|---|---|
| Create your first AI tracker | `getByRole('button', { name: 'Create your first AI tracker' })` |

## /app/pluma-Art — Pluma Art
| Element | Locator |
|---|---|
| Image description | `getByPlaceholder('Write an image description here')` |
| Number of images | `getByPlaceholder('Number of Images')` |
| Toggle switch ⚠ | `locator('button.peer.inline-flex')` |
| Checkbox ⚠ | `locator('input').nth(1)` |
| Generate | `getByRole('button', { name: 'Generate' })` |
| Saved tab | `getByRole('tab', { name: 'Saved' })` |
| Favourite tab | `getByRole('tab', { name: 'Favourite' })` |

## /app/pluma-humanize — Pluma Humanize
| Element | Locator |
|---|---|
| Text editor (Quill) | `locator('.ql-editor')` |
| Analyze Text | `getByRole('button', { name: 'Analyze Text' })` |

## /app/interlink — Link Network (onboarding screen; no sidebar)
| Element | Locator |
|---|---|
| Connect Your Domain | `getByRole('button', { name: 'Connect Your Domain' })` |
| Continue with Existing Account | `getByRole('button', { name: 'Continue with Existing Account' })` |

## /app/backlinks-analytics — Backlinks Analytics
| Element | Locator |
|---|---|
| View History | `getByRole('button', { name: 'View History' })` |
| Domain / URL input | `getByRole('textbox', { name: 'Domain or URL input' })` |
| Analyze backlinks | `getByRole('button', { name: 'Analyze backlinks' })` |

## /app/tools/keyword_intelligence — Keyword Intelligence
| Element | Locator |
|---|---|
| View All (link) | `getByRole('link', { name: 'View All' })` |
| View All (button) | `getByRole('button', { name: 'View All' })` |
| Keyword / niche input | `getByRole('textbox', { name: 'Keyword or niche input' })` |
| Analyze keywords | `getByRole('button', { name: 'Analyze keywords' })` |

## /app/templates — Templates
| Element | Locator |
|---|---|
| Search | `getByPlaceholder('Search for Template')` |
| Category filters | `getByRole('button', { name: '<Category>' })`, where Category is one of: All, SEO, Emails & Letters, Brainstorming, Social Ads, Products, Sales copy, Websites copy |
| Template card (link) | `getByRole('link', { name: '<Template>' })` |
| Template card (button) | `getByRole('button', { name: '<Template>' })` |

Templates: AIDA, Before After Bridge, Blog Introduction, Blog Outline, Blog Post SEO, Catchy Headlines, Cold Emails, Content Improver, Email Headlines, Explain Simply, Facebook Headlines, Facebook Primary Text, Feature To Benefits, Google Description, Google Headlines, Home Post SEO, Listicles, Marketing Angles, Pain Agitate Solution, Problem Promise Proof Proposal, Product Description, Product Reviewer, Review Generator, Sentence Expander, Tone Detector, Value Proposition.

Each template has both a link and a button with the same name, so always say which role you want.

## /settings — Settings (Account profile tab by default)
| Element | Locator |
|---|---|
| Account profile tab | `getByRole('tab', { name: 'Account profile' })` |
| Workspace tab | `getByRole('tab', { name: 'Workspace' })` |
| Integrations tab | `getByRole('tab', { name: 'Integrations' })` |
| Billing tab | `getByRole('tab', { name: 'Billing' })` |
| Help center tab | `getByRole('tab', { name: 'Help center' })` |
| Trash tab | `getByRole('tab', { name: 'Trash' })` |
| First switch | `locator('#airplane-mode')` |
| Language selector | `getByRole('combobox', { name: 'English' })` |
| Native select ⚠ | `locator('select')` |
| Save changes | `getByRole('button', { name: 'Save changes' })` |
| Notification switch | `locator('#notification')` |
| Other checkboxes ⚠ | `locator('input').nth(0..3)` |

The other settings tabs were not opened.

## /app/rewards — Rewards
| Element | Locator |
|---|---|
| Check rewards history | `getByRole('button', { name: 'Check rewards history' })` |
| Capterra | `getByRole('button', { name: 'Capterra' })` |
| G2 | `getByRole('button', { name: 'G2' })` |
| TrustPilot | `getByRole('button', { name: 'TrustPilot' })` |
| Linkedin | `getByRole('button', { name: 'Linkedin' })` |
| X | `getByRole('button', { name: 'X', exact: true })` |
| Facebook | `getByRole('button', { name: 'Facebook' })` |
| Unlabelled icon buttons ⚠ | `locator('button.flex.items-center').nth(5..9)`, `locator('button.inline-flex.items-center').nth(9)` |

## /copy-butler/:id — Copy Butler (document editor, opens with the topic dialog)
| Element | Locator |
|---|---|
| Create new tab | `getByRole('tab', { name: 'Create new' })` |
| Select from existing tab | `getByRole('tab', { name: 'Select from existing' })` |
| Keyword input | `getByPlaceholder('Enter relevant keyword to guide the AI in generating topic ideas.')` |
| Cancel | `getByRole('button', { name: 'Cancel' })` |
| Get Clusters | `getByRole('button', { name: 'Get Clusters' })` |
| Unlabelled icon buttons ⚠ | `locator('button.rounded-full.border').nth(1)`, `locator('button.flex.items-center').nth(3)` |

---

# Part 2 — Dialogs, menus, sub-pages and tabs (opened by clicking)

I opened these one at a time and then closed them with Escape, Cancel or Close. Nothing was submitted, saved, created or deleted.
For locators inside a dialog, scope them to the dialog so they don't clash with page buttons that have the same name:
`page.getByRole('dialog').getByRole('button', { name: 'Cancel' })`.

## Shared layout

### Workspace switcher → menu (`getByRole('menu')`)
| Element | Locator |
|---|---|
| Current workspace item | `getByRole('menu').getByText('Main Workspace')` |
| Create a workspace | `getByRole('button', { name: 'Create a workspace' })` → navigates to `/settings/workspace-creation` |

### `/settings/workspace-creation` — Create Workspace (full page)
| Element | Locator |
|---|---|
| Upload logo (a `<label>`) | `getByText('Upload', { exact: true })` |
| Color picker trigger ⚠ | `locator('button.flex.h-10')` |
| Color native select ⚠ | `locator('select')` |
| Workspace name | `getByPlaceholder('Workspace name...')` |
| Cancel | `getByRole('button', { name: 'Cancel' })` |
| Create | `getByRole('button', { name: 'Create' })` |

### Sidebar bottom user button (`locator('button').nth(6)`) → menu
| Element | Locator |
|---|---|
| Dark mode | `getByRole('menuitem', { name: 'Dark mode' })` |
| Logout | `getByRole('menuitem', { name: 'Logout' })` |

### Video/help icon next to every page title → dialog
The dialog is titled after the page, e.g. "Brand Voice".
| Element | Locator |
|---|---|
| Dialog | `getByRole('dialog')` |
| Close | `getByRole('dialog').getByRole('button', { name: 'Close' })` |

## Dashboard
| Trigger | Result |
|---|---|
| "Add domain" | Redirects to **Google sign-in (Search Console OAuth)** at accounts.google.com. The app has no dialog for this. |
| "Link" (Link your domain) | Same Google Search Console flow; I didn't click it. |
| "+" on the Brand Voice widget | Navigates to `/app/brand-voice` |

## Documents
| Trigger | Result |
|---|---|
| Status / Source | Toggle which filter group is shown: Draft / In Review / Completed / Published (locators in Part 1). No popup. |
| New document | **Not clicked**, because it creates a real document. It goes to `/copy-butler/:id`; see the Copy Butler section below. |

## Brand Voice
### "New Voice" → dialog "New brand voice"
| Element | Locator |
|---|---|
| Paste your text tab | `getByRole('tab', { name: 'Paste your text' })` |
| Extract from URL tab | `getByRole('tab', { name: 'Extract from URL' })` |
| Text content (Paste tab) | `getByPlaceholder('Write some content here...')` |
| URL (Extract tab) | `getByPlaceholder('Paste your url here...')` |
| Generate Voice | `getByRole('button', { name: 'Generate Voice' })` |
| Close | `getByRole('dialog').getByRole('button', { name: 'Close' })` |

### Dialog "Generated voice" (save step, opened by an unlabelled icon button ⚠)
| Element | Locator |
|---|---|
| Color trigger ⚠ / select ⚠ | `getByRole('dialog').locator('button.flex.h-10').nth(0)` / `getByRole('dialog').locator('select').nth(0)` |
| Icon picker | `getByRole('combobox', { name: 'robotIcon' })` |
| Title | `getByPlaceholder('Choose a title')` |
| Cancel / Save | `getByRole('dialog').getByRole('button', { name: 'Cancel' })` / `getByRole('dialog').getByRole('button', { name: 'Save' })` |

## Topical Map
### "New Topic Research" → dialog "New Topic Research"
| Element | Locator |
|---|---|
| Topic input | `getByPlaceholder('e.g best SEO Tool')` |
| Cancel | `getByRole('dialog').getByRole('button', { name: 'Cancel' })` |
| Create Topic Research | `getByRole('button', { name: 'Create Topic Research' })` |
| Close | `getByRole('dialog').getByRole('button', { name: 'Close' })` |

## Calendar
### "More view" → menu
| Element | Locator |
|---|---|
| Summary view | `getByRole('menuitem', { name: 'Summary' })` |
| List view | `getByRole('menuitem', { name: 'List' })` |

Summary view adds `getByRole('button', { name: 'All time' })` and `getByRole('button', { name: 'View all items' })`.
List view adds a "select all" checkbox: `locator('button.peer.h-4')` ⚠.
"Board" returns to the board view (`?view=board`).

### "Filters" → dialog "FILTERS"
| Element | Locator |
|---|---|
| Close | `getByRole('dialog').getByRole('button', { name: 'Close' })` |
| Clear | `getByRole('button', { name: 'Clear' })` |
| Date | `getByRole('button', { name: 'Pick a date' })` |
| Status | `getByPlaceholder('Select status...')` |
| Unlabelled buttons ⚠ | `locator('button.relative.flex')`, `locator('button.p-2.rounded-md').nth(0..2)` |
| Assignee avatar "O" | `getByRole('button', { name: 'O', exact: true })` |

### "Add Task" → dialog "Add Standalone Task"
| Element | Locator |
|---|---|
| Close | `getByRole('dialog').getByRole('button', { name: 'Close' })` |
| Status | `getByRole('combobox', { name: 'Draft' })` (the name is the current value) |
| Priority | `getByRole('combobox', { name: 'Medium' })` (the name is the current value) |
| Native selects ⚠ | `getByRole('dialog').locator('select').nth(0)` / `.nth(1)` |
| Task title | `getByPlaceholder('Enter task title')` |
| Description | `getByPlaceholder('Write task description...')` |
| Start date (name = current date) | `getByRole('button', { name: /\w{3} \d{1,2}, \d{4}/ })` |
| Due date | `getByRole('dialog').getByRole('button', { name: 'Pick a date' })` |
| Linked document | `getByRole('combobox', { name: 'Select a document...' })` |
| Assignee | `getByRole('button', { name: 'Unassigned' })` |
| Estimate | `getByRole('button', { name: 'Add estimate' })` |
| Activity tabs | `getByRole('button', { name: 'All' })`, `getByRole('button', { name: 'Comments' })`, `getByRole('button', { name: 'History' })` |
| Comment editor (Quill) | `getByRole('dialog').locator('.ql-editor')` |
| Editor toolbar | `getByRole('button', { name: 'bold' })`, `getByRole('button', { name: 'italic' })`, `underline`, `strike`, `list: ordered`, `list: bullet`, `list: check`, `link`, `image`, `code-block`, `clean` (all use the same `getByRole('button', …)` pattern) |
| Toolbar pickers ⚠ | `locator('span.ql-picker-label').nth(0..2)` |
| Quick replies | `getByRole('button', { name: 'Status update...' })`, `getByRole('button', { name: 'Thanks...' })`, `getByRole('button', { name: 'Agreed...' })` |
| Save comment | `getByRole('dialog').getByRole('button', { name: 'Save' })` |
| Cancel | `getByRole('dialog').getByRole('button', { name: 'Cancel' })` |
| Create Task | `getByRole('button', { name: 'Create Task' })` |

### Column "…" button (`locator('button.rounded-md.p-1').nth(n)`) → popover
| Element | Locator |
|---|---|
| Edit column | `getByRole('button', { name: 'Edit' })` |
| Delete column | `getByRole('button', { name: 'Delete' })` |

### Add-column button (`locator('button.flex.h-9')`) → dialog "Add Status"
| Element | Locator |
|---|---|
| Close | `getByRole('dialog').getByRole('button', { name: 'Close' })` |
| Status name | `getByPlaceholder('Enter status name')` |
| Color swatches | `getByRole('button', { name: 'Gray' })`; same pattern for Red, Orange, Yellow, Green, Blue, Indigo, Purple, Pink |
| Hex/color input ⚠ | `locator('input.h-10.w-14')` |
| Cancel | `getByRole('dialog').getByRole('button', { name: 'Cancel' })` |
| Create Status | `getByRole('button', { name: 'Create Status' })` |

## LLM Brand Ranking
### "Create your first AI tracker" → `/app/llm-rank/discover` (step 1 of a wizard)
| Element | Locator |
|---|---|
| Brand | `getByRole('textbox', { name: 'Brand' })` |
| Topic | `getByRole('textbox', { name: 'Topic' })` |
| Engines | `getByRole('button', { name: 'ChatGPT' })`, `getByRole('button', { name: 'Claude' })`, `getByRole('button', { name: 'Perplexity' })` |
| Cancel | `getByRole('button', { name: 'Cancel' })` |
| Next | `getByRole('button', { name: 'Next' })` |

I didn't go past step 1, because the later steps need real input.

## Pluma Art
| Element | Notes |
|---|---|
| "Visual" switch (`locator('button.peer.inline-flex')`) | Toggling it shows no new fields. I toggled it back. |
| Favourite tab | Shows no new controls (the list is empty). |

## Link Network
| Trigger | Result |
|---|---|
| Connect Your Domain | Redirects to **Google sign-in (Search Console OAuth)**, like "Add domain" on the Dashboard. |
| Continue with Existing Account | Disabled until a domain is connected. |

## Backlinks Analytics
### "View History" → `/app/backlinks-analytics/history`
| Element | Locator |
|---|---|
| New Analysis | `getByRole('button', { name: 'New Analysis' })` |
| Search | `getByPlaceholder('Search by target domain...')` |

## Keyword Intelligence
### "View All" (link or button) → `/app/tools/keyword_intelligence/recent`
| Element | Locator |
|---|---|
| New Keyword | `getByRole('button', { name: 'New Keyword' })` |
| Search | `getByPlaceholder('Search by keyword...')` |

## Templates
### Template card → `/app/templates/:id` (example: AIDA)
| Element | Locator |
|---|---|
| Back to templates ⚠ | `locator('a[href="/app/templates"]')` |
| Name | `getByPlaceholder('Name')` |
| Info tooltip icon ⚠ | `locator('button.flex.items-center').nth(5)` |
| Details | `getByPlaceholder('Brief details or features.')` |
| Tone | `getByPlaceholder('e.g. Friendly, Professional.')` |
| Brand-voice switch ⚠ | `locator('button.peer.inline-flex')` |
| Generate a copy | `getByRole('button', { name: 'Generate a copy' })` |

The input fields may differ from one template to another.

## Settings (all tabs; each tab has its own URL)
Tabs: `getByRole('tab', { name: 'Account profile' | 'Settings' | 'Workspace' | 'Integrations' | 'Billing' | 'Help center' | 'Trash' })`

### `/settings/account-profile` — Account profile
| Element | Locator |
|---|---|
| Delete photo | `getByRole('button', { name: 'Delete' })` |
| Update photo | `getByRole('button', { name: 'Update' })` |
| Full name | `locator('input[name="username"]')` |
| Phone number | `locator('input[name="phoneNumber"]')` |
| Email ⚠ | `locator('input.flex.h-10').nth(2)` |
| Change password | `getByRole('button', { name: 'Change password' })` |
| Logout | `getByRole('button', { name: 'Logout' })` |

**"Change password" → dialog "Change password"**
| Element | Locator |
|---|---|
| Old password | `locator('input[name="oldPassword"]')` |
| New password | `locator('input[name="newPassword"]')` |
| Confirm password | `locator('input[name="confirmPassword"]')` |
| Cancel | `getByRole('dialog').getByRole('button', { name: 'Cancel' })` |
| Save Changes | `getByRole('button', { name: 'Save Changes' })` |
| Close | `getByRole('dialog').getByRole('button', { name: 'Close' })` |

### `/settings` — Settings tab
These are the controls Part 1 listed under /settings, now with their meaning.
| Element | Locator |
|---|---|
| Dark theme switch | `locator('#airplane-mode')` (the id is misleading; it controls dark theme) |
| Allow notifications switch | `locator('#notification')` |
| Language | `getByRole('combobox', { name: 'English' })` → listbox `getByRole('option', { name: 'English' })` (the only option) |
| Save changes | `getByRole('button', { name: 'Save changes' })` |

### `/settings/workspace`
| Element | Locator |
|---|---|
| Create a workspace | `getByRole('button', { name: 'Create a workspace' })` |
| Search | `getByPlaceholder('Search...')` |
| Sort by creation date | `getByRole('button', { name: 'Creation date' })` (toggles the sort; no menu) |
| Row tooltip icon ⚠ | `locator('button[data-state]').filter({ hasNotText: /./ })` |

### `/settings/integrations`
Sub-tabs: `getByRole('tab', { name: 'Publish' | 'SEO' | 'Plagiarism' | 'Workflow' | 'BYOK' })`
| Sub-tab | Cards → locator |
|---|---|
| Publish | Wordpress, Webflow → `getByText('Wordpress').locator('..').getByRole('button', { name: 'Connect' })`. Safer: give each card a test id. |
| SEO | No buttons |
| Plagiarism | Copyscape → Connect |
| Workflow | No buttons |
| BYOK | Hunter io → Connect |

Every Connect button has the same name, so filter by card text, for example:
`page.locator('div').filter({ hasText: /^Wordpress/ }).getByRole('button', { name: 'Connect' }).first()`.
I didn't click any Connect button, because each one starts a connection to another service.

### `/settings/billing`
| Element | Locator |
|---|---|
| Plan & Billing | `getByRole('button', { name: 'Plan & Billing' })` (not clicked; it likely opens the payment portal) |

### `/settings/help-center`
**"Contact us" → dialog "Contact Pluma Support"**
| Element | Locator |
|---|---|
| Email (placeholder is the account email) | `getByRole('dialog').getByRole('textbox').first()` |
| Subject | `getByRole('combobox', { name: 'Select a subject' })` |
| Ticket title | `getByPlaceholder('Ticket title...')` |
| Message | `getByPlaceholder('Write here...')` |
| Cancel | `getByRole('dialog').getByRole('button', { name: 'Cancel' })` |
| Send Message | `getByRole('button', { name: 'Send Message' })` |
| Close | `getByRole('dialog').getByRole('button', { name: 'Close' })` |

### `/settings/trash`
| Element | Locator |
|---|---|
| Search | `getByPlaceholder('Search...')` |
| Restore all | `getByRole('button', { name: 'Restore all' })` |
| Delete | `getByRole('button', { name: 'Delete' })` |
| Select all | `getByRole('checkbox', { name: 'Select all' })` |

## Rewards
| Trigger | Result |
|---|---|
| Check rewards history | Opens dialog "Rewards history" with `getByRole('dialog').getByRole('button', { name: 'Close' })` |
| Capterra / G2 / TrustPilot / Linkedin / X / Facebook | Selector buttons. They open no popup or new tab. |
| Icon buttons `nth(5..9)` | Tooltip triggers. They open no dialog. |

## Copy Butler `/copy-butler/:id` — article wizard
Wizard steps (plain text, not clickable): `getByText('Cluster')`, `getByText('Content Setup & Reference')`, `getByText('Title')`, `getByText('Outline')`.
| Element | Locator |
|---|---|
| Open sidebar overlay ⚠ | `locator('button.rounded-full.border').nth(1)` |
| Back to documents | `locator('a[href="/app/documents"]')` |
| Create new / Select from existing | `getByRole('tab', { name: 'Create new' })` / `getByRole('tab', { name: 'Select from existing' })` |
| Keyword | `getByPlaceholder('Enter relevant keyword to guide the AI in generating topic ideas.')` |
| Language dropdown (custom div, not a combobox) | `locator('div.cursor-pointer.h-10').nth(0)` → search `getByPlaceholder('Search...')` → option `getByText('Arabic', { exact: true })` (27 languages) |
| Location dropdown (custom div) | `locator('div.cursor-pointer.h-10').nth(1)` → search `getByPlaceholder('Search...')` → option `getByText('Algeria', { exact: true })` (~190 countries) |
| Cancel | `getByRole('button', { name: 'Cancel' })` |
| Get Clusters (submit) | `getByRole('button', { name: 'Get Clusters' })` |

Wizard steps 2–4 only appear after "Get Clusters", which runs an AI generation, so I didn't capture them.

---

### Still not covered (each one would change data or leave the app)
- **New document**: creates a real document.
- **Submit/Create/Save/Generate buttons**: steps after submitting (Copy Butler steps 2–4, LLM tracker step 2+, generated results).
- **Connect buttons and Add domain / Link / Connect Your Domain**: start Google OAuth or third-party connections.
- **Plan & Billing**: opens the payment portal.
- **Delete / Restore all / Logout**: destructive actions or ending the session.
