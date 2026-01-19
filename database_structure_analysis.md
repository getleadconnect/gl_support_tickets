# Database Structure Analysis for gltickets_ai

## Total Tables: 74

## Table Categories

### 1. Core Tables (Main entities)
- **users** - System users (agents, managers, admins, branch admins)
- **customers** - Customer information
- **tickets** - Support tickets (uses soft deletes)
- **tasks** - Task management
- **invoices** - Invoice records (uses soft deletes)
- **payments** - Payment records
- **products** - Product inventory
- **brands** - Product brands
- **categories** - Product categories

### 2. Relationship/Pivot Tables
- **agent_ticket** - Many-to-many: tickets ↔ agents
- **agent_task** - Many-to-many: tasks ↔ agents
- **assign_agents** - Manager to agent assignments
- **notify_ticket** - Many-to-many: tickets ↔ users (notifications)
- **label_ticket** - Many-to-many: tickets ↔ labels
- **product_tickets** - Products used in tickets
- **invoice_items** - Invoice line items
- **model_has_permissions** - User/role permissions (Spatie)
- **model_has_roles** - User roles (Spatie)
- **role_has_permissions** - Role permissions (Spatie)

### 3. Configuration/Lookup Tables
- **roles** - User roles (1=Admin, 2=Agent, 3=Manager, 4=Branch Admin)
- **permissions** - System permissions
- **branches** - Branch locations
- **departments** - Organization departments
- **designations** - Job designations
- **priorities** - Ticket/task priorities
- **ticket_statuses** - Ticket status definitions
- **task_statuses** - Task status definitions
- **ticket_types** - Ticket type definitions
- **ticket_labels** - Available ticket labels
- **task_types** - Task type definitions
- **task_categories** - Task categorization
- **stages** - Workflow stages
- **call_reasons** - Reason for customer calls
- **message_settings** - WhatsApp API configuration

### 4. Activity/History Tables
- **activities** - General activity log
- **ticket_histories** - Ticket change history
- **ticket_status_histories** - Ticket status change history
- **task_notes** - Notes on tasks
- **ticket_log_notes** - Notes on ticket logs
- **logs** - General system logs
- **log_types** - Log type definitions
- **log_outcomes** - Log outcome definitions
- **api_logs** - API request/response logs
- **file_logs** - File operation logs
- **notifications** - User notifications

### 5. System Tables
- **migrations** - Laravel migrations
- **cache** - Laravel cache
- **cache_locks** - Laravel cache locks
- **sessions** - Laravel sessions
- **jobs** - Laravel queue jobs
- **failed_jobs** - Failed queue jobs
- **password_reset_tokens** - Password reset tokens
- **personal_access_tokens** - Laravel Sanctum tokens

### 6. Additional Feature Tables
- **companies** - Company information
- **company_logos** - Company logo storage
- **countries** - Country list
- **firms** - Firm/business entities
- **attachements** - General file attachments
- **ticket_images** - Ticket-specific images
- **qrcodes** - QR code storage
- **refunds** - Refund records
- **additional_fields** - Custom fields definition
- **additional_field_options** - Options for custom fields
- **ticket_additional_fields** - Ticket custom field values
- **apis** - API endpoint definitions
- **api_params** - API parameter definitions
- **telegram_notification_settings** - Telegram integration
- **accessories** - Accessory items
- **schedule_pickups** - Scheduled pickup appointments
- **estimates** - Cost estimates
- **estimate_items** - Estimate line items
- **ticket_customer_notes** - Customer-facing notes on tickets
- **payment_dues** - Payment due tracking
- **quote_templates** - Quote/estimate templates

## Key Observations

1. **Soft Deletes**: Only `tickets` and `invoices` tables use soft deletes
2. **Foreign Keys**: Limited foreign key constraints (only on critical relationships)
3. **JSON Fields**: Several tables use JSON columns (roles.permissions, tickets.notify_to, tickets.accessories)
4. **Timestamps**: Most tables have created_at/updated_at
5. **Branch-based**: Many tables have branch_id for multi-location support
6. **Audit Trail**: Comprehensive activity and history tracking

## Migration Order (Based on Dependencies)

1. **Independent Tables** (no foreign keys)
   - cache, cache_locks, sessions, migrations
   - countries, stages, call_reasons, log_types, log_outcomes
   - companies, permissions

2. **Core Configuration**
   - roles, branches, departments, designations
   - priorities, ticket_statuses, task_statuses, ticket_types
   - ticket_labels, task_types, task_categories
   - brands, categories

3. **User-related**
   - users
   - password_reset_tokens, personal_access_tokens
   - assign_agents

4. **Customer & Products**
   - customers
   - products

5. **Tickets & Tasks**
   - tickets
   - tasks
   - agent_ticket, agent_task
   - notify_ticket, label_ticket
   - ticket_images, ticket_histories, ticket_status_histories
   - ticket_log_notes, ticket_additional_fields
   - ticket_customer_notes

6. **Financial**
   - invoices
   - invoice_items
   - payments
   - payment_dues
   - refunds

7. **Extended Features**
   - estimates, estimate_items
   - schedule_pickups
   - accessories
   - company_logos
   - attachements
   - product_tickets

8. **Activity & Logs**
   - activities
   - logs, api_logs, file_logs
   - notifications

9. **Settings & Integration**
   - message_settings
   - telegram_notification_settings
   - apis, api_params
   - qrcodes
   - quote_templates

10. **Laravel System**
    - jobs, failed_jobs
    - model_has_permissions, model_has_roles, role_has_permissions