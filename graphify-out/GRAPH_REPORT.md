# Graph Report - main-2  (2026-08-22)

## Corpus Check
- 99 files · ~147,807 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 668 nodes · 1353 edges · 40 communities (28 shown, 12 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Encore API Client Types & Auth
- Category Management & Data Fetching
- Order Status & Category View Components
- Dashboard Dialog Forms & Schema
- Encore Client Base API & Streaming
- Dev Tooling & Linting Config
- Dashboard Overview & KPI Metrics
- TypeScript Build Configuration
- Core Runtime Dependencies
- UI Component Primitives
- shadcn Component Registry Config
- Expenses Management View & Filters
- Sidebar & Navigation UI Primitives
- Expense Deletion Dialog & Alerts
- Design Specs & CI Pipeline
- Order Server Actions & Mutations
- App Sidebar & Navigation Menu
- Category Server Actions & Mutations
- Authentication & Login Carousel
- Sheet Drawer UI Primitives
- API Streaming Protocols
- Root Layout & Global Providers
- API WebSocket Streaming Handlers
- Promotional Banner Media Assets
- Responsive Dashboard Layout
- 404 Not Found Page & Tests
- SVG UI Glyph Assets
- Sidebar State & Interaction Hooks
- API Inbound Stream Handlers
- Edge Reverse Proxy & Security
- Brand Logo Vector Assets
- Agent & Assistant Guidelines
- ESLint Flat Configuration
- API Error Handling Classes
- API Response Error Guards
- Next.js Build Configuration
- PostCSS Style Pipeline
- Client Auth SDK Helpers
- Project Documentation & README

## God Nodes (most connected - your core abstractions)
1. `cn()` - 118 edges
2. `ServiceClient` - 36 edges
3. `getApiClientFromCookies()` - 22 edges
4. `Button()` - 19 edges
5. `ExpensesView()` - 17 edges
6. `formatPrice()` - 17 edges
7. `compilerOptions` - 16 edges
8. `Input()` - 13 edges
9. `makeRecord()` - 12 edges
10. `masters` - 11 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --calls--> `getApiClientFromCookies()`  [EXTRACTED]
  app/(dashboard)/page.tsx → lib/api/index.ts
- `AlertDialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `AlertDialogMedia()` --calls--> `cn()`  [EXTRACTED]
  components/ui/alert-dialog.tsx → lib/utils.ts
- `CardDescription()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Mafaaza Admin Design Direction Mockups** — design_a_buku_kas_direction_a, design_b_struk_direction_b, design_c_shift_direction_c, design_mafaaza_admin_architecture [EXTRACTED 1.00]
- **CI Validation Pipeline** — _github_workflows_ci_ci_workflow, _github_workflows_ci_build_job, design_vitest_server_testing [INFERRED 0.95]
- **Login Carousel Promotional Banner Suite** — public_banner_chicken_1_asset, public_banner_chicken_2_asset, public_banner_chicken_3_asset [INFERRED 0.85]
- **Next.js Template SVG Icon Suite** — public_file_asset, public_globe_asset, public_window_asset [INFERRED 0.85]

## Communities (40 total, 12 thin omitted)

### Community 0 - "Encore API Client Types & Auth"
Cohesion: 0.03
Nodes (63): APIErrorResponse, auth, AuthDataGenerator, AuthParams, BaseURL, BootstrapAdminResponse, boundFetch, CallParameters (+55 more)

### Community 1 - "Category Management & Data Fetching"
Cohesion: 0.07
Nodes (40): CategoriesView(), CategoriesPage(), findByType(), { profile, listCategories, redirect }, renderPage(), ActionResult, ALLOWED_MUTATE_ROLES, createExpenseAction() (+32 more)

### Community 2 - "Order Status & Category View Components"
Cohesion: 0.09
Nodes (39): CategoriesViewProps, updateOrderStatusAction(), OrderRow, OrderStatusDialog(), OrderStatusDialogProps, STATUS_OPTIONS, OrderRow, OrdersViewProps (+31 more)

### Community 3 - "Dashboard Dialog Forms & Schema"
Cohesion: 0.13
Nodes (31): CategoryFormDialogProps, DeleteCategoryDialogProps, CATEGORIES, ExpenseFormDialog(), ExpenseFormDialogProps, ExpensesViewProps, SummaryStats, DeleteOrderDialogProps (+23 more)

### Community 4 - "Encore Client Base API & Streaming"
Cohesion: 0.09
Nodes (4): BaseClient, encodeQuery(), makeRecord(), ServiceClient

### Community 5 - "Dev Tooling & Linting Config"
Cohesion: 0.06
Nodes (34): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+26 more)

### Community 6 - "Dashboard Overview & KPI Metrics"
Cohesion: 0.12
Nodes (23): OrdersView(), DashboardPage(), KpiRow(), KpiRowProps, LowStockCard(), LowStockCardProps, RecentOrdersCard(), RecentOrdersCardProps (+15 more)

### Community 7 - "TypeScript Build Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "Core Runtime Dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, better-auth, class-variance-authority, clsx, lucide-react, next, next-themes, dependencies (+19 more)

### Community 9 - "UI Component Primitives"
Cohesion: 0.12
Nodes (24): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Breadcrumb(), BreadcrumbEllipsis() (+16 more)

