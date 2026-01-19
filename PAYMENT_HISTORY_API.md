# Payment History Controller API Documentation

This document provides comprehensive documentation for the `PaymentHistoryController` endpoints.

## Overview

The `PaymentHistoryController` provides centralized methods to fetch payment history, payment dues, and related statistics for customers with proper role-based access control.

## Authentication

All endpoints require authentication via `auth:sanctum` middleware.

## Role-Based Access Control

The controller implements the following access control:

- **Admin (role_id = 1)**: Full access to all data
- **Agent (role_id = 2)**: Access only to their own created records
- **Manager (role_id = 3)**: Access to records created by their assigned agents
- **Branch Admin (role_id = 4)**: Access to records from their branch

---

## Endpoints

### 1. Get Customer Payment Data

**Endpoint:** `GET /api/payment-history/customer/{customerId}/data`

**Description:** Fetches both payment history and payment dues for a specific customer in a single request.

**Parameters:**
- `customerId` (path, required): The ID of the customer

**Response:**
```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "country_code": "+91",
    "company_name": "ABC Corp",
    "branch_id": 1
  },
  "payment_history": [
    {
      "id": 1,
      "invoice_id": 10,
      "ticket_id": 5,
      "customer_id": 1,
      "service_charge": 500.00,
      "item_amount": 2000.00,
      "total_amount": 2500.00,
      "discount": 100.00,
      "net_amount": 2400.00,
      "paid_amount": 2400.00,
      "balance_due": 0.00,
      "payment_mode": "Cash",
      "created_at": "2025-01-15T10:30:00.000000Z",
      "invoice": {
        "id": 10,
        "invoice_id": "INV-000010",
        "status": "Paid"
      },
      "ticket": {
        "id": 5,
        "tracking_number": "TKT-000005",
        "issue": "Laptop repair"
      }
    }
  ],
  "total_paid": 2400.00,
  "payment_dues": [
    {
      "id": 1,
      "invoice_id": 11,
      "ticket_id": 6,
      "customer_id": 1,
      "balance_due": 1500.00,
      "status": "Pending",
      "created_at": "2025-01-14T15:20:00.000000Z",
      "invoice": {
        "id": 11,
        "invoice_id": "INV-000011",
        "status": "Unpaid"
      },
      "ticket": {
        "tracking_number": "TKT-000006",
        "issue": "Phone screen replacement"
      }
    }
  ],
  "total_due": 1500.00
}
```

**Error Responses:**
- `404 Not Found`: Customer not found
- `500 Internal Server Error`: Server error

**Usage Example:**
```javascript
const response = await axios.get('/payment-history/customer/1/data');
const { customer, payment_history, total_paid, payment_dues, total_due } = response.data;
```

---

### 2. Get Customer Payment Statistics

**Endpoint:** `GET /api/payment-history/customer/{customerId}/stats`

**Description:** Fetches comprehensive payment statistics for a customer including totals, averages, and counts.

**Parameters:**
- `customerId` (path, required): The ID of the customer

**Response:**
```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "country_code": "+91"
  },
  "stats": {
    "total_paid": 25000.00,
    "payment_count": 12,
    "average_payment": 2083.33,
    "total_due": 3500.00,
    "due_count": 2,
    "last_payment_date": "2025-01-15T10:30:00.000000Z",
    "total_transactions": 14
  }
}
```

**Error Responses:**
- `404 Not Found`: Customer not found
- `500 Internal Server Error`: Server error

**Usage Example:**
```javascript
const response = await axios.get('/payment-history/customer/1/stats');
const { customer, stats } = response.data;
console.log(`Average payment: ₹${stats.average_payment}`);
```

---

### 3. Get Customers with Payment Summary

**Endpoint:** `GET /api/payment-history/customers-summary`

**Description:** Fetches a paginated list of all customers with their payment summaries (total paid, total due, counts).

**Query Parameters:**
- `per_page` (optional, default: 10): Number of records per page
- `search` (optional): Search by customer name, mobile, or email

**Response:**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "1234567890",
      "country_code": "+91",
      "company_name": "ABC Corp",
      "branch": {
        "id": 1,
        "branch_name": "Main Branch"
      },
      "total_paid": 25000.00,
      "total_due": 3500.00,
      "payment_count": 12,
      "due_count": 2
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "mobile": "9876543210",
      "country_code": "+91",
      "company_name": "XYZ Ltd",
      "branch": {
        "id": 1,
        "branch_name": "Main Branch"
      },
      "total_paid": 15000.00,
      "total_due": 0.00,
      "payment_count": 8,
      "due_count": 0
    }
  ],
  "first_page_url": "http://example.com/api/payment-history/customers-summary?page=1",
  "from": 1,
  "last_page": 3,
  "last_page_url": "http://example.com/api/payment-history/customers-summary?page=3",
  "next_page_url": "http://example.com/api/payment-history/customers-summary?page=2",
  "path": "http://example.com/api/payment-history/customers-summary",
  "per_page": 10,
  "prev_page_url": null,
  "to": 10,
  "total": 25
}
```

**Error Responses:**
- `500 Internal Server Error`: Server error

**Usage Example:**
```javascript
// Basic usage
const response = await axios.get('/payment-history/customers-summary');

// With pagination and search
const response = await axios.get('/payment-history/customers-summary', {
  params: {
    per_page: 25,
    search: 'John'
  }
});

