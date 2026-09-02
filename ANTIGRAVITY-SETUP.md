# Antigravity Initial Setup Guide

Panduan universal inisialisasi awal (Starter Setup) untuk AI Agent Skills, MCP Servers, dan UI/UX tooling pada project Antigravity baru.

---

## 1. ⚡ One-Liner: Install Semua AI Skills Sekaligus

Jalankan perintah ini di root folder project baru Anda:

```bash
npx -y skills add nextlevelbuilder/ui-ux-pro-max-skill -s ui-ux-pro-max -a antigravity -y && \
npx -y skills add anthropics/skills --skill frontend-design -a antigravity -y && \
npx -y skills add shadcn/ui@shadcn -a antigravity -y && \
npx -y skills add addyosmani/web-quality-skills -a antigravity -y && \
npx -y skills add wshobson/agents@accessibility-compliance -a antigravity -y
```

---

## 2. 🌍 Global Setup (1x untuk Semua Project di Komputer)

Jika ingin skill otomatis aktif di semua project tanpa perlu install ulang per folder:

```bash
npx -y skills add nextlevelbuilder/ui-ux-pro-max-skill -s ui-ux-pro-max -a antigravity -g -y && \
npx -y skills add anthropics/skills --skill frontend-design -a antigravity -g -y && \
npx -y skills add shadcn/ui@shadcn -a antigravity -g -y && \
npx -y skills add addyosmani/web-quality-skills -a antigravity -g -y && \
npx -y skills add wshobson/agents@accessibility-compliance -a antigravity -g -y
```

---

## 3. 📋 Daftar Per Skill (Instalasi Satuan)

| # | Skill Name | Sumber Repository | Fungsi Utama | Perintah Instalasi Satuan |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `ui-ux-pro-max` | `nextlevelbuilder/ui-ux-pro-max-skill` | Design system, token warna, typography, layout | `npx -y skills add nextlevelbuilder/ui-ux-pro-max-skill -s ui-ux-pro-max -a antigravity -y` |
| **2** | `frontend-design` | `anthropics/skills` | Aesthetic direction & modern frontend guidelines | `npx -y skills add anthropics/skills --skill frontend-design -a antigravity -y` |
| **3** | `shadcn` | `shadcn/ui` | Komponen dan style shadcn/ui | `npx -y skills add shadcn/ui@shadcn -a antigravity -y` |
| **4** | `web-quality-skills` | `addyosmani/web-quality-skills` | Google best practices, SEO, Core Web Vitals, Performance | `npx -y skills add addyosmani/web-quality-skills -a antigravity -y` |
| **5** | `accessibility-compliance`| `wshobson/agents` | W3C & WCAG 2.1 / 2.2 accessibility compliance & audit | `npx -y skills add wshobson/agents@accessibility-compliance -a antigravity -y` |

---

## 4. ⚙️ Konfigurasi MCP Servers (`.agents/mcp_config.json`)

Buat file `.agents/mcp_config.json` di root project:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

---

## 5. 🎨 Essential UI & Animation Dependencies

Package standar untuk modern web application (React, Tailwind CSS, Framer Motion, Icons):

### Menggunakan Bun:
```bash
bun add framer-motion lucide-react clsx tailwind-merge canvas-confetti
```

### Menggunakan NPM:
```bash
npm install framer-motion lucide-react clsx tailwind-merge canvas-confetti
```

---

## 6. 💡 Generate Design System Awal

Setelah skill terinstall, jalankan perintah berikut untuk menginisialisasi design system master:

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<product-type> <keywords>" --design-system --persist
```
*Design system global akan otomatis tersimpan di folder `design-system/MASTER.md`.*
