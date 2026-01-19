# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Laravel 12 + React support ticket management system with multi-role access control, task management, reporting, and invoice generation capabilities. The system uses XAMPP/LAMPP for local development.

## Quick Start for New Developers

```bash
# 1. Install dependencies
composer install
npm install

# 2. Configure environment
# Copy .env.example to .env and configure database settings
# Set APP_URL based on your environment (see Environment Configuration section)

# 3. Run migrations
php artisan migrate

# 4. Clear config cache (critical after .env changes)
php artisan config:clear

# 5. Start development environment
composer run dev
# This starts: Laravel server, queue worker, logs viewer, and Vite dev server

# Alternative: Run services individually
php artisan serve               # Backend at http://127.0.0.1:8000
npm run dev                     # Frontend dev server
php artisan queue:listen --tries=1  # Background jobs
php artisan pail --timeout=0    # Live logs
```

**First-time setup checklist:**
- [ ] Database created in MySQL
- [ ] `.env` configured with correct `APP_URL` and database credentials
- [ ] Migrations run successfully
- [ ] Config cache cleared
- [ ] All services running without errors

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 with TypeScript/JSX
- **UI Framework**: shadcn/ui (built on Tailwind CSS 4 + Radix UI primitives)
- **Build Tool**: Vite 6
- **Database**: MySQL (via XAMPP/LAMPP)
- **Authentication**: Laravel Sanctum
- **Additional**: DomPDF for invoice generation, SimpleSoftware QR code library

## Coding Standards and Best Practices

### Frontend Standards

**IMPORTANT**: This project uses **shadcn/ui** as the default UI component library.

- Use shadcn/ui components for all UI elements (buttons, inputs, dialogs, dropdowns, etc.)
- shadcn/ui components are located in `resources/js/components/ui/`
- Components are built on Radix UI primitives with Tailwind CSS styling
- Common components: `button.tsx`, `dialog.tsx`, `select.tsx`, `dropdown-menu.tsx`, `alert-dialog.tsx`, `tabs.tsx`, `tooltip.tsx`, `input.tsx`, `table.tsx`
- Follow the existing component patterns in the codebase for consistency
- Use TypeScript/JSX for all React components

### Backend Standards

**CRITICAL**: Follow these Laravel best practices strictly:

1. **Always use Controller Methods**
   - ALL business logic must be in controller methods
   - NEVER write logic directly in routes (`routes/api.php`)
   - Routes should only define the HTTP method, path, and controller method reference

2. **Use Eloquent Models**
   - Use Eloquent ORM for all database operations
   - Define relationships in models (hasMany, belongsTo, belongsToMany, etc.)
   - Use query builder through models, not raw SQL queries
   - Leverage Eloquent features: scopes, accessors, mutators, soft deletes

**Example of CORRECT implementation:**

```php
// routes/api.php - ONLY route definition
Route::get('/tickets', [TicketController::class, 'index']);
Route::post('/tickets', [TicketController::class, 'store']);

// app/Http/Controllers/TicketController.php - Business logic here
public function index(Request $request)
{
    $user = auth()->user();
    $query = Ticket::with(['agent', 'customer', 'status', 'priority']);

    // Role-based filtering
    if ($user->role_id == 3) {
        $assignedAgentIds = DB::table('assign_agents')
            ->where('user_id', $user->id)
            ->pluck('agent_id')->toArray();
        $query->whereHas('agent', function($q) use ($assignedAgentIds) {
            $q->whereIn('agent_id', $assignedAgentIds);
        });
    }

    return response()->json($query->paginate(10));
}
```

**Example of INCORRECT implementation:**

```php
// routes/api.php - NEVER do this!
Route::get('/tickets', function() {
    $tickets = Ticket::with('agent')->get(); // ❌ Logic in route
    return response()->json($tickets);
});
```

### Code Organization Rules

- **Controllers**: Handle request validation, business logic, and response formatting
- **Models**: Define relationships, scopes, accessors, and mutators
- **Routes**: Only map HTTP verbs to controller methods
- **Middleware**: Handle cross-cutting concerns (auth, CORS, etc.)
- **Services** (`app/Services/`): Complex business logic that spans multiple models
  - `WhatsappApiService.php`: Trait for sending WhatsApp notifications (used in TicketController and TaskController)
  - `SimpleXLSXParser.php`: Service for parsing Excel files during customer import

## Development Commands

### Build and Development

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Build frontend assets (production)
npm run build

# Run Vite development server (frontend only)
npm run dev

# Start full development environment (requires Composer dev dependencies)
composer run dev
# This runs: php artisan serve, php artisan queue:listen, php artisan pail, and npm run dev concurrently
```

### Laravel Artisan Commands

```bash
# Start development server
php artisan serve
# Or for LAMPP environment:
/opt/lampp/bin/php artisan serve

# Run queue worker for background jobs
php artisan queue:listen --tries=1

# View application logs in real-time
php artisan pail --timeout=0

# Clear configuration cache after .env changes
php artisan config:clear

# Run migrations
php artisan migrate

# Run tests
composer run test
# Equivalent to: php artisan config:clear && php artisan test
```

### Database Access

The project uses XAMPP/LAMPP's MySQL server:

```bash
# Access MySQL via LAMPP
/opt/lampp/bin/mysql -u root -p

# Check MySQL status
sudo /opt/lampp/lampp status
```

## Environment Configuration

### Important .env Settings

- `APP_URL`: Must match your actual server URL. Update this for different environments:
  - Laravel dev server: `http://127.0.0.1:8000`
  - XAMPP: `http://localhost/AI/support_tickets_new/public`
  - Production: `https://yourdomain.com`
- **Always run** `php artisan config:clear` after changing `.env` values

### API Configuration

- The frontend reads `APP_URL` from a meta tag in `dashboard.blade.php`
- `bootstrap.js` sets this as the axios base URL with `/api` appended
- All API calls use relative paths that automatically prepend the base URL

## Architecture and Code Organization

### Backend Structure (app/)