const customers = response.data.data;
customers.forEach(customer => {
  console.log(`${customer.name}: Paid ₹${customer.total_paid}, Due ₹${customer.total_due}`);
});
```

---

## Existing Routes (from PaymentDueController)

The following routes are still available and functional:

### Get Customer Payment History

**Endpoint:** `GET /api/payment-history/customer/{customerId}`

**Description:** Fetches only payment history for a customer (legacy endpoint).

**Response:**
```json
{
  "customer": { ... },
  "payments": [ ... ],
  "total_paid": 25000.00
}
```

### Get Customer Payment Dues

**Endpoint:** `GET /api/payment-dues/customer/{customerId}`

**Description:** Fetches only payment dues for a customer (legacy endpoint).

**Response:**
```json
{
  "payment_dues": [ ... ],
  "total_amount": 3500.00
}
```

---

## Frontend Integration

### Current Implementation (payment-history.tsx)

The current frontend uses two separate API calls:

```typescript
// Fetch payment history
const historyResponse = await axios.get(`/payment-history/customer/${customerId}`);
setPaymentHistory(historyResponse.data.payments || []);
setTotalPaid(historyResponse.data.total_paid || 0);

// Fetch payment dues
const duesResponse = await axios.get(`/payment-dues/customer/${customerId}`);
setPaymentDues(duesResponse.data.payment_dues || []);
setTotalDue(duesResponse.data.total_amount || 0);
```

### Optimized Implementation (Single API Call)

You can optionally update to use the new consolidated endpoint:

```typescript
// Single API call for both data
const response = await axios.get(`/payment-history/customer/${customerId}/data`);
setPaymentHistory(response.data.payment_history || []);
setTotalPaid(response.data.total_paid || 0);
setPaymentDues(response.data.payment_dues || []);
setTotalDue(response.data.total_due || 0);
```

**Benefits:**
- Reduces network requests from 2 to 1
- Faster page load time
- Cleaner code
- Consistent data snapshot

---

## Database Tables

### payments
- `id`: Primary key
- `invoice_id`: Foreign key to invoices
- `ticket_id`: Foreign key to tickets
- `customer_id`: Foreign key to customers
- `service_charge`: Service charge amount
- `item_amount`: Items total amount
- `total_amount`: Total before discount
- `discount`: Discount amount
- `net_amount`: Final amount after discount
- `paid_amount`: Amount paid (can be partial)
- `balance_due`: Remaining balance
- `payment_mode`: Payment method (Cash, UPI, Card, etc.)
- `created_by`: User who created the payment
- `branch_id`: Branch where payment was made
- `created_at`, `updated_at`: Timestamps

### payment_dues
- `id`: Primary key
- `invoice_id`: Foreign key to invoices
- `ticket_id`: Foreign key to tickets
- `customer_id`: Foreign key to customers
- `balance_due`: Outstanding amount
- `status`: 'Pending' or 'Paid'
- `payment_id`: Foreign key to payments (when paid)
- `created_by`: User who created the due
- `branch_id`: Branch of the due
- `created_at`, `updated_at`: Timestamps

---

## Role-Based Filtering Logic

```php
// Admin - No filter (sees everything)
if ($user->role_id == 1) {
    // No additional WHERE clause
}

// Agent - Only their records
elseif ($user->role_id == 2) {
    $query->where('created_by', $user->id);
}

// Manager - Records from assigned agents
elseif ($user->role_id == 3) {
    $assignedAgentIds = DB::table('assign_agents')
        ->where('user_id', $user->id)
        ->pluck('agent_id')->toArray();

    if (!empty($assignedAgentIds)) {
        $query->whereIn('created_by', $assignedAgentIds);
    } else {
        $query->whereRaw('1 = 0'); // No access
    }
}

// Branch Admin - Records from their branch
elseif ($user->role_id == 4 && $user->branch_id) {
    $query->where('branch_id', $user->branch_id);
}
```

---

## Error Handling

All endpoints use try-catch blocks and return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed exception message"
}
```

HTTP Status Codes:
- `200 OK`: Success
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Testing the API

### Using cURL

```bash
# Get customer payment data
curl -X GET "http://localhost/api/payment-history/customer/1/data" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Get customer payment stats
curl -X GET "http://localhost/api/payment-history/customer/1/stats" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Get customers with payment summary
curl -X GET "http://localhost/api/payment-history/customers-summary?per_page=25&search=John" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Using Postman/Insomnia

1. Set Authorization header: `Bearer YOUR_TOKEN`
2. Set Accept header: `application/json`
3. Make GET requests to the endpoints

---

## Performance Considerations

1. **Eager Loading**: Uses `with()` to eager load relationships and avoid N+1 queries
2. **Role Filtering**: Applies filters at database level for efficient querying
3. **Indexing**: Ensure foreign keys are indexed for faster joins
4. **Caching**: Consider adding Redis caching for frequently accessed customer data

---

## Future Enhancements

Potential improvements:

1. **Date Range Filtering**: Add date filters to payment history
2. **Payment Mode Filtering**: Filter by payment mode
3. **Export Functionality**: Add CSV/PDF export for reports
4. **Pagination**: Add pagination to payment history within customer data
5. **Caching**: Implement Redis caching for payment statistics
6. **Analytics**: Add monthly/yearly trend analysis
7. **Notifications**: Send alerts for overdue payments

---

## Support

For issues or questions, contact the development team or refer to the main project documentation in `CLAUDE.md`.
