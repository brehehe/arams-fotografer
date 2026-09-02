# MASTER PROMPT

## Premium Photography Management System — Laravel + React Inertia

Anda bertindak sebagai **Senior Product Designer, UI/UX Designer, Laravel Architect, React Engineer, Database Engineer, Security Engineer, dan QA Engineer**.

Bangun sebuah **Photography Management System berbasis web** untuk perusahaan/studio fotografi profesional.

Aplikasi ini digunakan untuk mengelola:

* Client
* Project / WO
* Paket fotografi
* Add-on
* Kategori project
* Workflow project
* Jadwal
* Pembayaran
* Invoice
* File / dokumentasi
* Report
* Finance sederhana
* User dan role
* Activity Log / audit trail
* Backup
* Pengaturan perusahaan
* Pengaturan sistem

---

# 1. VISUAL REFERENCE

Gunakan screenshot dashboard yang diberikan dalam conversation ini sebagai **referensi visual utama**.

Jangan melakukan copy-paste desain secara mentah.

Ambil prinsip desainnya:

* Professional
* Clean
* Premium
* Elegant
* Modern
* Business-oriented
* High readability
* Structured
* Minimal visual noise
* Strong information hierarchy
* Banyak whitespace
* Card yang clean
* Sidebar dark/navy
* Accent warna gold/orange yang elegan
* Typography modern
* Border subtle
* Shadow sangat ringan
* Rounded corner modern
* Status menggunakan semantic colors
* Data visualization sederhana dan mudah dibaca

Jangan membuat desain yang terlihat seperti:

* AI dashboard
* AI startup
* ChatGPT clone
* futuristic AI interface
* neon dashboard
* glassmorphism berlebihan
* gradient berlebihan
* cyberpunk
* SaaS template generik

**Produk ini harus terasa seperti software bisnis profesional milik perusahaan fotografi premium.**

UI harus terasa seperti aplikasi yang benar-benar digunakan oleh perusahaan/studio fotografi setiap hari.

---

# 2. DESIGN PHILOSOPHY

Prioritaskan:

1. Usability
2. Information hierarchy
3. Readability
4. Consistency
5. Accessibility
6. Performance
7. Professional appearance
8. Responsive behavior

Jangan mengorbankan usability hanya demi visual.

Gunakan prinsip:

> Clean first, premium second, decorative last.

Setiap elemen UI harus memiliki alasan fungsional.

Hindari elemen dekoratif yang tidak memberikan value.

---

# 3. DESIGN SYSTEM

Sebelum membangun halaman secara luas, buat **Master Design System**.

Jika UI-UX Pro Max sudah terinstall, gunakan skill tersebut untuk melakukan design-system research dan gunakan hasilnya sebagai referensi.

Gunakan:

* UI-UX Pro Max
* Frontend Design
* shadcn/ui
* Web Quality
* Accessibility Compliance

Jika design system sudah tersedia di:

```text
design-system/MASTER.md
```

baca dan ikuti file tersebut.

Jangan membuat design system baru yang bertentangan dengan MASTER.md.

---

# 4. BRAND DIRECTION

Brand direction:

**Premium Photography Business Software**

Karakter:

* Elegant
* Trustworthy
* Professional
* Warm
* Premium
* Simple
* Organized

Gunakan dark navy sebagai foundation dan gold sebagai brand accent.

Contoh semantic color system:

```text
Primary:
Gold / Warm Gold

Neutral:
White
Slate
Gray
Dark Navy

Success:
Green

Warning:
Amber / Orange

Danger:
Red

Info:
Blue

Accent:
Purple hanya jika benar-benar diperlukan
```

Jangan menggunakan terlalu banyak warna.

Status dan kategori harus menggunakan semantic color yang konsisten.

---

# 5. TYPOGRAPHY

Typography harus modern dan professional.

Hierarchy:

```text
Page Title
Section Title
Card Title
Metric
Body
Secondary Text
Caption
```

Jangan menggunakan font size terlalu kecil.

Prioritaskan readability pada:

* table
* form
* financial information
* activity log
* project status
* client data

---

# 6. LAYOUT

Gunakan layout dashboard profesional:

