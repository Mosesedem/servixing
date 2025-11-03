# Navigation Structure Reference

## Layout Hierarchy

```
Root Layout (app/layout.tsx)
├── ConditionalNavbar
│   ├── Shows on: All pages except /auth/*
│   └── Hides on: /auth/signin, /auth/signup
│
├── Auth Pages (app/auth/*)
│   ├── /auth/signin
│   └── /auth/signup
│   └── No Navbar, Clean Auth UI
│
├── Public Pages
│   ├── / (Landing)
│   ├── /parts
│   ├── /shop
│   ├── /services
│   ├── /help
│   ├── /knowledge-base
│   └── /support
│   └── Navbar Only
│
├── Dashboard Layout (app/dashboard/layout.tsx)
│   ├── Navbar (from root)
│   ├── DashboardSidebar
│   │   ├── Overview
│   │   ├── My Devices
│   │   ├── Work Orders
│   │   └── Payments
│   └── Main Content Area
│
└── Admin Layout (app/admin/layout.tsx)
    ├── Navbar (from root)
    ├── AdminSidebar
    │   ├── Dashboard
    │   ├── Work Orders
    │   ├── Users
    │   ├── Payments
    │   └── Settings
    └── Main Content Area
```

## Component Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Navbar (Global)                  │
│  Logo | Parts | Shop | Services | Help | Auth      │
└─────────────────────────────────────────────────────┘

For Dashboard Pages:
┌─────────────────────────────────────────────────────┐
│                    Navbar (Global)                  │
└─────────────────────────────────────────────────────┘
┌────────────────┬────────────────────────────────────┐
│  Dashboard     │                                    │
│  Sidebar       │      Main Content Area             │
│                │                                    │
│  • Overview    │      (Children components)         │
│  • Devices     │                                    │
│  • Orders      │                                    │
│  • Payments    │                                    │
│                │                                    │
└────────────────┴────────────────────────────────────┘

For Admin Pages:
┌─────────────────────────────────────────────────────┐
│                    Navbar (Global)                  │
└─────────────────────────────────────────────────────┘
┌────────────────┬────────────────────────────────────┐
│  Admin Panel   │                                    │
│  Sidebar       │      Main Content Area             │
│                │                                    │
│  • Dashboard   │      (Children components)         │
│  • Orders      │                                    │
│  • Users       │                                    │
│  • Payments    │                                    │
│  • Settings    │                                    │
└────────────────┴────────────────────────────────────┘

For Auth Pages:
┌─────────────────────────────────────────────────────┐
│                                                     │
│         Centered Auth Form (No Navbar)              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Active State Visual Indicators

### Navbar Active State

```
Normal Link:     [🔍 Find Parts]     (gray, regular)
Active Link:     [🔍 Find Parts]     (orange, bold)
```

### Sidebar Active State

```
Normal Item:     [ 📱 My Devices ]   (gray bg, gray text)
Active Item:     [ 📱 My Devices ]   (orange bg, orange text, bold)
```

## Mobile Behavior

### Navbar Mobile Menu

```
┌─────────────────────────────────────┐
│  Logo              [☰]              │  ← Hamburger menu
└─────────────────────────────────────┘

When opened:
┌─────────────────────────────────────┐
│  Logo              [✕]              │
├─────────────────────────────────────┤
│  🔍 Find Parts                      │
│  🛍️ Shop                            │
│  🔧 Services                        │
│  📖 Help                            │
│  ─────────────────                  │
│  📊 Dashboard                       │
│  ⚙️  Admin                          │
│  Sign Out                           │
└─────────────────────────────────────┘
```

### Sidebar Mobile Menu

```
[☰] ← Menu button (top-left, below navbar)

When opened:
┌──────────────────────┐
│  • Overview          │  ← Slides in from left
│  • My Devices        │     with backdrop overlay
│  • Work Orders       │
│  • Payments          │
└──────────────────────┘
```

## Routing Behavior

### Navigation Types

1. **Absolute Navigation (Link href)**

   - All links use absolute paths from root
   - Example: `href="/dashboard"` not `href="dashboard"`
   - Ensures consistent navigation

2. **Active Detection**

   - Uses `usePathname()` from Next.js
   - Exact match for base routes
   - StartsWith match for nested routes

3. **Mobile Menu Closing**
   - Auto-close on link click
   - Close on backdrop click
   - Smooth transitions

## Color Scheme

- **Primary Accent:** Orange 600 (`#ea580c`)
- **Active Background:** Orange 50 / Orange 900/30 (light/dark)
- **Muted Text:** Gray 500
- **Border:** Gray 200 / Gray 800 (light/dark)
- **Background:** White / Gray 900 (light/dark)

## Z-Index Layers

```
50  - Navbar (sticky top)
40  - Mobile menu button
30  - Sidebar (mobile)
20  - Sidebar backdrop overlay
10  - Normal content
```

## Breakpoints

- **Mobile:** < 768px
- **Desktop:** ≥ 768px

Uses Tailwind's `md:` prefix for desktop styles.