**Controllers** (`app/Http/Controllers/`):
- `TicketController.php` - Core ticket management with activity logging
- `TaskController.php` - Task management with role-based agent filtering
- `CustomerController.php` - Customer CRUD, import, and ticket relationships
- `InvoiceController.php` - Invoice generation, PDF download, payment tracking
- `ReportController.php` - All reporting endpoints (monthly, customer, inventory, performance)
- `StaffReportController.php` - Staff-specific reports and monthly splitups
- `UserController.php` - User management and agent assignment to managers
- Dashboard controllers: `AgentDashboardController.php`, `BranchDashboardController.php`
- Settings controllers: `MessageSettingController.php`, `ProductController.php`, etc.

**Models** (`app/Models/`):
- Core models: `Ticket` (uses SoftDeletes), `Task`, `Customer`, `User`, `Invoice`, `Payment`
- Relationship tables use pivot models: `AgentTicket`, `AgentTask`, `AssignAgent`, `NotifyTicket`
- Configuration models: `TicketStatus`, `TaskStatus`, `Priority`, `Branch`, `TicketLabel`, `Role`, `MessageSetting`
- Supporting models: `Activity`, `Product`, `Brand`, `Category`, `Department`, `Designation`

**Key Model Relationships**:
- `Ticket::agent()` - Many-to-many via `agent_ticket` table
- `Ticket::notifyTo()` - Many-to-many via `notify_ticket` table (returns users to be notified)
- `Ticket::ticketLabel()` - Many-to-many via `label_ticket` table
- `Task::agent()` - Many-to-many via `agent_task` table
- `Task::ticket()` - Belongs to with `->withTrashed()` to display tracking numbers for soft-deleted tickets (Tickets use SoftDeletes)
- `Task::taskStatus()` - Belongs to TaskStatus (status field maps to task_statuses.id)
- `Task::branch()` - Belongs to Branch for location-based task management
- `Task::category()` - Belongs to TaskCategory for task categorization

### Frontend Structure (resources/js/)

**Pages** (`resources/js/pages/`):
- `tickets.tsx` - Main ticket list with search, pagination, and filters
- `tasks.tsx` - Task management with role-based filtering and mobile responsive design
- `dashboard.tsx` - Admin dashboard with statistics and charts
- `agent-dashboard.tsx` - Agent-specific dashboard
- `branch-admin-dashboard.tsx` - Branch admin dashboard
- `customers.tsx` - Customer management with import functionality
- `invoices.tsx` - Invoice list and management
- `payments.tsx` - Payment tracking
- `reports.tsx` - Report selection page
- `report-preview.tsx` - Report preview with export options
- `settings.tsx` - Comprehensive settings (large 317KB file with all configuration)
- Specialized views: `deleted-tickets.tsx`, `verify-tickets.tsx`, `closed-tickets.tsx`

**Components** (`resources/js/components/`):
- **Modal Components**: `TicketDetailsModal.tsx` (large 103KB file), `TaskDetailsModal.tsx`, `AddTaskModal.tsx`, `AddTicketModal.tsx`, `AddCustomerModal.tsx`
- **Layout Components**: `sidebar.tsx`, `topbar.tsx`, `dashboard-layout.tsx`
- **Feature Components**: `AssignAgentModal.tsx`, `InvoiceDetailsOffcanvas.tsx`, `PayInvoiceModal.tsx`, `ProductModal.tsx`
- **shadcn/ui Components** (`components/ui/`): Pre-built, customizable components available:
  - Layout: `dialog.tsx`, `sheet.tsx`, `card.tsx`, `separator.tsx`, `scroll-area.tsx`
  - Forms: `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `label.tsx`, `button.tsx`
  - Feedback: `alert.tsx`, `alert-dialog.tsx`, `tooltip.tsx`, `badge.tsx`
  - Navigation: `tabs.tsx`, `dropdown-menu.tsx`, `command.tsx`
  - Data: `table.tsx`, `avatar.tsx`, `popover.tsx`
  - **Always use these components** instead of creating custom UI elements
  - Import path: `@/components/ui/component-name`
  - Built on Radix UI primitives with Tailwind CSS styling

**Important UI Patterns**:
- Modals use fixed positioning with specific coordinates (e.g., `left: 200px; top: 154px`)
- Standard border color: `#e4e4e4` throughout the application
- Custom scrollbar styling with slate colors
- Color-coded status badges (blue=open, yellow=pending, purple=in-progress, green=closed)
- Responsive design with mobile card views and desktop table views
- **Lazy Loading**: Most pages are lazy-loaded using React.lazy() in `app.jsx` to improve initial load performance. Only Login and Register pages are eagerly loaded.

### API Routes (routes/api.php)

All routes are protected with `auth:sanctum` middleware except:
- `POST /api/login`
- `POST /api/register-customer`

**Key API Endpoints**:
- Tickets: `/api/tickets` (CRUD + relationships: agents, labels, notify users)
- Tasks: `/api/tasks` (CRUD + `/api/task-statuses`, `/api/task-agents`, `/api/task-categories`)
- Customers: `/api/customers` (CRUD + import + `/api/customer-details/{id}`)
- Invoices: `/api/invoices` (CRUD + `/api/invoices/{id}/download`)
- Reports: `/api/reports/*` (monthly-revenue, tickets-report, customer-analytics, etc.)
- Dashboard stats: `/api/dashboard-stats`, `/api/agent-dashboard-stats`, `/api/branch-dashboard-stats`

## Role-Based Access Control

The system has 4 user roles (via `role_id` field):

1. **Admin (role_id = 1)**: Full system access
2. **Agent (role_id = 2)**: Limited to assigned tickets and tasks
3. **Manager (role_id = 3)**: Can view tickets/tasks assigned to their managed agents (via `assign_agents` table)
4. **Branch Admin (role_id = 4)**: Can view tickets/tasks for agents in their branch

### Role Filtering Implementation