```text
┌──────────────────────────────────────────────┐
│ Sidebar │ Top Navigation                    │
│         ├────────────────────────────────────┤
│         │ Page Content                       │
│         │                                    │
│         │ Cards / Tables / Charts / Forms    │
│         │                                    │
└─────────┴────────────────────────────────────┘
```

Desktop:

* Sidebar sekitar 240–260px
* Bisa collapse menjadi icon-only
* Header sticky jika dibutuhkan
* Content memiliki max-width yang reasonable
* Jangan membuat konten terlalu melebar

Responsive:

```text
Desktop
Tablet
Mobile
```

Jangan hanya mengecilkan desktop.

Untuk mobile:

* Sidebar menjadi drawer
* Table berubah menjadi card/list jika terlalu lebar
* Filter menjadi bottom sheet/drawer
* Form menjadi single-column
* Action button tetap mudah dijangkau
* Tidak ada horizontal overflow yang tidak perlu

---

# 7. NAVIGATION

Buat sidebar:

```text
Dashboard

Clients

Projects / WO

Calendar / Schedule

Finance
    Payments
    Invoices

Master Data
    Categories
    Packages
    Add-ons
    Services
    Project Status
    Payment Methods

Reports

Files

Users

Activity Log

Settings

Logout
```

Menu dapat disesuaikan jika hasil information architecture menunjukkan struktur yang lebih baik.

Sidebar harus mendukung:

* Active state
* Hover state
* Collapsed state
* Nested menu
* Badge notification jika diperlukan
* Permission-aware menu
* Tooltip ketika collapsed

---

# 8. DASHBOARD

Dashboard harus mengikuti struktur visual screenshot sebagai baseline.

Buat dashboard yang berisi:

## Header

```text
Dashboard

Selamat datang kembali, Admin 👋
Kelola project, client, pembayaran, dan aktivitas studio.

[ Periode ]
```

Gunakan date/period filter.

Contoh:

```text
Hari Ini
Minggu Ini
Bulan Ini
Bulan Lalu
Tahun Ini
Custom Range
```

---

# 9. KPI CARDS

Buat KPI:

```text
Total Project
Project Aktif
Project Selesai
Total Client
```

Tambahkan jika relevan:

```text
Outstanding Payment
Revenue
Upcoming Deadline
```

Setiap KPI harus dapat diklik jika memiliki detail page.

Jika memungkinkan tampilkan trend:

```text
↑ 12.5% dari periode sebelumnya
```

Tetapi jangan menggunakan trend palsu.

Gunakan data database nyata.

---

# 10. FINANCE SUMMARY

Dashboard finance:

```text
Total Nilai Project
Total Pembayaran Diterima
Outstanding Payment
Collection Rate
```

Gunakan grafik yang sederhana.

Contoh:

```text
Monthly Payment
Jan
Feb
Mar
Apr
May
Jun
Jul
Aug
Sep
Oct
Nov
Dec
```

Bedakan:

```text
Project Value
Received Payment
Outstanding
```

Jangan menyebut seluruh project value sebagai revenue.

---

# 11. QUICK ACTIONS

Buat section:

```text
Akses Cepat
```

Actions:

```text
+ Client
+ Project
+ Payment
+ Invoice
+ Report
```

Primary action dapat menggunakan brand accent.

Gunakan icon dari:

```text
lucide-react
```

Jangan menggunakan emoji sebagai icon utama UI.

---

# 12. PROJECT TABLE

Buat table:

```text
Project
Client
Category
Package
Status
Progress
Payment
Deadline
Action
```

Contoh:

```text
Andi & Sinta Wedding
Andi Pratama
Wedding
Premium Wedding
Editing
68%
Rp 15.000.000 / Rp 25.000.000
05 Juni 2026
```

Gunakan:

* Avatar / project thumbnail
* Badge
* Progress bar
* Status
* Deadline indicator
* Action menu

Deadline:

```text
3 hari lagi
8 hari lagi
Selesai
Overdue
```

Gunakan semantic color.

---

# 13. CLIENT MODULE

Client adalah entity utama.

Buat:

## Client List

Kolom:

```text
Client
Contact
Total Project
Total Value
Outstanding
Last Project
Status
Action
```

Features:

* Search
* Filter
* Sort
* Pagination
* Bulk action jika diperlukan
* Export jika diperlukan

---

# 14. CLIENT DETAIL

Client detail harus menjadi pusat informasi client.

Layout:

```text
Client Header

Name
Phone
Email
Address
Status

Total Project
Total Transaction
Outstanding

Tabs:

Overview
Projects
Payments
Invoices
Files
Activity
Notes
```

Semua data harus terhubung dengan client.

---

# 15. PROJECT / WO MODULE

Project merupakan inti operasional.

Gunakan konsep:

```text
Client
   ↓
Project / WO
   ↓
Package
   ↓
Add-ons
   ↓
Schedule
   ↓
Production
   ↓
Editing
   ↓
Delivery
   ↓
Payment
```

Project harus mempunyai:

```text
Project Number
Project Name
Client
Category
Package
Add-ons
Event Date
Location
Start Time
End Time
Status
Progress
Photographer
Editor
Supervisor
Notes
Price
Discount
Tax jika digunakan
Grand Total
Payment Status
Deadline
Files
```

---

# 16. PROJECT DETAIL

Project detail harus menggunakan layout yang professional.

Header:

```text
Project Name
Project Number
Client
Status
Project Value
Payment Status
```

Tabs:

```text
Overview
Timeline
Schedule
Package
Add-ons
Team
Payments
Invoices
Files
Notes
Activity
```

Gunakan timeline untuk workflow.

Contoh:

```text
Booking
   ↓
Preparation
   ↓
Event
   ↓
Editing
   ↓
Review
   ↓
Finalization
   ↓
Delivered
   ↓
Completed
```

Status harus configurable dari Master Data.

---

# 17. WORK ORDER

Jika Project diperlakukan sebagai Work Order, gunakan nomor WO yang unik.

Contoh:

```text
WO-2026-00001
WO-2026-00002
```

Format nomor harus configurable.

Jangan hardcode.

---

# 18. PACKAGE MASTER DATA

Buat Master Data:

```text
Packages
```

Field:

```text
Package Name
Category
Description
Base Price
Duration
Included Services
Included Deliverables
Status
Sort Order
```

Package dapat memiliki:

```text
Wedding Package
Prewedding Package
Event Package
Newborn Package
Maternity Package
Commercial Package
```

Kategori harus configurable.

---

# 19. ADD-ON MASTER DATA

Buat:

```text
Add-ons
```

Field:

```text
Name
Category
Description
Price
Unit
Status
```

Contoh:

```text
Additional Photographer
Additional Hour
Album
Canvas
Drone
Same Day Edit
Additional Photo
Video Highlight
```

Harga add-on dapat ditambahkan ke Project.

---

# 20. MASTER DATA

Master Data harus scalable.

Minimal:

```text
Categories
Packages
Add-ons
Services
Project Status
Payment Methods
File Types
```

Gunakan CRUD standard:

```text
Create
Read
Update
Delete
Restore
Force Delete jika authorized
```

Gunakan SoftDeletes untuk entity yang relevan.

---

# 21. SCHEDULE / CALENDAR

Buat calendar untuk:

* Event
* Shooting
* Editing deadline
* Delivery
* Meeting
* Other schedule

View:

```text
Month
Week
Day
List
```

Gunakan warna berdasarkan category/status.

Klik event membuka Project detail.

---

# 22. FINANCE SIMPLE

Finance tidak perlu menjadi accounting software kompleks.

Fokus pada:

```text
Project Value
Invoice
Payment
Outstanding
Payment Status
```

Payment:

```text
Payment Number
Project
Client
Date
Amount
Payment Method
Reference
Notes
Created By
```

Status:

```text
Unpaid
Partial
Paid
Overdue
```

Dashboard finance harus menghitung data aktual dari database.

---

# 23. INVOICE

Buat invoice system sederhana.

Invoice:

```text
Invoice Number
Client
Project
Invoice Date
Due Date
Items
Subtotal
Discount
Tax
Total
Paid
Remaining
Status
```

Nomor invoice configurable.

Contoh:

```text
INV/2026/00001
```

Tetapi format harus dapat diubah melalui Settings.

---

# 24. INVOICE NUMBER SETTINGS

Settings harus mendukung:

```text
Invoice Prefix
Invoice Number
Invoice Padding
Invoice Format
Reset Number
Reset Period
```

Contoh:

```text
INV/{YEAR}/{NUMBER}
INV-{YEAR}-{MONTH}-{NUMBER}
```

Pastikan nomor invoice:

* unique
* atomic
* race-condition safe
* tidak duplicate
* aman ketika concurrent request

---

# 25. REPORT

Buat Reports yang sederhana tetapi profesional.

Minimal:

```text
Project Report
Client Report
Revenue Report
Payment Report
Outstanding Report
Project Performance
Package Performance
Category Performance
Photographer Performance
Editor Performance
```

Filter:

```text
Date Range
Category
Status
Client
Photographer
Editor
Package
Payment Status
```

Output:

```text
Summary
Table
Chart
Export
```

Jangan membuat dashboard analytics berlebihan.

---

# 26. ACTIVITY LOG / AUDIT TRAIL

Implementasikan activity logging secara menyeluruh menggunakan:

**spatie/laravel-activitylog**

Log minimal:

```text
Login
Logout

Create
Insert
Update
Delete
Restore
Force Delete

View
Open Menu
Open Page

Upload
Download
Delete File

Create Payment
Update Payment

Create Invoice
Update Invoice

Change Project Status
Assign Photographer
Assign Editor
Assign Supervisor

Change Settings

Backup
Restore Backup
```

Activity harus menyimpan jika memungkinkan:

```text
User
Action
Subject
Subject Type
Subject ID
Description
Old Values
New Values
IP Address
User Agent
URL / Route
HTTP Method
Timestamp
```

---

# 27. MENU / PAGE ACTIVITY

Selain mutation activity, track juga aktivitas navigasi penting.

Contoh:

```text
User opened Dashboard
User opened Clients
User opened Client Detail
User opened Projects
User opened Finance
User opened Reports
User opened Settings
```

Tetapi jangan melakukan database logging pada setiap render React component.

Gunakan event/middleware yang tepat dan cegah log berlebihan.

Activity log harus tetap performant.

---

# 28. ACTIVITY LOG UI

Buat halaman:

```text
Activity Log
```

Dengan:

```text
Date
User
Action
Module
Description
IP
Timestamp
```

Filter:

```text
User
Action
Module
Date Range
Subject
```

Detail activity dapat membuka:

```text
Before
After
```

Untuk update:

```text
Price
Rp 10.000.000
→
Rp 12.000.000
```

---

# 29. SECURITY

Security harus menjadi prioritas.

Gunakan security best practice Laravel.

Implementasikan:

* Authentication
* Authorization
* CSRF protection
* XSS protection
* SQL injection protection
* Mass assignment protection
* Validation
* Rate limiting
* Secure password hashing
* Session security
* Secure cookies
* Authorization policy
* Form Request validation
* Input sanitization
* File upload validation
* MIME validation
* File size limits
* Secure download authorization
* Prevent unauthorized object access
* Prevent IDOR
* Prevent privilege escalation
* Login throttling
* Session regeneration after login
* Logout invalidation
* Password confirmation untuk action sensitif

Jangan expose:

* internal database ID jika tidak diperlukan
* sensitive configuration
* secret key
* password
* tokens

---

# 30. ROLE & PERMISSION

Gunakan:

**spatie/laravel-permission**

Buat role:

```text
Super Admin
Admin
Supervisor
Fotografer
Editor
```

Permission dibuat granular.

Contoh:

```text
dashboard.view

clients.view
clients.create
clients.update
clients.delete
clients.restore

projects.view
projects.create
projects.update
projects.delete
projects.restore

packages.view
packages.create
packages.update
packages.delete

addons.view
addons.create
addons.update
addons.delete

payments.view
payments.create
payments.update
payments.delete

invoices.view
invoices.create
invoices.update
invoices.delete

reports.view

files.view
files.upload
files.download
files.delete

users.view
users.create
users.update
users.delete

roles.view
roles.create
roles.update
roles.delete

settings.view
settings.update

activity-log.view

backup.create
backup.view
backup.restore
```

Role harus benar-benar diterapkan melalui:

* Middleware
* Policies
* Gates
* Backend authorization
* Frontend permission-aware UI

