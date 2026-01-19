# ** this api is used to login the user **
1. ** Login api
## MEthod POST


curl --location 'http://127.0.0.1:8000/api/login' \
--header 'Accept: application/json' \
--form 'email="superadmin@gmail.com"' \
--form 'password="123456"'


# ** RESPONSE 

{
    "user": {
        "id": 1,
        "name": "Shaji",
        "country_code": "91",
        "mobile": "1234567899",
        "email": "superadmin@gmail.com",
        "role_id": 1,
        "department_id": 1,
        "branch_id": null,
        "status": 1,
        "created_at": null,
        "updated_at": "2025-08-16T08:18:36.000000Z",
        "parent_id": null,
        "firebase_id": null,
        "image": null,
        "designation_id": 3,
        "password_validity": null,
        "deleted_at": null,
        "role": "Admin",
        "department": {
            "id": 1,
            "department_name": "SALES"
        },
        "designation": {
            "id": 3,
            "designation_name": "IT"
        }
    },
    "token": "271|NlJkZSmKmUAVAYtDzbTIHhUkdOHpKT8UjUiybts96c2b2f70"
}

# -----------------------------------------------------------------------------
# To logout current user
2. ** Logout Api

curl --location --request POST 'http://127.0.0.1:8000/api/logout' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 271|NlJkZSmKmUAVAYtDzbTIHhUkdOHpKT8UjUiybts96c2b2f70'

# ** RESPONSE

{
    "message": "Logged out successfully"
}




## Branch admin dashboard
## Method : GET

curl --location 'http://127.0.0.1:8000/api/branch-dashboard-stats' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 274|Jw25ZkagcIn1DUsyFpplii4JqTpJjVExC3jr4Pd0261e4e07'

# ** RESPONSE

{
    "totalTickets": 21,
    "overdueTickets": 21,
    "openTickets": 0,
    "monthlyData": [
        {
            "month": "Nov",
            "tickets": 0,
            "trend": 0
        },
        {
            "month": "Dec",
            "tickets": 0,
            "trend": 0
        },
        {
            "month": "Jan",
            "tickets": 7,
            "trend": 2
        },
        {
            "month": "Feb",
            "tickets": 0,
            "trend": 2
        },
        {
            "month": "Mar",
            "tickets": 0,
            "trend": 2
        },
        {
            "month": "Apr",
            "tickets": 0,
            "trend": 0
        },
        {
            "month": "May",
            "tickets": 2,
            "trend": 1
        },
        {
            "month": "Jun",
            "tickets": 0,
            "trend": 1
        },
        {
            "month": "Jul",
            "tickets": 2,
            "trend": 1
        },
        {
            "month": "Aug",
            "tickets": 6,
            "trend": 3
        },
        {
            "month": "Sep",
            "tickets": 4,
            "trend": 4
        },
        {
            "month": "Oct",
            "tickets": 0,
            "trend": 3
        }
    ]
}


## AGENT dashboard details
## Method : GET

curl --location 'http://127.0.0.1:8000/api/agent-dashboard-stats' \
--header 'Authorization: Bearer 275|7EOxG8yEf4VxHSaj597J0pc6CSbIu8j6SmvcEUa82f404504'

# ** RESPONSE

{
    "totalAssigned": 1,
    "openTickets": 1,
    "inProgressTickets": 0,
    "closedToday": 0,
    "dueToday": 0,
    "overdue": 1
}





# -----------------------------------------------------------------------------
# To get current user details
3. ** user api   

curl --location 'http://127.0.0.1:8000/api/user' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--header 'Cookie: XSRF-TOKEN=eyJpdiI6Imx5Njk3TUdORWFpM3R1TVhIUTVNWUE9PSIsInZhbHVlIjoiLzA5YUVVaDBxbVFvSlVlaG56SGhjY09oemEyY3lKR29nMXVJZEVxdXZ2M2FGcnI2TE5weUhtVVJkWnJsaEMyNmttcXdFbGx5WWlvemZ1SWZ0Qi9MbzR2UzdzUXQ2ZWlaN2wrVHRSZFJNNTRYNDkvSUFPQ1gyeWx0blBvQXNxYkYiLCJtYWMiOiJlNzI1MTZlNmQxY2ZjNDdiMWY0YjIwNTExOGE0MGJhYmY4MzM5ZWFiZmM0Nzg0MmFmZTVlNWQ2YTNiODUyNTg1IiwidGFnIjoiIn0%3D; g_l_tickets_react_session=eyJpdiI6IjBnUmxzOEtqV2J0elBBbFQ1bm8wM1E9PSIsInZhbHVlIjoiSmN5Y1orZnc1Q1pQNmNVbGhMV1B5MEN5UVZiSmhGQkw5dHRidms4QVRaNmdMSDlKKzNZQkFpV1BxSklrUUdnR3o5L3RBcTlFTFd3alZLNGx5enVVNUNjbWdKR1RVS3pyNk1sNFRVU1JsU1lKYThlTUZ0RnBuNHlsTklqQWRUTVkiLCJtYWMiOiJmYzg5MzU5ODNlY2RkOTZmNjMwNWE2ZmYyMTZhMzU4ZGVmZWNjYThjNGFjZDRlZTEzZDc1NjU2Njc5NzAzOTE2IiwidGFnIjoiIn0%3D'

** Response

{
    "user": {
        "id": 1,
        "name": "Shaji",
        "country_code": "91",
        "mobile": "1234567899",
        "email": "superadmin@gmail.com",
        "role_id": 1,
        "department_id": 1,
        "branch_id": null,
        "status": 1,
        "created_at": null,
        "updated_at": "2025-08-16T08:18:36.000000Z",
        "parent_id": null,
        "firebase_id": null,
        "image": null,
        "designation_id": 3,
        "password_validity": null,
        "deleted_at": null,
        "role": "Admin",
        "department": {
            "id": 1,
            "department_name": "SALES"
        },
        "designation": {
            "id": 3,
            "designation_name": "IT"
        }
    }
}

# -------------------------------------------------------------------------------
# To register issue and create new customer user
4. ** Register_customer api

curl --location 'http://127.0.0.1:8000/api/register-customer' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--header 'Cookie: XSRF-TOKEN=eyJpdiI6Im0zNFZSV3dBVWVYUERRaUphSWhiS3c9PSIsInZhbHVlIjoiM1QvVVlZMmNuNU5EdzhFMHdyMG9EVEJFZEdnRllkYWZxVmxEeldCcGJZbXFBclhBREhJWW96RnVvQ3gwSVJYYnptVFNlYklzQThtNEpGRjVyUmh5NnJ5NjJISmp3eERKWFgwaU00eTBsdy9HVThsSWQ3eGVmdDMxeDhuWmR0MTUiLCJtYWMiOiIzZWU0ZmJmOThmMGI5ODM2MzgzMzYwMGE4YmMzOTdjMjVlMTdmMWIzMWM4NTAwMTkyNWM3NjI4MDQwM2NjOWVmIiwidGFnIjoiIn0%3D; g_l_tickets_react_session=eyJpdiI6ImtuTWJLeUorOXZyN0JjSktHYTFyN3c9PSIsInZhbHVlIjoiQ0FyUmJhVlg3TVZFM3VRSFJzV3ZaK1JOZnlMaEVkdmh4MDFzanBmK29FNlpxYVZPLzFnTmFEZ0xUczliL0VsaWluTlVVTEpRbXF2T29mYnBpcFNGanFvckVhamRmQWd2aVp1bENvcEF0czZaajZjK254aldWR1MvMDU4NG9WYWoiLCJtYWMiOiI3ZGFjNTk3ZTg3YTg5MDc0ODU0ZmQzNTMxNDlhMjgyYTI4ZWVjYTI5ODFhNjZhNDhlZWIyMmEzOWNkY2UyZDU0IiwidGFnIjoiIn0%3D' \
--form 'name="shaji-555"' \
--form 'email="s55@gmail.com"' \
--form 'contact_number="6543217891"' \
--form 'company_name="get lead 55"' \
--form 'issue="this is testing register issue api"' \
--form 'branch_id="5"'

** RESPONSE

{
    "success": true,
    "message": "Registration successful. Your ticket has been created.",
    "tracking_number": "ONS0000717",
    "customer_id": 53,
    "ticket_id": 717,
    "due_date": "2025-10-19 17:30:00"
}

# ---------------------------------------------------------------------------------
# TICKETS APIS

# To create new tickets
5. # ** tickets api
   # ** Method : POST

curl --location 'http://127.0.0.1:8000/api/tickets' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--data '{
"issue":"this is testing issue",
"description":"this is testing",
"customer_id":2,
"priority":2,
"status":1,
"due_date":"2025-10-17",
"ticket_type":"In Shop",
"branch_id":"5",
"service_id":null,
"assigned_users":[3,6],
"notify_users":[6]
}'


# ** RESPONSE

{
    "current_page": 1,
    "data": [
        {
            "id": 717,
            "issue": "this is testing register issue api",
            "description": "Issue submitted through customer registration form",
            "customer_id": 53,
            "priority": 2,
            "status": 1,
            "ticket_type": null,
            "ticket_label": [],
            "notify_to": [],
            "branch_id": 5,
            "tracking_number": "ONS0000717",
            "due_date": "2025-10-19 17:30:00",
            "deleted_at": null,
            "created_at": "2025-10-17T11:40:06.000000Z",
            "updated_at": "2025-10-17T11:40:06.000000Z",
            "created_by": 1,
            "slug": "this-is-testing-register-issue-api-1760701206",
            "service_id": null,
            "closed_time": "05:30:00",
            "closed_by": null,
            "closed_at": null,
            "verified_at": null,
            "remarks": null,
            "customer": {
                "id": 53,
                "name": "shaji-55",
                "email": "s55@gmail.com",
                "country_code": "91",
                "mobile": "3452345670",
                "company_name": "get lead 55",
                "branch_id": 3,
                "created_by": 1
            },
            "user": {
                "id": 1,
                "name": "Shaji",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "superadmin@gmail.com",
                "role_id": 1,
                "department_id": 1,
                "branch_id": null,
                "status": 1,
                "created_at": null,
                "updated_at": "2025-08-16T08:18:36.000000Z",
                "parent_id": null,
                "firebase_id": null,
                "image": null,
                "designation_id": 3,
                "password_validity": null,
                "deleted_at": null
            },
            "ticket_status": {
                "id": 1,
                "status": "Open",
                "color_code": "#0055fa",
                "active": 1,
                "created_at": "2024-12-12T15:57:49.000000Z",
                "updated_at": "2024-12-12T15:57:49.000000Z",
                "stage_id": 1,
                "created_by": 1,
                "order": 1,
                "name": "Open",
                "color": "#0055fa"
            },
            "ticket_priority": {
                "id": 2,
                "title": "Medium",
                "active": 1,
                "created_at": null,
                "updated_at": null,
                "color": "#49E0F4",
                "name": "Medium"
            },
            "agent": [],
            "activity": []
        },
        {
            "id": 716,
            "issue": "fdsdff",
            "description": "dsfdsfsdfdsfsdfd f fsd fdsfdsfsdfds fdsfdfdfdsfdf sdfsdfdsffdsf  dfd asdad 5454 4 4 dsfdf sds adsa da dsa da d ad ad a da da dadas dasd asd asd sadsa dad ad asd asd asd",
            "customer_id": 3,
            "priority": 2,
            "status": 2,
            "ticket_type": "In Shop",
            "ticket_label": [],
            "notify_to": [
                {
                    "id": 3,
                    "name": "shaji-1",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "shaji1@gmail.com",
                    "pivot": {
                        "ticket_id": 716,
                        "agent_id": 3
                    }
                }
            ],
            "branch_id": 2,
            "tracking_number": "TKT0000716",
            "due_date": "2025-09-29 00:00:00",
            "deleted_at": null,
            "created_at": "2025-09-29T05:01:02.000000Z",
            "updated_at": "2025-10-07T08:06:42.000000Z",
            "created_by": 1,
            "slug": "fdsdff-1759122062",
            "service_id": null,
            "closed_time": null,
            "closed_by": null,
            "closed_at": null,
            "verified_at": null,
            "remarks": null,
            "customer": {
                "id": 3,
                "name": "Antony's fashions",
                "email": null,
                "country_code": "91",
                "mobile": "9446197893",
                "company_name": "Antony's Fashions",
                "branch_id": 2,
                "created_by": 8
            },
            "user": {
                "id": 1,
                "name": "Shaji",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "superadmin@gmail.com",
                "role_id": 1,
                "department_id": 1,
                "branch_id": null,
                "status": 1,
                "created_at": null,
                "updated_at": "2025-08-16T08:18:36.000000Z",
                "parent_id": null,
                "firebase_id": null,
                "image": null,
                "designation_id": 3,
                "password_validity": null,
                "deleted_at": null
            },
            "ticket_status": {
                "id": 2,
                "status": "In Progress",
                "color_code": "#e6af84",
                "active": 1,
                "created_at": "2024-12-12T15:57:49.000000Z",
                "updated_at": "2025-05-02T10:57:59.000000Z",
                "stage_id": 2,
                "created_by": 1,
                "order": 1,
                "name": "In Progress",
                "color": "#e6af84"
            },
            "ticket_priority": {
                "id": 2,
                "title": "Medium",
                "active": 1,
                "created_at": null,
                "updated_at": null,
                "color": "#49E0F4",
                "name": "Medium"
            },
            "agent": [
                {
                    "id": 3,
                    "name": "shaji-1",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "shaji1@gmail.com",
                    "role_id": 4,
                    "department_id": 2,
                    "branch_id": 2,
                    "status": 1,
                    "created_at": "2024-12-13T12:53:59.000000Z",
                    "updated_at": "2025-06-27T13:49:52.000000Z",
                    "parent_id": 1,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null,
                    "pivot": {
                        "ticket_id": 716,
                        "agent_id": 3
                    }
                }
            ],
            "activity": [
                {
                    "id": 604,
                    "type": "Ticket Status Changed",
                    "note": "Status changed from None to In Progress",
                    "title": null,
                    "status_id": 2,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 716,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-10-07T08:06:42.000000Z",
                    "updated_at": "2025-10-07T08:06:42.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": {
                        "id": 2,
                        "status": "In Progress",
                        "color_code": "#e6af84",
                        "active": 1,
                        "created_at": "2024-12-12T15:57:49.000000Z",
                        "updated_at": "2025-05-02T10:57:59.000000Z",
                        "stage_id": 2,
                        "created_by": 1,
                        "order": 1,
                        "name": "In Progress",
                        "color": "#e6af84"
                    },
                    "priority": null
                },
            ]
        }
          
    ],
    "first_page_url": "http://127.0.0.1:8000/api/tickets?page=1",
    "from": 1,
    "last_page": 6,
    "last_page_url": "http://127.0.0.1:8000/api/tickets?page=6",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/tickets?page=1",
            "label": "1",
            "active": true
        },
        {
            "url": "http://127.0.0.1:8000/api/tickets?page=2",
            "label": "2",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/tickets?page=3",
            "label": "3",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/tickets?page=4",
            "label": "4",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/tickets?page=5",
            "label": "5",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/tickets?page=6",
            "label": "6",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/tickets?page=2",
            "label": "Next &raquo;",
            "active": false
        }
    ],
    "next_page_url": "http://127.0.0.1:8000/api/tickets?page=2",
    "path": "http://127.0.0.1:8000/api/tickets",
    "per_page": 10,
    "prev_page_url": null,
    "to": 10,
    "total": 58
}

