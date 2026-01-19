# GL Tickets React App - Project Details

## Overview
This is a Laravel-based ticket management system with a React frontend. The application manages support tickets with features for assignments, notifications, priorities, statuses, and activity tracking.

## Recent Updates and Features

### 1. 404 Error Fix
- **Issue**: Refreshing the tickets list page resulted in a 404 error
- **Solution**: User changed the API route from POST to GET method
- **Status**: Resolved

### 2. Ticket Details Modal Implementation
- **Layout**: Two-column design (30% left, 70% right)
- **Header**: 
  - Height: 50px
  - Background: #5a4b81
  - Border color: #e4e4e4
- **Features**:
  - Left column (30%): Ticket information and update controls
  - Right column (70%): Activity tabs and content
  - Custom scrollbar for left column with 740px height

### 3. Multiselect Dropdowns
- **Assigned To Dropdown**:
  - Shows selected users as badges inside the dropdown
  - Integrates with `agent_ticket` table
  - Remove functionality with × button
  - Auto-saves on selection
- **Notify To Dropdown**:
  - Shows selected users as badges inside the dropdown
  - Filters users with role_id = 2
  - Integrates with `notify_ticket` table
  - Remove functionality with × button
  - Auto-saves on selection

### 4. Database Integration

#### Tables Used:
- `tickets` - Main ticket information
- `agent_ticket` - Many-to-many relationship for ticket assignments
- `notify_ticket` - Many-to-many relationship for notifications
- `priorities` - Priority levels (excluding "Urgent")
- `ticket_statuses` - Ticket status options
- `branches` - Branch locations
- `ticket_labels` - Available labels
- `label_ticket` - Many-to-many relationship for ticket labels
- `activities` - Activity log for all ticket changes
- `ticket_log_notes` - Log notes for tickets
- `tasks` - Task management for tickets
- `ticket_images` - File attachments for tickets
- `products` - Product catalog
- `product_tickets` - Many-to-many relationship for spare parts

#### API Endpoints:
- `GET /api/tickets` - List tickets with pagination and search
- `GET /api/tickets/{id}` - Get ticket details with relationships
- `PUT /api/tickets/{id}` - Update ticket information
- `DELETE /api/tickets/{id}` - Soft delete ticket
- `DELETE /api/tickets/{ticket}/agents/{agent}` - Remove assigned agent
- `DELETE /api/tickets/{ticket}/notify/{user}` - Remove notify user
- `DELETE /api/tickets/{ticket}/labels/{label}` - Remove ticket label
- `GET /api/priorities` - Get active priorities (excluding "Urgent")
- `GET /api/ticket-statuses` - Get active ticket statuses
- `GET /api/branches` - Get all branches
- `GET /api/ticket-labels` - Get active ticket labels
- `GET /api/tickets/{ticket}/log-notes` - Get ticket log notes
- `POST /api/tickets/{ticket}/log-notes` - Add log note
- `GET /api/tickets/{ticket}/tasks` - Get ticket tasks
- `POST /api/tickets/{ticket}/tasks` - Add task
- `GET /api/tickets/{ticket}/attachments` - Get ticket attachments
- `POST /api/tickets/{ticket}/attachments` - Upload attachment
- `DELETE /api/tickets/{ticket}/attachments/{attachment}` - Delete attachment
- `GET /api/tickets/{ticket}/spare-parts` - Get spare parts
- `POST /api/tickets/{ticket}/spare-parts` - Add spare part
- `DELETE /api/tickets/{ticket}/spare-parts/{sparePart}` - Delete spare part

### 5. Status and Priority Management
- **Auto-save on change**: Updates happen immediately when dropdown values change
- **Dynamic loading**: Priorities loaded from `priorities` table using 'title' column
- **Toast notifications**: Success/error messages for all updates
- **Real-time updates**: No need to close modal for changes to take effect