Jangan hanya menyembunyikan button di React.

Backend tetap harus melakukan authorization.

---

# 31. ROLE DEFAULT

Implementasikan role default:

### Super Admin

Full access.

### Admin

Full operational access.

### Supervisor

Full operational monitoring dan management sesuai konfigurasi permission.

### Fotografer

Project, schedule, assigned project, file, activity yang relevan.

### Editor

Project editing workflow, assigned project, files, delivery workflow.

Namun **jangan hardcode restriction di business logic**.

Semua akses harus berasal dari permission system sehingga permission dapat diubah dari admin.

Jika requirement bisnis meminta seluruh role memiliki akses penuh, sistem harus tetap mampu memberikan seluruh permission tanpa perlu mengubah source code.

---

# 32. USER MANAGEMENT

User:

```text
Name
Email
Phone
Avatar
Role
Status
Last Login
Created At
```

Status:

```text
Active
Inactive
Suspended
```

User detail:

```text
Profile
Roles
Permissions
Projects
Activity
Login History
```

---

# 33. SETTINGS

Settings harus profesional dan terstruktur.

Buat:

```text
Company
General
Branding
Invoice
Date & Time
Security
Backup
Activity Log
System
```

---

# 34. COMPANY SETTINGS

Field:

```text
Company Name
Legal Name
Tagline
Email
Phone
WhatsApp
Website
Address
City
Province
Postal Code
Country
Tax ID jika diperlukan
```

---

# 35. BRANDING SETTINGS

Field:

```text
Logo
Favicon
Primary Color
Company Name
Login Logo
Login Background
```

Upload harus divalidasi.

Logo dan favicon tidak boleh menerima file berbahaya.

---

# 36. DATE & TIME SETTINGS

Support:

```text
Date Format
Time Format
Timezone
First Day of Week
Currency
Currency Position
Decimal Separator
Thousands Separator
```

Contoh date:

```text
DD/MM/YYYY
MM/DD/YYYY
YYYY-MM-DD
```

Default Indonesia:

```text
DD/MM/YYYY
Asia/Jakarta
IDR
```

Jangan hardcode format tanggal ke seluruh application.

Gunakan centralized formatting helper.

---

# 37. BACKUP

Gunakan:

**spatie/laravel-backup**

Backup harus dapat:

```text
Create Backup
View Backup
Download Backup
Delete Backup
Restore jika architecture mendukung
```

Backup configuration:

```text
Daily
Weekly
Monthly
Retention
Storage
```

Gunakan queue jika backup berat.

Jangan menjalankan backup besar secara synchronous pada HTTP request jika dapat dihindari.

---

# 38. REDIS

Gunakan Redis untuk kebutuhan yang relevan:

```text
Cache
Queue
Rate Limiting
Session jika diperlukan
```

Gunakan queue untuk:

* backup
* report generation
* export
* notification
* heavy processing

Jangan memasukkan seluruh query database ke Redis tanpa alasan.

---

# 39. DATABASE

Database harus dirancang production-grade.

Gunakan:

* Foreign keys
* Proper indexes
* Composite indexes jika diperlukan
* Unique indexes
* Soft deletes
* Timestamps
* Nullable hanya jika benar-benar diperlukan
* Enum/value object atau centralized constants untuk state yang sesuai
* Transaction untuk proses penting

Index berdasarkan pola query nyata.

Contoh:

```text
clients
    email
    phone
    deleted_at

projects
    client_id
    status_id
    category_id
    event_date
    deadline
    deleted_at

payments
    project_id
    client_id
    payment_date
    payment_method_id

invoices
    invoice_number
    project_id
    client_id
    invoice_date
    due_date
    status

activity_log
    subject_type
    subject_id
    causer_type
    causer_id
    created_at
```

Jangan menambahkan index secara membabi buta.

---

# 40. SOFT DELETE

Gunakan SoftDeletes pada entity penting.

Minimal:

```text
Client
Project
Package
Add-on
Service
User jika business rule mengizinkan
Payment jika business rule mengizinkan
Invoice jika business rule mengizinkan
```

Hapus data secara aman.

UI harus memiliki:

```text
Delete
Trash
Restore
Permanent Delete
```