# --------------------------------------------------------------------------------------

# to get tickets list and filter tickets
6. # ** tickets api
   # ** Method GET

curl --location --request GET 'http://127.0.0.1:8000/api/tickets' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--data '{
    "agent_id":6,
    "customer_id":null,
    "status":1,
    "search":null,
    "start_date":null,
    "end_date":null,
    "ticket_type":"TKT",
    "label_id":null,
    "branch_id":null
}'

Note: parameter datas

    "agent_id": agent_id, eg: 8
    "customer_id": customer_id, eg: 23
    "status":1, eg: 1 or 2 or 3 
    "search":null,  any text,
    "start_date":null,  date data
    "end_date":null, date data
    "ticket_type":"TKT",   all or TKT or ONS
    "label_id":null,  1 or 2 or ....
 

# ** RESPONSE

{
    "current_page": 1,
    "data": [
        {
            "id": 712,
            "issue": "qqqqq qqqqqqq qqqqqqqqq qqqqq qqqqqq qqqq",
            "description": "sdffd fdafdsfsd fdsf df dsfdsfsd fdsfsdf f",
            "customer_id": 23,
            "priority": 1,
            "status": 1,
            "ticket_type": null,
            "ticket_label": [],
            "notify_to": [
                {
                    "id": 5,
                    "name": "shaji-3",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "shaji3@gmail.com",
                    "pivot": {
                        "ticket_id": 712,
                        "agent_id": 5
                    }
                }
            ],
            "branch_id": 3,
            "tracking_number": "TKT0000712",
            "due_date": "2025-09-16 00:00:00",
            "deleted_at": null,
            "created_at": "2025-09-15T12:21:41.000000Z",
            "updated_at": "2025-09-17T07:10:31.000000Z",
            "created_by": 5,
            "slug": "qqqqq-qqqqqqq-qqqqqqqqq-qqqqq-qqqqqq-qqqq-1757938901",
            "service_id": null,
            "closed_time": "05:30:00",
            "closed_by": null,
            "closed_at": null,
            "verified_at": null,
            "remarks": null,
            "customer": {
                "id": 23,
                "name": "Kalyan silks",
                "email": "srt@krs.in",
                "country_code": "91",
                "mobile": "9099153699",
                "company_name": null,
                "branch_id": 4,
                "created_by": 8
            },
            "user": {
                "id": 5,
                "name": "shaji-3",
                "country_code": "+91",
                "mobile": "1234567899",
                "email": "shaji3@gmail.com",
                "role_id": 3,
                "department_id": 2,
                "branch_id": 4,
                "status": 1,
                "created_at": "2024-12-13T12:59:18.000000Z",
                "updated_at": "2025-06-27T13:49:52.000000Z",
                "parent_id": 3,
                "firebase_id": null,
                "image": null,
                "designation_id": 2,
                "password_validity": null,
                "deleted_at": null
            },
            "ticket_status": {
                "id": 1,
                "status": "Open",
                "color_code": "#0055fa",
                "active": 1,
                "created_at": "2024-12-12T15:57:49.000000Z",
                "updated_at": "2024-12-12T15:57:49.000000Z",
                "stage_id": 1,
                "created_by": 1,
                "order": 1,
                "name": "Open",
                "color": "#0055fa"
            },
            "ticket_priority": {
                "id": 1,
                "title": "Low",
                "active": 1,
                "created_at": null,
                "updated_at": null,
                "color": "#FF5C66",
                "name": "Low"
            },
            "agent": [
                {
                    "id": 6,
                    "name": "Babu",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "shaji4@gmail.com",
                    "role_id": 2,
                    "department_id": null,
                    "branch_id": 2,
                    "status": 1,
                    "created_at": "2024-12-13T14:12:10.000000Z",
                    "updated_at": "2024-12-23T13:32:18.000000Z",
                    "parent_id": 3,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 1,
                    "password_validity": null,
                    "deleted_at": "2024-12-23 13:32:18",
                    "pivot": {
                        "ticket_id": 712,
                        "agent_id": 6
                    }
                }
            ],
            "activity": [
                {
                    "id": 546,
                    "type": "Ticket Branch Changed",
                    "note": "Branch changed from  to ",
                    "title": null,
                    "status_id": null,
                    "branch_id": 3,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:10:31.000000Z",
                    "updated_at": "2025-09-17T07:10:31.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 547,
                    "type": "Due Date Changed",
                    "note": "Due date changed from 2025-09-16 00:00:00 to 2025-09-16",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:10:31.000000Z",
                    "updated_at": "2025-09-17T07:10:31.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 545,
                    "type": "Due Date Changed",
                    "note": "Due date changed from 2025-09-16 00:00:00 to 2025-09-16",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:10:25.000000Z",
                    "updated_at": "2025-09-17T07:10:25.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 543,
                    "type": "Due Date Changed",
                    "note": "Due date changed from 2025-09-16 00:00:00 to 2025-09-16",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:59.000000Z",
                    "updated_at": "2025-09-17T07:09:59.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 544,
                    "type": "Closing Time Changed",
                    "note": "Closing time changed from 05:30:00 to 05:30",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:59.000000Z",
                    "updated_at": "2025-09-17T07:09:59.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 540,
                    "type": "Due Date Changed",
                    "note": "Due date changed from 2025-09-16 00:00:00 to 2025-09-16",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:56.000000Z",
                    "updated_at": "2025-09-17T07:09:56.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 541,
                    "type": "Closing Time Changed",
                    "note": "Closing time changed from 05:30:00 to 05:30",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:56.000000Z",
                    "updated_at": "2025-09-17T07:09:56.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 542,
                    "type": "Notify User Added",
                    "note": "Added notify user(s): shaji-3",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:56.000000Z",
                    "updated_at": "2025-09-17T07:09:56.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 539,
                    "type": "Notify User Removed",
                    "note": "Removed notify user: system",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:52.000000Z",
                    "updated_at": "2025-09-17T07:09:52.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 538,
                    "type": "Agent Removed",
                    "note": "Removed agent: shaji-3",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": "5",
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:44.000000Z",
                    "updated_at": "2025-09-17T07:09:44.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 537,
                    "type": "Agent Removed",
                    "note": "Removed agent: system",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": "13",
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:40.000000Z",
                    "updated_at": "2025-09-17T07:09:40.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 536,
                    "type": "Notify User Removed",
                    "note": "Removed notify user: raju",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:27.000000Z",
                    "updated_at": "2025-09-17T07:09:27.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 534,
                    "type": "Due Date Changed",
                    "note": "Due date changed from 2025-09-16 00:00:00 to 2025-09-16",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:10.000000Z",
                    "updated_at": "2025-09-17T07:09:10.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 535,
                    "type": "Closing Time Changed",
                    "note": "Closing time changed from 05:03:00 to 05:30",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:10.000000Z",
                    "updated_at": "2025-09-17T07:09:10.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 532,
                    "type": "Due Date Changed",
                    "note": "Due date changed from 2025-09-16 00:00:00 to 2025-09-16",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:09.000000Z",
                    "updated_at": "2025-09-17T07:09:09.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 533,
                    "type": "Closing Time Changed",
                    "note": "Closing time changed from None to 05:03",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T07:09:09.000000Z",
                    "updated_at": "2025-09-17T07:09:09.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 530,
                    "type": "Notify User Removed",
                    "note": "Removed notify user: ssasadadasdasdasdad",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T05:21:50.000000Z",
                    "updated_at": "2025-09-17T05:21:50.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 529,
                    "type": "Notify User Removed",
                    "note": "Removed notify user: ssasadadasdasdasdad",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T05:21:12.000000Z",
                    "updated_at": "2025-09-17T05:21:12.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                },
                {
                    "id": 528,
                    "type": "Notify User Removed",
                    "note": "Removed notify user: Babu",
                    "title": null,
                    "status_id": null,
                    "branch_id": null,
                    "priority_id": null,
                    "agent_id": null,
                    "ticket_id": 712,
                    "log_id": null,
                    "created_by": 1,
                    "description": null,
                    "created_at": "2025-09-17T05:20:57.000000Z",
                    "updated_at": "2025-09-17T05:20:57.000000Z",
                    "task_id": null,
                    "schedule_date": null,
                    "log_file": null,
                    "log_file_type": null,
                    "user": {
                        "id": 1,
                        "name": "Shaji",
                        "country_code": "91",
                        "mobile": "1234567899",
                        "email": "superadmin@gmail.com",
                        "role_id": 1,
                        "department_id": 1,
                        "branch_id": null,
                        "status": 1,
                        "created_at": null,
                        "updated_at": "2025-08-16T08:18:36.000000Z",
                        "parent_id": null,
                        "firebase_id": null,
                        "image": null,
                        "designation_id": 3,
                        "password_validity": null,
                        "deleted_at": null
                    },
                    "status": null,
                    "priority": null
                }
            ]
        }
    ],
    "first_page_url": "http://127.0.0.1:8000/api/tickets?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://127.0.0.1:8000/api/tickets?page=1",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/tickets?page=1",
            "label": "1",
            "active": true
        },
        {
            "url": null,
            "label": "Next &raquo;",
            "active": false
        }
    ],
    "next_page_url": null,
    "path": "http://127.0.0.1:8000/api/tickets",
    "per_page": 10,
    "prev_page_url": null,
    "to": 1,
    "total": 1
}


## To update ticket details
## Method:PUT