**TicketController**: Manager users see only tickets assigned to their managed agents:
```php
if ($user->role_id == 3) {
    $assignedAgentIds = DB::table('assign_agents')
        ->where('user_id', $user->id)
        ->pluck('agent_id')->toArray();
    $query->whereHas('agent', function($q) use ($assignedAgentIds) {
        $q->whereIn('agent_id', $assignedAgentIds);
    });
}
```

**TaskController**:
- Branch Admin filtering uses `whereHas('agent', function($q) use ($user) { $q->where('users.branch_id', $user->branch_id); })`
- `getAgents()` method filters available agents based on role (Agents see only themselves, Managers see assigned agents, Branch Admins see same-branch agents)

### Role Filtering Template Pattern

When implementing new features with role-based access, use this template:

```php
public function index(Request $request)
{
    $user = auth()->user();
    $query = YourModel::with(['relationships']);

    // Admin (role_id = 1) - See everything, no filter
    if ($user->role_id == 1) {
        // No additional filtering
    }

    // Agent (role_id = 2) - See only assigned items
    elseif ($user->role_id == 2) {
        $query->whereHas('agent', function($q) use ($user) {
            $q->where('agent_id', $user->id);
        });
    }

    // Manager (role_id = 3) - See items assigned to managed agents
    elseif ($user->role_id == 3) {
        $assignedAgentIds = DB::table('assign_agents')
            ->where('user_id', $user->id)
            ->pluck('agent_id')->toArray();

        if (!empty($assignedAgentIds)) {
            $query->whereHas('agent', function($q) use ($assignedAgentIds) {
                $q->whereIn('agent_id', $assignedAgentIds);
            });
        } else {
            // Manager has no assigned agents - show nothing
            $query->whereRaw('1 = 0');
        }
    }

    // Branch Admin (role_id = 4) - See items from their branch
    elseif ($user->role_id == 4 && $user->branch_id) {
        $query->where('branch_id', $user->branch_id);
        // OR if filtering via agent relationship:
        // $query->whereHas('agent', function($q) use ($user) {
        //     $q->where('users.branch_id', $user->branch_id);
        // });
    }

    return response()->json($query->paginate($request->per_page ?? 10));
}
```

**Key Points**:
- Always check `$user->role_id` first
- Use `whereHas()` for relationship-based filtering
- Manager filtering requires `assign_agents` lookup
- Return empty results (`whereRaw('1 = 0')`) if manager has no assigned agents
- Branch Admin filtering needs `branch_id` check

## Activity Logging System

All ticket/task changes create activity records in the `activities` table with these fields:
- `type`: Activity type (e.g., "Ticket Status Changed", "Priority Changed")
- `note`: Descriptive message (e.g., "Status changed from Open to Closed")
- `ticket_id`, `created_by`, `status_id`, `priority_id`, `branch_id`, `agent_id`

**Logged Activities**: Status changes, priority changes, branch changes, due date changes, agent assignments/removals, notify user changes, label changes.

## Database Key Tables

- **tickets**: Main ticket data with soft deletes (uses `deleted_at` column)
- **tasks**: Task data (does NOT use soft deletes)
- **customers**: Customer information
- **users**: System users (agents, managers, admins)
- **assign_agents**: Manager-to-agent assignments (columns: `user_id` for manager, `agent_id` for agent)
- **ticket_statuses**: Ticket status definitions
- **task_statuses**: Task status definitions (1=open, 2=pending, 3=In Progress, 4=closed)
- **activities**: Audit log for all changes
- **invoices**, **payments**: Financial tracking
- **products**, **brands**, **categories**: Inventory management
- **ticket_images**: File attachments
- **product_tickets**: Spare parts tracking
- **message_settings**: WhatsApp API configuration for notifications (stores `instance_id`, `access_token`, `is_active`)

## Important Implementation Details

### Status Management

**Task Statuses**: Must use `task_statuses` table (not hardcoded):
- Frontend fetches from `/api/task-statuses`
- Status display uses `task.task_status?.status` for label
- Closing status is id=4 (not 3), includes `closing_comment` field

**Ticket Statuses**: Loaded dynamically from `ticket_statuses` table via `/api/ticket-statuses`

### Soft Deletes

- Only `Ticket` model uses `SoftDeletes` trait (NOT Task model)
- To show related data for soft-deleted tickets, use `->withTrashed()` in relationships
- Example: `Task::ticket()` relationship uses `->withTrashed()` to display tracking numbers for deleted tickets
- Soft-deleted tickets can be viewed in `deleted-tickets.tsx` and restored via `/api/tickets/{ticket}/restore` endpoint

**CRITICAL PATTERN**: When creating new relationships to the Ticket model, always consider if you need `->withTrashed()`:
```php
// If you need to show data even when ticket is deleted
public function ticket() {
    return $this->belongsTo(Ticket::class)->withTrashed();
}

// Without ->withTrashed(), deleted tickets will return null
public function ticket() {
    return $this->belongsTo(Ticket::class); // ❌ Will break if ticket is soft-deleted
}
```

### File Uploads

- Ticket attachments: `public/uploads/ticket_image/`
- Handle with `TicketController::uploadAttachment()` and store in `ticket_images` table

### Frontend-Backend Communication

- Axios configured in `bootstrap.js` with base URL from meta tag in `dashboard.blade.php`
- The meta tag reads from `.env` file's `APP_URL` variable
- All API calls use relative paths (e.g., `/tickets` becomes `http://APP_URL/api/tickets`)
- Toast notifications (react-hot-toast) for success/error feedback

### WhatsApp Integration

- WhatsApp notifications are sent via `WhatsappApiService` trait
- Configuration stored in `message_settings` table (accessible via Settings page)
- Used in both `TicketController` and `TaskController` for customer notifications
- Requires `instance_id` and `access_token` to be configured

### Modal Positioning

Many modals use fixed positioning for consistency:
- Add/Edit forms typically: `position: fixed; left: 200px; top: 154px; width: 400px`
- Two-column detail modals: 30% left (info), 70% right (tabs)
- Sub-modals (like Add Note): `position: absolute; right: 20px; top: 170px; width: 400px; z-index: 9999999`

## Common Development Patterns

### Adding a New Feature with Role-Based Filtering

