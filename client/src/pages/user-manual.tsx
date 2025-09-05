import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Link } from "wouter";
import { 
  BookOpen, ChevronDown, ChevronUp, Home, CheckSquare, Users, 
  FileText, Mail, Clock, BarChart3, Zap, FolderOpen, Settings,
  Plus, AlertTriangle, Calendar, Folder, Upload, Download,
  Palette, PenTool, Megaphone, Copy, CreditCard
} from "lucide-react";

export default function UserManual() {
  const [openSections, setOpenSections] = useState<string[]>(['getting-started']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const features = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Home className="h-5 w-5 text-blue-600" />,
      description: 'Basic setup and navigation',
      content: {
        overview: 'Gigster Garage is your simplified workflow hub for comprehensive task management, client relations, and business operations.',
        sections: [
          {
            title: 'Dashboard Overview',
            content: 'The dashboard provides an at-a-glance view of your critical tasks, project status, and quick actions. Key metrics include overdue tasks, due soon alerts, high priority items, and daily completions.'
          },
          {
            title: 'Navigation',
            content: 'Access all features through the top navigation bar. The dashboard serves as your central hub with quick access cards to all major functions.'
          },
          {
            title: 'Quick Actions',
            content: 'Use the "New Task" button to quickly create tasks from anywhere in the application. The collapsible task form provides full task creation capabilities.'
          }
        ],
        tips: [
          'Start each day by reviewing your dashboard metrics',
          'Use the "New Task" button for quick task entry',
          'Click on metric cards to filter and view specific task groups'
        ]
      }
    },
    {
      id: 'task-management',
      title: 'Task Management',
      icon: <CheckSquare className="h-5 w-5 text-green-600" />,
      description: 'Create, manage, and track tasks',
      content: {
        overview: 'Comprehensive task management with priorities, due dates, assignments, progress tracking, and rich attachments.',
        sections: [
          {
            title: 'Creating Tasks',
            content: 'Create tasks using the "New Task" button or form. Include title, description, due date/time, priority level, project assignment, and assignee. Add notes, file attachments, and URL links for complete task context.'
          },
          {
            title: 'Task Priorities & Status',
            content: 'Set priority levels (Low, Normal, High) and status (Active, In Progress, Completed, Critical). Status badges provide visual indicators for quick identification.'
          },
          {
            title: 'Due Dates & Reminders',
            content: 'Set specific due dates and times. The system provides automated reminders: yellow notifications 24 hours before due date, red urgent notifications 1 hour before due date.'
          },
          {
            title: 'Task Relationships',
            content: 'Create parent-child task hierarchies with subtasks. The system prevents circular dependencies and maintains proper task relationships.'
          },
          {
            title: 'Progress Tracking',
            content: 'Add progress notes with timestamps and comments to track task advancement. View progress history for accountability and review.'
          }
        ],
        tips: [
          'Use High priority for urgent items that need immediate attention',
          'Add detailed descriptions to provide context for assignees',
          'Set realistic due dates and times for better planning',
          'Use progress notes to document milestones and updates',
          'Attach relevant files directly to tasks for easy access'
        ]
      }
    },
    {
      id: 'project-organization',
      title: 'Project Organization',
      icon: <Folder className="h-5 w-5 text-purple-600" />,
      description: 'Organize tasks by projects',
      content: {
        overview: 'Group related tasks into projects for better organization and tracking. Each project provides comprehensive views and progress monitoring.',
        sections: [
          {
            title: 'Project Creation',
            content: 'Create projects from the dropdown in task forms or through the project management interface. Projects automatically organize related tasks and provide progress tracking.'
          },
          {
            title: 'Project Dashboard',
            content: 'Each project has a dedicated dashboard showing outstanding tasks, critical items, overdue tasks, and overall progress percentage. Visual progress bars indicate completion status.'
          },
          {
            title: 'Project Views',
            content: 'View projects in multiple formats: Kanban boards for workflow visualization, Timeline/Gantt charts for scheduling, and List view for detailed task management.'
          },
          {
            title: 'Project Status',
            content: 'Projects can be marked as Active, Completed, On-Hold, or Cancelled. Status affects visibility and reporting.'
          }
        ],
        tips: [
          'Group related tasks into projects for better organization',
          'Use project dashboards to monitor overall progress',
          'Set project status appropriately to manage workflows',
          'Review project progress regularly through the dashboard cards'
        ]
      }
    },
    {
      id: 'client-management',
      title: 'Client Management',
      icon: <Users className="h-5 w-5 text-indigo-600" />,
      description: 'Manage client relationships',
      content: {
        overview: 'Comprehensive client relationship management with contact information, communication history, and project associations.',
        sections: [
          {
            title: 'Client Profiles',
            content: 'Create detailed client profiles with contact information, company details, and relationship notes. Track client history and interactions.'
          },
          {
            title: 'Client Communication',
            content: 'Track all client communications, including emails, calls, and meetings. Maintain a comprehensive history for reference and follow-up.'
          },
          {
            title: 'Project Associations',
            content: 'Link clients to specific projects and tasks. View client-specific project progress and deliverables.'
          }
        ],
        tips: [
          'Keep client contact information up to date',
          'Log all significant client interactions',
          'Review client history before meetings or calls'
        ]
      }
    },
    {
      id: 'messages-email',
      title: 'Messages & Email',
      icon: <Mail className="h-5 w-5 text-blue-600" />,
      description: 'Email communication system',
      content: {
        overview: 'Integrated email system for client communication with both outbound sending and inbound processing capabilities.',
        sections: [
          {
            title: 'Sending Messages',
            content: 'Send professional emails directly from the application. Compose messages with rich formatting, attach files, and maintain communication records.'
          },
          {
            title: 'Inbound Email Processing',
            content: 'Receive emails through SendGrid integration. Configure your domain to forward emails to the system for centralized communication management.'
          },
          {
            title: 'Email Templates',
            content: 'Use pre-built templates for common communications like project updates, invoice notifications, and follow-up messages.'
          },
          {
            title: 'Communication History',
            content: 'All email communications are automatically logged and associated with clients and projects for complete visibility.'
          }
        ],
        tips: [
          'Use professional email templates for consistency',
          'Configure inbound email forwarding for centralized management',
          'Review communication history before client interactions',
          'Keep email subject lines clear and descriptive'
        ]
      }
    },
    {
      id: 'invoicing',
      title: 'Invoicing System',
      icon: <FileText className="h-5 w-5 text-green-600" />,
      description: 'Create and manage invoices',
      content: {
        overview: 'Professional invoicing system with draft functionality, approval workflows, and automated email delivery.',
        sections: [
          {
            title: 'Invoice Creation',
            content: 'Create professional invoices with client information, itemized services, rates, and totals. Include company branding and payment terms.'
          },
          {
            title: 'Draft System',
            content: 'Save invoices as drafts for review and approval before sending. Edit drafts until ready for final delivery to clients.'
          },
          {
            title: 'Hour Approval',
            content: 'Review and approve tracked hours before including them in invoices. Ensure accuracy and completeness of billable time.'
          },
          {
            title: 'Invoice Delivery',
            content: 'Send invoices directly to clients via email with professional formatting. Track delivery status and payment reminders.'
          }
        ],
        tips: [
          'Review all invoice details before sending to clients',
          'Use the draft system for internal approval processes',
          'Include clear payment terms and due dates',
          'Track invoice status for follow-up actions',
          'Tip: Invoices integrate with your Client Management system. If no client profile exists for the invoice recipient, one will be automatically created using the client information from the invoice'
        ]
      }
    },
    {
      id: 'proposals',
      title: 'Proposal System',
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      description: 'Create and manage client proposals',
      content: {
        overview: 'Professional proposal creation system with template support, automated client management, and streamlined approval workflows.',
        sections: [
          {
            title: 'Proposal Creation',
            content: 'Create professional proposals using templates or direct input. Include project details, timeline, deliverables, pricing, and terms & conditions for comprehensive client presentations.'
          },
          {
            title: 'Template-Based Proposals',
            content: 'Use pre-built templates to quickly generate proposals. Templates streamline the creation process and ensure consistency across client communications.'
          },
          {
            title: 'Direct Proposal Creation',
            content: 'Create proposals from scratch with custom content, line items, pricing calculations, and personalized terms. Full control over proposal structure and content.'
          },
          {
            title: 'Client Integration',
            content: 'Proposals automatically integrate with your client management system. If a client profile doesn\'t exist, the system will create one automatically when generating proposals.'
          },
          {
            title: 'Proposal Delivery',
            content: 'Send proposals directly to clients via email with professional formatting. Track proposal status and manage follow-up communications.'
          }
        ],
        tips: [
          'Use templates for faster proposal creation and consistency',
          'Include detailed project descriptions and clear timelines',
          'Set appropriate expiration dates for proposals',
          'Tip: Creating a proposal will automatically create a Client Profile if none exists for the provided email address',
          'Review all pricing calculations before sending to clients'
        ]
      }
    },
    {
      id: 'time-tracking',
      title: 'Time Tracking & Productivity',
      icon: <Clock className="h-5 w-5 text-orange-600" />,
      description: 'Track time and productivity metrics',
      content: {
        overview: 'Comprehensive time tracking with project association, productivity insights, and billing integration.',
        sections: [
          {
            title: 'Time Entry',
            content: 'Log time spent on tasks and projects with detailed descriptions. Start/stop timers or manually enter time blocks.'
          },
          {
            title: 'Project Time Allocation',
            content: 'Associate time entries with specific projects and tasks. Track time distribution across different work areas.'
          },
          {
            title: 'Productivity Reports',
            content: 'Generate reports showing time utilization, project progress, and productivity trends. Identify areas for improvement.'
          },
          {
            title: 'Billable Hours',
            content: 'Mark time entries as billable or non-billable. Export billable hours for invoice creation and client billing.'
          }
        ],
        tips: [
          'Log time consistently for accurate tracking',
          'Use descriptive notes for time entries',
          'Review time reports weekly for productivity insights',
          'Mark billable status accurately for proper invoicing'
        ]
      }
    },
    {
      id: 'agency-hub',
      title: 'Agency Hub - AI Marketing Tools',
      icon: <Zap className="h-5 w-5 text-purple-600" />,
      description: 'AI-powered marketing and creative tools',
      content: {
        overview: 'Advanced AI-powered marketing tools for content creation, copywriting, advertising strategy, and analytics.',
        sections: [
          {
            title: 'Create Tool - Marketing Mockups',
            content: 'Generate detailed marketing concepts and visual mockups using AI. Create both written marketing concepts and actual AI-generated images for campaigns, social media posts, and promotional materials.'
          },
          {
            title: 'Write Tool - Creative Copy',
            content: 'Generate professional marketing copy, press releases, presentations, and advertising content. AI creates compelling, persuasive content tailored to your specific needs.'
          },
          {
            title: 'Promote Tool - Advertising Strategy',
            content: 'Develop comprehensive advertising strategies with specific recommendations for platforms, budgets, targeting, and campaign structures. Get actionable marketing plans.'
          },
          {
            title: 'Track Tool - Marketing Analytics',
            content: 'Analyze marketing data and campaign performance. Get actionable insights, recommendations, and performance assessments from AI analysis.'
          },
          {
            title: 'Using Generated Content',
            content: 'All generated content can be copied to clipboard, downloaded, or saved for later use. Images can be viewed full-size and downloaded in high quality.'
          }
        ],
        tips: [
          'Provide detailed prompts for better AI-generated results',
          'Use the Create tool for both concepts and actual visuals',
          'Save generated content for reuse and refinement',
          'Combine different tools for comprehensive marketing campaigns',
          'Wait between image generations if you hit rate limits'
        ]
      }
    },
    {
      id: 'filing-cabinet',
      title: 'Filing Cabinet',
      icon: <FolderOpen className="h-5 w-5 text-gray-600" />,
      description: 'Organize files and documents',
      content: {
        overview: 'Centralized document management system for organizing all business files, contracts, proposals, and client documents.',
        sections: [
          {
            title: 'Document Organization',
            content: 'Create folders and categories to organize all business documents. Maintain a structured filing system for easy retrieval.'
          },
          {
            title: 'File Upload & Storage',
            content: 'Upload files of various formats including documents, images, spreadsheets, and presentations. Secure cloud storage ensures accessibility.'
          },
          {
            title: 'Search & Retrieval',
            content: 'Quickly find documents using search functionality. Filter by file type, date, or category for efficient document management.'
          },
          {
            title: 'Access Control',
            content: 'Manage document access permissions for team members and clients. Control who can view, edit, or download specific documents.'
          }
        ],
        tips: [
          'Create a consistent folder structure for organization',
          'Use descriptive file names for easy identification',
          'Regularly review and archive old documents',
          'Set appropriate access permissions for sensitive files'
        ]
      }
    },
    {
      id: 'admin-features',
      title: 'Admin Features',
      icon: <Settings className="h-5 w-5 text-red-600" />,
      description: 'Administrative tools and user management',
      content: {
        overview: 'Administrative tools for user management, system configuration, and oversight of all platform activities.',
        sections: [
          {
            title: 'User Management',
            content: 'Create and manage user accounts with different role assignments (Admin/User). Control access levels and permissions for team members.'
          },
          {
            title: 'Admin Dashboard',
            content: 'Comprehensive view of all users and their assigned tasks. Monitor system-wide activity and task assignments.'
          },
          {
            title: 'System Configuration',
            content: 'Configure system settings, notification preferences, and integration parameters. Manage API keys and external service connections.'
          },
          {
            title: 'User Onboarding',
            content: 'Manage new user signup process and collect notification preferences including email and SMS opt-in settings.'
          }
        ],
        tips: [
          'Review user permissions regularly for security',
          'Monitor admin dashboard for system oversight',
          'Keep system configurations up to date',
          'Ensure proper user onboarding for new team members'
        ]
      }
    },
    {
      id: 'notifications',
      title: 'Notifications & Reminders',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      description: 'Stay informed with automated notifications',
      content: {
        overview: 'Comprehensive notification system with email, SMS, and browser alerts to keep you informed of important deadlines and updates.',
        sections: [
          {
            title: 'Email Notifications',
            content: 'Receive email alerts for high priority tasks, due date reminders, and system updates. Emails include complete task details and direct links to the application.'
          },
          {
            title: 'SMS Notifications',
            content: 'Get text message alerts for critical deadlines and urgent tasks. Configure SMS preferences during onboarding or in user settings.'
          },
          {
            title: 'Browser Notifications',
            content: 'Real-time browser notifications for immediate alerts while using the application. Visual indicators for due and overdue tasks.'
          },
          {
            title: 'Reminder Schedule',
            content: 'Automated reminders sent 24 hours and 1 hour before due dates. Color-coded alerts (yellow for 24-hour, red for 1-hour) indicate urgency levels.'
          }
        ],
        tips: [
          'Configure notification preferences during initial setup',
          'Enable browser notifications for real-time alerts',
          'Review notification settings regularly',
          'Ensure contact information is up to date for delivery'
        ]
      }
    },
    {
      id: 'file-storage',
      title: 'File Storage & Documents',
      icon: <FileText className="h-5 w-5 text-indigo-600" />,
      description: 'Secure file storage and document management',
      content: {
        overview: 'Comprehensive file storage capabilities with secure cloud storage, automatic access controls, and seamless integration with tasks, projects, and client management.',
        sections: [
          {
            title: 'Security Features',
            content: 'All files are protected with secure presigned URL uploads, automatic access control policies, private file protection, and user-based permissions. Files are encrypted and backed up automatically.'
          },
          {
            title: 'File Upload Capabilities',  
            content: 'Support for all file types up to 10MB per file. Multiple file uploads with real-time progress tracking. Files are automatically organized and categorized based on context.'
          },
          {
            title: 'Organization System',
            content: 'Filing Cabinet serves as central repository for client documents. Task attachments for project files. Project-specific document spaces. Client document organization with filtering and search.'
          },
          {
            title: 'Access Control',
            content: 'Private files accessible only to authorized users. Public files shareable via secure links. Client-specific documents automatically protected. Role-based access controls.'
          },
          {
            title: 'How to Upload Files',
            content: '1. Navigate to relevant section (Tasks, Projects, Filing Cabinet) 2. Click upload button to open file modal 3. Drag and drop or select files 4. Monitor upload progress 5. Files automatically secured with proper permissions'
          }
        ],
        tips: [
          'Use descriptive file names for easy identification',
          'Organize files by client or project for better management', 
          'Upload files directly to tasks/projects for context',
          'All files are automatically backed up and secured',
          'Large files are optimized for fast loading'
        ]
      }
    },
    {
      id: 'payment-tracking',
      title: 'Payment Tracking & Management',
      icon: <CreditCard className="h-5 w-5 text-green-600" />,
      description: 'Comprehensive payment recording and invoice management',
      content: {
        overview: 'Advanced payment tracking system that automatically updates invoice statuses, calculates balances, and provides detailed payment history for complete financial management.',
        sections: [
          {
            title: 'Payment Recording Features',
            content: 'Record payments with multiple payment methods (Cash, Check, Credit Card, Bank Transfer, PayPal, Stripe). Automatic invoice balance calculations and status updates. Deposit tracking and partial payment support.'
          },
          {
            title: 'Invoice Integration',
            content: 'Payments automatically link to invoices and update paid amounts. Real-time balance calculations showing total due vs. paid. Automatic status changes from draft → sent → paid based on payment completion.'
          },
          {
            title: 'Payment Methods Supported',
            content: 'Cash payments for in-person transactions. Check payments with reference tracking. Credit card processing integration. Bank transfers with transaction IDs. PayPal and Stripe online payments. Custom payment methods as needed.'
          },
          {
            title: 'Reporting & Analytics',
            content: 'Total payment summaries across all invoices. Monthly payment tracking and trends. Deposit vs. final payment analysis. Average payment amounts and timing. Payment method usage statistics.'
          },
          {
            title: 'How to Record Payments',
            content: '1. Navigate to Payments page or Invoice Details 2. Click "Record Payment" button 3. Enter payment amount and date 4. Select payment method and add reference 5. Link to specific invoice (optional) 6. Mark as deposit if applicable 7. Add notes for context 8. Invoice status updates automatically'
          },
          {
            title: 'Payment History & Search',
            content: 'Complete payment history with client and invoice links. Search by amount, reference, client name, or payment method. Filter by payment method or date range. Export payment data for accounting. Quick access from invoice details pages.'
          }
        ],
        tips: [
          'Record payments immediately to keep accurate balances',
          'Use reference numbers (check #, transaction ID) for tracking',
          'Mark partial payments as deposits for clarity',
          'Link payments to invoices for automatic status updates',
          'Search payment history by client name or invoice number',
          'Use notes field for important payment context',
          'Review monthly payment summaries for cash flow analysis'
        ]
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Manual</h1>
                <p className="text-gray-600">Complete guide to Gigster Garage features and functionality</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-dashboard">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {features.map((feature) => (
                <Button
                  key={feature.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const element = document.getElementById(feature.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="justify-start h-auto py-3 px-4"
                  data-testid={`nav-${feature.id}`}
                >
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <span className="text-sm font-medium">{feature.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Sections */}
        <div className="space-y-6">
          {features.map((feature) => (
            <div key={feature.id} id={feature.id}>
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <Collapsible 
                    open={openSections.includes(feature.id)} 
                    onOpenChange={() => toggleSection(feature.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-6 -my-4 px-6 py-4 rounded-lg">
                        <div className="flex items-center gap-4">
                          {feature.icon}
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {feature.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                          </div>
                        </div>
                        {openSections.includes(feature.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                  </Collapsible>
                </CardHeader>
                
                <Collapsible 
                  open={openSections.includes(feature.id)}
                  onOpenChange={() => toggleSection(feature.id)}
                >
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-6">
                        {/* Overview */}
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-l-blue-400">
                          <h4 className="font-semibold text-blue-900 mb-2">Overview</h4>
                          <p className="text-blue-800">{feature.content.overview}</p>
                        </div>

                        {/* Detailed Sections */}
                        <div className="space-y-4">
                          {feature.content.sections.map((section, index) => (
                            <div key={index} className="border-l-2 border-gray-200 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{section.title}</h4>
                              <p className="text-gray-700 leading-relaxed">{section.content}</p>
                            </div>
                          ))}
                        </div>

                        {/* Tips */}
                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-l-green-400">
                          <h4 className="font-semibold text-green-900 mb-3">💡 Helpful Tips</h4>
                          <ul className="space-y-1">
                            {feature.content.tips.map((tip, index) => (
                              <li key={index} className="text-green-800 flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Getting Help</h4>
                <p className="text-gray-600 mb-3">If you need additional assistance:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Review the relevant feature section above</li>
                  <li>• Check notification settings for system alerts</li>
                  <li>• Ensure all required fields are completed</li>
                  <li>• Contact your system administrator for access issues</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Best Practices</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Review your dashboard daily for task updates</li>
                  <li>• Set realistic due dates and priorities</li>
                  <li>• Keep client information up to date</li>
                  <li>• Regularly organize files in the Filing Cabinet</li>
                  <li>• Use project organization for better workflow</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-testid="button-back-to-top"
          >
            Back to Top
          </Button>
        </div>
      </main>
    </div>
  );
}