Permanent delete hanya untuk permission khusus.

---

# 41. LARAVEL ARCHITECTURE

Gunakan Laravel sebagai backend utama.

Prioritaskan:

```text
Controllers
Form Requests
Policies
Services
Actions
Events
Listeners
Jobs
Models
Resources
Repositories hanya jika benar-benar diperlukan
```

Jangan membuat controller menjadi terlalu besar.

Business logic jangan diletakkan seluruhnya di Controller.

---

# 42. REACT + INERTIA

Gunakan:

```text
Laravel
React
Inertia.js
```

Gunakan React untuk UI.

Gunakan Inertia untuk server-driven application flow.

Hindari membuat SPA architecture yang tidak diperlukan.

Prioritaskan:

* reusable components
* typed props
* predictable state
* forms
* validation
* loading states
* empty states
* error states

---

# 43. UI COMPONENTS

Gunakan shadcn/ui sebagai foundation jika sesuai.

Gunakan:

```text
Button
Input
Select
Combobox
DatePicker
Dialog
Drawer
Dropdown
Popover
Tabs
Table
Badge
Card
Tooltip
Toast
Alert
Skeleton
Pagination
Command
```

Customize visual style agar tidak terlihat seperti default shadcn.

---

# 44. ICONS

Gunakan:

```text
lucide-react
```

Icon harus konsisten.

Jangan mencampurkan banyak icon library.

---

# 45. ANIMATION

Gunakan:

```text
framer-motion
```

Tetapi sangat subtle.

Gunakan untuk:

* page transition
* modal transition
* drawer
* dropdown
* hover
* card interaction
* skeleton transition

Jangan membuat semua elemen bergerak.

Tidak boleh terasa seperti AI/futuristic interface.

Animation harus mendukung UX.

---

# 46. BUN

Gunakan Bun sebagai package manager/runtime sesuai kebutuhan project.

Jika dependencies belum tersedia:

```bash
bun add framer-motion lucide-react clsx tailwind-merge canvas-confetti
```

Tetapi **jangan install ulang dependency yang sudah terinstall**.

Sebelum install:

```bash
bun install
```

dan periksa package.json.

---

# 47. EXISTING SKILLS

Jika skill berikut sudah terinstall:

```text
ui-ux-pro-max
frontend-design
shadcn
web-quality-skills
accessibility-compliance
```

gunakan semuanya.

Jangan menganggap project kosong jika dependency/skill sudah tersedia.

Jangan menghapus konfigurasi yang sudah ada tanpa alasan.

---

# 48. MCP

Jika tersedia, manfaatkan:

```text
Playwright MCP
Chrome DevTools MCP
```

untuk:

* browser testing
* responsive testing
* visual inspection
* interaction testing
* console error detection
* network issue detection
* accessibility checking

---

# 49. QUALITY CONTROL

Setiap halaman harus dicek:

### UI

* alignment
* spacing
* typography
* hierarchy
* consistency
* responsive
* empty state
* loading state
* error state
* hover
* focus
* disabled
* active

### UX

* clear CTA
* understandable navigation
* confirmation destructive action
* useful feedback
* no dead-end screen

### Accessibility

Target:

**WCAG 2.2 AA**

Perhatikan:

* keyboard navigation
* focus state
* contrast
* semantic HTML
* aria label
* form label
* error messaging
* screen reader usability

---

# 50. RESPONSIVE REQUIREMENT

Test minimal:

```text
1440px
1280px
1024px
768px
390px
375px
```

Mobile harus tetap professional.

Mobile dashboard tidak boleh hanya menjadi desktop yang diperkecil.

---

# 51. LOADING STATE

Semua page yang mengambil data harus memiliki skeleton.

Contoh:

```text
Dashboard
    KPI skeleton
    Chart skeleton
    Table skeleton
```

Jangan membuat halaman kosong ketika request masih berjalan.

---

# 52. EMPTY STATE

Setiap module harus memiliki empty state.

Contoh:

```text
Belum ada project

Mulai dengan membuat project pertama.

[ + Tambah Project ]
```

Empty state harus membantu user melakukan action.

---

# 53. ERROR STATE

Gunakan error handling yang jelas.