**Backend (Laravel):**

1. Create/update controller method in `app/Http/Controllers/`
   - Use Eloquent models for all database operations
   - Implement role-based filtering logic
   - Add request validation
   - Return JSON responses

2. Define route in `routes/api.php`
   - Map HTTP verb to controller method ONLY
   - Add `auth:sanctum` middleware
   - Example: `Route::get('/feature', [FeatureController::class, 'index']);`
   - **Never** write business logic in the route file

3. Update/create Eloquent model in `app/Models/`
   - Define relationships (use `->withTrashed()` if needed for soft deletes)
   - Add fillable/guarded properties
   - Define accessors/mutators if needed

**Frontend (React + shadcn/ui):**

4. Create React component in `resources/js/pages/` or `resources/js/components/`
   - Use shadcn/ui components from `resources/js/components/ui/`
   - Import needed components: `Button`, `Dialog`, `Select`, `Input`, `Table`, etc.
   - Follow TypeScript/JSX patterns from existing components
   - Use axios for API calls with relative paths

5. Add route to React Router in `app.jsx`

6. Add menu item in `sidebar.tsx` (implement role-based visibility if needed)

7. Build assets: `npm run build`

**Example Implementation:**

```php
// ❌ WRONG - Logic in route
Route::get('/reports', function() {
    return Report::all();
});

// ✅ CORRECT - Route only references controller
Route::get('/reports', [ReportController::class, 'index']);

// app/Http/Controllers/ReportController.php
public function index(Request $request)
{
    $user = auth()->user();
    $query = Report::with('user', 'category');

    if ($user->role_id == 2) {
        $query->where('user_id', $user->id);
    }

    return response()->json($query->paginate(15));
}
```

```tsx
// React component using shadcn/ui
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";

export default function MyFeature() {
    return (
        <Dialog>
            <DialogContent>
                <DialogHeader>Feature Title</DialogHeader>
                <Select>
                    <SelectContent>
                        <SelectItem value="1">Option 1</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleSubmit}>Submit</Button>
            </DialogContent>
        </Dialog>
    );
}
```

### Updating Task/Ticket Status

1. Ensure status tables (`task_statuses`, `ticket_statuses`) are up to date
2. Frontend fetches statuses dynamically from API
3. Update uses relationship: `$task->taskStatus()` or `$ticket->status()`
4. Log activity in `activities` table with old/new values

### Testing API Changes

Use the built-in test suite:
```bash
composer run test
# Equivalent to: php artisan config:clear && php artisan test
```

**Testing Workflow**:
1. Write feature tests in `tests/Feature/` for API endpoints
2. Write unit tests in `tests/Unit/` for model logic and helpers
3. Run tests after making changes to verify no regressions
4. Tests automatically clear config cache before running

**Manual API Testing**:
- Use Postman/Insomnia with Sanctum token authentication
- Get token from `POST /api/login` response
- Add header: `Authorization: Bearer {token}`
- All routes except `/api/login` and `/api/register-customer` require authentication

**Common Test Scenarios**:
- Role-based filtering (test as different role_id users)
- Soft delete restoration (verify `->withTrashed()` works)
- Activity logging (check activities table after changes)
- WhatsApp notifications (verify jobs dispatched)

## Build and Deployment

### Production Build

```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Build optimized assets
npm run build

# Optimize Laravel
php artisan optimize
```

### Vite Build Configuration

The project uses code splitting for optimal performance:
- `react-vendor`: React core libraries
- `ui-vendor`: Radix UI components
- `charts`: Recharts library
- `utils`: Axios, date-fns, class utilities
- `jquery-plugins`: jQuery + Select2 (for searchable dropdowns)

**Build Settings** (`vite.config.js`):
- Chunk size warning limit: 600KB
- Terser minification (keeps console logs, removes debugger)
- Sourcemaps disabled in production
- All major libraries pre-bundled via `optimizeDeps.include`

**Performance Optimizations**:
- React components lazy-loaded (see app.jsx - only Login/Register eagerly loaded)
- Separate vendor chunks reduce main bundle size
- Long-term caching enabled via content hashing in filenames

## Key Architectural Decisions & Patterns

### Why Controller-Only Logic?

This strict pattern ensures:
- **Testability**: Controllers can be unit tested without bootstrapping routes
- **Maintainability**: All business logic in one place, not scattered across routes
- **Reusability**: Controller methods can be called from multiple routes or other controllers
- **Clarity**: Routes file becomes a simple HTTP endpoint map

### Why Selective Soft Deletes?

- **Tickets use SoftDeletes**: Customer-facing records need audit trail and restoration capability
- **Tasks do NOT use SoftDeletes**: Internal workflow records can be permanently deleted
- **Activities table**: Immutable audit log (no deletes) preserves complete history

### WhatsApp Integration as Trait

`WhatsappApiService` is implemented as a PHP Trait (not a Service class) because:
- Used in multiple controllers (TicketController, TaskController)
- Needs access to controller's request/response context
- Dispatches background jobs via Laravel's queue system
- Configuration dynamically loaded from database (`message_settings` table)

### Select2 vs shadcn/ui Select

While the project uses shadcn/ui for most components, Select2 is used for customer dropdowns because:
- Needs to search across multiple fields (name + mobile number)
- Displays complex content in dropdown (name + formatted phone number)
- Handles large customer lists efficiently with virtual scrolling
- **Pattern**: Use shadcn/ui for simple selects, Select2 for complex searchable dropdowns

### Activity Logging Philosophy

Every state change creates an Activity record with:
- **What changed**: Type field (e.g., "Status Changed", "Agent Assigned")
- **Details**: Note field with old→new values
- **Context**: Foreign keys to ticket, task, user, status, priority, branch
- **Immutable**: Activities are never updated or deleted (audit trail integrity)

This enables:
- Complete audit trail for compliance
- Activity timeline in ticket/task detail views
- Reporting on agent actions and performance
- Debugging state transition issues

## Troubleshooting

### Build Issues