curl --location --request PUT 'http://127.0.0.1:8000/api/tickets/717' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9' \
--data '{
        "issue": "this is testing issue",
        "description":"this is testing description",
        "customer_id": 2,
        "priority": 2,
        "status" : 1,
        "due_date" : "2025-10-20",
        "due_time" : "6:30:00",
        "closed_time": "5:30:00",
        "ticket_type": null,
        "branch_id": 2,
        "service_id" :null,
        "assigned_users": [6,7],
        "notify_users" : [6,7],
        "ticket_labels": [1,2]
 }'


 # ** Response

 {
    "message": "Ticket updated successfully",
    "ticket": {
        "id": 717,
        "issue": "this is testing issue",
        "description": "this is testing description",
        "customer_id": 2,
        "priority": 2,
        "status": 1,
        "ticket_type": null,
        "ticket_label": [
            {
                "id": 1,
                "label_name": "Shipment Damage",
                "color": "#EF5350",
                "pivot": {
                    "ticket_id": 717,
                    "label_id": 1
                }
            },
            {
                "id": 2,
                "label_name": "Theft",
                "color": "#FFCDD2",
                "pivot": {
                    "ticket_id": 717,
                    "label_id": 2
                }
            }
        ],
        "notify_to": [
            {
                "id": 6,
                "name": "Babu",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "shaji4@gmail.com",
                "pivot": {
                    "ticket_id": 717,
                    "agent_id": 6
                }
            },
            {
                "id": 7,
                "name": "Manoj.M",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "manoj1@krs.in",
                "pivot": {
                    "ticket_id": 717,
                    "agent_id": 7
                }
            }
        ],
        "branch_id": 2,
        "tracking_number": "ONS0000717",
        "due_date": "2025-10-20",
        "deleted_at": null,
        "created_at": "2025-10-17T11:40:06.000000Z",
        "updated_at": "2025-10-24T06:41:42.000000Z",
        "created_by": 1,
        "slug": "this-is-testing-register-issue-api-1760701206",
        "service_id": null,
        "closed_time": "5:30:00",
        "closed_by": null,
        "closed_at": null,
        "verified_at": null,
        "remarks": null,
        "agent": [
            {
                "id": 6,
                "name": "Babu",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "shaji4@gmail.com",
                "role_id": 2,
                "department_id": null,
                "branch_id": 2,
                "status": 1,
                "created_at": "2024-12-13T14:12:10.000000Z",
                "updated_at": "2024-12-23T13:32:18.000000Z",
                "parent_id": 3,
                "firebase_id": null,
                "image": null,
                "designation_id": 1,
                "password_validity": null,
                "deleted_at": "2024-12-23 13:32:18",
                "pivot": {
                    "ticket_id": 717,
                    "agent_id": 6
                }
            },
            {
                "id": 7,
                "name": "Manoj.M",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "manoj1@krs.in",
                "role_id": 2,
                "department_id": null,
                "branch_id": 2,
                "status": 1,
                "created_at": "2024-12-23T13:20:05.000000Z",
                "updated_at": "2024-12-23T13:20:05.000000Z",
                "parent_id": 3,
                "firebase_id": null,
                "image": null,
                "designation_id": 1,
                "password_validity": null,
                "deleted_at": null,
                "pivot": {
                    "ticket_id": 717,
                    "agent_id": 7
                }
            }
        ],
        "customer": {
            "id": 2,
            "name": "Ramshad",
            "email": null,
            "country_code": "91",
            "mobile": "9846337019",
            "company_name": null,
            "branch_id": 2,
            "created_by": 8
        },
        "user": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket_status": {
            "id": 1,
            "status": "Open",
            "color_code": "#0055fa",
            "active": 1,
            "created_at": "2024-12-12T15:57:49.000000Z",
            "updated_at": "2024-12-12T15:57:49.000000Z",
            "stage_id": 1,
            "created_by": 1,
            "order": 1,
            "name": "Open",
            "color": "#0055fa"
        },
        "ticket_priority": {
            "id": 2,
            "title": "Medium",
            "active": 1,
            "created_at": null,
            "updated_at": null,
            "color": "#49E0F4",
            "name": "Medium"
        },
        "activity": [
            {
                "id": 632,
                "type": "Ticket Branch Changed",
                "note": "Branch changed from branch five to branch one",
                "title": null,
                "status_id": null,
                "branch_id": 2,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 14,
                "description": null,
                "created_at": "2025-10-24T06:41:42.000000Z",
                "updated_at": "2025-10-24T06:41:42.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 14,
                    "name": "Getlead testing",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "glead@gmail.com",
                    "role_id": 3,
                    "department_id": null,
                    "branch_id": 4,
                    "status": 1,
                    "created_at": "2025-02-11T10:33:43.000000Z",
                    "updated_at": "2025-02-19T11:30:52.000000Z",
                    "parent_id": 4,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 633,
                "type": "Due Date Changed",
                "note": "Due date changed from 2025-10-19 17:30:00 to 2025-10-20",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 14,
                "description": null,
                "created_at": "2025-10-24T06:41:42.000000Z",
                "updated_at": "2025-10-24T06:41:42.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 14,
                    "name": "Getlead testing",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "glead@gmail.com",
                    "role_id": 3,
                    "department_id": null,
                    "branch_id": 4,
                    "status": 1,
                    "created_at": "2025-02-11T10:33:43.000000Z",
                    "updated_at": "2025-02-19T11:30:52.000000Z",
                    "parent_id": 4,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 634,
                "type": "Closing Time Changed",
                "note": "Closing time changed from 05:30:00 to 5:30:00",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 14,
                "description": null,
                "created_at": "2025-10-24T06:41:42.000000Z",
                "updated_at": "2025-10-24T06:41:42.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 14,
                    "name": "Getlead testing",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "glead@gmail.com",
                    "role_id": 3,
                    "department_id": null,
                    "branch_id": 4,
                    "status": 1,
                    "created_at": "2025-02-11T10:33:43.000000Z",
                    "updated_at": "2025-02-19T11:30:52.000000Z",
                    "parent_id": 4,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 635,
                "type": "Agent Assigned",
                "note": "Assigned agent(s): Babu, Manoj.M",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "6,7",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 14,
                "description": null,
                "created_at": "2025-10-24T06:41:42.000000Z",
                "updated_at": "2025-10-24T06:41:42.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 14,
                    "name": "Getlead testing",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "glead@gmail.com",
                    "role_id": 3,
                    "department_id": null,
                    "branch_id": 4,
                    "status": 1,
                    "created_at": "2025-02-11T10:33:43.000000Z",
                    "updated_at": "2025-02-19T11:30:52.000000Z",
                    "parent_id": 4,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 636,
                "type": "Notify User Added",
                "note": "Added notify user(s): Babu, Manoj.M",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 14,
                "description": null,
                "created_at": "2025-10-24T06:41:42.000000Z",
                "updated_at": "2025-10-24T06:41:42.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 14,
                    "name": "Getlead testing",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "glead@gmail.com",
                    "role_id": 3,
                    "department_id": null,
                    "branch_id": 4,
                    "status": 1,
                    "created_at": "2025-02-11T10:33:43.000000Z",
                    "updated_at": "2025-02-19T11:30:52.000000Z",
                    "parent_id": 4,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 637,
                "type": "Label Added",
                "note": "Added label(s): , ",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 14,
                "description": null,
                "created_at": "2025-10-24T06:41:42.000000Z",
                "updated_at": "2025-10-24T06:41:42.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 14,
                    "name": "Getlead testing",
                    "country_code": "+91",
                    "mobile": "1234567899",
                    "email": "glead@gmail.com",
                    "role_id": 3,
                    "department_id": null,
                    "branch_id": 4,
                    "status": 1,
                    "created_at": "2025-02-11T10:33:43.000000Z",
                    "updated_at": "2025-02-19T11:30:52.000000Z",
                    "parent_id": 4,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 623,
                "type": "Spare Part Removed",
                "note": "Removed spare part: HP ProBook 450 G8 (Qty: 1)",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T07:44:15.000000Z",
                "updated_at": "2025-10-20T07:44:15.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 622,
                "type": "Spare Part Added",
                "note": "Added spare part: HP ProBook 450 G8 (Qty: 1)",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T07:25:35.000000Z",
                "updated_at": "2025-10-20T07:25:35.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 621,
                "type": "Attachment Deleted",
                "note": "Deleted attachment: picture-1.png",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T07:08:17.000000Z",
                "updated_at": "2025-10-20T07:08:17.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 620,
                "type": "Attachment Added",
                "note": "Added attachment: picture-1.png",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T07:01:42.000000Z",
                "updated_at": "2025-10-20T07:01:42.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 619,
                "type": "Attachment Added",
                "note": "Added attachment: picture-7.png",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T06:50:35.000000Z",
                "updated_at": "2025-10-20T06:50:35.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 618,
                "type": "Task Added",
                "note": "Added task: testing",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T06:43:15.000000Z",
                "updated_at": "2025-10-20T06:43:15.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 617,
                "type": "Task Added",
                "note": "Added task: gggggggg ggggggg gggg",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T06:22:05.000000Z",
                "updated_at": "2025-10-20T06:22:05.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 616,
                "type": "Task Added",
                "note": "Added task: to change keyboard",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T06:20:51.000000Z",
                "updated_at": "2025-10-20T06:20:51.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 615,
                "type": "Log Note Added",
                "note": "Added a log note to the ticket",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T05:29:59.000000Z",
                "updated_at": "2025-10-20T05:29:59.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 614,
                "type": "Log Note Added",
                "note": "Added a log note to the ticket",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T05:26:12.000000Z",
                "updated_at": "2025-10-20T05:26:12.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 613,
                "type": "Log Note Added",
                "note": "Added a log note to the ticket",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T05:23:39.000000Z",
                "updated_at": "2025-10-20T05:23:39.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 612,
                "type": "Ticket Updated",
                "note": "Issue updated and Description updated",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T05:11:27.000000Z",
                "updated_at": "2025-10-20T05:11:27.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 611,
                "type": "Label Removed",
                "note": "Removed label: ",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T04:40:52.000000Z",
                "updated_at": "2025-10-20T04:40:52.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 610,
                "type": "Notify User Removed",
                "note": "Removed notify user: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:57:06.000000Z",
                "updated_at": "2025-10-18T07:57:06.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 609,
                "type": "Agent Removed",
                "note": "Removed agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:05:58.000000Z",
                "updated_at": "2025-10-18T07:05:58.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 608,
                "type": "Agent Added",
                "note": "Added agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T06:58:28.000000Z",
                "updated_at": "2025-10-18T06:58:28.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            }
        ]
    }
}




# ------------------------------------------------------------------------

# To delete specified ticket
7. ## tickets api
   ## Mthod DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/tickets/706' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'


** RESPONSE

{
    "message": "Ticket deleted successfully"
}

# ------------------------------------------------------------------------
# ** To add agent to the specified ticket

8. ## /tickets/{ticket}/agents
   ## Method : POST

curl --location 'http://127.0.0.1:8000/api/tickets/717/agents' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--form 'agent_id="3"'

** RESPONSE

{
    "message": "Agent added successfully",
    "ticket": {
        "id": 717,
        "issue": "this is testing register issue api",
        "description": "Issue submitted through customer registration form",
        "customer_id": 53,
        "priority": 2,
        "status": 1,
        "ticket_type": null,
        "ticket_label": null,
        "notify_to": null,
        "branch_id": 5,
        "tracking_number": "ONS0000717",
        "due_date": "2025-10-19 17:30:00",
        "deleted_at": null,
        "created_at": "2025-10-17T11:40:06.000000Z",
        "updated_at": "2025-10-17T11:40:06.000000Z",
        "created_by": 1,
        "slug": "this-is-testing-register-issue-api-1760701206",
        "service_id": null,
        "closed_time": "05:30:00",
        "closed_by": null,
        "closed_at": null,
        "verified_at": null,
        "remarks": null,
        "customer": {
            "id": 53,
            "name": "shaji-55",
            "email": "s55@gmail.com",
            "country_code": "91",
            "mobile": "3452345670",
            "company_name": "get lead 55",
            "branch_id": 3,
            "created_by": 1
        },
        "user": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket_status": {
            "id": 1,
            "status": "Open",
            "color_code": "#0055fa",
            "active": 1,
            "created_at": "2024-12-12T15:57:49.000000Z",
            "updated_at": "2024-12-12T15:57:49.000000Z",
            "stage_id": 1,
            "created_by": 1,
            "order": 1,
            "name": "Open",
            "color": "#0055fa"
        },
        "ticket_priority": {
            "id": 2,
            "title": "Medium",
            "active": 1,
            "created_at": null,
            "updated_at": null,
            "color": "#49E0F4",
            "name": "Medium"
        },
        "agent": [
            {
                "id": 3,
                "name": "shaji-1",
                "country_code": "+91",
                "mobile": "1234567899",
                "email": "shaji1@gmail.com",
                "role_id": 4,
                "department_id": 2,
                "branch_id": 2,
                "status": 1,
                "created_at": "2024-12-13T12:53:59.000000Z",
                "updated_at": "2025-06-27T13:49:52.000000Z",
                "parent_id": 1,
                "firebase_id": null,
                "image": null,
                "designation_id": 3,
                "password_validity": null,
                "deleted_at": null,
                "pivot": {
                    "ticket_id": 717,
                    "agent_id": 3
                }
            }
        ],
        "activity": [
            {
                "id": 608,
                "type": "Agent Added",
                "note": "Added agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T06:58:28.000000Z",
                "updated_at": "2025-10-18T06:58:28.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            }
        ]
    }
}

# -------------------------------------------------------------------------------
## to remove agent from the tickets
9. ## /tickets/{ticket}/agents/{agent}
   ## Method DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/tickets/717/agents/3' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

# ** RESPONSE

{
    "message": "Agent removed successfully",
    "ticket": {
        "id": 717,
        "issue": "this is testing register issue api",
        "description": "Issue submitted through customer registration form",
        "customer_id": 53,
        "priority": 2,
        "status": 1,
        "ticket_type": null,
        "ticket_label": null,
        "notify_to": null,
        "branch_id": 5,
        "tracking_number": "ONS0000717",
        "due_date": "2025-10-19 17:30:00",
        "deleted_at": null,
        "created_at": "2025-10-17T11:40:06.000000Z",
        "updated_at": "2025-10-17T11:40:06.000000Z",
        "created_by": 1,
        "slug": "this-is-testing-register-issue-api-1760701206",
        "service_id": null,
        "closed_time": "05:30:00",
        "closed_by": null,
        "closed_at": null,
        "verified_at": null,
        "remarks": null,
        "customer": {
            "id": 53,
            "name": "shaji-55",
            "email": "s55@gmail.com",
            "country_code": "91",
            "mobile": "3452345670",
            "company_name": "get lead 55",
            "branch_id": 3,
            "created_by": 1
        },
        "user": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket_status": {
            "id": 1,
            "status": "Open",
            "color_code": "#0055fa",
            "active": 1,
            "created_at": "2024-12-12T15:57:49.000000Z",
            "updated_at": "2024-12-12T15:57:49.000000Z",
            "stage_id": 1,
            "created_by": 1,
            "order": 1,
            "name": "Open",
            "color": "#0055fa"
        },
        "ticket_priority": {
            "id": 2,
            "title": "Medium",
            "active": 1,
            "created_at": null,
            "updated_at": null,
            "color": "#49E0F4",
            "name": "Medium"
        },
        "agent": [],
        "activity": [
            {
                "id": 609,
                "type": "Agent Removed",
                "note": "Removed agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:05:58.000000Z",
                "updated_at": "2025-10-18T07:05:58.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 608,
                "type": "Agent Added",
                "note": "Added agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T06:58:28.000000Z",
                "updated_at": "2025-10-18T06:58:28.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            }
        ]
    }
}

# ---------------------------------------------------------------------------------
# To delete notify agent of the ticket
10. ## /tickets/{ticket}/notify/{user}
    ## Method DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/tickets/717/notify/3' \
--header 'Accept: application/ecmascript' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

# ** RESPONSE
{
    "message": "Notify user removed successfully",
    "ticket": {
        "id": 717,
        "issue": "this is testing register issue api",
        "description": "Issue submitted through customer registration form",
        "customer_id": 53,
        "priority": 2,
        "status": 1,
        "ticket_type": null,
        "ticket_label": null,
        "notify_to": [],
        "branch_id": 5,
        "tracking_number": "ONS0000717",
        "due_date": "2025-10-19 17:30:00",
        "deleted_at": null,
        "created_at": "2025-10-17T11:40:06.000000Z",
        "updated_at": "2025-10-17T11:40:06.000000Z",
        "created_by": 1,
        "slug": "this-is-testing-register-issue-api-1760701206",
        "service_id": null,
        "closed_time": "05:30:00",
        "closed_by": null,
        "closed_at": null,
        "verified_at": null,
        "remarks": null,
        "customer": {
            "id": 53,
            "name": "shaji-55",
            "email": "s55@gmail.com",
            "country_code": "91",
            "mobile": "3452345670",
            "company_name": "get lead 55",
            "branch_id": 3,
            "created_by": 1
        },
        "user": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket_status": {
            "id": 1,
            "status": "Open",
            "color_code": "#0055fa",
            "active": 1,
            "created_at": "2024-12-12T15:57:49.000000Z",
            "updated_at": "2024-12-12T15:57:49.000000Z",
            "stage_id": 1,
            "created_by": 1,
            "order": 1,
            "name": "Open",
            "color": "#0055fa"
        },
        "ticket_priority": {
            "id": 2,
            "title": "Medium",
            "active": 1,
            "created_at": null,
            "updated_at": null,
            "color": "#49E0F4",
            "name": "Medium"
        },
        "agent": [],
        "activity": [
            {
                "id": 610,
                "type": "Notify User Removed",
                "note": "Removed notify user: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:57:06.000000Z",
                "updated_at": "2025-10-18T07:57:06.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 609,
                "type": "Agent Removed",
                "note": "Removed agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:05:58.000000Z",
                "updated_at": "2025-10-18T07:05:58.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 608,
                "type": "Agent Added",
                "note": "Added agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T06:58:28.000000Z",
                "updated_at": "2025-10-18T06:58:28.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            }
        ]
    }
}