### 6. Date and Time Fields
- **Due Date**: Date picker with auto-save
- **Closing Time**: Time picker with auto-save
- **Validation**: Proper handling of null values and data types
- **Format**: Dates stored as YYYY-MM-DD, times as HH:MM

### 7. Branch Management
- **Dynamic loading**: Branches loaded from `branches` table
- **Auto-save**: Updates branch_id in tickets table on selection
- **Activity logging**: Tracks branch changes in activity log

### 8. Ticket Labels (Multiselect)
- **Dynamic loading**: Labels from `ticket_labels` table
- **Color-coded badges**: Shows label colors in dropdown and selected items
- **Many-to-many relationship**: Uses `label_ticket` pivot table
- **Add/Remove functionality**: 
  - Add labels by selecting from dropdown
  - Remove with × button on badges
  - Auto-saves to database
- **No longer uses**: Removed label field from tickets table

### 9. Activity Tab Integration
- **Real-time data**: Loads activities from `activities` table
- **Relationships**: Shows user who performed action, status, and priority details
- **Timeline view**: Visual timeline with connecting lines
- **Empty state**: Shows message when no activities exist
- **Formatted timestamps**: Shows date/time in readable format (MMM DD at HH:MM AM/PM)

### 10. Activity Logging System
All changes to tickets now create activity records with appropriate details:

#### Logged Activities:
- **Status Changes**: "Status changed from [Old] to [New]"
- **Priority Changes**: "Priority changed from [Old] to [New]"
- **Branch Changes**: "Branch changed from [Old] to [New]"
- **Due Date Changes**: "Due date changed from [Old] to [New]"
- **Closing Time Changes**: "Closing time changed from [Old] to [New]"
- **Agent Assignments**: "Assigned agent(s): [Names]"
- **Agent Removals**: "Removed agent: [Name]"
- **Notify User Additions**: "Added notify user(s): [Names]"
- **Notify User Removals**: "Removed notify user: [Name]"
- **Label Additions**: "Added label(s): [Names]"
- **Label Removals**: "Removed label: [Name]"

#### Activity Record Structure:
- `type`: Type of activity (e.g., "Ticket Status Changed")
- `note`: Descriptive message about the change
- `ticket_id`: Related ticket ID
- `created_by`: User who made the change
- `status_id`: New status ID (for status changes)
- `priority_id`: New priority ID (for priority changes)
- `branch_id`: New branch ID (for branch changes)
- `agent_id`: Agent IDs (for agent-related activities)
- `created_at`: Timestamp of the activity

### 11. Tab-based Content Areas

#### Log Note Tab:
- **List View**: Timeline-style display with user avatars
- **Add Note**: Modal form with position: absolute; right: 20px; width: 400px; z-index: 9999999; top: 170px
- **Fields**: Note text (textarea)
- **Database**: Stores in `ticket_log_notes` table
- **Height**: List container height: 485px with scrollbar

#### Task Tab:
- **List View**: Shows task name, assigned users, status, created date, and due date/time
- **Add Task**: Modal form with same positioning as Log Note
- **Fields**: 
  - Task name (required)
  - Description (textarea)
  - Assigned To (multi-select showing users with role_id=2)
  - Task Status (dropdown: Open=1, In Progress=2, Closed=3)
  - Date and Time (combined into datetime field)
- **Database**: Stores in `tasks` table with `agent_task` pivot table
- **Status Colors**: Text-only colors - Open (green), In Progress (maroon), Closed (red)
- **Height**: List container height: 490px with scrollbar

#### Attachments Tab:
- **List View**: Shows file name (clickable to view), uploaded date/time, and file size
- **Add File**: Modal form upload interface
- **Upload Path**: public/uploads/ticket_image/
- **Database**: Stores in `ticket_images` table
- **Features**: Download and delete buttons for each file
- **Height**: List container height: 485px with scrollbar