- If build fails, check that all dependencies are installed: `composer install && npm install`
- For type errors, check TypeScript interfaces match backend response structure
- Large files like `settings.tsx` (317KB) and `TicketDetailsModal.tsx` (103KB) may cause slow builds

### Database Issues

- After `.env` changes, always run: `php artisan config:clear`
- For migration issues, check database connection in `.env` (LAMPP uses different socket)
- If tracking numbers don't show, ensure relationships use `->withTrashed()`

### Role Filtering Issues

- Check `assign_agents` table has correct `user_id` (manager) and `agent_id` entries
- Verify `role_id` values: 1=Admin, 2=Agent, 3=Manager, 4=Branch Admin
- Manager filtering requires non-empty `assign_agents` records

### Missing PHP Extensions

XAMPP PHP may lack required extensions. Use system PHP (8.2+) with:
```bash
sudo apt-get install php8.2-xml php8.2-mysql php8.2-mbstring php8.2-curl
```

## Recent Updates and Features

### Branches Country Code and Customer Care Number (Added: 2025-11-11)

**Feature**: Added country code and customer care number fields to branches management

**Database Changes**:
- Added `country_code` (varchar 10) column to `branches` table with default value '+91'
- Added `customer_care_number` (varchar 50) column to `branches` table
- Migration file: `2025_11_11_050206_add_country_code_and_customer_care_number_to_branches_table.php`

**Backend** (`app/Http/Controllers/BranchController.php`):
- Updated `index()` method to include country_code and customer_care_number in response
- Updated `store()` method with validation:
  - `country_code`: nullable, string, max:10
  - `customer_care_number`: nullable, string, max:20
- Updated `update()` method with same validation rules
- All responses now return country_code and customer_care_number fields

**Model** (`app/Models/Branch.php`):
- Fields already included in `$fillable` array: `country_code`, `customer_care_number`

**Frontend** (`resources/js/pages/settings.tsx`):

**Country Codes Array**:
- Created `COUNTRY_CODES` constant with **240+ countries**
- Each entry includes: `code`, `name`, and `flag` emoji
- Alphabetically sorted (A-Z)
- Default: +91 India 🇮🇳
- Comprehensive coverage: Africa, Asia, Americas, Europe, Oceania, Caribbean, Pacific Islands

**Add Branch Form (Left Column - 25% width)**:
- **Branch Name**: Text input field
- **Country Code**: Select dropdown with 240+ countries
  - Shows flag emoji + country name + code (e.g., "🇮🇳 India (+91)")
  - Scrollable dropdown (max-height: 300px)
  - Uses shadcn/ui Select component
  - Value updates `branchFormData.country_code`
- **Customer Care Number**: Text input field
  - Number-only validation (removes non-digits)
  - Max length: 15 characters
  - Updates `branchFormData.customer_care_number`

**Edit Branch Modal**:
- Dialog with same three fields as Add form
- Pre-fills existing values when editing
- Country Code dropdown pre-selects current country
- Same validation and components as Add form

**Table Display (Desktop - 75% width)**:
- Added two new columns:
  - **Country Code**: Shows selected country code (e.g., "+91")
  - **Customer Care Number**: Shows customer care number or "-"
- Column order: Branch Name | Country Code | Customer Care Number | Created By | Created At | Actions
- Updated colSpan from 4 to 6 for loading/error/empty states

**Mobile Card View**:
- Displays country code and customer care number in card layout
- Format:
  - **Country Code**: +91
  - **Customer Care**: [number or "-"]
  - **Created**: [date]

**State Management**:
- Updated `branchFormData` state to include:
  ```typescript
  {
    branch_name: '',
    country_code: '+91',  // Default India
    customer_care_number: ''
  }
  ```
- Updated `handleEditBranch()` to populate all three fields
- Updated API calls in `handleAddBranch()` and `handleUpdateBranch()` to send all fields

**Branch Interface**:
```typescript
interface Branch {
  id: number;
  branch_name: string;
  country_code?: string;
  customer_care_number?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  // ...
}
```

**Implementation Details**:
- Uses shadcn/ui Select component (not custom jQuery library)
- Country dropdown is searchable by scrolling
- Flag emojis provide visual identification
- Clean, consistent UI following project design patterns
- Numbers-only validation for customer care field

**Build Results**:
- settings.js: 161.30 kB (27.13 kB gzipped)
- Increased slightly due to 240+ country codes array

**User Experience**:
1. **Adding a Branch**:
   - Enter branch name
   - Select country code from dropdown (default: 🇮🇳 India +91)
   - Enter customer care number (optional)
   - Click "Add Branch"

2. **Editing a Branch**:
   - Click edit button → Modal opens
   - All fields pre-populated
   - Can change country code via dropdown
   - Can update customer care number
   - Click "Save Changes"

3. **Viewing Branches**:
   - Desktop: Table shows all fields in columns
   - Mobile: Card view shows all information
   - Both display country code and customer care number

**Files Modified**:
1. `database/migrations/2025_11_11_050206_add_country_code_and_customer_care_number_to_branches_table.php`
2. `app/Http/Controllers/BranchController.php`
3. `resources/js/pages/settings.tsx`

**Notes**:
- Initially implemented with ccpicker jQuery library, then replaced with shadcn/ui Select for consistency
- Default country code set to +91 (India) for existing and new branches
- Customer care number is optional (nullable)
- Country code dropdown includes all 240+ countries worldwide

### Ticket Status Close Confirmation (Added: 2025-01-03)

**Feature**: Confirmation dialog when changing ticket status to "Closed"

**Implementation Locations**:
1. **Tickets List Page** (`resources/js/pages/tickets.tsx`):
   - Added state variables: `closeConfirmOpen`, `pendingCloseTicket`
   - Modified status dropdown to intercept "Closed" (value=3) selection
   - Shows AlertDialog with tracking number in **bold font**
   - User must confirm with "OK" button or cancel the action
   - On confirmation, ticket status updates to "Closed" and disappears from active list

