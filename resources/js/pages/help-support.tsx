import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Ticket,
  Users,
  FileText,
  Settings,
  BarChart3,
  Package,
  CreditCard,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState('create-tickets');

  return (
    <DashboardLayout title="Help & Support">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          {/* Tabs Section with Vertical Layout */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6"
            orientation="vertical"
          >
            {/* Desktop vertical tabs - Left sidebar */}
            <TabsList className="hidden lg:flex flex-col h-fit w-[240px] p-1 bg-gray-50 justify-start">
              <TabsTrigger
                value="create-tickets"
                className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <Ticket className="h-4 w-4" />
                How to Create Tickets
              </TabsTrigger>
              <TabsTrigger
                value="manage-customers"
                className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Managing Customers
              </TabsTrigger>
              <TabsTrigger
                value="invoicing"
                className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Invoicing & Payments
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Reports & Analytics
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Product Management
              </TabsTrigger>
              <TabsTrigger
                value="user-management"
                className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings Management
              </TabsTrigger>
              <TabsTrigger
                value="faqs"
                className="w-full justify-start text-sm px-3 py-2 mt-[5px] data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                FAQs
              </TabsTrigger>
            </TabsList>

            {/* Mobile horizontal tabs */}
            <TabsList className="lg:hidden grid w-full grid-cols-2 gap-2">
              <TabsTrigger value="create-tickets" className="text-xs">
                <Ticket className="h-3 w-3 mr-1" />
                Create Tickets
              </TabsTrigger>
              <TabsTrigger value="manage-customers" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Customers
              </TabsTrigger>
              <TabsTrigger value="invoicing" className="text-xs">
                <CreditCard className="h-3 w-3 mr-1" />
                Invoicing
              </TabsTrigger>
            </TabsList>

            {/* Content Area - Right side */}
            <div className="flex-1 min-w-0">

          {/* How to Create Tickets Tab */}
          <TabsContent value="create-tickets" className="space-y-4">
            <Card className="border" style={{ borderColor: '#e4e4e4' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  How to Create Support Tickets
                </CardTitle>
                <CardDescription>
                  Follow this step-by-step guide to create and manage support tickets effectively.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert for important info */}
                <Alert className="border" style={{ borderColor: '#e4e4e4' }}>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Quick Tip</AlertTitle>
                  <AlertDescription>
                    You can create tickets from multiple places: the main Tickets page, the dashboard, or using the quick Add button in the top navigation.
                  </AlertDescription>
                </Alert>

                {/* Step by Step Instructions */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Step-by-Step Instructions</h3>

                    {/* Step 1 */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className="mt-1">1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Navigate to the Tickets Page</h4>
                          <p className="text-sm text-muted-foreground">
                            Click on "Tickets" in the left sidebar menu. This will take you to the main tickets management page.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className="mt-1">2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Click the "Add Ticket" Button</h4>
                          <p className="text-sm text-muted-foreground">
                            On the Tickets page, locate and click the "+ Add Ticket" button in the top-right corner of the page.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className="mt-1">3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Fill in the Ticket Details</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Complete the ticket creation form with the following information:
                          </p>
                          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li><strong>Customer:</strong> Select or add a new customer</li>
                            <li><strong>Issue/Subject:</strong> Enter a brief description of the problem</li>
                            <li><strong>Description:</strong> Provide detailed information about the issue</li>
                            <li><strong>Priority:</strong> Set the urgency level (Low, Medium, High, Urgent)</li>
                            <li><strong>Status:</strong> Select the initial status (typically "Open")</li>
                            <li><strong>Due Date:</strong> Set when the issue needs to be resolved</li>
                            <li><strong>Assign to Agent:</strong> Choose the responsible team member</li>
                            <li><strong>Labels:</strong> Add relevant tags for categorization</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className="mt-1">4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Add Additional Information (Optional)</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            You can enhance your ticket with additional details:
                          </p>
                          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                            <li><strong>Attachments:</strong> Upload relevant files, images, or documents</li>
                            <li><strong>Products:</strong> Link related products or spare parts</li>
                            <li><strong>Additional Fields:</strong> Fill in any custom fields specific to your organization</li>
                            <li><strong>Notes:</strong> Add internal notes for team members</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-3">
                        <Badge className="mt-1">5</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Save the Ticket</h4>
                          <p className="text-sm text-muted-foreground">
                            After filling in all required information, click the "Create Ticket" button at the bottom of the form. The system will generate a unique tracking number for the ticket.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Success Message */}
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Your ticket has been created successfully. You can track its progress using the unique tracking number provided.
                      </AlertDescription>
                    </Alert>
                  </div>

                  {/* Additional Tips */}
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Use descriptive titles</p>
                          <p className="text-sm text-muted-foreground">Clear, specific issue titles help agents understand and prioritize tickets faster.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Include all relevant details</p>
                          <p className="text-sm text-muted-foreground">The more information you provide upfront, the quicker the resolution.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Set appropriate priority levels</p>
                          <p className="text-sm text-muted-foreground">Reserve "Urgent" for critical issues that affect business operations.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Use labels for better organization</p>
                          <p className="text-sm text-muted-foreground">Labels help categorize and filter tickets for easier management.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Common Issues */}
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Troubleshooting Common Issues</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Customer not found?</p>
                          <p className="text-sm text-muted-foreground">Click "Add New Customer" in the customer dropdown to create a new customer profile on the fly.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Can't upload attachments?</p>
                          <p className="text-sm text-muted-foreground">Check file size limits (max 10MB per file) and supported formats (PDF, images, documents).</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Need to edit after creation?</p>
                          <p className="text-sm text-muted-foreground">You can always edit ticket details by clicking the edit icon on the ticket details page.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Managing Customers Tab */}
          <TabsContent value="manage-customers" className="space-y-4">
            <Card className="border" style={{ borderColor: '#e4e4e4' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Managing Customers
                </CardTitle>
                <CardDescription>
                  Learn how to add, edit, and manage customer information in the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Tip */}
                <Alert className="border" style={{ borderColor: '#e4e4e4' }}>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Quick Tip</AlertTitle>
                  <AlertDescription>
                    Customer management is central to ticket tracking. Keep customer information updated to ensure smooth communication and service delivery.
                  </AlertDescription>
                </Alert>

                <div className="space-y-8">
                  {/* Adding New Customers */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">1. Adding New Customers</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Navigate to Customers Page</h4>
                          <p className="text-sm text-muted-foreground">
                            Click on "Customers" in the left sidebar menu to access the customer management page.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Click "Add Customer" Button</h4>
                          <p className="text-sm text-muted-foreground">
                            Locate and click the "+ Add Customer" button at the top-right corner of the customers list page.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Fill in Customer Details</h4>
                          <p className="text-sm text-muted-foreground mb-2">Complete the customer form with:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li><strong>Name:</strong> Customer's full name (required)</li>
                            <li><strong>Email:</strong> Valid email address for communication</li>
                            <li><strong>Phone:</strong> Contact number with country code</li>
                            <li><strong>Company:</strong> Organization name (if applicable)</li>
                            <li><strong>Address:</strong> Complete address details</li>
                            <li><strong>Branch:</strong> Assign to specific branch</li>
                            <li><strong>Notes:</strong> Additional information about the customer</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Save Customer</h4>
                          <p className="text-sm text-muted-foreground">
                            Click "Save Customer" to create the new customer profile. The system will generate a unique customer ID automatically.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Editing Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">2. Editing Customer Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Locate the Customer List page</h4>
                          <p className="text-sm text-muted-foreground">
                            Use the search bar or browse the customer list to find the customer you want to edit. Then move on the customer to display "Edit" button on the right side.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Click Edit Button</h4>
                          <p className="text-sm text-muted-foreground">
                            Click the edit button, or click on the customer name and select "Edit" from the details page.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Update Information</h4>
                          <p className="text-sm text-muted-foreground">
                            Modify any customer details as needed. All fields except customer ID can be edited.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Save Changes</h4>
                          <p className="text-sm text-muted-foreground">
                            Click "Update Customer" to save your changes. The system will log the modification with timestamp.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Managing Customer Profile */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">3. Managing Customer Profile</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Point 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Access Customer Profile</h4>
                          <p className="text-sm text-muted-foreground">
                            Open the customer's details page, Click on the Customer Name to view the profile page.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Point 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Adding Tickets</h4>
                          <p className="text-sm text-muted-foreground">
                            Click on the "Add tickets" button to show the Customer Adding Modal box. To fill the details and click submit.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Point 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Assign Agents to tickets</h4>
                          <p className="text-sm text-muted-foreground">
                            Click on Assign agent icon, to show modal box. To select agents name from dropdown and submit.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Point 4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">To show tickets statistics of the Customer</h4>
                          <p className="text-sm text-muted-foreground mb-2">The profile page displays ticket statistics including:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li>Total Tickets</li>
                            <li>Total Open tickets</li>
                            <li>Total In Progress</li>
                            <li>Total Closed Tickets</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Bulk Customer Operations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">4. Bulk Customer Operations</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Select Multiple Customers</h4>
                          <p className="text-sm text-muted-foreground">
                            Use the checkboxes in the customer list to select multiple customers for bulk operations.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Choose Bulk Action</h4>
                          <p className="text-sm text-muted-foreground mb-2">Available bulk actions include:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            <li><strong>Export:</strong> Download customer data in CSV/Excel</li>
                            <li><strong>Assign Branch:</strong> Move customers to different branch</li>
                            <li><strong>Update Status:</strong> Change active/inactive status</li>
                            <li><strong>Send Communication:</strong> Bulk email or SMS</li>
                            <li><strong>Add Tags:</strong> Apply labels for categorization</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Confirm Action</h4>
                          <p className="text-sm text-muted-foreground">
                            Review the selected customers and confirm the bulk action. Some actions may require additional parameters.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Monitor Progress</h4>
                          <p className="text-sm text-muted-foreground">
                            For large bulk operations, monitor the progress bar. You'll receive a notification when complete.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Adding Tickets from Customer List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">5. Adding Tickets from Customer List</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Find the Customer</h4>
                          <p className="text-sm text-muted-foreground">
                            Locate the customer in the list using search or filters.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Click "Add Ticket" Icon</h4>
                          <p className="text-sm text-muted-foreground">
                            Click the ticket icon (or "Add Ticket" button) in the actions column for that customer.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Complete Ticket Form</h4>
                          <p className="text-sm text-muted-foreground">
                            The customer field will be pre-populated. Fill in the remaining ticket details like issue, description, and priority.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Create Ticket</h4>
                          <p className="text-sm text-muted-foreground">
                            Click "Create Ticket" to save. The ticket will be automatically linked to the customer's profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Delete Customer from the List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">6. Delete Customer from the List</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 1</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Find the Customer</h4>
                          <p className="text-sm text-muted-foreground">
                            Locate the customer in the list using search or filters.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 2</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Hover Over Customer Row</h4>
                          <p className="text-sm text-muted-foreground">
                            Move your mouse over the customer row to reveal action buttons on the right side, including the delete icon (trash bin).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 3</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Click Delete Icon</h4>
                          <p className="text-sm text-muted-foreground">
                            Click on the delete icon button to display a confirmation dialog with appropriate message.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">Step 4</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">Confirm Deletion</h4>
                          <p className="text-sm text-muted-foreground">
                            Review the confirmation message and click "Delete Customer" button to permanently remove the customer from the system.
                          </p>
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="text-sm text-amber-800">
                              <strong>Note:</strong> Customers with associated tickets cannot be deleted. You must first resolve or reassign all their tickets before deletion is allowed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pro Tips */}
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Keep information current</p>
                          <p className="text-sm text-muted-foreground">Regularly update customer contact details to avoid communication issues.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Use tags effectively</p>
                          <p className="text-sm text-muted-foreground">Tag customers by type (VIP, Regular, New) for better segmentation.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Document interactions</p>
                          <p className="text-sm text-muted-foreground">Add notes after important interactions for team reference.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Regular data backup</p>
                          <p className="text-sm text-muted-foreground">Export customer data periodically for backup and analysis.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoicing & Payments Tab */}
          <TabsContent value="invoicing" className="space-y-4">
            <Card className="border" style={{ borderColor: '#e4e4e4' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Invoicing & Payments
                </CardTitle>
                <CardDescription>
                  Understand how to create invoices, process payments, and manage financial records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Creating Invoices from Tickets */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">1. Creating Invoices from Tickets</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Step 1</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Navigate to Ticket Details</h4>
                        <p className="text-sm text-muted-foreground">
                          Click on the Tickets menu and click on the ticket name to view the details page. Open the ticket for which you want to create an invoice. Ensure the ticket has been resolved or completed.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Step 2</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Click "Add Invoice"</h4>
                        <p className="text-sm text-muted-foreground">
                          Click the "Add Invoice" button at the top of the ticket details page. This will open the invoice creation form.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Step 3</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Add Invoice Details</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Fill in the required invoice information:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Service charge</li>
                          <li>Payment mode</li>
                          <li>View the used products price details</li>
                          <li>Review the total invoice amount and submit the details</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Step 4</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">View All Invoices</h4>
                        <p className="text-sm text-muted-foreground">
                          Click on "Invoices" in the sidebar to view all invoices in the system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Recording Payments */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">2. Recording Payments</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Step 1</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Access Invoice</h4>
                        <p className="text-sm text-muted-foreground">
                          Navigate to the invoice from the Invoices list.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Step 2</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Click "Pay" Button</h4>
                        <p className="text-sm text-muted-foreground">
                          Click the "Pay" button to show a modal box for adding payment details.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Step 3</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Enter Payment Information</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Provide the payment details:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Invoice ID</li>
                          <li>Service charges</li>
                          <li>Item cost</li>
                          <li>Total amount</li>
                          <li>Set discount amount</li>
                          <li>Select payment mode</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Step 4</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Confirm Payment</h4>
                        <p className="text-sm text-muted-foreground">
                          Review the payment details and click "Confirm Payment". The system will update the invoice status and payment balance automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* View Payments */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">3. View Payments</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Point 1</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Access Payments List</h4>
                        <p className="text-sm text-muted-foreground">
                          Click on the "Payments" option in the sidebar to view the payments list.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Point 2</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Filter Payments - Date Wise</h4>
                        <p className="text-sm text-muted-foreground">
                          Set start date and end date to filter date-wise payment details and view the total amount.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Point 3</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Filter Payments - Customer Wise</h4>
                        <p className="text-sm text-muted-foreground">
                          Select customer name from the dropdown and click filter to display payments list based on the selected customer.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Point 4</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Filter Payments - Payment Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Select payment mode from the dropdown and click filter to display payments list based on the selected payment mode.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Point 5</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Filter Payments - All</h4>
                        <p className="text-sm text-muted-foreground">
                          You can combine filter options to get specific payments. For example, select both date range and customer to list payments matching both criteria.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Timely Invoicing</p>
                        <p className="text-sm text-muted-foreground">Generate invoices immediately after service completion to ensure prompt payment.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Clear Payment Terms</p>
                        <p className="text-sm text-muted-foreground">Define clear payment terms, due dates, and late payment penalties on all invoices.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Regular Reconciliation</p>
                        <p className="text-sm text-muted-foreground">Reconcile payments regularly with bank statements to maintain accurate financial records.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Follow-up System</p>
                        <p className="text-sm text-muted-foreground">Set up automated reminders for overdue invoices to improve collection rates.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Reports & Analytics Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="border" style={{ borderColor: '#e4e4e4' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Reports & Analytics
                </CardTitle>
                <CardDescription>
                  Learn how to generate and understand various reports in the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Analytics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">1. Customer Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Overview</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Customer Insights Dashboard</h4>
                        <p className="text-sm text-muted-foreground">
                          Access comprehensive analytics about customer behavior, satisfaction rates, and engagement patterns to make data-driven decisions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Metrics</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Key Customer Metrics</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Track important customer analytics including:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Customer acquisition and retention rates</li>
                          <li>Average ticket resolution time per customer</li>
                          <li>Customer satisfaction scores</li>
                          <li>Service usage patterns and frequency</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tickets Report */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">2. Tickets Report</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Access</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Generate Ticket Reports</h4>
                        <p className="text-sm text-muted-foreground">
                          Navigate to Reports → Tickets Report to generate detailed ticket analysis and performance metrics.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Filter</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Filter Options</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Customize your ticket reports with various filters:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Date range (daily, weekly, monthly, custom)</li>
                          <li>Ticket status (open, in progress, closed)</li>
                          <li>Priority levels and categories</li>
                          <li>Assigned agents and departments</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Export</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Export and Share</h4>
                        <p className="text-sm text-muted-foreground">
                          Export ticket reports in PDF, Excel, or CSV format for further analysis or sharing with stakeholders.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Inventory Report */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">3. Inventory Report</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Stock</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Stock Level Monitoring</h4>
                        <p className="text-sm text-muted-foreground">
                          Track current inventory levels, low stock alerts, and product availability across all locations.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Usage</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Product Usage Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          Analyze which products are most frequently used in service tickets and plan inventory accordingly.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Trends</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Inventory Trends</h4>
                        <p className="text-sm text-muted-foreground">
                          View historical inventory data and trends to optimize stock management and reduce carrying costs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Performance Report */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">4. Performance Report</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Team</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Team Performance Metrics</h4>
                        <p className="text-sm text-muted-foreground">
                          Monitor individual and team performance including ticket resolution rates, response times, and customer satisfaction scores.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">KPIs</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Key Performance Indicators</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Track essential performance metrics:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Average resolution time</li>
                          <li>First contact resolution rate</li>
                          <li>Agent productivity and efficiency</li>
                          <li>Service quality ratings</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Goals</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Performance Goals</h4>
                        <p className="text-sm text-muted-foreground">
                          Set and track performance goals for individuals and teams to drive continuous improvement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Monthly Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">5. Monthly Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Overview</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Comprehensive Monthly Overview</h4>
                        <p className="text-sm text-muted-foreground">
                          Get a complete summary of monthly activities, achievements, and key performance indicators in one consolidated report.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Highlights</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Monthly Highlights</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          The monthly summary includes:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Total tickets processed and resolution rates</li>
                          <li>Revenue and financial performance</li>
                          <li>Customer satisfaction trends</li>
                          <li>Team performance achievements</li>
                          <li>Inventory usage and costs</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Schedule</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Automated Delivery</h4>
                        <p className="text-sm text-muted-foreground">
                          Schedule monthly summary reports to be automatically generated and delivered to stakeholders via email.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Regular Review</p>
                        <p className="text-sm text-muted-foreground">Review reports regularly to identify trends and make data-driven decisions.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Share Insights</p>
                        <p className="text-sm text-muted-foreground">Share key insights with team members to improve overall performance.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Set Benchmarks</p>
                        <p className="text-sm text-muted-foreground">Use historical data to set realistic performance benchmarks and goals.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Management Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card className="border" style={{ borderColor: '#e4e4e4' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Management
                </CardTitle>
                <CardDescription>
                  Learn how to manage products, inventory, and spare parts in the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Adding and Editing Products */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">1. Adding and Editing Products</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Add New</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Creating New Products</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          To add a new product to the system:
                        </p>
                        <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to Products in the sidebar</li>
                          <li>Click the "Add Product" button</li>
                          <li>Fill in the required product information:
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                              <li>Product name and unique code</li>
                              <li>Select category and brand</li>
                              <li>Set initial stock quantity</li>
                              <li>Enter cost price</li>
                            </ul>
                          </li>
                          <li>Click "Save Product" to create the product</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Edit</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Editing Existing Products</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          To modify existing product information:
                        </p>
                        <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Find the product in the products list</li>
                          <li>Click the edit icon (pencil) next to the product</li>
                          <li>Update the necessary fields</li>
                          <li>Click "Update Product" to save changes</li>
                        </ol>
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Product codes must be unique. The initial stock value is preserved for inventory tracking purposes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Search</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Finding Products</h4>
                        <p className="text-sm text-muted-foreground">
                          Use the search functionality to quickly find products by name, code, or description. The search works in real-time as you type.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Managing Product Categories */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">2. Managing Product Categories</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Setup</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Category Management</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Categories help organize products into logical groups for easier management:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to Settings → Categories to manage product categories</li>
                          <li>Create new categories with descriptive names</li>
                          <li>Categories can be associated with specific brands</li>
                          <li>Active/inactive status controls visibility in product forms</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Assign</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Assigning Categories</h4>
                        <p className="text-sm text-muted-foreground">
                          When creating or editing products, select the appropriate category from the dropdown. Categories help in filtering and organizing products for reporting and inventory management.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Filter</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Category-Based Filtering</h4>
                        <p className="text-sm text-muted-foreground">
                          Categories can be filtered by brand association, allowing for hierarchical organization of products based on brand and category combinations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tracking Inventory Levels */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">3. Tracking Inventory Levels</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Stock</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Current Stock Monitoring</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          The system tracks both initial stock and current stock levels:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li><strong>Initial Stock:</strong> Set when product is first created, used for reference</li>
                          <li><strong>Current Stock:</strong> Real-time quantity available for use</li>
                          <li><strong>Stock Usage:</strong> Automatically updated when products are used in tickets</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Updates</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Stock Level Updates</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Stock levels are updated automatically and manually:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li><strong>Automatic:</strong> Stock reduces when products are added to tickets</li>
                          <li><strong>Manual:</strong> Update stock levels directly in the product edit form</li>
                          <li><strong>Adjustments:</strong> Use increase/decrease stock functions for inventory adjustments</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Reports</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Inventory Reporting</h4>
                        <p className="text-sm text-muted-foreground">
                          Generate inventory reports to track stock levels, usage patterns, and identify low stock items. Reports can be filtered by branch, category, or brand.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Managing Spare Parts */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">4. Managing Spare Parts</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Setup</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Spare Parts as Products</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Spare parts are managed as regular products with specific characteristics:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Create spare parts products with descriptive names</li>
                          <li>Use specific categories for spare parts organization</li>
                          <li>Assign to appropriate brands for compatibility tracking</li>
                          <li>Set accurate cost prices for proper expense tracking</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Usage</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Spare Parts in Service Tickets</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          When working on service tickets:
                        </p>
                        <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to the ticket details page</li>
                          <li>Go to the "Spare Parts" section</li>
                          <li>Add required spare parts from the product inventory</li>
                          <li>Stock levels will automatically decrease when spare parts are used</li>
                          <li>Costs are tracked for accurate service pricing</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Track</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Spare Parts Tracking</h4>
                        <p className="text-sm text-muted-foreground">
                          Monitor spare parts usage through inventory reports to identify frequently used items and plan restocking accordingly. This helps maintain service efficiency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Product Pricing and Discounts */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">5. Product Pricing and Discounts</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Cost</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Cost Price Management</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Manage product costs effectively:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li><strong>Cost Price:</strong> Set the actual cost of the product for expense tracking</li>
                          <li><strong>Updates:</strong> Regularly update cost prices to reflect current market rates</li>
                          <li><strong>Reporting:</strong> Use cost data for profitability analysis and pricing decisions</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Service</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Service Pricing Integration</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Product costs integrate with service pricing:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Product costs are included in invoice calculations</li>
                          <li>Service charges can be calculated based on product usage</li>
                          <li>Total service cost includes both labor and product costs</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Badge className="mt-1">Discount</Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Discount Application</h4>
                        <p className="text-sm text-muted-foreground">
                          Discounts can be applied at the invoice level when creating bills for services that include products. This allows for flexible pricing based on customer relationships and service agreements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Consistent Naming</p>
                        <p className="text-sm text-muted-foreground">Use clear, consistent naming conventions for products and codes to improve searchability.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Regular Stock Audits</p>
                        <p className="text-sm text-muted-foreground">Perform regular physical stock audits to ensure system data matches actual inventory.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Category Organization</p>
                        <p className="text-sm text-muted-foreground">Organize products into logical categories and maintain brand associations for better management.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Cost Updates</p>
                        <p className="text-sm text-muted-foreground">Keep product costs up to date to ensure accurate pricing and profitability calculations.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Management Tab */}
          <TabsContent value="user-management" className="space-y-4">
            <Card className="border" style={{ borderColor: '#e4e4e4' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings Management
                </CardTitle>
                <CardDescription>
                  Learn how to manage all system settings, users, roles, and configurations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">

                  {/* 1. User Management */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">1. User Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Adding New Users</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to Settings → Users tab</li>
                          <li>Click the "Add User" button</li>
                          <li>Fill in required information: Name, Email, Department, Designation</li>
                          <li>Set password and confirm password</li>
                          <li>Select user role (Admin/Agent/Branch Admin/Manager)</li>
                          <li>Choose status (Active/Inactive)</li>
                          <li>Assign to appropriate branch</li>
                          <li>Click "Save" to create the user</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Managing Existing Users</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Use search function to find specific users</li>
                          <li>Filter by branch to view branch-specific users</li>
                          <li>Edit user details using the edit button</li>
                          <li>Reset user passwords from the actions menu</li>
                          <li>Change user status to activate/deactivate accounts</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 2. Role Management */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">2. Role Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Creating Custom Roles</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Go to Settings → Roles tab</li>
                          <li>Click "Add Role" button</li>
                          <li>Enter role name (e.g., "Senior Agent", "Supervisor")</li>
                          <li>Add role description for clarity</li>
                          <li>Click "Save" to create the role</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Managing Roles</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>View all existing roles in the roles table</li>
                          <li>Edit role names and descriptions as needed</li>
                          <li>Delete unused roles (ensure no users are assigned first)</li>
                          <li>Search roles using the search functionality</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 3. Branch Management */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">3. Branch Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Adding New Branches</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to Settings → Branches tab</li>
                          <li>Click "Add Branch" button</li>
                          <li>Enter branch name (e.g., "Downtown Office", "North Branch")</li>
                          <li>Click "Save" to create the branch</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Branch Administration</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Edit branch names when relocating or renaming</li>
                          <li>Delete branches that are no longer operational</li>
                          <li>Search branches using the search function</li>
                          <li>Monitor branch-specific user assignments</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 4. Brand Management */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">4. Brand Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Creating Brands</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Go to Settings → Brands tab</li>
                          <li>Click "Add Brand" button</li>
                          <li>Enter brand name (e.g., "Samsung", "Apple", "Dell")</li>
                          <li>Click "Save" to create the brand</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Brand Management</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Edit brand names for consistency</li>
                          <li>Delete unused brands (check for product associations first)</li>
                          <li>Search brands to quickly find specific manufacturers</li>
                          <li>Organize brands alphabetically for better user experience</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 5. Category Management */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">5. Category Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Adding Categories</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to Settings → Categories tab</li>
                          <li>Click "Add Category" button</li>
                          <li>Select the associated brand from dropdown</li>
                          <li>Enter category name (e.g., "Laptops", "Smartphones", "Accessories")</li>
                          <li>Click "Save" to create the category</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Category Organization</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Link categories to appropriate brands for better organization</li>
                          <li>Edit category names and brand associations</li>
                          <li>Delete unused categories (verify no products are assigned)</li>
                          <li>Use search to locate specific categories quickly</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 6. Department Management */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">6. Department Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Creating Departments</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Go to Settings → Departments tab</li>
                          <li>Click "Add Department" button</li>
                          <li>Enter department name (e.g., "IT Support", "Sales", "Customer Service")</li>
                          <li>Click "Save" to create the department</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Department Administration</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Edit department names when restructuring</li>
                          <li>Delete departments that are no longer needed</li>
                          <li>Search departments for quick access</li>
                          <li>Ensure users are reassigned before deleting departments</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 7. Designation Management */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">7. Designation Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Adding Designations</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to Settings → Designations tab</li>
                          <li>Click "Add Designation" button</li>
                          <li>Enter designation title (e.g., "Senior Technician", "Team Lead", "Manager")</li>
                          <li>Click "Save" to create the designation</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Designation Management</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Edit designation titles for accuracy</li>
                          <li>Delete unused designations (check user assignments first)</li>
                          <li>Search designations using the search feature</li>
                          <li>Organize designations by hierarchy level</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 8. Ticket Labels */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">8. Ticket Labels Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Creating Ticket Labels</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Go to Settings → Ticket Labels tab</li>
                          <li>Click "Add Label" button</li>
                          <li>Enter label name (e.g., "Hardware Issue", "Software Bug", "Network Problem")</li>
                          <li>Select label color for visual identification</li>
                          <li>Click "Save" to create the label</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Label Organization</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Use colors strategically (red for urgent, green for resolved, etc.)</li>
                          <li>Edit label names and colors as needed</li>
                          <li>Delete unused labels to avoid confusion</li>
                          <li>Search labels for quick management</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 9. Additional Fields */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">9. Additional Fields Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Creating Custom Fields</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to Settings → Additional Fields tab</li>
                          <li>Click "Add Field" button</li>
                          <li>Enter field title (display name)</li>
                          <li>Set field name (internal identifier)</li>
                          <li>Select field type (SELECT dropdown, Text input, Date picker)</li>
                          <li>For SELECT fields, add option values separated by commas</li>
                          <li>Click "Save" to create the custom field</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Field Management</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Edit field titles and types as requirements change</li>
                          <li>Update SELECT field options by editing values</li>
                          <li>Delete unused fields to keep forms clean</li>
                          <li>Search fields for quick access to specific custom fields</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 10. QR Codes */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">10. QR Code Management</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Generating QR Codes</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Go to Settings → QR Codes tab</li>
                          <li>Enter the URL or link you want to encode</li>
                          <li>Click "Generate QR Code" button</li>
                          <li>Preview the generated QR code</li>
                          <li>Download the QR code image for use</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">QR Code Applications</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Create QR codes for ticket submission forms</li>
                          <li>Generate codes for product documentation links</li>
                          <li>Link to customer portals or feedback forms</li>
                          <li>Use for quick access to frequently used system pages</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 11. Notification Settings */}
                  <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3">11. Notification Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Managing Message Templates</h4>
                        <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Navigate to Settings → Notification Settings tab</li>
                          <li>Click "Add Message Template" button</li>
                          <li>Select message type (Ticket Confirmation, Issue Completed, Item Delivered, Payment Confirmation)</li>
                          <li>Enter template name for identification</li>
                          <li>Configure WhatsApp API settings (API URL, Token, Secret Key)</li>
                          <li>Create template text with placeholders for dynamic content</li>
                          <li>Click "Save" to create the template</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Template Management</h4>
                        <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                          <li>Filter templates by message type for easy organization</li>
                          <li>Filter by status (Active/Inactive) to manage which templates are in use</li>
                          <li>Edit templates to update messaging or API configurations</li>
                          <li>Test templates before activating them</li>
                          <li>Deactivate outdated or unused templates</li>
                          <li>Search templates by name or type</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border" style={{ borderColor: '#e4e4e4' }}>
                    <h3 className="font-semibold text-base mb-3 text-blue-900">Best Practices for Settings Management</h3>
                    <ul className="list-disc pl-4 space-y-2 text-sm text-blue-800">
                      <li><strong>Regular Maintenance:</strong> Regularly review and clean up unused settings to maintain system performance</li>
                      <li><strong>Consistent Naming:</strong> Use clear, consistent naming conventions for all settings items</li>
                      <li><strong>User Training:</strong> Ensure team members understand their roles and permissions</li>
                      <li><strong>Backup Strategy:</strong> Document critical settings and configurations for backup purposes</li>
                      <li><strong>Access Control:</strong> Restrict settings access to authorized administrators only</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-4">
            <Card className="border" style={{ borderColor: '#e4e4e4' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Quick answers to common questions about using the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                      <h4 className="font-semibold text-sm mb-1">How do I reset my password?</h4>
                      <p className="text-sm text-muted-foreground">
                        Click on the "Forgot Password" link on the login page and follow the instructions sent to your email.
                      </p>
                    </div>
                    <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                      <h4 className="font-semibold text-sm mb-1">How can I export ticket data?</h4>
                      <p className="text-sm text-muted-foreground">
                        Navigate to Reports → Ticket Reports and click the "Export" button to download data in CSV or Excel format.
                      </p>
                    </div>
                    <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                      <h4 className="font-semibold text-sm mb-1">What are the different ticket priorities?</h4>
                      <p className="text-sm text-muted-foreground">
                        Tickets can have Low, Medium, High, or Urgent priority. Urgent tickets are highlighted and should be addressed immediately.
                      </p>
                    </div>
                    <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                      <h4 className="font-semibold text-sm mb-1">How do I assign multiple agents to a ticket?</h4>
                      <p className="text-sm text-muted-foreground">
                        Open the ticket details, click on "Assign Agents" and select multiple team members from the dropdown list.
                      </p>
                    </div>
                    <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                      <h4 className="font-semibold text-sm mb-1">Can I customize ticket statuses?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, administrators can add custom ticket statuses from Settings → Ticket Settings → Status Management.
                      </p>
                    </div>
                    <div className="border-l-4 pl-4" style={{ borderLeftColor: '#e4e4e4' }}>
                      <h4 className="font-semibold text-sm mb-1">How do I generate an invoice from a ticket?</h4>
                      <p className="text-sm text-muted-foreground">
                        In the ticket details page, click the "Create Invoice" button and fill in the required billing information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}