Contoh:

```text
Data gagal dimuat.

Silakan coba lagi.

[ Coba Lagi ]
```

Validation:

```text
Nama project wajib diisi.
```

Jangan hanya menampilkan:

```text
Something went wrong.
```

---

# 54. DESTRUCTIVE ACTION

Delete harus menggunakan confirmation dialog.

Contoh:

```text
Hapus Project?

Project "Andi & Sinta Wedding" akan dipindahkan ke Trash.

[ Batal ] [ Hapus Project ]
```

Untuk permanent delete:

```text
Tindakan ini tidak dapat dibatalkan.
```

---

# 55. SEARCH & FILTER

List page harus memiliki:

```text
Search
Filter
Sort
Pagination
```

Filter harus mudah digunakan.

Jika filter aktif:

```text
Status: Active ×
Category: Wedding ×
```

Berikan:

```text
Clear Filters
```

---

# 56. PERFORMANCE

Prioritaskan:

* database indexing
* eager loading
* pagination
* lazy loading jika tepat
* query optimization
* caching
* Redis
* queue
* image optimization
* asset optimization
* code splitting
* avoid N+1 queries

Jangan mengambil seluruh database hanya untuk menampilkan 10 rows.

---

# 57. SECURITY AUDIT

Sebelum dianggap selesai, lakukan pemeriksaan:

```text
Authentication
Authorization
IDOR
Mass Assignment
SQL Injection
XSS
CSRF
File Upload
File Download
Rate Limiting
Session
Password
Role Escalation
Sensitive Data Exposure
```

Pastikan authorization diuji pada backend.

---

# 58. TESTING

Buat testing untuk business-critical functionality.

Minimal:

```text
Authentication
Role Permission
Client CRUD
Project CRUD
Package CRUD
Add-on CRUD
Payment
Invoice
Invoice Number
Soft Delete
Restore
Activity Log
Backup
Settings
```

Test terutama:

```text
Unauthorized user cannot access protected action.
User cannot manipulate another user's restricted resource.
Invoice number cannot duplicate.
Payment totals remain consistent.
Soft deleted records are handled correctly.
Activity is recorded.
```

---

# 59. ACTIVITY LOG CONSISTENCY

Setiap mutation penting harus otomatis menghasilkan activity.

Contoh:

```text
Created Client
Updated Client
Deleted Client
Restored Client

Created Project
Updated Project
Changed Project Status

Created Payment
Updated Payment

Created Invoice

Uploaded File
Deleted File

Changed Company Settings

User Logged In
User Logged Out
```

Gunakan event/listener atau architecture yang maintainable.

Jangan menulis:

```text
activity()->log(...)
```

secara acak di puluhan tempat jika dapat dibuat centralized.

---

# 60. UI COPY

Bahasa aplikasi:

**Bahasa Indonesia**

Gunakan bahasa bisnis yang natural.

Contoh:

```text
Dashboard
Klien
Project
Pembayaran
Invoice
Laporan
Pengaturan
Aktivitas
Pengguna
Master Data
```

Jangan menggunakan copy yang terasa seperti AI-generated.

Hindari:

```text
AI-powered
Intelligent
Smart insights
AI analytics
Future-ready
```

Aplikasi ini bukan aplikasi AI.

---

# 61. NO AI VISUAL STYLE

SANGAT PENTING:

Jangan gunakan:

* AI sparkle icon
* gradient neon
* glowing border
* holographic card
* excessive glassmorphism
* purple-blue AI gradient
* futuristic interface
* excessive animated particles
* chat-style UI
* AI assistant panel
* "Ask AI" button

UI harus terlihat seperti:

**Premium Business Management Software untuk perusahaan fotografi.**

---

# 62. DATA REALISTIC

Gunakan realistic mock/seed data saat development.

Contoh:

```text
Wedding
Prewedding
Event
Newborn
Maternity
Commercial
Product
Corporate
```

Client names harus realistic.

Project names realistic.

Nominal Rupiah realistic.

Jangan menggunakan:

```text
Lorem ipsum
Project ABC
John Doe
Test User
```

pada visual UI final jika dapat dihindari.

---

# 63. IMPLEMENTATION ORDER

Jangan langsung membuat semua halaman sekaligus.