2. **Ticket Details Modal** (`resources/js/components/TicketDetailsModal.tsx`):
   - Added state variables: `closeConfirmOpen`, `pendingCloseStatus`
   - Modified status Select to intercept "Closed" (value=3) selection
   - Shows AlertDialog with tracking number in **bold font**
   - User must confirm with "OK" button or cancel the action
   - On confirmation, ticket status updates and activities are refreshed

**User Experience**:
- When selecting "Closed" status from dropdown
- AlertDialog appears: "Are you sure you want to close ticket **#[tracking_number]**?"
- Cancel button: Closes dialog, no changes
- OK button (blue): Confirms and closes ticket, shows success message

### Company Logo in Sidebar (Added: 2025-01-03)

**Feature**: Display company logo from database in sidebar menu

**Backend**:
- Created `CompanyController.php` with `getCompanyInfo()` method
- Added API route: `GET /api/company` (protected with auth:sanctum)
- Fetches company data from `company` table including `logo` column

**Frontend** (`resources/js/components/sidebar.tsx`):
- Added state variables: `companyLogo`, `companyName`
- Fetches company information on component mount via `/api/company`
- Logo Section displays:
  - **With logo**: Centered company logo image (h-12, ~48px height) with "Tickets Management System" text below in small font
  - **Without logo**: Fallback to purple gradient icon with company name and "Management System" text
- Layout: Vertical centered alignment (`flex flex-col items-center justify-center`)
- Error handling: If logo fails to load, shows fallback display

**Database Requirements**:
- `company` table must exist with:
  - `logo` column: Full URL or path to logo image
  - `name` column: Company name (optional, defaults to "GL Tickets")

**Visual Layout**:
```
┌─────────────────────┐
│    [LOGO IMAGE]     │  ← Centered horizontally (48px height)
│ Tickets Management  │  ← Small text (text-xs)
│       System        │  ← text-slate-500
└─────────────────────┘
```

### Ticket and Customer Management Updates (Added: 2025-01-04)

#### 1. Reopen and Restore Confirmation Dialogs

**Closed Tickets - Reopen Confirmation** (`resources/js/pages/closed-tickets.tsx`):
- Added confirmation dialog for "Reopen" button
- State variables: `reopenConfirmOpen`, `pendingReopenTicket`
- AlertDialog displays: "Are you sure you want to reopen ticket **#[tracking_number]**?"
- User must confirm before ticket status changes to "Open"

**Deleted Tickets - Restore Confirmation** (`resources/js/pages/deleted-tickets.tsx`):
- Added confirmation dialog for "Restore" button
- State variables: `restoreConfirmOpen`, `pendingRestoreTicket`
- AlertDialog displays: "Are you sure you want to restore ticket **#[tracking_number]**?"
- User must confirm before ticket is restored from soft delete

#### 2. Completed Status Confirmation

**Implementation Locations**:
1. **Tickets List Page** (`resources/js/pages/tickets.tsx`):
   - Added state variables: `completedConfirmOpen`, `pendingCompletedTicket`, `pendingCompletedStatus`
   - Status dropdown intercepts "Completed" (value=4) selection
   - AlertDialog displays: "Are you sure you want to mark ticket **#[tracking_number]** as completed?"
   - Prevents accidental status changes to "Completed"

2. **Ticket Details Modal** (`resources/js/components/TicketDetailsModal.tsx`):
   - Added state variables: `completedConfirmOpen`, `pendingCompletedStatus`
   - Status Select intercepts "Completed" (value=4) selection
   - Same confirmation dialog pattern as tickets list
   - Consistent user experience across both locations

#### 3. Roles Management UI Improvements

**Settings Page - Roles Tab** (`resources/js/pages/settings.tsx`):

**Removed Features**:
- "Add Role" section and form (left column, 25% width)
- "Add Role" modal dialog
- Delete role functionality and button
- All state/handlers for add and delete operations

**Added Features**:
- **"Sl No" Column**: Serial number column with pagination-aware numbering
  - Desktop table: First column before "Name"
  - Mobile cards: Displays as `#[number]` at top of card
  - Formula: `((currentPage - 1) * perPage) + index + 1`

- **"Type" Column**: Role type classification
  - role_id = 1: "Admin"
  - role_id = 2: "Agent"
  - role_id = 3: "Manager"
  - role_id = 4: "Branch Admin"
  - Uses `getRoleName(role.id)` function
  - Displayed between "Name" and "Description" columns

**Updated Behavior**:
- Edit button now active for ALL roles (including system roles 1-4)
- System roles (id 1-4) marked with "(System)" label
- Table colSpan updated from 6 to 7 for new Sl No column
- Grid layout changed from `lg:grid-cols-4` to single column

#### 4. WhatsApp Number Standardization

**Changed "Mobile Number" to "Whatsapp Number"** across all customer forms:

**Customer Registration Page** (`resources/js/pages/register.tsx`):
- Label: "Whatsapp Number" (instead of "Mobile Number")
- Placeholder: "Enter whatsapp number"
- Validation error: "Please enter a valid 10-digit whatsapp number"
- **Replaced**: Select dropdown with 170+ country codes
- **Implemented**: `CountryCodePicker` component with flags and search
- Default country code: +91 (India) 🇮🇳

**CountryCodePicker Component** (`resources/js/components/CountryCodePicker.tsx`):
- Custom country selector with flag emojis (75+ countries)
- Built-in search functionality (by country name or code)
- Dropdown: 300px wide with scrollable list
- Used in: Customer registration, Add Customer modal, Edit Customer modal
- Features: Flag display, compact format (e.g., "🇮🇳 +91"), responsive design

**Add Customer Modal** (`resources/js/components/AddCustomerModal.tsx`):
- Label: "Whatsapp Number" (was "Contact Number")
- Uses CountryCodePicker component
- Consistent with registration page design

**Customers Page Modals** (`resources/js/pages/customers.tsx`):
- **Add Customer Modal**: Label and placeholder updated to "Whatsapp Number"
- **Edit Customer Modal**: Label and placeholder updated to "Whatsapp Number"
- Both use CountryCodePicker with flags
- Number-only input validation with maxLength=15