#### Spare Parts Tab:
- **List View**: Shows product name, quantity, price, and total amount
- **Add Spare Part**: Modal form with product dropdown and quantity input
- **Product Selection**: Dropdown shows all products from `products` table
- **Price Calculation**: Automatically calculates total (quantity × cost)
- **Database**: Stores in `product_tickets` pivot table
- **Height**: List container height: 485px with scrollbar

### 12. Ticket Actions and Status Management

#### Edit Functionality:
- **Edit Button**: 25×25px with 20×20px SVG icon
- **Edit Form**: Modal style (position: fixed; left: 200px; top: 154px; width: 400px)
- **Background**: #e4e4e4
- **Fields**: Issue and Description only
- **Updates**: tickets table issue and description columns

#### Delete Functionality:
- **Delete Button**: 25×25px with 20×20px SVG icon
- **Soft Delete**: Uses Laravel's SoftDeletes trait
- **Action**: Sets ticket status to 3 (Closed) instead of permanent deletion
- **Confirmation**: AlertDialog with custom styling

#### Close/Re-open Ticket:
- **Close Ticket**: Updates status to 3 (Closed)
- **Re-open Ticket**: Updates status to 1 (Open) - only shows for closed tickets
- **Behavior**: Modal stays open, only status dropdown updates
- **Button Colors**: Close (red), Re-open (green)