### Community 10 - "shadcn Component Registry Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "Expenses Management View & Filters"
Cohesion: 0.14
Nodes (14): ExpensesView(), handleCategoryChange(), handleEndDateChange(), handleSearchSubmit(), handleStartDateChange(), updateQuery(), formatDateIndonesian(), formatIDR() (+6 more)

### Community 12 - "Sidebar & Navigation UI Primitives"
Cohesion: 0.14
Nodes (15): Separator(), SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarInput(), SidebarMenuAction(), SidebarMenuBadge(), SidebarMenuSkeleton() (+7 more)

### Community 13 - "Expense Deletion Dialog & Alerts"
Cohesion: 0.18
Nodes (13): DeleteExpenseDialog(), handleDelete(), DeleteExpenseDialogProps, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+5 more)

### Community 14 - "Design Specs & CI Pipeline"
Cohesion: 0.16
Nodes (16): Typecheck, Lint & Build Job, CI Workflow, Direction A: Buku Kas Mockup, Buku Kas Ledger Grid Pattern, Direction B: Struk Mockup, Struk Receipt Pattern, Direction C: Shift Mockup, Keyboard-Driven POS Pattern (+8 more)

### Community 15 - "Order Server Actions & Mutations"
Cohesion: 0.19
Nodes (13): ActionResult, ALLOWED_MUTATE_ROLES, createOrderAction(), deleteOrderAction(), getAuthedApi(), getMutatingApi(), ORDER_STATUSES, fd() (+5 more)

### Community 16 - "App Sidebar & Navigation Menu"
Cohesion: 0.14
Nodes (12): AppSidebar(), generalItems, itemClass(), menuItems, SidebarContent(), SidebarFooter(), SidebarGroup(), SidebarGroupContent() (+4 more)

### Community 17 - "Category Server Actions & Mutations"
Cohesion: 0.26
Nodes (10): ActionResult, ALLOWED_MUTATE_ROLES, createCategoryAction(), deleteCategoryAction(), getAuthedApi(), getMutatingApi(), { profile, createCategory, updateCategory, deleteCategory, revalidatePath }, updateCategoryAction() (+2 more)

### Community 18 - "Authentication & Login Carousel"
Cohesion: 0.22
Nodes (7): loginAction(), parseSetCookie(), BannerCarousel(), Slide, SLIDES, LoginForm(), metadata

### Community 19 - "Sheet Drawer UI Primitives"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 21 - "Root Layout & Global Providers"
Cohesion: 0.32
Nodes (4): metadata, ThemeProvider(), Toaster(), TooltipProvider()

### Community 23 - "Promotional Banner Media Assets"
Cohesion: 0.29
Nodes (4): Crispy Fried Chicken Presentation, POS and Order Management Terminal, Sales Growth and Revenue Analytics, Sunset Landscape Illustration

### Community 24 - "Responsive Dashboard Layout"
Cohesion: 0.33
Nodes (5): SidebarInset(), SidebarProvider(), SidebarTrigger(), subscribe(), useIsMobile()

### Community 25 - "404 Not Found Page & Tests"
Cohesion: 0.43
Nodes (3): metadata, NotFoundPage(), buttonVariants

### Community 26 - "SVG UI Glyph Assets"
Cohesion: 0.33
Nodes (3): Document File Icon, Globe Network Icon, Browser Window Icon

### Community 27 - "Sidebar State & Interaction Hooks"
Cohesion: 0.40
Nodes (5): Sidebar(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), useSidebar()

### Community 29 - "Edge Reverse Proxy & Security"
Cohesion: 0.50
Nodes (4): applySecurityHeaders(), config, proxy(), SESSION_COOKIE_NAMES

## Knowledge Gaps
- **219 isolated node(s):** `{ profile, createCategory, updateCategory, deleteCategory, revalidatePath }`, `ActionResult`, `ALLOWED_MUTATE_ROLES`, `CategoriesViewProps`, `CategoryFormDialogProps` (+214 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Component Primitives` to `Order Status & Category View Components`, `Dashboard Dialog Forms & Schema`, `Sidebar & Navigation UI Primitives`, `Expense Deletion Dialog & Alerts`, `App Sidebar & Navigation Menu`, `Sheet Drawer UI Primitives`, `Responsive Dashboard Layout`, `404 Not Found Page & Tests`, `Sidebar State & Interaction Hooks`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `ServiceClient` connect `Encore Client Base API & Streaming` to `Encore API Client Types & Auth`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `Button()` connect `Dashboard Dialog Forms & Schema` to `Order Status & Category View Components`, `UI Component Primitives`, `Sidebar & Navigation UI Primitives`, `Expense Deletion Dialog & Alerts`, `Sheet Drawer UI Primitives`, `404 Not Found Page & Tests`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `{ profile, createCategory, updateCategory, deleteCategory, revalidatePath }`, `ActionResult`, `ALLOWED_MUTATE_ROLES` to the rest of the system?**
  _219 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Encore API Client Types & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.03076923076923077 - nodes in this community are weakly interconnected._
- **Should `Category Management & Data Fetching` be split into smaller, more focused modules?**
  _Cohesion score 0.06531986531986532 - nodes in this community are weakly interconnected._
- **Should `Order Status & Category View Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08925979680696662 - nodes in this community are weakly interconnected._