**Benefits**:
- Consistent terminology across the entire application
- Better user experience with visual country flags
- Search capability for quick country selection
- Optimized bundle size (reduced from 221.04 kB to 215.62 kB)

### Select2 Searchable Customer Dropdown (Added: 2025-11-18)

**Feature**: Implemented Select2 library for searchable customer dropdowns with mobile number display in Add and Edit Ticket modals.

**Libraries Added**:
- `jquery@3.7.1` - Required dependency for Select2
- `select2@4.1.0-rc.0` - Searchable dropdown plugin
- `@types/jquery@3.5.33` - TypeScript support
- `@types/select2@4.0.63` - TypeScript support

**Implementation Files**:

#### 1. Add Ticket Modal (`resources/js/components/AddTicketModal.tsx`)

**Imports and Initialization**:
```typescript
import jQuery from 'jquery';
import select2Factory from 'select2';
import 'select2/dist/css/select2.min.css';

// Initialize select2 on jQuery
select2Factory(jQuery);

// Make jQuery available globally
(window as any).jQuery = jQuery;
(window as any).$ = jQuery;
```

**Customer Interface Updated**:
```typescript
interface Customer {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  country_code?: string;
}
```

**Select2 Configuration**:
- **Placeholder**: "Select a customer..."
- **Search**: Always visible (minimumResultsForSearch: 0)
- **Height**: 38px (custom CSS applied)
- **Font-size**: 13px for all dropdown items
- **Font-weight**: Regular (no bold styling)
- **Clear button**: 8px left padding

**Template Functions**:
```typescript
templateResult: function(customer: any) {
  // Display: Customer Name (+91 1234567890)
  return `<span style="font-size: 13px;">${customerData.name}</span>
          <span style="color: #374151; font-size: 13px;">
            (${customerData.country_code || ''} ${customerData.mobile})
          </span>`;
}

templateSelection: function(customer: any) {
  // Shows only customer name when selected
  return customerData ? customerData.name : customer.text;
}
```

**State Management**:
- Added `customerSelectRef` - useRef for select element
- Removed shadcn/ui Select component
- Replaced with regular `<select>` element enhanced by Select2

**useEffect Hook**:
- Initializes Select2 when modal opens and customers are loaded
- Dependency array: `[open, customers, customerId]`
- Automatically re-initializes when customers list updates (e.g., after adding new customer)
- Proper cleanup on unmount

**Add Customer Integration**:
- Fixed duplicate entry bug when adding new customer via "+" button
- Previous issue: Customer appeared twice in dropdown
- Solution: Destroy Select2 instance instead of manually appending option
- Let useEffect re-initialize automatically with updated customers state

**Styling Applied**:
```typescript
// Select box height
$container.find('.select2-selection--single').css({
  'height': '38px',
  'display': 'flex',
  'align-items': 'center'
});

// Clear button spacing
$container.find('.select2-selection__clear').css({
  'padding-left': '8px'
});
```

#### 2. Edit Ticket Modal (`resources/js/pages/tickets.tsx`)

**Same Implementation as Add Modal**:
- Imported jQuery and Select2 factory at file level
- Added `editCustomerSelectRef` useRef
- Updated Customer interface with mobile and country_code fields
- Replaced shadcn/ui Select with regular select element
- Added Select2 initialization useEffect
- Same configuration: 38px height, 13px font-size, no bold, search enabled

**useEffect Dependency Array**:
```typescript
[editModalOpen, customers, editFormData.customer_id]
```

**Change Handler**:
```typescript
$select.on('change', function() {
  const value = $(this).val() as string;
  if (value) {
    handleEditFormChange('customer_id', parseInt(value));
  }
});
```

**Initial Value Setting**:
```typescript
if (editFormData.customer_id) {
  $select.val(editFormData.customer_id.toString()).trigger('change.select2');
}
```

#### 3. Vite Configuration Updates (`vite.config.js`)

**Added jQuery Plugins Bundle**:
```javascript
manualChunks: {
  'jquery-plugins': ['jquery', 'select2'],
}
```

**Optimized Dependencies**:
```javascript
optimizeDeps: {
  include: [
    'react',
    'react-dom',
    'react-router-dom',
    'axios',
    'recharts',
    'date-fns',
    'react-hot-toast',
    'jquery',    // Added
    'select2'    // Added
  ],
}
```

**Build Output**:
- `jquery-plugins-i4N2ihbw.js`: 160.65 kB (gzipped: 50.30 kB)
- Bundled separately for optimal loading

**User Experience**:

**Add Ticket Modal**:
1. Click "Add Ticket" button
2. Customer dropdown shows with search box
3. Type to filter customers by name or mobile number
4. Each option displays: **Customer Name** *(+91 1234567890)*
5. Selected option shows only customer name
6. Click "+" to add new customer
7. New customer appears in dropdown (no duplicates)
8. Dropdown auto-updates with new customer

**Edit Ticket Modal**:
1. Click edit action on any ticket
2. Edit modal opens with searchable customer dropdown
3. Same search and display functionality as Add modal
4. Pre-selected customer shown
5. Can change to different customer with search