Kerjakan bertahap:

## Phase 1 — Foundation

```text
Project setup
Database
Authentication
Roles
Permissions
Layout
Design System
Components
Theme
```

## Phase 2 — Core Data

```text
Clients
Categories
Packages
Add-ons
Services
Project Status
```

## Phase 3 — Project

```text
Projects / WO
Project Detail
Workflow
Schedule
Team Assignment
Files
```

## Phase 4 — Finance

```text
Payments
Invoices
Outstanding
Finance Dashboard
```

## Phase 5 — Reports

```text
Reports
Charts
Export
```

## Phase 6 — Administration

```text
Users
Activity Log
Settings
Backup
```

## Phase 7 — Quality

```text
Testing
Security Audit
Accessibility
Responsive
Performance
Browser Testing
```

---

# 64. IMPORTANT DEVELOPMENT RULE

Sebelum membuat component/page baru:

1. Periksa apakah component sudah ada.
2. Reuse component.
3. Jangan membuat duplicate component.
4. Ikuti design token.
5. Ikuti existing architecture.
6. Jangan merusak functionality yang sudah berjalan.

Jika ada existing implementation:

**improve it instead of rebuilding unnecessarily.**

---

# 65. FINAL UI TARGET

Hasil akhir harus memiliki karakter:

```text
Professional
Clean
Premium
Elegant
Warm
Business-oriented
Fast
Simple
Reliable
```

Secara visual harus terasa seperti:

> "Software management profesional yang dibuat khusus untuk studio fotografi."

Bukan:

> "Template dashboard AI."

---

# 66. FINAL ACCEPTANCE CRITERIA

Anggap project selesai hanya jika:

* UI konsisten di seluruh halaman
* Dashboard mengikuti visual direction screenshot
* Client terhubung dengan Project
* Project terhubung dengan Package dan Add-on
* Project terhubung dengan Payment dan Invoice
* Finance menghitung data nyata
* Invoice number aman dan configurable
* SoftDeletes berjalan
* Database memiliki index yang tepat
* Redis digunakan secara tepat
* Backup menggunakan Spatie Backup
* Activity Log mencatat aktivitas penting
* Login/logout tercatat
* Menu/page access dapat dicatat tanpa logging berlebihan
* Spatie Permission berjalan di backend
* Semua role tersedia
* Security validation berjalan
* Form validation berjalan
* Empty/loading/error state tersedia
* Responsive desktop/tablet/mobile
* Accessibility diperhatikan
* Tidak ada horizontal overflow yang tidak diperlukan
* Tidak ada N+1 query pada halaman utama
* Critical flow memiliki test
* Tidak ada console error
* Tidak ada broken route
* Tidak ada broken component
* Tidak ada placeholder visual yang tertinggal
* Tidak ada UI bergaya AI/futuristic
* Tidak ada hardcoded business configuration yang seharusnya berasal dari Settings

---

# 67. START NOW

Mulai dengan:

### Step 1

Inspect existing project.

Periksa:

```text
Laravel version
PHP version
Node/Bun
React
Inertia
Tailwind
shadcn
Redis
Database
Existing migrations
Existing models
Existing components
Existing routes
Existing authentication
Existing packages
Existing skills
```

### Step 2

Inspect screenshot reference dan design-system.

### Step 3

Buat/validasi:

```text
design-system/MASTER.md
```

### Step 4

Buat architecture plan.

### Step 5

Buat database schema dan migrations.

### Step 6

Implement authentication + roles + permissions.

### Step 7

Implement application shell:

```text
Sidebar
Header
Breadcrumb
Page Header
Command/Search
Notifications
User Menu
```

### Step 8

Implement Dashboard terlebih dahulu.

Dashboard harus menjadi **reference implementation** untuk kualitas UI seluruh aplikasi.

### Step 9

Setelah dashboard stabil, lanjutkan ke Client → Project → Finance → Reports → Settings.

### Step 10

Setelah setiap phase selesai:

* run tests
* run lint
* run build
* check console
* check browser
* check responsive
* check accessibility
* check security
* fix issues

**Jangan hanya menghasilkan mockup. Bangun aplikasi yang benar-benar functional dan production-oriented.**