# ------------------------------------------------------------------------------
## To add ticket label to the specified ticket
11. ## /tickets/{ticket}/labels 
    ## Method POST


curl --location 'http://127.0.0.1:8000/api/tickets/717/labels' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--form 'label_id="3"'

# ** RESPONSE

{
    "message": "Label added successfully"
}


# -----------------------------------------------------------------------------
## To remove ticket label from the specified ticket
12. ## /tickets/{ticket}/labels/{label}
    ## Method DELETE


curl --location --request DELETE 'http://127.0.0.1:8000/api/tickets/717/labels/3' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

# ** RESPONSE

{
    "message": "Label removed successfully",
    "ticket": {
        "id": 717,
        "issue": "this is testing register issue api",
        "description": "Issue submitted through customer registration form",
        "customer_id": 53,
        "priority": 2,
        "status": 1,
        "ticket_type": null,
        "ticket_label": [],
        "notify_to": [],
        "branch_id": 5,
        "tracking_number": "ONS0000717",
        "due_date": "2025-10-19 17:30:00",
        "deleted_at": null,
        "created_at": "2025-10-17T11:40:06.000000Z",
        "updated_at": "2025-10-17T11:40:06.000000Z",
        "created_by": 1,
        "slug": "this-is-testing-register-issue-api-1760701206",
        "service_id": null,
        "closed_time": "05:30:00",
        "closed_by": null,
        "closed_at": null,
        "verified_at": null,
        "remarks": null,
        "customer": {
            "id": 53,
            "name": "shaji-55",
            "email": "s55@gmail.com",
            "country_code": "91",
            "mobile": "3452345670",
            "company_name": "get lead 55",
            "branch_id": 3,
            "created_by": 1
        },
        "user": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket_status": {
            "id": 1,
            "status": "Open",
            "color_code": "#0055fa",
            "active": 1,
            "created_at": "2024-12-12T15:57:49.000000Z",
            "updated_at": "2024-12-12T15:57:49.000000Z",
            "stage_id": 1,
            "created_by": 1,
            "order": 1,
            "name": "Open",
            "color": "#0055fa"
        },
        "ticket_priority": {
            "id": 2,
            "title": "Medium",
            "active": 1,
            "created_at": null,
            "updated_at": null,
            "color": "#49E0F4",
            "name": "Medium"
        },
        "agent": [],
        "activity": [
            {
                "id": 611,
                "type": "Label Removed",
                "note": "Removed label: ",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T04:40:52.000000Z",
                "updated_at": "2025-10-20T04:40:52.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 610,
                "type": "Notify User Removed",
                "note": "Removed notify user: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:57:06.000000Z",
                "updated_at": "2025-10-18T07:57:06.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 609,
                "type": "Agent Removed",
                "note": "Removed agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:05:58.000000Z",
                "updated_at": "2025-10-18T07:05:58.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 608,
                "type": "Agent Added",
                "note": "Added agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T06:58:28.000000Z",
                "updated_at": "2025-10-18T06:58:28.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            }
        ]
    }
}

# --------------------------------------------------------------------------------------
## TO UPDTE TICKET 'issue/description' of the spectified ticket
12. ## /tickets/{ticket}/update-issue
    ## Method PUT

curl --location --request PUT 'http://127.0.0.1:8000/api/tickets/717/update-issue' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--data '{
    "issue":"this is testing issue",
    "description":"this is testing description"
}'


# ** RESPONSE

{
    "message": "Ticket updated successfully",
    "ticket": {
        "id": 717,
        "issue": "this is testing issue",
        "description": "this is testing description",
        "customer_id": 53,
        "priority": 2,
        "status": 1,
        "ticket_type": null,
        "ticket_label": [],
        "notify_to": [],
        "branch_id": 5,
        "tracking_number": "ONS0000717",
        "due_date": "2025-10-19 17:30:00",
        "deleted_at": null,
        "created_at": "2025-10-17T11:40:06.000000Z",
        "updated_at": "2025-10-20T05:11:27.000000Z",
        "created_by": 1,
        "slug": "this-is-testing-register-issue-api-1760701206",
        "service_id": null,
        "closed_time": "05:30:00",
        "closed_by": null,
        "closed_at": null,
        "verified_at": null,
        "remarks": null,
        "customer": {
            "id": 53,
            "name": "shaji-55",
            "email": "s55@gmail.com",
            "country_code": "91",
            "mobile": "3452345670",
            "company_name": "get lead 55",
            "branch_id": 3,
            "created_by": 1
        },
        "user": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket_status": {
            "id": 1,
            "status": "Open",
            "color_code": "#0055fa",
            "active": 1,
            "created_at": "2024-12-12T15:57:49.000000Z",
            "updated_at": "2024-12-12T15:57:49.000000Z",
            "stage_id": 1,
            "created_by": 1,
            "order": 1,
            "name": "Open",
            "color": "#0055fa"
        },
        "ticket_priority": {
            "id": 2,
            "title": "Medium",
            "active": 1,
            "created_at": null,
            "updated_at": null,
            "color": "#49E0F4",
            "name": "Medium"
        },
        "agent": [],
        "activity": [
            {
                "id": 612,
                "type": "Ticket Updated",
                "note": "Issue updated and Description updated",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T05:11:27.000000Z",
                "updated_at": "2025-10-20T05:11:27.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 611,
                "type": "Label Removed",
                "note": "Removed label: ",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-20T04:40:52.000000Z",
                "updated_at": "2025-10-20T04:40:52.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 610,
                "type": "Notify User Removed",
                "note": "Removed notify user: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": null,
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:57:06.000000Z",
                "updated_at": "2025-10-18T07:57:06.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 609,
                "type": "Agent Removed",
                "note": "Removed agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T07:05:58.000000Z",
                "updated_at": "2025-10-18T07:05:58.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            },
            {
                "id": 608,
                "type": "Agent Added",
                "note": "Added agent: shaji-1",
                "title": null,
                "status_id": null,
                "branch_id": null,
                "priority_id": null,
                "agent_id": "3",
                "ticket_id": 717,
                "log_id": null,
                "created_by": 1,
                "description": null,
                "created_at": "2025-10-18T06:58:28.000000Z",
                "updated_at": "2025-10-18T06:58:28.000000Z",
                "task_id": null,
                "schedule_date": null,
                "log_file": null,
                "log_file_type": null,
                "user": {
                    "id": 1,
                    "name": "Shaji",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "superadmin@gmail.com",
                    "role_id": 1,
                    "department_id": 1,
                    "branch_id": null,
                    "status": 1,
                    "created_at": null,
                    "updated_at": "2025-08-16T08:18:36.000000Z",
                    "parent_id": null,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": null
                },
                "status": null,
                "priority": null
            }
        ]
    }
}

# ----------------------------------------------------------------------------------
## TO get LOG Notes  of the spectified ticket
13. ## /tickets/{ticket}/update-issue
    ## Method PUT

curl --location 'http://127.0.0.1:8000/api/tickets/717/log-notes' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

# ** RESPONSE

[
    {
        "id": 49,
        "agent_id": 1,
        "ticket_id": 717,
        "type_id": 1,
        "outcome_id": null,
        "time": "2025-10-20 05:26:12",
        "description": "f f fsf ff sdf dsf sdf dsf dsf ds fds fsd fs dfds fsd fdsf dsf dsf dsf sd fsd sfsf sfsdf",
        "log": "f f fsf ff sdf dsf sdf dsf dsf ds fds fsd fs dfds fsd fdsf dsf dsf dsf sd fsd sfsf sfsdf",
        "file_type": null,
        "created_at": "2025-10-20T05:26:12.000000Z",
        "updated_at": "2025-10-20T05:26:12.000000Z",
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    },
    {
        "id": 48,
        "agent_id": 1,
        "ticket_id": 717,
        "type_id": 1,
        "outcome_id": null,
        "time": "2025-10-20 05:23:39",
        "description": "this is testing log note",
        "log": "this is testing log note",
        "file_type": null,
        "created_at": "2025-10-20T05:23:39.000000Z",
        "updated_at": "2025-10-20T05:23:39.000000Z",
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    }
]

# --------------------------------------------------------------------------------

## To add Log note to the specified ticket
13. ## /tickets/{ticket}/log-notes
    ## Method : POST

curl --location 'http://127.0.0.1:8000/api/tickets/717/log-notes' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--form 'note="this is testing"'

# ** RESPONSE

{
    "message": "Log note added successfully",
    "logNote": {
        "id": 50,
        "agent_id": 1,
        "ticket_id": 717,
        "type_id": 1,
        "outcome_id": null,
        "time": "2025-10-20 05:29:59",
        "description": "this is testing",
        "log": "this is testing",
        "file_type": null,
        "created_at": "2025-10-20T05:29:59.000000Z",
        "updated_at": "2025-10-20T05:29:59.000000Z",
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    }
}

# ----------------------------------------------------------------------------

## to get tasks  from the specified ticket
14. ## /tickets/{ticket}/tasks
    # Method GET


curl --location 'http://127.0.0.1:8000/api/tickets/717/tasks' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'


# ** RESPONSE

[
    {
        "id": 34,
        "task_name": "gggggggg ggggggg gggg",
        "user_id": 1,
        "ticket_id": 717,
        "type_id": 1,
        "time": "2025-10-20T10:30:00.000000Z",
        "description": "fdsf fdfdfdfdsfs fsfs fsdf",
        "created_at": "2025-10-20T06:22:05.000000Z",
        "updated_at": "2025-10-20T06:22:05.000000Z",
        "category_id": null,
        "status": "1",
        "closed_time": null,
        "closed_by": null,
        "closing_comment": null,
        "assigned_agents": [
            {
                "id": 6,
                "name": "Babu"
            }
        ],
        "user": {
            "id": 1,
            "name": "Shaji"
        },
        "category": null,
        "type": {
            "id": 1,
            "type": "open",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        }
    },
    {
        "id": 33,
        "task_name": "to change keyboard",
        "user_id": 1,
        "ticket_id": 717,
        "type_id": 1,
        "time": "2025-10-20T06:30:00.000000Z",
        "description": "sdf fdsfsf sdfdsfa fsf dsfadsfs fdsfds fdsf",
        "created_at": "2025-10-20T06:20:51.000000Z",
        "updated_at": "2025-10-20T06:20:51.000000Z",
        "category_id": null,
        "status": "1",
        "closed_time": null,
        "closed_by": null,
        "closing_comment": null,
        "assigned_agents": [
            {
                "id": 18,
                "name": "arun"
            }
        ],
        "user": {
            "id": 1,
            "name": "Shaji"
        },
        "category": null,
        "type": {
            "id": 1,
            "type": "open",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        }
    }
]

# ------------------------------------------------------------------------

# To add task to the selected ticket
15. ## /tickets/{ticket}/tasks
    ## Method : POST

curl --location 'http://127.0.0.1:8000/api/tickets/717/tasks' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--data '{
    "task_name":"testing",
    "description":"ffdfdfdf fdsfdsfd ff",
    "type_id":null,
    "category_id": 1,
    "time": "2025-10-20 10:30:35",
    "status":1,
    "assigned_users":[3]
}'

## ** RESPONSE

{
    "message": "Task added successfully",
    "task": {
        "ticket_id": 717,
        "user_id": 1,
        "task_name": "testing",
        "description": "ffdfdfdf fdsfdsfd ff",
        "type_id": 1,
        "category_id": 1,
        "time": "2025-10-20T10:30:35.000000Z",
        "status": 1,
        "updated_at": "2025-10-20T06:43:15.000000Z",
        "created_at": "2025-10-20T06:43:15.000000Z",
        "id": 35,
        "assigned_agents": [
            {
                "id": 3,
                "name": "shaji-1"
            }
        ],
        "user": {
            "id": 1,
            "name": "Shaji"
        },
        "category": {
            "id": 1,
            "category": "Call",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        },
        "type": {
            "id": 1,
            "type": "open",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        }
    }
}


# -------------------------------------------------------------------

## to get attachements (images/files) to the selected ticket
16. ## /tickets/{ticket}/attachments
    ## Method: GET

curl --location 'http://127.0.0.1:8000/api/tickets/717/attachments' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--data ''

## ** RESPONSE

[
    {
        "id": 69,
        "ticket_id": 717,
        "name": "picture-7.png",
        "file_path": "uploads/ticket_image/1760943035_picture-7.png",
        "file_size": "114918",
        "created_at": "2025-10-20 06:50:35",
        "updated_at": "2025-10-20 06:50:35"
    }
]


# ---------------------------------------------------------------------

# To add attachements to the selected ticket
17. ## /tickets/{ticket}/attachments
    ## Method : POST

curl --location 'http://127.0.0.1:8000/api/tickets/717/attachments' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--form 'file=@"/home/getlead/Pictures/picture-1.png"'


# ** RESPONSE