**Visual Design**:
- Dropdown height: 38px (consistent with other inputs)
- Font size: 13px (readable and clean)
- Customer name: Regular font weight (not bold)
- Mobile number: Gray color (#374151) for visual hierarchy
- Clear button: Proper 8px left padding
- Search box: Always visible at top of dropdown
- Scrollable list: For many customers

**Technical Implementation Details**:

**Select2 Factory Pattern**:
```typescript
import select2Factory from 'select2';
select2Factory(jQuery);  // Extends jQuery with .select2() method
```

**Why Factory Function**:
- Select2 exports a factory in module environments (not UMD)
- Must call factory with jQuery to attach select2 plugin
- Direct import of 'select2' returns factory function
- Factory extends jQuery prototype with select2 method

**Error Handling**:
```typescript
if (typeof $.fn.select2 !== 'function') {
  console.error('Select2 is not available on jQuery');
  return;
}
```

**Cleanup Pattern**:
```typescript
return () => {
  clearTimeout(timeoutId);
  try {
    if ($select.data('select2')) {
      $select.select2('destroy');
    }
  } catch (error) {
    // Silently fail
  }
};
```

**Benefits**:
- ✅ Live search functionality for better UX
- ✅ Mobile numbers visible in dropdown for quick identification
- ✅ Consistent 38px height matching other form inputs
- ✅ Clean 13px font size throughout
- ✅ No duplicate entries when adding new customers
- ✅ Automatic re-initialization on data changes
- ✅ Proper memory cleanup on unmount
- ✅ Fallback to regular select if Select2 fails
- ✅ Same experience in both Add and Edit modals
- ✅ Clear button with proper spacing

**Files Modified**:
1. `resources/js/components/AddTicketModal.tsx`
2. `resources/js/pages/tickets.tsx`
3. `vite.config.js`
4. `package.json` (dependencies added)

**Notes**:
- Select2 version: 4.1.0-rc.0 (release candidate)
- jQuery version: 3.7.1
- Both libraries bundled in separate chunk for optimal loading
- No changes required to backend API
- Works with existing customer data structure
- Compatible with existing form validation

### Select2 Customer Dropdown Fix for Edit Ticket Modal (Added: 2025-11-19)

**Feature**: Fixed Select2 initialization in Edit Ticket Modal and updated selected text display to show mobile numbers in both Add and Edit ticket modals.

**Problem Identified**:
- Select2 was not initializing in Edit Ticket Modal customer dropdown
- `editCustomerSelectRef.current` was `null` when useEffect ran because the ref hadn't attached to the DOM element yet
- Selected text only showed customer name, not mobile number (inconsistent with dropdown options)

**Root Cause**:
The ref check was happening before the modal DOM elements fully rendered, causing the initialization to exit early.

**Solution Applied**:

**1. Fixed Select2 Initialization Timing** (`resources/js/pages/tickets.tsx`):

```javascript
// ❌ BEFORE (Not Working)
useEffect(() => {
  if (!editCustomerSelectRef.current || !editModalOpen) {
    return; // Ref is null here, exits immediately
  }
  setTimeout(() => {
    // Never reaches here
  }, 300);
}, [editModalOpen, customers, editFormData.customer_id]);

// ✅ AFTER (Working)
useEffect(() => {
  if (!editModalOpen) {
    return; // Only check modal state
  }

  if (customers.length === 0) {
    return; // Wait for customers
  }

  setTimeout(() => {
    if (!editCustomerSelectRef.current) {
      return; // Check ref AFTER 300ms delay
    }
    // Initialize Select2 - ref is now attached!
  }, 300);
}, [editModalOpen, customers, editFormData.customer_id]);
```

**Key Fix**: Moved the ref existence check **inside the setTimeout** instead of before it, allowing the modal DOM to fully render before checking if the ref is attached.

**2. Updated templateSelection to Show Mobile Numbers**:

Both Add and Edit ticket modals now display mobile numbers in the selected text:

```javascript
templateSelection: function(customer: any) {
  if (!customer.id) {
    return customer.text;
  }
  const customerData = customers.find(c => c.id === parseInt(customer.id));
  if (customerData && customerData.mobile) {
    const $result = $('<div></div>');
    $result.html(`<span style="font-size: 13px;">${customerData.name}</span> <span style="color: #374151; font-size: 13px;">(${customerData.country_code || ''} ${customerData.mobile})</span>`);
    return $result;
  }
  return customerData ? customerData.name : customer.text;
}
```

**Implementation Details**:

**Edit Modal Initialization**:
```javascript
// Find the dialog/modal container for proper dropdown rendering
const $modalContainer = $select.closest('[role="dialog"]');

$select.select2({
  placeholder: 'Select a customer...',
  allowClear: true,
  width: '100%',
  minimumResultsForSearch: 0, // Always show search box
  dropdownParent: $modalContainer.length > 0 ? $modalContainer : $select.parent(),
  templateResult: function(customer: any) {
    // Shows: Customer Name (+91 1234567890)
  },
  templateSelection: function(customer: any) {
    // Shows: Customer Name (+91 1234567890)
  }
});
```

**Timing Configuration**:
- **Timeout**: 300ms delay to ensure modal DOM is fully rendered
- **Dependencies**: `[editModalOpen, customers, editFormData.customer_id]`
- **dropdownParent**: Set to modal container `[role="dialog"]` for proper z-index layering

**User Experience**:

**Before Fix**:
- ❌ Edit modal: Regular dropdown (no search)
- ✅ Add modal: Searchable dropdown working
- 📝 Selected text: Customer Name only

**After Fix**:
- ✅ Edit modal: Searchable dropdown working
- ✅ Add modal: Searchable dropdown working (unchanged)
- 📝 Selected text: Customer Name *(+91 1234567890)*

**Visual Consistency**:
- **Dropdown options**: Customer Name *(+91 1234567890)*
- **Selected text**: Customer Name *(+91 1234567890)* - **Same format!**
- **Search**: Live search by name or mobile number
- **Styling**: 38px height, 13px font-size
- **Mobile number color**: Gray (#374151) for visual hierarchy

**Files Modified**:
1. `resources/js/pages/tickets.tsx` (lines 220-344) - Fixed initialization timing and updated templateSelection
2. `resources/js/components/AddTicketModal.tsx` (lines 225-236) - Updated templateSelection

**Benefits**:
- ✅ Search functionality now works in both Add and Edit ticket modals
- ✅ Mobile numbers visible in selected text for better identification
- ✅ Consistent user experience across both modals
- ✅ Proper dropdown rendering inside modal (correct z-index)
- ✅ No performance issues with 300ms delay
- ✅ Clean console output (debug logs removed)

**Technical Notes**:
- The 300ms timeout is critical for React to complete modal rendering and ref attachment
- The `dropdownParent` setting ensures dropdown renders inside modal container
- Both `templateResult` and `templateSelection` now use identical formatting
- Select2 instance properly cleaned up on modal close to prevent memory leaks