### 13. UI/UX Improvements
- **Custom scrollbar styling**: Thin scrollbar with slate colors
- **Responsive design**: Proper handling of different screen sizes
- **Loading states**: Proper handling of async operations
- **Error handling**: Toast notifications for failures
- **Pointer events**: Fixed issue with clicking × on badges
- **Button Alignment**: Edit, delete, and close/re-open buttons aligned to the right
- **Activity List Height**: 530px
- **Dropdown Menu Background**: Solid white (#fff) to remove transparency
- **AlertDialog Backdrop**: Semi-transparent white (#ffffff4d)
- **AlertDialog Red Buttons**: 50% opacity (bg-red-600/50)

### 14. Tickets List Page Updates

#### Edit Modal:
- **Simplified Form**: Only shows Issue and Description fields
- **Save Button**: Light blue background (bg-blue-400 hover:bg-blue-500)
- **Modal Width**: 400px

#### Delete Functionality:
- **Confirmation Dialog**: Asks before deleting
- **Action**: Sets ticket status to 3 (Closed)
- **After Delete**: Refreshes the tickets list
- **Success Message**: "Ticket deleted successfully"

### 15. Environment Configuration
- **API Base URL**: Configured to use APP_URL from environment
- **Axios Configuration**: Set in bootstrap.js to use meta tag app-url

## Technical Stack
- **Backend**: Laravel 12.20.0 (PHP)
- **Frontend**: React with TypeScript
- **UI Components**: Radix UI (Dialog, Select, Tabs, AlertDialog)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Build Tool**: Vite
- **Icons**: Lucide React

## Key Features
1. Ticket management with full CRUD operations
2. Multi-user assignment and notification system
3. Priority and status tracking
4. Branch-based ticket organization
5. Label categorization with colors
6. Comprehensive activity logging
7. Real-time updates without page refresh
8. Responsive modal-based interface
9. Search and pagination functionality
10. Role-based user filtering
11. Log notes management
12. Task management with multi-user assignment
13. File attachment support
14. Spare parts tracking with price calculation
15. Soft delete functionality
16. Close/Re-open ticket workflow

## File Structure
- `/app/Http/Controllers/TicketController.php` - Main ticket controller with activity logging
- `/app/Models/` - Eloquent models (Ticket, Activity, Branch, TicketLabel, Task, etc.)
- `/resources/js/components/TicketDetailsModal.tsx` - Main modal component
- `/resources/js/pages/tickets.tsx` - Tickets list page
- `/resources/js/components/ui/` - UI components (alert-dialog, dropdown-menu, etc.)
- `/routes/api.php` - API route definitions
- `/database/migrations/` - Database migration files
- `/resources/css/app.css` - Custom styles including scrollbar
- `/public/uploads/ticket_image/` - File upload directory

## Recent Reporting System Implementation

### 16. Comprehensive Reporting Module

#### Report Types Implemented:
1. **Customer Analytics Report**
   - Detailed customer behavior and insights
   - Ticket statistics per customer
   - Revenue tracking
   - Customer satisfaction metrics

2. **Tickets Report**
   - Complete ticket statistics and trends
   - Response and resolution time tracking
   - Status and priority filtering
   - Category-based analysis

3. **Customer Report**
   - Customer activity and engagement
   - Contact information management
   - Join date tracking
   - Total spend analysis

4. **Inventory Report**
   - Product stock levels and movement
   - Stock usage percentage
   - Category and brand filtering
   - Stock value calculations

5. **Performance Report**
   - Agent performance metrics
   - Completion rates
   - Average resolution times
   - Performance rankings

6. **Monthly Summary Report**
   - Comprehensive monthly business overview
   - Revenue tracking with daily breakdown
   - Payment mode distribution
   - Top customer identification
   - Month-over-month growth comparison
   - Ticket statistics and closure rates

#### Report Features:
- **Date Filtering**: Custom date ranges or all data
- **CSV Export**: All reports exportable to CSV format
- **Print Support**: Print-friendly layouts with proper styling
- **Real-time Data**: Fetches live data from database
- **Quick Stats Dashboard**: 
  - Total Revenue (from payments table)
  - Total Tickets (from tickets table)
  - Active Customers (from customers table)
  - Completion Rate (using closed ticket status)

#### API Endpoints for Reports:
- `GET /api/reports/monthly-revenue` - Monthly revenue data
- `GET /api/reports/daily-revenue` - Daily revenue breakdown
- `GET /api/reports/tickets-report` - Comprehensive ticket report
- `GET /api/reports/ticket-statistics` - Ticket stats summary
- `GET /api/reports/customer-analytics` - Customer analytics data
- `GET /api/reports/customer-report` - Customer details report
- `GET /api/reports/agent-performance` - Agent performance metrics
- `GET /api/reports/inventory-report` - Inventory status report
- `GET /api/reports/quick-stats` - Dashboard statistics
- `GET /api/reports/monthly-summary` - Monthly business summary

#### Report Controller Implementation:
- **ReportController.php**: Centralized controller for all reporting
- **Database Queries**: Optimized with Eloquent ORM and raw queries
- **Date Range Support**: All reports support date filtering
- **Currency**: Indian Rupees (₹) formatting
- **Performance**: Efficient queries with proper indexing

#### Frontend Report Components:
- **reports.tsx**: Main reports page with report selection
- **report-preview.tsx**: Detailed report preview with export options
- **Local Storage**: Saves last 10 generated reports
- **Alert Dialogs**: Confirmation for clearing report history
- **Border Styling**: Consistent #e4e4e4 border color throughout

### 17. Database Tables Used for Reporting:
- `payments` - Payment transactions and revenue
- `tickets` - Ticket data and statistics
- `customers` - Customer information
- `products` - Inventory data
- `users` - Agent/user information
- `agent_ticket` - Agent assignments
- `categories` - Product categories
- `brands` - Product brands

### 18. UI/UX Enhancements for Reports:
- **Card-based Layout**: Visual report type selection
- **Color-coded Statistics**: Different colors for different metrics
- **Responsive Tables**: Horizontal scrolling for large datasets
- **Summary Cards**: Quick overview before detailed data
- **Loading States**: Proper loading indicators
- **Toast Notifications**: Success/error feedback
- **Date Range Display**: Shows "All Data" when no date filter applied

## Future Considerations
- Implement real-time updates using WebSockets
- Add email notifications for ticket updates
- Add chart visualizations for reports
- Implement scheduled report generation
- Add report email delivery
- Implement ticket templates
- Add bulk operations for tickets
- Implement task reminders and notifications
- Add file preview for common formats
- Implement spare parts inventory tracking
- Add role-based report access control
- Implement report templates and customization