{
    "message": "File uploaded successfully",
    "attachment": {
        "id": 70,
        "ticket_id": 717,
        "name": "picture-1.png",
        "file_path": "uploads/ticket_image/1760943702_picture-1.png",
        "file_size": "155222",
        "created_at": "2025-10-20 07:01:42",
        "updated_at": "2025-10-20 07:01:42"
    }
}

# --------------------------------------------------------------------------

## To remove attachment image/file
18. ## /tickets/{ticket}/attachments/{attachments}
    ## ** Method : POST

curl --location --request DELETE 'http://127.0.0.1:8000/api/tickets/717/attachments/70' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE
{
    "message": "File deleted successfully"
}


# -----------------------------------------------------------------------

## To get all spare parts of the ticket
19. ## /tickets/{ticket}/spare-parts
    ## ** Method : GET

curl --location 'http://127.0.0.1:8000/api/tickets/717/spare-parts' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE

[
    {
        "id": 35,
        "ticket_id": 717,
        "product_id": 2,
        "quantity": 1,
        "price": 650,
        "total_price": 650,
        "created_at": "2025-10-20T07:25:35.000000Z",
        "updated_at": "2025-10-20T07:25:35.000000Z",
        "product": {
            "id": 2,
            "name": "HP ProBook 450 G8",
            "cost": 650
        }
    }
]

# -----------------------------------------------------------------------

## To remove attachment image/file
20. ## /tickets/{ticket}/spare-parts
    ## ** Method : POST

curl --location 'http://127.0.0.1:8000/api/tickets/717/spare-parts' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--form 'product_id="2"' \
--form 'quantity="1"'

## ** RESPONSE

{
    "message": "Spare part added successfully",
    "sparePart": {
        "id": 35,
        "ticket_id": 717,
        "product_id": 2,
        "quantity": 1,
        "price": 650,
        "total_price": 650,
        "created_at": "2025-10-20 07:25:35",
        "updated_at": "2025-10-20 07:25:35",
        "product": {
            "id": 2,
            "name": "HP ProBook 450 G8",
            "cost": 650
        }
    }
}

# -----------------------------------------------------------------------

## to remove the spare parts of the ticket
21. ## /tickets/717/spare-parts/{sparePart}
    ## Method : DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/tickets/717/spare-parts/35' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'


## ** RESPONSE

{
    "message": "Spare part removed successfully"
}



## ============ CUSTOMERS =================


## to get all customers list
22. ## /customers
    ## Method : GET

curl --location 'http://127.0.0.1:8000/api/customers' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE

[
    {
        "id": 2,
        "name": "Ramshad",
        "email": null,
        "country_code": "91",
        "mobile": "9846337019",
        "company_name": null,
        "branch_id": 2,
        "created_by": 8,
        "branch": {
            "id": 2,
            "branch_name": "branch one",
            "created_by": 1,
            "created_at": "2025-05-12T12:54:10.000000Z",
            "updated_at": "2025-05-12T12:54:10.000000Z"
        }
    },
    {
        "id": 3,
        "name": "Antony's fashions",
        "email": null,
        "country_code": "91",
        "mobile": "9446197893",
        "company_name": "Antony's Fashions",
        "branch_id": 2,
        "created_by": 8,
        "branch": {
            "id": 2,
            "branch_name": "branch one",
            "created_by": 1,
            "created_at": "2025-05-12T12:54:10.000000Z",
            "updated_at": "2025-05-12T12:54:10.000000Z"
        }
    },
    {
        "id": 4,
        "name": "Robert Johnson",
        "email": "robert.j@example.com",
        "country_code": "+44",
        "mobile": "7700900123",
        "company_name": "Tech Solutions Ltd",
        "branch_id": null,
        "created_by": 1,
        "branch": null
    }
]

# ------------------------------------------------------------------

## to create new customer
23. ## /customers
    ## Method : POST

curl --location 'http://127.0.0.1:8000/api/customers' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--form 'name="shaji-666"' \
--form 'email="sha66@gmail.com"' \
--form 'country_code="91"' \
--form 'contact_number="2233445566"' \
--form 'company_name="SH666 LTD"' \
--form 'branch_id="2"'


## ** RESPONSE

{
    "message": "Customer created successfully",
    "customer": {
        "name": "shaji-666",
        "email": "sha66@gmail.com",
        "country_code": "91",
        "company_name": "SH666 LTD",
        "branch_id": "2",
        "mobile": "2233445566",
        "created_by": 1,
        "id": 76,
        "branch": {
            "id": 2,
            "branch_name": "branch one",
            "created_by": 1,
            "created_at": "2025-05-12T12:54:10.000000Z",
            "updated_at": "2025-05-12T12:54:10.000000Z"
        }
    }
}


# ------------------------------------------------------------------

## to update customer details
24. ## /customers/{customer}
    ## Method : PUT

    curl --location --request PUT 'http://127.0.0.1:8000/api/customers/76' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--data-raw '{
    "name": "shaji-566",
    "email":"sha566@gmail.com",
    "country_code":"91",
    "contact_number":"2233445566",
    "company_name":"shaji-555",
    "branch_id":"2"
}'

## ** RESPONSE

{
    "message": "Customer updated successfully",
    "customer": {
        "id": 76,
        "name": "shaji-566",
        "email": "sha566@gmail.com",
        "country_code": "91",
        "mobile": "2233445566",
        "company_name": "shaji-555",
        "branch_id": "2",
        "created_by": 1,
        "branch": {
            "id": 2,
            "branch_name": "branch one",
            "created_by": 1,
            "created_at": "2025-05-12T12:54:10.000000Z",
            "updated_at": "2025-05-12T12:54:10.000000Z"
        }
    }
}

# ------------------------------------------------------------------

## to delete customer
25. ## /customers/{customer}
    ## Method : DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/customers/76' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'


## ** RESPONSE

{
    "success": true,
    "message": "Customer deleted successfully"
}

# -----------------------------------------------------------------

## to get customer details
26. ## /customer-details/{customer}
    ## Method : GET

curl --location 'http://127.0.0.1:8000/api/customer-details/75' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE

{
    "customer": {
        "id": 75,
        "name": "this is testing issue",
        "email": "ssss@gmail.com",
        "country_code": "+917",
        "mobile": "+917896543215",
        "company_name": "DSDDSDSDSDSD",
        "branch_id": 7,
        "created_by": 1,
        "branch": {
            "id": 7,
            "branch_name": "API Test Branch",
            "created_by": 1,
            "created_at": "2025-08-29T07:27:29.000000Z",
            "updated_at": "2025-08-29T07:27:29.000000Z"
        }
    },
    "tickets": [
        {
            "id": 715,
            "issue": "fsdf dsfdsaf dsa fdsf dsfdsfds fdsfsdfds fdsfdsfsdfsd fsdfsdfsdfsdfdsf dsf dsf sdfd sfdfsdfsdfsd fsdfdsfds ffdsfdsfdsf",
            "description": "Issue submitted through customer registration form",
            "customer_id": 75,
            "priority": 2,
            "status": 1,
            "ticket_type": null,
            "ticket_label": null,
            "notify_to": null,
            "branch_id": 7,
            "tracking_number": "ONS0000715",
            "due_date": "2025-09-29 17:30:00",
            "deleted_at": null,
            "created_at": "2025-09-27T07:35:25.000000Z",
            "updated_at": "2025-09-27T07:35:25.000000Z",
            "created_by": 1,
            "slug": "fsdf-dsfdsaf-dsa-fdsf-dsfdsfds-fdsfsdfds-fdsfdsfsdfsd-fsdfsdfsdfsdfdsf-dsf-dsf-sdfd-sfdfsdfsdfsd-fsdfdsfds-ffdsfdsfdsf-1758958525",
            "service_id": null,
            "closed_time": "05:30:00",
            "closed_by": null,
            "closed_at": null,
            "verified_at": null,
            "remarks": null,
            "ticket_status": {
                "id": 1,
                "status": "Open",
                "color_code": "#0055fa",
                "active": 1,
                "created_at": "2024-12-12T15:57:49.000000Z",
                "updated_at": "2024-12-12T15:57:49.000000Z",
                "stage_id": 1,
                "created_by": 1,
                "order": 1,
                "name": "Open",
                "color": "#0055fa"
            },
            "ticket_priority": {
                "id": 2,
                "title": "Medium",
                "active": 1,
                "created_at": null,
                "updated_at": null,
                "color": "#49E0F4",
                "name": "Medium"
            },
            "user": {
                "id": 1,
                "name": "Shaji"
            },
            "agent": []
        }
    ],
    "stats": {
        "total_tickets": 1,
        "open_tickets": 1,
        "in_progress_tickets": 0,
        "closed_tickets": 0
    }
}


# -----------------------------------------------------------------

## to get customer details with their tickets count
27. ## /customers-with-tickets
    ## Method : GET

curl --location 'http://127.0.0.1:8000/api/customers-with-tickets' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE


{
    "current_page": 1,
    "data": [
        {
            "id": 75,
            "name": "customer-75",
            "email": "ssss@gmail.com",
            "country_code": "+917",
            "mobile": "+917896543215",
            "company_name": "DSDDSDSDSDSD",
            "branch_id": 7,
            "created_by": 1,
            "tickets_count": 1,
            "branch": {
                "id": 7,
                "branch_name": "API Test Branch",
                "created_by": 1,
                "created_at": "2025-08-29T07:27:29.000000Z",
                "updated_at": "2025-08-29T07:27:29.000000Z"
            }
        },
        {
            "id": 72,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "country_code": "+91",
            "mobile": "9876543210",
            "company_name": "ABC Corporation",
            "branch_id": null,
            "created_by": 1,
            "tickets_count": 0,
            "branch": null
        },
    
        {
            "id": 56,
            "name": "shaji test-2255",
            "email": "s2255@gmail.com",
            "country_code": "+91",
            "mobile": "+919874561230",
            "company_name": "getlead",
            "branch_id": 4,
            "created_by": 1,
            "tickets_count": 0,
            "branch": {
                "id": 4,
                "branch_name": "branch three",
                "created_by": 1,
                "created_at": "2025-05-12T12:54:22.000000Z",
                "updated_at": "2025-05-12T12:54:22.000000Z"
            }
        }
    ],
    "first_page_url": "http://127.0.0.1:8000/api/customers-with-tickets?page=1",
    "from": 1,
    "last_page": 5,
    "last_page_url": "http://127.0.0.1:8000/api/customers-with-tickets?page=5",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/customers-with-tickets?page=1",
            "label": "1",
            "active": true
        },
        {
            "url": "http://127.0.0.1:8000/api/customers-with-tickets?page=2",
            "label": "2",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/customers-with-tickets?page=3",
            "label": "3",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/customers-with-tickets?page=4",
            "label": "4",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/customers-with-tickets?page=5",
            "label": "5",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/customers-with-tickets?page=2",
            "label": "Next &raquo;",
            "active": false
        }
    ],
    "next_page_url": "http://127.0.0.1:8000/api/customers-with-tickets?page=2",
    "path": "http://127.0.0.1:8000/api/customers-with-tickets",
    "per_page": 10,
    "prev_page_url": null,
    "to": 10,
    "total": 50
}



# -----------------------------------------------------------------

## to get all ticket statuses
28. ## /ticket-statuses
    ## Method : GET

curl --location 'http://127.0.0.1:8000/api/ticket-statuses' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'


## ** RESPONSE

[
    {
        "id": 4,
        "status": "Completed",
        "color_code": "#9810fa",
        "name": "Completed",
        "color": "#9810fa"
    },
    {
        "id": 5,
        "status": "Returned",
        "color_code": "#480597",
        "name": "Returned",
        "color": "#480597"
    },
    {
        "id": 1,
        "status": "Open",
        "color_code": "#0055fa",
        "name": "Open",
        "color": "#0055fa"
    },
    {
        "id": 2,
        "status": "In Progress",
        "color_code": "#e6af84",
        "name": "In Progress",
        "color": "#e6af84"
    },
    {
        "id": 3,
        "status": "Closed",
        "color_code": "#D23B3B",
        "name": "Closed",
        "color": "#D23B3B"
    }
]

# -----------------------------------------------------------------

## to get ticket priorities
29. ## /priorities
    ## Method : GET

curl --location 'http://127.0.0.1:8000/api/priorities' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'


## ** RESPONSE

[
    {
        "id": 1,
        "title": "Low",
        "color": "#FF5C66",
        "name": "Low"
    },
    {
        "id": 2,
        "title": "Medium",
        "color": "#49E0F4",
        "name": "Medium"
    },
    {
        "id": 3,
        "title": "High",
        "color": "#FCD614",
        "name": "High"
    }
]

# -----------------------------------------------------------------

## to get all branches
30. ## /branches
    ## Method : GET

curl --location 'http://127.0.0.1:8000/api/branches' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'


## ** RESPONSE

[
    {
        "id": 2,
        "branch_name": "branch one"
    },
    {
        "id": 3,
        "branch_name": "branch two"
    },
    {
        "id": 4,
        "branch_name": "branch three"
    },
    {
        "id": 5,
        "branch_name": "branch five"
    },
    {
        "id": 6,
        "branch_name": "Test Branch"
    },
    {
        "id": 7,
        "branch_name": "API Test Branch"
    }
]

# -----------------------------------------------------------------

## to get all ticket labels
31. ## /ticket-labels
    ## Method : GET

curl --location 'http://127.0.0.1:8000/api/ticket-labels' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE

[
    {
        "id": 1,
        "label_name": "Customer Complaint",
        "color": "#F9A825",
        "active": true
    },
    {
        "id": 2,
        "label_name": "Customs Issue",
        "color": "#9575CD",
        "active": true
    },
    {
        "id": 3,
        "label_name": "Delayed Shipment",
        "color": "#E6EE9C",
        "active": true
    },
    {
        "id": 4,
        "label_name": "Incorrect Delivery",
        "color": "#0D47A1",
        "active": true
    },
    {
        "id": 5,
        "label_name": "Theft",
        "color": "#FFCDD2",
        "active": true
    }
]



## ----- BRANCH MANAGEMENT -----------------------


## to get all branches list
32. ## /branches-management
    ## Method : GET
curl --location 'http://127.0.0.1:8000/api/branches-management' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE

{
    "current_page": 1,
    "data": [
        {
            "id": 5,
            "branch_name": "branch five",
            "created_by": {
                "id": 1,
                "name": "Shaji"
            },
            "created_at": "2025-05-12T12:54:31.000000Z",
            "updated_at": "2025-05-12T12:54:31.000000Z"
        },
        {
            "id": 4,
            "branch_name": "branch three",
            "created_by": {
                "id": 1,
                "name": "Shaji"
            },
            "created_at": "2025-05-12T12:54:22.000000Z",
            "updated_at": "2025-05-12T12:54:22.000000Z"
        },
        {
            "id": 3,
            "branch_name": "branch two",
            "created_by": {
                "id": 1,
                "name": "Shaji"
            },
            "created_at": "2025-05-12T12:54:16.000000Z",
            "updated_at": "2025-05-12T12:54:16.000000Z"
        },
        {
            "id": 2,
            "branch_name": "branch one",
            "created_by": {
                "id": 1,
                "name": "Shaji"
            },
            "created_at": "2025-05-12T12:54:10.000000Z",
            "updated_at": "2025-05-12T12:54:10.000000Z"
        }
    ],
    "first_page_url": "http://127.0.0.1:8000/api/branches-management?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://127.0.0.1:8000/api/branches-management?page=1",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/branches-management?page=1",
            "label": "1",
            "active": true
        },
        {
            "url": null,
            "label": "Next &raquo;",
            "active": false
        }
    ],
    "next_page_url": null,
    "path": "http://127.0.0.1:8000/api/branches-management",
    "per_page": 10,
    "prev_page_url": null,
    "to": 6,
    "total": 6
}

# -----------------------------------------------------------------------

## to create a new branch
33. ## /branches-management
    ## Method : POST

curl --location 'http://127.0.0.1:8000/api/branches-management' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--form 'branch_name="branch-10"'

## ** RESPONSE

{
    "message": "Branch created successfully",
    "branch": {
        "id": 9,
        "branch_name": "branch-10",
        "created_by": {
            "id": 1,
            "name": "Shaji"
        },
        "created_at": "2025-10-20T10:27:12.000000Z",
        "updated_at": "2025-10-20T10:27:12.000000Z"
    }
}

# --------------------------------------------------------------------

## to update the specified branch name
34. ## /branches-management/{branch}
    ## Method : PUT

curl --location --request PUT 'http://127.0.0.1:8000/api/branches-management/9' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f' \
--form 'branch_name="branch-100"'

## ** RESPONSE

{
    "message": "Branch updated successfully",
    "branch": {
        "id": 9,
        "branch_name": "branch-10",
        "created_by": {
            "id": 1,
            "name": "Shaji"
        },
        "created_at": "2025-10-20T10:27:12.000000Z",
        "updated_at": "2025-10-20T10:27:12.000000Z"
    }
}

# -----------------------------------------------------------------

## to delete the specified branch
35. ## /branches-management/{branch}
    ## Method : DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/branches-management/9' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE

{
    "message": "Branch deleted successfully"
}

# ----------------------------------------------------------------

## to show a particular branch and their tickets
36. ## /branches-management/{branch}
    ## Method : GET

curl --location 'http://127.0.0.1:8000/api/branches-management/7' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 272|IDPWpTUD3FgSSs57xyjFzliUdGn2e4pBQdrvuYjvfdb2387f'

## ** RESPONSE

{
    "id": 7,
    "branch_name": "API Test Branch",
    "created_by": {
        "id": 1,
        "name": "Shaji",
        "country_code": "91",
        "mobile": "1234567899",
        "email": "superadmin@gmail.com",
        "role_id": 1,
        "department_id": 1,
        "branch_id": null,
        "status": 1,
        "created_at": null,
        "updated_at": "2025-08-16T08:18:36.000000Z",
        "parent_id": null,
        "firebase_id": null,
        "image": null,
        "designation_id": 3,
        "password_validity": null,
        "deleted_at": null
    },
    "created_at": "2025-08-29T07:27:29.000000Z",
    "updated_at": "2025-08-29T07:27:29.000000Z",
    "tickets": [
        {
            "id": 715,
            "issue": "fsdf dsfdsaf dsa fdsf dsfdsfds fdsfsdfds fdsfdsfsdfsd fsdfsdfsdfsdfdsf dsf dsf sdfd sfdfsdfsdfsd fsdfdsfds ffdsfdsfdsf",
            "description": "Issue submitted through customer registration form",
            "customer_id": 75,
            "priority": 2,
            "status": 1,
            "ticket_type": null,
            "ticket_label": null,
            "notify_to": null,
            "branch_id": 7,
            "tracking_number": "ONS0000715",
            "due_date": "2025-09-29 17:30:00",
            "deleted_at": null,
            "created_at": "2025-09-27T07:35:25.000000Z",
            "updated_at": "2025-09-27T07:35:25.000000Z",
            "created_by": 1,
            "slug": "fsdf-dsfdsaf-dsa-fdsf-dsfdsfds-fdsfsdfds-fdsfdsfsdfsd-fsdfsdfsdfsdfdsf-dsf-dsf-sdfd-sfdfsdfsdfsd-fsdfdsfds-ffdsfdsfdsf-1758958525",
            "service_id": null,
            "closed_time": "05:30:00",
            "closed_by": null,
            "closed_at": null,
            "verified_at": null,
            "remarks": null
        }
    ]
}


## to get all brands for product adding
## ** Method : GET

curl --location 'http://127.0.0.1:8000/api/brands' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036'

## ** RESPONSE

[
    {
        "id": 2,
        "brand": "SAMSUNG",
        "created_by": 1,
        "created_at": "2025-05-07T16:22:20.000000Z",
        "updated_at": "2025-05-07T16:22:20.000000Z"
    },
    {
        "id": 7,
        "brand": "Microsoft",
        "created_by": 1,
        "created_at": "2025-08-08T09:14:47.000000Z",
        "updated_at": "2025-08-08T09:14:47.000000Z"
    },
    {
        "id": 1,
        "brand": "LENOVO",
        "created_by": 1,
        "created_at": "2025-05-07T16:22:09.000000Z",
        "updated_at": "2025-05-07T16:22:09.000000Z"
    },
    {
        "id": 3,
        "brand": "HP",
        "created_by": 1,
        "created_at": "2025-06-27T14:52:30.000000Z",
        "updated_at": "2025-06-27T14:52:30.000000Z"
    },
    {
        "id": 6,
        "brand": "Dell",
        "created_by": 1,
        "created_at": "2025-08-08T09:14:47.000000Z",
        "updated_at": "2025-08-08T09:14:47.000000Z"
    },
    {
        "id": 8,
        "brand": "Apple mmmm",
        "created_by": 1,
        "created_at": "2025-08-08T09:14:47.000000Z",
        "updated_at": "2025-08-08T11:48:39.000000Z"
    }
]


## To create new brands
## Method : POST

curl --location 'http://127.0.0.1:8000/api/brands' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036' \
--form 'brand="QWERTY"'

# ** RESPONSE

{
    "message": "Brand created successfully",
    "brand": {
        "brand": "QWERTY",
        "created_by": 1,
        "updated_at": "2025-10-22T04:43:44.000000Z",
        "created_at": "2025-10-22T04:43:44.000000Z",
        "id": 12
    }
}


## To update specified brand
## Method : PUT

curl --location --request PUT 'http://127.0.0.1:8000/api/brands/12' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036' \
--data '{
    "brand":"QWERTYUIOP"
}'

# ** RESPONSE

{
    "message": "Brand updated successfully",
    "brand": {
        "id": 12,
        "brand": "QWERTYUIOP",
        "created_by": 1,
        "created_at": "2025-10-22T04:43:44.000000Z",
        "updated_at": "2025-10-22T04:47:34.000000Z"
    }
}

## To delete specified brands
## Method : DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/brands/12' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036'

# ** RESPONSE

{
    "message": "Brand deleted successfully"
}


## -------- CATEGORIES ----------------


## To get all categories for products
## Method : GET

curl --location 'http://127.0.0.1:8000/api/categories' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036'

# ** RESPONSE

[
    {
        "id": 9,
        "category": "Electronics",
        "brand_id": 6,
        "created_by": 1,
        "created_at": "2025-08-08T09:14:47.000000Z",
        "updated_at": "2025-08-08T09:14:47.000000Z",
        "brand": {
            "id": 6,
            "brand": "Dell",
            "created_by": 1,
            "created_at": "2025-08-08T09:14:47.000000Z",
            "updated_at": "2025-08-08T09:14:47.000000Z"
        }
    },
    {
        "id": 10,
        "category": "Software",
        "brand_id": 7,
        "created_by": 1,
        "created_at": "2025-08-08T09:14:47.000000Z",
        "updated_at": "2025-08-08T09:14:47.000000Z",
        "brand": {
            "id": 7,
            "brand": "Microsoft",
            "created_by": 1,
            "created_at": "2025-08-08T09:14:47.000000Z",
            "updated_at": "2025-08-08T09:14:47.000000Z"
        }
    },
    {
        "id": 11,
        "category": "Hardware",
        "brand_id": 6,
        "created_by": 1,
        "created_at": "2025-08-08T09:14:47.000000Z",
        "updated_at": "2025-08-08T09:14:47.000000Z",
        "brand": {
            "id": 6,
            "brand": "Dell",
            "created_by": 1,
            "created_at": "2025-08-08T09:14:47.000000Z",
            "updated_at": "2025-08-08T09:14:47.000000Z"
        }
    },
    {
        "id": 12,
        "category": "Accessories",
        "brand_id": 8,
        "created_by": 1,
        "created_at": "2025-08-08T09:14:47.000000Z",
        "updated_at": "2025-08-08T09:14:47.000000Z",
        "brand": {
            "id": 8,
            "brand": "Apple mmmm",
            "created_by": 1,
            "created_at": "2025-08-08T09:14:47.000000Z",
            "updated_at": "2025-08-08T11:48:39.000000Z"
        }
    },
    {
        "id": 5,
        "category": "NEW CATEGORY-5",
        "brand_id": 3,
        "created_by": 1,
        "created_at": "2025-06-27T10:35:31.000000Z",
        "updated_at": "2025-06-27T10:35:31.000000Z",
        "brand": {
            "id": 3,
            "brand": "HP",
            "created_by": 1,
            "created_at": "2025-06-27T14:52:30.000000Z",
            "updated_at": "2025-06-27T14:52:30.000000Z"
        }
    },
    {
        "id": 4,
        "category": "NEW CATEGORY-4",
        "brand_id": 2,
        "created_by": 1,
        "created_at": "2025-06-27T10:30:47.000000Z",
        "updated_at": "2025-06-27T10:30:47.000000Z",
        "brand": {
            "id": 2,
            "brand": "SAMSUNG",
            "created_by": 1,
            "created_at": "2025-05-07T16:22:20.000000Z",
            "updated_at": "2025-05-07T16:22:20.000000Z"
        }
    },
    {
        "id": 3,
        "category": "NEW CATEGORY-3",
        "brand_id": 2,
        "created_by": 1,
        "created_at": "2025-06-27T10:29:51.000000Z",
        "updated_at": "2025-06-27T10:29:51.000000Z",
        "brand": {
            "id": 2,
            "brand": "SAMSUNG",
            "created_by": 1,
            "created_at": "2025-05-07T16:22:20.000000Z",
            "updated_at": "2025-05-07T16:22:20.000000Z"
        }
    },
    {
        "id": 2,
        "category": "NEW CATEGORY-2",
        "brand_id": 3,
        "created_by": 1,
        "created_at": "2025-06-27T10:11:58.000000Z",
        "updated_at": "2025-06-27T10:11:58.000000Z",
        "brand": {
            "id": 3,
            "brand": "HP",
            "created_by": 1,
            "created_at": "2025-06-27T14:52:30.000000Z",
            "updated_at": "2025-06-27T14:52:30.000000Z"
        }
    },
    {
        "id": 1,
        "category": "CATEGORY -1",
        "brand_id": 1,
        "created_by": 1,
        "created_at": "2025-05-07T16:27:33.000000Z",
        "updated_at": "2025-05-07T16:27:33.000000Z",
        "brand": {
            "id": 1,
            "brand": "LENOVO",
            "created_by": 1,
            "created_at": "2025-05-07T16:22:09.000000Z",
            "updated_at": "2025-05-07T16:22:09.000000Z"
        }
    }
]


## To create new category
## Method : POST

curl --location 'http://127.0.0.1:8000/api/categories' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036' \
--form 'category="QWERTY"' \
--form 'brand_id="2"'

# ** RESPONSE

{
    "category": "QWERTY",
    "brand_id": "2",
    "created_by": 1,
    "updated_at": "2025-10-22T04:58:12.000000Z",
    "created_at": "2025-10-22T04:58:12.000000Z",
    "id": 14,
    "brand": {
        "id": 2,
        "brand": "SAMSUNG",
        "created_by": 1,
        "created_at": "2025-05-07T16:22:20.000000Z",
        "updated_at": "2025-05-07T16:22:20.000000Z"
    }
}


## to update specified category
## Method : PUT

curl --location --request PUT 'http://127.0.0.1:8000/api/categories/14' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036' \
--data '{
    "category":"qwerty-111",
    "brand_id":3
}'

# ** RESPONSE

{
    "id": 14,
    "category": "qwerty-111",
    "brand_id": 3,
    "created_by": 1,
    "created_at": "2025-10-22T04:58:12.000000Z",
    "updated_at": "2025-10-22T05:01:34.000000Z",
    "brand": {
        "id": 3,
        "brand": "HP",
        "created_by": 1,
        "created_at": "2025-06-27T14:52:30.000000Z",
        "updated_at": "2025-06-27T14:52:30.000000Z"
    }
}


## To delete specified category
## Method : DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/categories/14' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036'

# ** RESPONSE

{
    "message": "Category deleted successfully"
}


## ------------- DEPARTMENTS ------------

## To list all Departments
## Method : GET

curl --location 'http://127.0.0.1:8000/api/departments' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036'

# ** RESPONSE

[
    {
        "id": 3,
        "department_name": "SERVICE",
        "created_by": 1,
        "created_at": "2025-06-27T13:40:45.000000Z",
        "updated_at": "2025-08-11T04:30:43.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    },
    {
        "id": 2,
        "department_name": "Office",
        "created_by": 1,
        "created_at": "2025-06-27T13:35:10.000000Z",
        "updated_at": "2025-06-27T13:35:10.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    },
    {
        "id": 1,
        "department_name": "SALES",
        "created_by": 1,
        "created_at": "2025-05-07T15:45:26.000000Z",
        "updated_at": "2025-05-07T15:45:26.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    }
]


## To add new department
## Method:POST

curl --location 'http://127.0.0.1:8000/api/departments' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036' \
--form 'department_name="qwerty"'

# ** RESPONSE

{
    "department_name": "qwerty",
    "created_by": 1,
    "updated_at": "2025-10-22T05:16:28.000000Z",
    "created_at": "2025-10-22T05:16:28.000000Z",
    "id": 6
}


## To update specified department
## Method : PUT

curl --location --request PUT 'http://127.0.0.1:8000/api/departments/6' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036' \
--data '{
    "department_name":"asdfgh"
}'

# ** RESPONSE

{
    "id": 6,
    "department_name": "asdfgh",
    "created_by": 1,
    "created_at": "2025-10-22T05:16:28.000000Z",
    "updated_at": "2025-10-22T05:19:25.000000Z"
}


## To delete specified department
## Method: DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/departments/6' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036'

# ** RESPONSE

{
    "message": "Department deleted successfully"
}


## To get all designations list
## Method: GET

curl --location 'http://127.0.0.1:8000/api/designations' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036'

# ** RESPONSE

[
    {
        "id": 8,
        "designation_name": "sales executive",
        "created_by": 1,
        "created_at": "2025-04-28T18:16:46.000000Z",
        "updated_at": "2025-04-28T18:16:46.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    },
    {
        "id": 7,
        "designation_name": "manager",
        "created_by": 1,
        "created_at": "2025-04-28T18:16:22.000000Z",
        "updated_at": "2025-04-28T18:16:22.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    },
    {
        "id": 6,
        "designation_name": "Develeoper",
        "created_by": 1,
        "created_at": "2025-04-28T18:15:42.000000Z",
        "updated_at": "2025-04-28T18:15:42.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    },
    {
        "id": 4,
        "designation_name": "CS Team Lead",
        "created_by": 1,
        "created_at": "2025-01-27T12:26:34.000000Z",
        "updated_at": "2025-01-27T12:26:34.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    },
    {
        "id": 3,
        "designation_name": "IT",
        "created_by": 1,
        "created_at": "2024-12-13T12:51:59.000000Z",
        "updated_at": "2024-12-13T12:51:59.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    },
    {
        "id": 2,
        "designation_name": "SALES",
        "created_by": 1,
        "created_at": "2024-12-13T12:51:23.000000Z",
        "updated_at": "2025-06-27T14:35:47.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    },
    {
        "id": 1,
        "designation_name": "Customer Support",
        "created_by": 1,
        "created_at": "2024-12-13T12:51:13.000000Z",
        "updated_at": "2024-12-13T12:51:13.000000Z",
        "creator": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        }
    }
]


## to create new designations
## Method: POST

curl --location 'http://127.0.0.1:8000/api/designations' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036' \
--form 'designation_name="qwertyuiop"'

# ** RESPONSE

{
    "designation_name": "qwertyuiop",
    "created_by": 1,
    "updated_at": "2025-10-22T05:30:44.000000Z",
    "created_at": "2025-10-22T05:30:44.000000Z",
    "id": 13
}


## To update specified deignations
## Method : PUT

curl --location --request PUT 'http://127.0.0.1:8000/api/designations/13' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036' \
--data '{
    "designation_name":"asdfgh"
}'

# ** RESPONSE

{
    "id": 13,
    "designation_name": "asdfgh",
    "created_by": 1,
    "created_at": "2025-10-22T05:30:44.000000Z",
    "updated_at": "2025-10-22T05:33:57.000000Z"
}


## To delete specified designation
## Method :DELETE

curl --location --request DELETE 'http://127.0.0.1:8000/api/designations/13' \
--header 'Authorization: Bearer 276|Gd1Tew01PysCTnGj3RCvPrYYLS9nSAf8Qe4pbEM7af231036'

# ** RESPONSE

{
    "message": "Designation deleted successfully"
}


## To Display admin/manager dashboard stats
## Method : GET

curl --location 'http://127.0.0.1:8000/api/dashboard-stats' \
--header 'a: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9'

# ** RESPONSE

{
    "stats": {
        "totalTickets": 10,
        "ticketsOpen": 0,
        "ticketsOverdue": 9,
        "ticketProgress": 0,
        "totalCustomers": 50,
        "ticketsProgress": 9,
        "chartData": [
            {
                "month": "Nov",
                "tickets": 0,
                "trend": 0
            },
            {
                "month": "Dec",
                "tickets": 0,
                "trend": 0
            },
            {
                "month": "Jan",
                "tickets": 13,
                "trend": 4
            },
            {
                "month": "Feb",
                "tickets": 0,
                "trend": 4
            },
            {
                "month": "Mar",
                "tickets": 0,
                "trend": 4
            },
            {
                "month": "Apr",
                "tickets": 6,
                "trend": 2
            },
            {
                "month": "May",
                "tickets": 6,
                "trend": 4
            },
            {
                "month": "Jun",
                "tickets": 1,
                "trend": 4
            },
            {
                "month": "Jul",
                "tickets": 2,
                "trend": 3
            },
            {
                "month": "Aug",
                "tickets": 15,
                "trend": 6
            },
            {
                "month": "Sep",
                "tickets": 10,
                "trend": 9
            },
            {
                "month": "Oct",
                "tickets": 2,
                "trend": 9
            }
        ]
    }
}



## TASK MANAGEMENT APIS

# ** To get all tasks
# Method: GET

curl --location --request GET 'http://127.0.0.1:8000/api/tasks' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9' \
--data '{
    "start_date":null,
    "end_date":null,
    "agent_id":[8,6],
    "category_id":null,
    "status":1
}'

## **RESPONSE

{
    "current_page": 1,
    "data": [
        {
            "id": 37,
            "task_name": "new task name-22222",
            "user_id": 1,
            "ticket_id": null,
            "type_id": null,
            "branch_id": 2,
            "time": "2025-10-24T12:29:00.000000Z",
            "description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
            "created_at": "2025-10-24T06:59:27.000000Z",
            "updated_at": "2025-10-24T09:11:01.000000Z",
            "category_id": 1,
            "status": 1,
            "closed_time": "2025-10-24 09:04:31",
            "closed_by": 1,
            "closing_comment": null,
            "user": {
                "id": 1,
                "name": "Shaji",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "superadmin@gmail.com",
                "role_id": 1,
                "department_id": 1,
                "branch_id": null,
                "status": 1,
                "created_at": null,
                "updated_at": "2025-08-16T08:18:36.000000Z",
                "parent_id": null,
                "firebase_id": null,
                "image": null,
                "designation_id": 3,
                "password_validity": null,
                "deleted_at": null
            },
            "ticket": null,
            "type": null,
            "category": {
                "id": 1,
                "category": "Call",
                "created_at": null,
                "updated_at": null,
                "created_by": 1
            },
            "agent": [
                {
                    "id": 8,
                    "name": "Anusha",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "anusha1@krs.in",
                    "role_id": 2,
                    "department_id": null,
                    "branch_id": 2,
                    "status": 1,
                    "created_at": "2024-12-23T13:22:00.000000Z",
                    "updated_at": "2024-12-23T13:22:00.000000Z",
                    "parent_id": 3,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 1,
                    "password_validity": null,
                    "deleted_at": null,
                    "pivot": {
                        "task_id": 37,
                        "agent_id": 8
                    }
                },
                {
                    "id": 18,
                    "name": "arun",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "muneer+11@gmail.com",
                    "role_id": 2,
                    "department_id": null,
                    "branch_id": 5,
                    "status": 1,
                    "created_at": "2025-02-19T21:36:13.000000Z",
                    "updated_at": "2025-02-19T21:36:31.000000Z",
                    "parent_id": 5,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 4,
                    "password_validity": null,
                    "deleted_at": "2025-02-19 21:36:31",
                    "pivot": {
                        "task_id": 37,
                        "agent_id": 18
                    }
                },
                {
                    "id": 6,
                    "name": "Babu",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "shaji4@gmail.com",
                    "role_id": 2,
                    "department_id": null,
                    "branch_id": 2,
                    "status": 1,
                    "created_at": "2024-12-13T14:12:10.000000Z",
                    "updated_at": "2024-12-23T13:32:18.000000Z",
                    "parent_id": 3,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 1,
                    "password_validity": null,
                    "deleted_at": "2024-12-23 13:32:18",
                    "pivot": {
                        "task_id": 37,
                        "agent_id": 6
                    }
                },
                {
                    "id": 19,
                    "name": "dileep",
                    "country_code": "91",
                    "mobile": "1234567899",
                    "email": "muneerr+21@gmail.com",
                    "role_id": 2,
                    "department_id": null,
                    "branch_id": 5,
                    "status": 1,
                    "created_at": "2025-02-19T21:36:53.000000Z",
                    "updated_at": "2025-02-19T21:37:52.000000Z",
                    "parent_id": 5,
                    "firebase_id": null,
                    "image": null,
                    "designation_id": 3,
                    "password_validity": null,
                    "deleted_at": "2025-02-19 21:37:52",
                    "pivot": {
                        "task_id": 37,
                        "agent_id": 19
                    }
                }
            ],
            "branch": {
                "id": 2,
                "branch_name": "branch one",
                "created_by": 1,
                "created_at": "2025-05-12T12:54:10.000000Z",
                "updated_at": "2025-05-12T12:54:10.000000Z"
            },
            "task_status": {
                "id": 1,
                "status": "Open",
                "created_at": null,
                "updated_at": null,
                "created_by": 1
            }
        }
    ],
    "first_page_url": "http://127.0.0.1:8000/api/tasks?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://127.0.0.1:8000/api/tasks?page=1",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "active": false
        },
        {
            "url": "http://127.0.0.1:8000/api/tasks?page=1",
            "label": "1",
            "active": true
        },
        {
            "url": null,
            "label": "Next &raquo;",
            "active": false
        }
    ],
    "next_page_url": null,
    "path": "http://127.0.0.1:8000/api/tasks",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
}

## TO GET SELECTED TASK DETAILS
## METHOD:GET
## api : /tasks/{id}

curl --location 'http://127.0.0.1:8000/api/tasks/38' \
--header 'Accept: application/ecmascript' \
--header 'Authorization: Bearer 295|e1LwCic69QLKCrAaty3X7Gi5zkpn33OFM0AlRra1e5a593da'

## **RESPONSE

{
    "id": 38,
    "task_name": "testing-7777",
    "user_id": 1,
    "ticket_id": null,
    "type_id": null,
    "branch_id": 2,
    "time": "2025-10-28T06:30:00.000000Z",
    "description": "this is testing task",
    "created_at": "2025-10-24T07:15:22.000000Z",
    "updated_at": "2025-10-28T08:03:14.000000Z",
    "category_id": 2,
    "status": 2,
    "closed_time": "2025-10-24 09:28:49",
    "closed_by": 1,
    "closing_comment": null,
    "user": {
        "id": 1,
        "name": "Shaji",
        "country_code": "91",
        "mobile": "1234567899",
        "email": "superadmin@gmail.com",
        "role_id": 1,
        "department_id": 1,
        "branch_id": null,
        "status": 1,
        "created_at": null,
        "updated_at": "2025-08-16T08:18:36.000000Z",
        "parent_id": null,
        "firebase_id": null,
        "image": null,
        "designation_id": 3,
        "password_validity": null,
        "deleted_at": null
    },
    "ticket": null,
    "type": null,
    "category": {
        "id": 2,
        "category": "Meeting",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    },
    "agent": [
        {
            "id": 6,
            "name": "Babu",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "shaji4@gmail.com",
            "role_id": 2,
            "department_id": null,
            "branch_id": 2,
            "status": 1,
            "created_at": "2024-12-13T14:12:10.000000Z",
            "updated_at": "2024-12-23T13:32:18.000000Z",
            "parent_id": 3,
            "firebase_id": null,
            "image": null,
            "designation_id": 1,
            "password_validity": null,
            "deleted_at": "2024-12-23 13:32:18",
            "pivot": {
                "task_id": 38,
                "agent_id": 6
            }
        },
        {
            "id": 7,
            "name": "Manoj.M",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "manoj1@krs.in",
            "role_id": 2,
            "department_id": null,
            "branch_id": 2,
            "status": 1,
            "created_at": "2024-12-23T13:20:05.000000Z",
            "updated_at": "2024-12-23T13:20:05.000000Z",
            "parent_id": 3,
            "firebase_id": null,
            "image": null,
            "designation_id": 1,
            "password_validity": null,
            "deleted_at": null,
            "pivot": {
                "task_id": 38,
                "agent_id": 7
            }
        }
    ],
    "branch": {
        "id": 2,
        "branch_name": "branch one",
        "created_by": 1,
        "created_at": "2025-05-12T12:54:10.000000Z",
        "updated_at": "2025-05-12T12:54:10.000000Z"
    },
    "task_status": {
        "id": 2,
        "status": "Pending",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    }
}


## TO GET ALL TASK CATEGORIES
## Method: GET

curl --location 'http://127.0.0.1:8000/api/task-categories' \
--header 'Accept: application/atom+xml' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9'

## **RESPONSE

[
    {
        "id": 1,
        "category": "Call",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    },
    {
        "id": 2,
        "category": "Meeting",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    },
    {
        "id": 3,
        "category": "Sales",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    }
]


## TO GET ALL TASK STATUSES
## Method: GET

curl --location 'http://127.0.0.1:8000/api/task-statuses' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9'

## **RESPONSE

[
    {
        "id": 1,
        "status": "Open",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    },
    {
        "id": 2,
        "status": "Pending",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    },
    {
        "id": 3,
        "status": "In Progress",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    },
    {
        "id": 4,
        "status": "Closed",
        "created_at": null,
        "updated_at": null,
        "created_by": 1
    }
]

## ** TO GET ALL AGENTS FOR FILTER TASK
## METHOD:GET

curl --location 'http://127.0.0.1:8000/api/task-agents' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9'


## **RESPONSE

[
    {
        "id": 8,
        "name": "Anusha",
        "email": "anusha1@krs.in"
    },
    {
        "id": 11,
        "name": "Babu",
        "email": "babu1@krs.in"
    },
    {
        "id": 19,
        "name": "dileep",
        "email": "muneerr+21@gmail.com"
    }
]


## TO GET A PARTICULATR TICKETS DETAILS
## METHOD : GET
## api:  /task-ticket/{trackingNumber}

curl --location 'http://127.0.0.1:8000/api/task-ticket/TKT0000718' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9'

## **RESPONSE

{
    "id": 718,
    "tracking_number": "TKT0000718",
    "issue": "this is testing issue",
    "description": "this is testing",
    "due_date": "2025-10-17 00:00:00",
    "status": "Returned",
    "status_id": 5,
    "priority": null,
    "priority_id": 1
}



## TO GET TASK ACTIVITIES
## METHOD: GET
## api: /tasks/{id}/activities

curl --location 'http://127.0.0.1:8000/api/tasks/38/activities' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9'

## **RESPONSE

[
    {
        "id": 643,
        "type": "Task Updated",
        "note": "Task \"nw task-333\" updated: status changed from Open to Closed",
        "title": null,
        "status_id": null,
        "branch_id": null,
        "priority_id": null,
        "agent_id": null,
        "ticket_id": 718,
        "log_id": null,
        "created_by": 1,
        "description": null,
        "created_at": "2025-10-24T09:28:49.000000Z",
        "updated_at": "2025-10-24T09:28:49.000000Z",
        "task_id": 38,
        "schedule_date": null,
        "log_file": null,
        "log_file_type": null,
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    },
    {
        "id": 639,
        "type": "Task Updated",
        "note": "Task \"nw task-333\" was updated",
        "title": null,
        "status_id": null,
        "branch_id": null,
        "priority_id": null,
        "agent_id": null,
        "ticket_id": 718,
        "log_id": null,
        "created_by": 1,
        "description": null,
        "created_at": "2025-10-24T07:17:18.000000Z",
        "updated_at": "2025-10-24T07:17:18.000000Z",
        "task_id": 38,
        "schedule_date": null,
        "log_file": null,
        "log_file_type": null,
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    },
    {
        "id": 638,
        "type": "Task Created",
        "note": "Task \"nw task-333\" was created",
        "title": null,
        "status_id": null,
        "branch_id": null,
        "priority_id": null,
        "agent_id": null,
        "ticket_id": 718,
        "log_id": null,
        "created_by": 1,
        "description": null,
        "created_at": "2025-10-24T07:15:22.000000Z",
        "updated_at": "2025-10-24T07:15:22.000000Z",
        "task_id": 38,
        "schedule_date": null,
        "log_file": null,
        "log_file_type": null,
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    }
]


## TO GET TASK NOTES 
## METHOD :GET
## api: /tasks/{id}/notes

curl --location 'http://127.0.0.1:8000/api/tasks/38/notes' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9'


## **RESPONSE

[
    {
        "id": 2,
        "task_id": 38,
        "task_status": 2,
        "comment": "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. ",
        "created_by": 1,
        "created_at": "2025-10-24T12:59:57.000000Z",
        "updated_at": "2025-10-24T12:59:57.000000Z",
        "deleted_at": "2025-10-24 12:59:57",
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    },
    {
        "id": 1,
        "task_id": 38,
        "task_status": 1,
        "comment": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. ",
        "created_by": 1,
        "created_at": "2025-10-24T12:59:09.000000Z",
        "updated_at": "2025-10-24T12:59:09.000000Z",
        "deleted_at": "2025-10-24 12:59:09",
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    },
    {
        "id": 7,
        "task_id": 38,
        "task_status": 3,
        "comment": "this isteting task colsed",
        "created_by": 1,
        "created_at": "2025-10-24T09:28:49.000000Z",
        "updated_at": "2025-10-24T09:28:49.000000Z",
        "deleted_at": null,
        "user": {
            "id": 1,
            "name": "Shaji"
        }
    }
]

## TO ADD TASK NOTE
## METHOD:POST
## api: /tasks/38/notes

curl --location 'http://127.0.0.1:8000/api/tasks/38/notes' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9' \
--form 'comment="this is testing"' \
--form 'task_status="2"'

## **RESPONSE
{
    "message": "Note added successfully",
    "note": {
        "task_id": "38",
        "task_status": "2",
        "comment": "this is testing",
        "created_by": 14,
        "updated_at": "2025-10-27T12:37:56.000000Z",
        "created_at": "2025-10-27T12:37:56.000000Z",
        "id": 10,
        "user": {
            "id": 14,
            "name": "Getlead testing"
        }
    },
    "task": {
        "id": 38,
        "task_name": "nw task-333",
        "user_id": 1,
        "ticket_id": 718,
        "type_id": null,
        "branch_id": 2,
        "time": "2025-10-24T13:30:00.000000Z",
        "description": "sdf fdfd fdsf sdfdsfds dsfdsfdsf dsfdsfdsfdsfdsfdsfdsfsdfsdfds fdsfdsfdsfdfdsfdsfdsfdsfdsfdsf dfdfdfsdfdsfdf",
        "created_at": "2025-10-24T07:15:22.000000Z",
        "updated_at": "2025-10-27T12:37:56.000000Z",
        "category_id": 1,
        "status": "2",
        "closed_time": "2025-10-24 09:28:49",
        "closed_by": 1,
        "closing_comment": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. ",
        "user": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket": {
            "id": 718,
            "issue": "this is testing issue",
            "description": "this is testing",
            "customer_id": 2,
            "priority": 1,
            "status": 5,
            "ticket_type": "In Shop",
            "ticket_label": null,
            "notify_to": null,
            "branch_id": 5,
            "tracking_number": "TKT0000718",
            "due_date": "2025-10-17 00:00:00",
            "deleted_at": null,
            "created_at": "2025-10-17T12:38:45.000000Z",
            "updated_at": "2025-10-22T06:20:46.000000Z",
            "created_by": 1,
            "slug": "this-is-testing-issue-1760704725",
            "service_id": "43234",
            "closed_time": null,
            "closed_by": null,
            "closed_at": null,
            "verified_at": null,
            "remarks": null
        },
        "type": null,
        "category": {
            "id": 1,
            "category": "Call",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        },
        "agent": [
            {
                "id": 8,
                "name": "Anusha",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "anusha1@krs.in",
                "role_id": 2,
                "department_id": null,
                "branch_id": 2,
                "status": 1,
                "created_at": "2024-12-23T13:22:00.000000Z",
                "updated_at": "2024-12-23T13:22:00.000000Z",
                "parent_id": 3,
                "firebase_id": null,
                "image": null,
                "designation_id": 1,
                "password_validity": null,
                "deleted_at": null,
                "pivot": {
                    "task_id": 38,
                    "agent_id": 8
                }
            }
        ],
        "task_status": {
            "id": 2,
            "status": "Pending",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        }
    }
}



## TO ADD NEW TASK
## METHOD :POST
## api: /tasks

curl --location 'http://127.0.0.1:8000/api/tasks' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9' \
--data '{
    "task_name": "testing-55",
    "ticket_id": null,
    "type_id": null,
    "category_id": "2",
    "time":"2025-10-28 6:30:00",
    "description": "this is testing task",
    "status": "2",
    "agent_ids":[6,7],
    "closing_comment":null
}'

## **RESPONSE

{
    "message": "Task created successfully",
    "task": {
        "task_name": "testing-55",
        "user_id": 14,
        "ticket_id": null,
        "type_id": null,
        "category_id": "2",
        "time": "2025-10-28T06:30:00.000000Z",
        "description": "this is testing task",
        "status": "2",
        "branch_id": 4,
        "updated_at": "2025-10-28T07:36:59.000000Z",
        "created_at": "2025-10-28T07:36:59.000000Z",
        "id": 41,
        "user": {
            "id": 14,
            "name": "Getlead testing",
            "country_code": "+91",
            "mobile": "1234567899",
            "email": "glead@gmail.com",
            "role_id": 3,
            "department_id": null,
            "branch_id": 4,
            "status": 1,
            "created_at": "2025-02-11T10:33:43.000000Z",
            "updated_at": "2025-02-19T11:30:52.000000Z",
            "parent_id": 4,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket": null,
        "type": null,
        "category": {
            "id": 2,
            "category": "Meeting",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        },
        "agent": [
            {
                "id": 6,
                "name": "Babu",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "shaji4@gmail.com",
                "role_id": 2,
                "department_id": null,
                "branch_id": 2,
                "status": 1,
                "created_at": "2024-12-13T14:12:10.000000Z",
                "updated_at": "2024-12-23T13:32:18.000000Z",
                "parent_id": 3,
                "firebase_id": null,
                "image": null,
                "designation_id": 1,
                "password_validity": null,
                "deleted_at": "2024-12-23 13:32:18",
                "pivot": {
                    "task_id": 41,
                    "agent_id": 6
                }
            },
            {
                "id": 7,
                "name": "Manoj.M",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "manoj1@krs.in",
                "role_id": 2,
                "department_id": null,
                "branch_id": 2,
                "status": 1,
                "created_at": "2024-12-23T13:20:05.000000Z",
                "updated_at": "2024-12-23T13:20:05.000000Z",
                "parent_id": 3,
                "firebase_id": null,
                "image": null,
                "designation_id": 1,
                "password_validity": null,
                "deleted_at": null,
                "pivot": {
                    "task_id": 41,
                    "agent_id": 7
                }
            }
        ],
        "branch": {
            "id": 4,
            "branch_name": "branch three",
            "created_by": 1,
            "created_at": "2025-05-12T12:54:22.000000Z",
            "updated_at": "2025-05-12T12:54:22.000000Z"
        },
        "task_status": {
            "id": 2,
            "status": "Pending",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        }
    }
}


## TO UPDATE SPECIFIED TASK
## METHOD :PUT
## api: /tasks/{id}

curl --location --request PUT 'http://127.0.0.1:8000/api/tasks/38' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer 277|4yExilJxMRN8r0msHiMKLeGFF4PAMEp1V9GRGPw71bcdf3f9' \
--data '{
    "task_name": "testing-7777",
    "ticket_id":null,
    "type_id":null,
    "category_id":"2",
    "time":"2025-10-28 6:30:00",
    "description":"this is testing task",
    "status":"2",
    "agent_ids":[6,7],
    "closing_comment":null
}'

## **RESPONSE

{
    "message": "Task updated successfully",
    "task": {
        "id": 38,
        "task_name": "testing-7777",
        "user_id": 1,
        "ticket_id": null,
        "type_id": null,
        "branch_id": 2,
        "time": "2025-10-28T06:30:00.000000Z",
        "description": "this is testing task",
        "created_at": "2025-10-24T07:15:22.000000Z",
        "updated_at": "2025-10-28T08:03:14.000000Z",
        "category_id": "2",
        "status": "2",
        "closed_time": "2025-10-24 09:28:49",
        "closed_by": 1,
        "closing_comment": null,
        "user": {
            "id": 1,
            "name": "Shaji",
            "country_code": "91",
            "mobile": "1234567899",
            "email": "superadmin@gmail.com",
            "role_id": 1,
            "department_id": 1,
            "branch_id": null,
            "status": 1,
            "created_at": null,
            "updated_at": "2025-08-16T08:18:36.000000Z",
            "parent_id": null,
            "firebase_id": null,
            "image": null,
            "designation_id": 3,
            "password_validity": null,
            "deleted_at": null
        },
        "ticket": null,
        "type": null,
        "category": {
            "id": 2,
            "category": "Meeting",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        },
        "agent": [
            {
                "id": 6,
                "name": "Babu",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "shaji4@gmail.com",
                "role_id": 2,
                "department_id": null,
                "branch_id": 2,
                "status": 1,
                "created_at": "2024-12-13T14:12:10.000000Z",
                "updated_at": "2024-12-23T13:32:18.000000Z",
                "parent_id": 3,
                "firebase_id": null,
                "image": null,
                "designation_id": 1,
                "password_validity": null,
                "deleted_at": "2024-12-23 13:32:18",
                "pivot": {
                    "task_id": 38,
                    "agent_id": 6
                }
            },
            {
                "id": 7,
                "name": "Manoj.M",
                "country_code": "91",
                "mobile": "1234567899",
                "email": "manoj1@krs.in",
                "role_id": 2,
                "department_id": null,
                "branch_id": 2,
                "status": 1,
                "created_at": "2024-12-23T13:20:05.000000Z",
                "updated_at": "2024-12-23T13:20:05.000000Z",
                "parent_id": 3,
                "firebase_id": null,
                "image": null,
                "designation_id": 1,
                "password_validity": null,
                "deleted_at": null,
                "pivot": {
                    "task_id": 38,
                    "agent_id": 7
                }
            }
        ],
        "task_status": {
            "id": 2,
            "status": "Pending",
            "created_at": null,
            "updated_at": null,
            "created_by": 1
        }
    }
}

## TO DELETE SELECTED TASK
## METHOD :DELETE
## api: /tasks/{id}

curl --location --request DELETE 'http://127.0.0.1:8000/api/tasks/39' \
--header 'Accept: application/atom+xml' \
--header 'Authorization: Bearer 295|e1LwCic69QLKCrAaty3X7Gi5zkpn33OFM0AlRra1e5a593da'

## **RESPONSE

{
    "message": "Task deleted successfully"
}





