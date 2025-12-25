import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type TranslationKeys = {
  // Navigation & Header
  dashboard: string;
  settings: string;
  messages: string;
  tasks: string;
  home: string;
  logout: string;
  search: string;
  searchPlaceholder: string;
  
  // Common actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  add: string;
  remove: string;
  submit: string;
  close: string;
  confirm: string;
  tools: string;
  back: string;
  next: string;
  previous: string;
  finish: string;
  loading: string;
  saving: string;
  deleting: string;
  updating: string;
  yes: string;
  no: string;
  ok: string;
  apply: string;
  reset: string;
  clear: string;
  refresh: string;
  retry: string;
  view: string;
  download: string;
  upload: string;
  export: string;
  import: string;
  duplicate: string;
  archive: string;
  restore: string;
  
  // Settings page
  settingsTitle: string;
  settingsDescription: string;
  account: string;
  notifications: string;
  appearance: string;
  integrations: string;
  data: string;
  preferences: string;
  language: string;
  languageDescription: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  savePreferences: string;
  preferencesSaved: string;
  profile: string;
  security: string;
  privacy: string;
  billing: string;
  
  // Dashboard
  myDashboard: string;
  welcomeMessage: string;
  overdue: string;
  dueSoon: string;
  highPriority: string;
  completedToday: string;
  timeTracking: string;
  
  // Dashboard cards
  clientManagement: string;
  clientManagementDesc: string;
  messagesDesc: string;
  createProposal: string;
  createProposalDesc: string;
  createInvoice: string;
  createInvoiceDesc: string;
  createContract: string;
  createContractDesc: string;
  createPresentation: string;
  createPresentationDesc: string;
  productivityTools: string;
  productivityToolsDesc: string;
  agencyHub: string;
  agencyHubDesc: string;
  filingCabinet: string;
  filingCabinetDesc: string;
  
  // Dashboard buttons
  agentManagement: string;
  analyticsDashboard: string;
  userManual: string;
  sparkNewTask: string;
  
  // Tooltips
  overdueTooltip: string;
  dueSoonTooltip: string;
  highPriorityTooltip: string;
  completedTodayTooltip: string;
  timeTrackingTooltip: string;
  clientManagementTooltip: string;
  messagesTooltip: string;
  createProposalTooltip: string;
  createInvoiceTooltip: string;
  createContractTooltip: string;
  createPresentationTooltip: string;
  productivityToolsTooltip: string;
  agencyHubTooltip: string;
  filingCabinetTooltip: string;
  
  // Projects section
  projectFolders: string;
  activeProjects: string;
  noProjects: string;
  createFirstProject: string;
  tasksCompleted: string;
  outstandingItems: string;
  projects: string;
  newProject: string;
  projectName: string;
  projectDescription: string;
  projectDetails: string;
  projectSettings: string;
  projectMembers: string;
  
  // Tasks section
  allTasks: string;
  activeTasks: string;
  completedTasks: string;
  assignedTo: string;
  everyone: string;
  newTask: string;
  taskName: string;
  taskDescription: string;
  taskDetails: string;
  taskPriority: string;
  taskStatus: string;
  dueDate: string;
  startDate: string;
  endDate: string;
  priority: string;
  status: string;
  assignee: string;
  completed: string;
  inProgress: string;
  pending: string;
  notStarted: string;
  onHold: string;
  cancelled: string;
  low: string;
  medium: string;
  high: string;
  urgent: string;
  none: string;
  
  // Task Modal
  taskDetailTitle: string;
  taskDetailDescription: string;
  progressNotes: string;
  addProgressNote: string;
  progressDate: string;
  progressComment: string;
  attachments: string;
  addAttachment: string;
  comments: string;
  addComment: string;
  activity: string;
  activityFeed: string;
  markComplete: string;
  markIncomplete: string;
  reopenTask: string;
  deleteTask: string;
  deleteTaskConfirm: string;
  taskCompleted: string;
  taskReopened: string;
  progressUpdated: string;
  progressAdded: string;
  noAttachments: string;
  noComments: string;
  noActivity: string;
  noProgressNotes: string;
  writeComment: string;
  
  // Common labels
  admin: string;
  user: string;
  client: string;
  project: string;
  invoice: string;
  proposal: string;
  contract: string;
  
  // Form labels
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  company: string;
  website: string;
  notes: string;
  description: string;
  title: string;
  amount: string;
  quantity: string;
  rate: string;
  total: string;
  subtotal: string;
  tax: string;
  discount: string;
  date: string;
  time: string;
  type: string;
  category: string;
  tags: string;
  
  // Client management
  clients: string;
  newClient: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  clientAddress: string;
  clientDetails: string;
  clientHistory: string;
  clientProjects: string;
  clientInvoices: string;
  noClients: string;
  addClient: string;
  editClient: string;
  deleteClient: string;
  deleteClientConfirm: string;
  clientAdded: string;
  clientUpdated: string;
  clientDeleted: string;
  contactInfo: string;
  billingInfo: string;
  
  // Messages
  inbox: string;
  sent: string;
  drafts: string;
  trash: string;
  compose: string;
  reply: string;
  replyAll: string;
  forward: string;
  sendMessage: string;
  newMessage: string;
  to: string;
  from: string;
  subject: string;
  message: string;
  attachFile: string;
  noMessages: string;
  messageSent: string;
  messageDeleted: string;
  
  // Invoices
  invoices: string;
  newInvoice: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueAmount: string;
  paidAmount: string;
  outstanding: string;
  invoiceStatus: string;
  draft: string;
  invoiceSent: string;
  paid: string;
  overdueLower: string;
  partiallyPaid: string;
  voided: string;
  lineItems: string;
  addLineItem: string;
  removeLineItem: string;
  paymentTerms: string;
  invoiceNotes: string;
  sendInvoice: string;
  markAsPaid: string;
  
  // Proposals
  proposals: string;
  newProposalBtn: string;
  proposalTitle: string;
  proposalScope: string;
  proposalTimeline: string;
  proposalBudget: string;
  proposalStatus: string;
  accepted: string;
  rejected: string;
  proposalSent: string;
  
  // Contracts
  contracts: string;
  newContractBtn: string;
  contractTitle: string;
  contractTerms: string;
  contractStartDate: string;
  contractEndDate: string;
  contractValue: string;
  contractStatus: string;
  active: string;
  expired: string;
  terminated: string;
  
  // Dialogs & Modals
  confirmDelete: string;
  confirmDeleteMessage: string;
  confirmAction: string;
  unsavedChanges: string;
  unsavedChangesMessage: string;
  discardChanges: string;
  keepEditing: string;
  areYouSure: string;
  cannotUndo: string;
  
  // Tabs
  overview: string;
  details: string;
  history: string;
  files: string;
  team: string;
  analytics: string;
  reports: string;
  
  // Empty states
  noData: string;
  noResults: string;
  noItemsFound: string;
  getStarted: string;
  
  // Errors
  error: string;
  errorOccurred: string;
  tryAgain: string;
  somethingWentWrong: string;
  pageNotFound: string;
  unauthorized: string;
  forbidden: string;
  
  // Success messages
  success: string;
  savedSuccessfully: string;
  deletedSuccessfully: string;
  updatedSuccessfully: string;
  createdSuccessfully: string;
  
  // Validation
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  minLength: string;
  maxLength: string;
  invalidFormat: string;
  
  // Tagline
  tagline: string;
  
  // Filing Cabinet
  documents: string;
  folders: string;
  allDocuments: string;
  recentDocuments: string;
  sharedWithMe: string;
  myDocuments: string;
  createFolder: string;
  uploadDocument: string;
  folderName: string;
  documentName: string;
  lastModified: string;
  fileSize: string;
  fileType: string;
  
  // Time tracking
  startTimer: string;
  stopTimer: string;
  pauseTimer: string;
  resumeTimer: string;
  timerRunning: string;
  timeEntry: string;
  timeEntries: string;
  hoursLogged: string;
  todayHours: string;
  weekHours: string;
  monthHours: string;
  
  // Search & Filter
  searchResults: string;
  filter: string;
  sortBy: string;
  ascending: string;
  descending: string;
  newest: string;
  oldest: string;
  alphabetical: string;
  
  // Dates
  today: string;
  yesterday: string;
  tomorrow: string;
  thisWeek: string;
  lastWeek: string;
  thisMonth: string;
  lastMonth: string;
  custom: string;
  selectDate: string;
  selectDateRange: string;
};

const translations: Record<string, TranslationKeys> = {
  en: {
    dashboard: "Dashboard",
    settings: "Settings",
    messages: "Messages",
    tasks: "Tasks",
    home: "Home",
    logout: "Logout",
    search: "Search",
    searchPlaceholder: "Search tasks, projects, clients...",
    
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    add: "Add",
    remove: "Remove",
    submit: "Submit",
    close: "Close",
    confirm: "Confirm",
    tools: "Tools",
    back: "Back",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    loading: "Loading...",
    saving: "Saving...",
    deleting: "Deleting...",
    updating: "Updating...",
    yes: "Yes",
    no: "No",
    ok: "OK",
    apply: "Apply",
    reset: "Reset",
    clear: "Clear",
    refresh: "Refresh",
    retry: "Retry",
    view: "View",
    download: "Download",
    upload: "Upload",
    export: "Export",
    import: "Import",
    duplicate: "Duplicate",
    archive: "Archive",
    restore: "Restore",
    
    settingsTitle: "Settings",
    settingsDescription: "Manage your account settings and preferences",
    account: "Account",
    notifications: "Notifications",
    appearance: "Appearance",
    integrations: "Integrations",
    data: "Data",
    preferences: "Preferences",
    language: "Language",
    languageDescription: "Choose your preferred display language",
    timezone: "Timezone",
    dateFormat: "Date Format",
    timeFormat: "Time Format",
    savePreferences: "Save Preferences",
    preferencesSaved: "Your preferences have been updated",
    profile: "Profile",
    security: "Security",
    privacy: "Privacy",
    billing: "Billing",
    
    myDashboard: "My Dashboard",
    welcomeMessage: "Welcome back! Here's what's happening with your tasks and projects.",
    overdue: "Overdue",
    dueSoon: "Due Soon",
    highPriority: "High Priority",
    completedToday: "Completed Today",
    timeTracking: "Time Tracking",
    
    clientManagement: "Client Management",
    clientManagementDesc: "Manage client relationships & history",
    messagesDesc: "Client communication",
    createProposal: "Create Proposal",
    createProposalDesc: "Professional project proposals",
    createInvoice: "Create Invoice",
    createInvoiceDesc: "Professional billing & invoices",
    createContract: "Create Contract",
    createContractDesc: "Legal agreements & terms",
    createPresentation: "Create Presentation",
    createPresentationDesc: "Slide decks & presentations",
    productivityTools: "Productivity Tools",
    productivityToolsDesc: "Time tracking & insights",
    agencyHub: "Agency Hub",
    agencyHubDesc: "AI-powered marketing tools",
    filingCabinet: "Filing Cabinet",
    filingCabinetDesc: "Document storage & organization",
    
    agentManagement: "Agent Management",
    analyticsDashboard: "Analytics Dashboard",
    userManual: "User Manual",
    sparkNewTask: "Spark New Task",
    
    overdueTooltip: "Tasks that are past their due date. Click to view and take action on overdue items.",
    dueSoonTooltip: "Tasks due within the next 24 hours. Click to review upcoming deadlines.",
    highPriorityTooltip: "Tasks marked as high priority that need immediate attention. Click to view all high priority items.",
    completedTodayTooltip: "Tasks you've completed today. Great job! Click to review your daily accomplishments.",
    timeTrackingTooltip: "Access time tracking tools and productivity insights to monitor your work patterns and efficiency.",
    clientManagementTooltip: "Manage client profiles, contact information, and relationship history for better client service.",
    messagesTooltip: "Send and receive professional emails with clients. Integrated communication system for streamlined correspondence.",
    createProposalTooltip: "Create professional project proposals with detailed scope, timeline, and pricing information for clients.",
    createInvoiceTooltip: "Generate professional invoices with itemized services, rates, and payment terms. Includes draft system for approval workflows.",
    createContractTooltip: "Draft and manage legal contracts with terms, conditions, and signature tracking. Professional agreement management.",
    createPresentationTooltip: "Create professional slide presentations for client meetings, proposals, and project updates.",
    productivityToolsTooltip: "Track time spent on tasks and projects. Monitor productivity patterns and generate insightful reports for better time management.",
    agencyHubTooltip: "Access AI-powered marketing tools including content creation, image generation, copywriting, and campaign strategy development.",
    filingCabinetTooltip: "Store and organize all your documents in one place. Easy access to contracts, invoices, and project files.",
    
    projectFolders: "Project Folders",
    activeProjects: "Active Projects",
    noProjects: "No projects yet",
    createFirstProject: "Create your first project to get started",
    tasksCompleted: "tasks completed",
    outstandingItems: "outstanding items",
    projects: "Projects",
    newProject: "New Project",
    projectName: "Project Name",
    projectDescription: "Project Description",
    projectDetails: "Project Details",
    projectSettings: "Project Settings",
    projectMembers: "Project Members",
    
    allTasks: "All",
    activeTasks: "Active",
    completedTasks: "Completed",
    assignedTo: "Assigned to",
    everyone: "Everyone",
    newTask: "New Task",
    taskName: "Task Name",
    taskDescription: "Task Description",
    taskDetails: "Task Details",
    taskPriority: "Task Priority",
    taskStatus: "Task Status",
    dueDate: "Due Date",
    startDate: "Start Date",
    endDate: "End Date",
    priority: "Priority",
    status: "Status",
    assignee: "Assignee",
    completed: "Completed",
    inProgress: "In Progress",
    pending: "Pending",
    notStarted: "Not Started",
    onHold: "On Hold",
    cancelled: "Cancelled",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    none: "None",
    
    taskDetailTitle: "Task Details",
    taskDetailDescription: "View and manage task information",
    progressNotes: "Progress Notes",
    addProgressNote: "Add Progress Note",
    progressDate: "Date",
    progressComment: "Comment",
    attachments: "Attachments",
    addAttachment: "Add Attachment",
    comments: "Comments",
    addComment: "Add Comment",
    activity: "Activity",
    activityFeed: "Activity Feed",
    markComplete: "Mark Complete",
    markIncomplete: "Mark Incomplete",
    reopenTask: "Reopen Task",
    deleteTask: "Delete Task",
    deleteTaskConfirm: "Are you sure you want to delete this task? This action cannot be undone.",
    taskCompleted: "Task has been marked as complete.",
    taskReopened: "Task has been reopened.",
    progressUpdated: "Progress has been updated.",
    progressAdded: "Progress note has been added.",
    noAttachments: "No attachments yet",
    noComments: "No comments yet",
    noActivity: "No activity yet",
    noProgressNotes: "No progress notes yet",
    writeComment: "Write a comment...",
    
    admin: "Admin",
    user: "User",
    client: "Client",
    project: "Project",
    invoice: "Invoice",
    proposal: "Proposal",
    contract: "Contract",
    
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "Zip Code",
    company: "Company",
    website: "Website",
    notes: "Notes",
    description: "Description",
    title: "Title",
    amount: "Amount",
    quantity: "Quantity",
    rate: "Rate",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount",
    date: "Date",
    time: "Time",
    type: "Type",
    category: "Category",
    tags: "Tags",
    
    clients: "Clients",
    newClient: "New Client",
    clientName: "Client Name",
    clientEmail: "Client Email",
    clientPhone: "Client Phone",
    clientCompany: "Client Company",
    clientAddress: "Client Address",
    clientDetails: "Client Details",
    clientHistory: "Client History",
    clientProjects: "Client Projects",
    clientInvoices: "Client Invoices",
    noClients: "No clients yet",
    addClient: "Add Client",
    editClient: "Edit Client",
    deleteClient: "Delete Client",
    deleteClientConfirm: "Are you sure you want to delete this client?",
    clientAdded: "Client has been added successfully.",
    clientUpdated: "Client has been updated successfully.",
    clientDeleted: "Client has been deleted.",
    contactInfo: "Contact Information",
    billingInfo: "Billing Information",
    
    inbox: "Inbox",
    sent: "Sent",
    drafts: "Drafts",
    trash: "Trash",
    compose: "Compose",
    reply: "Reply",
    replyAll: "Reply All",
    forward: "Forward",
    sendMessage: "Send Message",
    newMessage: "New Message",
    to: "To",
    from: "From",
    subject: "Subject",
    message: "Message",
    attachFile: "Attach File",
    noMessages: "No messages",
    messageSent: "Message sent successfully.",
    messageDeleted: "Message deleted.",
    
    invoices: "Invoices",
    newInvoice: "New Invoice",
    invoiceNumber: "Invoice Number",
    invoiceDate: "Invoice Date",
    dueAmount: "Amount Due",
    paidAmount: "Amount Paid",
    outstanding: "Outstanding",
    invoiceStatus: "Invoice Status",
    draft: "Draft",
    invoiceSent: "Sent",
    paid: "Paid",
    overdueLower: "overdue",
    partiallyPaid: "Partially Paid",
    voided: "Voided",
    lineItems: "Line Items",
    addLineItem: "Add Line Item",
    removeLineItem: "Remove Line Item",
    paymentTerms: "Payment Terms",
    invoiceNotes: "Invoice Notes",
    sendInvoice: "Send Invoice",
    markAsPaid: "Mark as Paid",
    
    proposals: "Proposals",
    newProposalBtn: "New Proposal",
    proposalTitle: "Proposal Title",
    proposalScope: "Scope of Work",
    proposalTimeline: "Timeline",
    proposalBudget: "Budget",
    proposalStatus: "Proposal Status",
    accepted: "Accepted",
    rejected: "Rejected",
    proposalSent: "Proposal Sent",
    
    contracts: "Contracts",
    newContractBtn: "New Contract",
    contractTitle: "Contract Title",
    contractTerms: "Terms & Conditions",
    contractStartDate: "Start Date",
    contractEndDate: "End Date",
    contractValue: "Contract Value",
    contractStatus: "Contract Status",
    active: "Active",
    expired: "Expired",
    terminated: "Terminated",
    
    confirmDelete: "Confirm Delete",
    confirmDeleteMessage: "This action cannot be undone. Are you sure you want to continue?",
    confirmAction: "Confirm Action",
    unsavedChanges: "Unsaved Changes",
    unsavedChangesMessage: "You have unsaved changes. Do you want to save before leaving?",
    discardChanges: "Discard Changes",
    keepEditing: "Keep Editing",
    areYouSure: "Are you sure?",
    cannotUndo: "This action cannot be undone.",
    
    overview: "Overview",
    details: "Details",
    history: "History",
    files: "Files",
    team: "Team",
    analytics: "Analytics",
    reports: "Reports",
    
    noData: "No data available",
    noResults: "No results found",
    noItemsFound: "No items found",
    getStarted: "Get Started",
    
    error: "Error",
    errorOccurred: "An error occurred",
    tryAgain: "Try Again",
    somethingWentWrong: "Something went wrong",
    pageNotFound: "Page not found",
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    
    success: "Success",
    savedSuccessfully: "Saved successfully",
    deletedSuccessfully: "Deleted successfully",
    updatedSuccessfully: "Updated successfully",
    createdSuccessfully: "Created successfully",
    
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone number",
    minLength: "Minimum length is",
    maxLength: "Maximum length is",
    invalidFormat: "Invalid format",
    
    tagline: "Smarter tools for bolder dreams",
    
    documents: "Documents",
    folders: "Folders",
    allDocuments: "All Documents",
    recentDocuments: "Recent Documents",
    sharedWithMe: "Shared with Me",
    myDocuments: "My Documents",
    createFolder: "Create Folder",
    uploadDocument: "Upload Document",
    folderName: "Folder Name",
    documentName: "Document Name",
    lastModified: "Last Modified",
    fileSize: "File Size",
    fileType: "File Type",
    
    startTimer: "Start Timer",
    stopTimer: "Stop Timer",
    pauseTimer: "Pause Timer",
    resumeTimer: "Resume Timer",
    timerRunning: "Timer Running",
    timeEntry: "Time Entry",
    timeEntries: "Time Entries",
    hoursLogged: "Hours Logged",
    todayHours: "Today",
    weekHours: "This Week",
    monthHours: "This Month",
    
    searchResults: "Search Results",
    filter: "Filter",
    sortBy: "Sort By",
    ascending: "Ascending",
    descending: "Descending",
    newest: "Newest",
    oldest: "Oldest",
    alphabetical: "Alphabetical",
    
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    custom: "Custom",
    selectDate: "Select Date",
    selectDateRange: "Select Date Range",
  },
  es: {
    dashboard: "Panel",
    settings: "Configuración",
    messages: "Mensajes",
    tasks: "Tareas",
    home: "Inicio",
    logout: "Cerrar Sesión",
    search: "Buscar",
    searchPlaceholder: "Buscar tareas, proyectos, clientes...",
    
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    add: "Agregar",
    remove: "Quitar",
    submit: "Enviar",
    close: "Cerrar",
    confirm: "Confirmar",
    tools: "Herramientas",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar",
    loading: "Cargando...",
    saving: "Guardando...",
    deleting: "Eliminando...",
    updating: "Actualizando...",
    yes: "Sí",
    no: "No",
    ok: "OK",
    apply: "Aplicar",
    reset: "Restablecer",
    clear: "Limpiar",
    refresh: "Actualizar",
    retry: "Reintentar",
    view: "Ver",
    download: "Descargar",
    upload: "Subir",
    export: "Exportar",
    import: "Importar",
    duplicate: "Duplicar",
    archive: "Archivar",
    restore: "Restaurar",
    
    settingsTitle: "Configuración",
    settingsDescription: "Administra la configuración y preferencias de tu cuenta",
    account: "Cuenta",
    notifications: "Notificaciones",
    appearance: "Apariencia",
    integrations: "Integraciones",
    data: "Datos",
    preferences: "Preferencias",
    language: "Idioma",
    languageDescription: "Elige tu idioma de visualización preferido",
    timezone: "Zona Horaria",
    dateFormat: "Formato de Fecha",
    timeFormat: "Formato de Hora",
    savePreferences: "Guardar Preferencias",
    preferencesSaved: "Tus preferencias han sido actualizadas",
    profile: "Perfil",
    security: "Seguridad",
    privacy: "Privacidad",
    billing: "Facturación",
    
    myDashboard: "Mi Panel",
    welcomeMessage: "¡Bienvenido de nuevo! Esto es lo que está pasando con tus tareas y proyectos.",
    overdue: "Atrasado",
    dueSoon: "Vence Pronto",
    highPriority: "Alta Prioridad",
    completedToday: "Completado Hoy",
    timeTracking: "Control de Tiempo",
    
    clientManagement: "Gestión de Clientes",
    clientManagementDesc: "Administrar relaciones e historial de clientes",
    messagesDesc: "Comunicación con clientes",
    createProposal: "Crear Propuesta",
    createProposalDesc: "Propuestas de proyectos profesionales",
    createInvoice: "Crear Factura",
    createInvoiceDesc: "Facturación profesional",
    createContract: "Crear Contrato",
    createContractDesc: "Acuerdos y términos legales",
    createPresentation: "Crear Presentación",
    createPresentationDesc: "Diapositivas y presentaciones",
    productivityTools: "Herramientas de Productividad",
    productivityToolsDesc: "Control de tiempo e informes",
    agencyHub: "Centro de Agencia",
    agencyHubDesc: "Herramientas de marketing con IA",
    filingCabinet: "Archivador",
    filingCabinetDesc: "Almacenamiento de documentos",
    
    agentManagement: "Gestión de Agentes",
    analyticsDashboard: "Panel de Análisis",
    userManual: "Manual de Usuario",
    sparkNewTask: "Nueva Tarea",
    
    overdueTooltip: "Tareas que han pasado su fecha de vencimiento. Haz clic para ver y actuar.",
    dueSoonTooltip: "Tareas que vencen en las próximas 24 horas. Haz clic para revisar.",
    highPriorityTooltip: "Tareas marcadas como alta prioridad que necesitan atención inmediata.",
    completedTodayTooltip: "Tareas que has completado hoy. ¡Buen trabajo!",
    timeTrackingTooltip: "Accede a herramientas de control de tiempo e información de productividad.",
    clientManagementTooltip: "Administra perfiles de clientes, información de contacto e historial de relaciones.",
    messagesTooltip: "Envía y recibe correos profesionales con clientes.",
    createProposalTooltip: "Crea propuestas de proyectos profesionales con alcance, cronograma y precios detallados.",
    createInvoiceTooltip: "Genera facturas profesionales con servicios detallados, tarifas y términos de pago.",
    createContractTooltip: "Redacta y administra contratos legales con términos, condiciones y seguimiento de firmas.",
    createPresentationTooltip: "Crea presentaciones profesionales para reuniones con clientes y actualizaciones de proyectos.",
    productivityToolsTooltip: "Rastrea el tiempo dedicado a tareas y proyectos. Monitorea patrones de productividad.",
    agencyHubTooltip: "Accede a herramientas de marketing con IA incluyendo creación de contenido y generación de imágenes.",
    filingCabinetTooltip: "Almacena y organiza todos tus documentos en un solo lugar.",
    
    projectFolders: "Carpetas de Proyectos",
    activeProjects: "Proyectos Activos",
    noProjects: "Sin proyectos aún",
    createFirstProject: "Crea tu primer proyecto para comenzar",
    tasksCompleted: "tareas completadas",
    outstandingItems: "elementos pendientes",
    projects: "Proyectos",
    newProject: "Nuevo Proyecto",
    projectName: "Nombre del Proyecto",
    projectDescription: "Descripción del Proyecto",
    projectDetails: "Detalles del Proyecto",
    projectSettings: "Configuración del Proyecto",
    projectMembers: "Miembros del Proyecto",
    
    allTasks: "Todas",
    activeTasks: "Activas",
    completedTasks: "Completadas",
    assignedTo: "Asignado a",
    everyone: "Todos",
    newTask: "Nueva Tarea",
    taskName: "Nombre de la Tarea",
    taskDescription: "Descripción de la Tarea",
    taskDetails: "Detalles de la Tarea",
    taskPriority: "Prioridad de la Tarea",
    taskStatus: "Estado de la Tarea",
    dueDate: "Fecha de Vencimiento",
    startDate: "Fecha de Inicio",
    endDate: "Fecha de Fin",
    priority: "Prioridad",
    status: "Estado",
    assignee: "Asignado",
    completed: "Completado",
    inProgress: "En Progreso",
    pending: "Pendiente",
    notStarted: "No Iniciado",
    onHold: "En Espera",
    cancelled: "Cancelado",
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
    none: "Ninguno",
    
    taskDetailTitle: "Detalles de la Tarea",
    taskDetailDescription: "Ver y gestionar información de la tarea",
    progressNotes: "Notas de Progreso",
    addProgressNote: "Agregar Nota de Progreso",
    progressDate: "Fecha",
    progressComment: "Comentario",
    attachments: "Archivos Adjuntos",
    addAttachment: "Agregar Archivo",
    comments: "Comentarios",
    addComment: "Agregar Comentario",
    activity: "Actividad",
    activityFeed: "Historial de Actividad",
    markComplete: "Marcar Completo",
    markIncomplete: "Marcar Incompleto",
    reopenTask: "Reabrir Tarea",
    deleteTask: "Eliminar Tarea",
    deleteTaskConfirm: "¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.",
    taskCompleted: "La tarea ha sido marcada como completa.",
    taskReopened: "La tarea ha sido reabierta.",
    progressUpdated: "El progreso ha sido actualizado.",
    progressAdded: "Nota de progreso agregada.",
    noAttachments: "Sin archivos adjuntos",
    noComments: "Sin comentarios",
    noActivity: "Sin actividad",
    noProgressNotes: "Sin notas de progreso",
    writeComment: "Escribe un comentario...",
    
    admin: "Administrador",
    user: "Usuario",
    client: "Cliente",
    project: "Proyecto",
    invoice: "Factura",
    proposal: "Propuesta",
    contract: "Contrato",
    
    name: "Nombre",
    email: "Correo Electrónico",
    phone: "Teléfono",
    address: "Dirección",
    city: "Ciudad",
    state: "Estado",
    country: "País",
    zipCode: "Código Postal",
    company: "Empresa",
    website: "Sitio Web",
    notes: "Notas",
    description: "Descripción",
    title: "Título",
    amount: "Monto",
    quantity: "Cantidad",
    rate: "Tarifa",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuesto",
    discount: "Descuento",
    date: "Fecha",
    time: "Hora",
    type: "Tipo",
    category: "Categoría",
    tags: "Etiquetas",
    
    clients: "Clientes",
    newClient: "Nuevo Cliente",
    clientName: "Nombre del Cliente",
    clientEmail: "Correo del Cliente",
    clientPhone: "Teléfono del Cliente",
    clientCompany: "Empresa del Cliente",
    clientAddress: "Dirección del Cliente",
    clientDetails: "Detalles del Cliente",
    clientHistory: "Historial del Cliente",
    clientProjects: "Proyectos del Cliente",
    clientInvoices: "Facturas del Cliente",
    noClients: "Sin clientes aún",
    addClient: "Agregar Cliente",
    editClient: "Editar Cliente",
    deleteClient: "Eliminar Cliente",
    deleteClientConfirm: "¿Estás seguro de que deseas eliminar este cliente?",
    clientAdded: "Cliente agregado exitosamente.",
    clientUpdated: "Cliente actualizado exitosamente.",
    clientDeleted: "Cliente eliminado.",
    contactInfo: "Información de Contacto",
    billingInfo: "Información de Facturación",
    
    inbox: "Bandeja de Entrada",
    sent: "Enviados",
    drafts: "Borradores",
    trash: "Papelera",
    compose: "Redactar",
    reply: "Responder",
    replyAll: "Responder a Todos",
    forward: "Reenviar",
    sendMessage: "Enviar Mensaje",
    newMessage: "Nuevo Mensaje",
    to: "Para",
    from: "De",
    subject: "Asunto",
    message: "Mensaje",
    attachFile: "Adjuntar Archivo",
    noMessages: "Sin mensajes",
    messageSent: "Mensaje enviado exitosamente.",
    messageDeleted: "Mensaje eliminado.",
    
    invoices: "Facturas",
    newInvoice: "Nueva Factura",
    invoiceNumber: "Número de Factura",
    invoiceDate: "Fecha de Factura",
    dueAmount: "Monto Adeudado",
    paidAmount: "Monto Pagado",
    outstanding: "Pendiente",
    invoiceStatus: "Estado de Factura",
    draft: "Borrador",
    invoiceSent: "Enviada",
    paid: "Pagado",
    overdueLower: "atrasado",
    partiallyPaid: "Parcialmente Pagado",
    voided: "Anulado",
    lineItems: "Líneas de Factura",
    addLineItem: "Agregar Línea",
    removeLineItem: "Quitar Línea",
    paymentTerms: "Términos de Pago",
    invoiceNotes: "Notas de Factura",
    sendInvoice: "Enviar Factura",
    markAsPaid: "Marcar como Pagado",
    
    proposals: "Propuestas",
    newProposalBtn: "Nueva Propuesta",
    proposalTitle: "Título de la Propuesta",
    proposalScope: "Alcance del Trabajo",
    proposalTimeline: "Cronograma",
    proposalBudget: "Presupuesto",
    proposalStatus: "Estado de la Propuesta",
    accepted: "Aceptada",
    rejected: "Rechazada",
    proposalSent: "Propuesta Enviada",
    
    contracts: "Contratos",
    newContractBtn: "Nuevo Contrato",
    contractTitle: "Título del Contrato",
    contractTerms: "Términos y Condiciones",
    contractStartDate: "Fecha de Inicio",
    contractEndDate: "Fecha de Fin",
    contractValue: "Valor del Contrato",
    contractStatus: "Estado del Contrato",
    active: "Activo",
    expired: "Expirado",
    terminated: "Terminado",
    
    confirmDelete: "Confirmar Eliminación",
    confirmDeleteMessage: "Esta acción no se puede deshacer. ¿Estás seguro de continuar?",
    confirmAction: "Confirmar Acción",
    unsavedChanges: "Cambios sin Guardar",
    unsavedChangesMessage: "Tienes cambios sin guardar. ¿Deseas guardar antes de salir?",
    discardChanges: "Descartar Cambios",
    keepEditing: "Seguir Editando",
    areYouSure: "¿Estás seguro?",
    cannotUndo: "Esta acción no se puede deshacer.",
    
    overview: "Resumen",
    details: "Detalles",
    history: "Historial",
    files: "Archivos",
    team: "Equipo",
    analytics: "Análisis",
    reports: "Informes",
    
    noData: "Sin datos disponibles",
    noResults: "Sin resultados",
    noItemsFound: "No se encontraron elementos",
    getStarted: "Comenzar",
    
    error: "Error",
    errorOccurred: "Ocurrió un error",
    tryAgain: "Intentar de Nuevo",
    somethingWentWrong: "Algo salió mal",
    pageNotFound: "Página no encontrada",
    unauthorized: "No autorizado",
    forbidden: "Prohibido",
    
    success: "Éxito",
    savedSuccessfully: "Guardado exitosamente",
    deletedSuccessfully: "Eliminado exitosamente",
    updatedSuccessfully: "Actualizado exitosamente",
    createdSuccessfully: "Creado exitosamente",
    
    required: "Este campo es requerido",
    invalidEmail: "Por favor ingresa un correo válido",
    invalidPhone: "Por favor ingresa un teléfono válido",
    minLength: "La longitud mínima es",
    maxLength: "La longitud máxima es",
    invalidFormat: "Formato inválido",
    
    tagline: "Herramientas más inteligentes para sueños más audaces",
    
    documents: "Documentos",
    folders: "Carpetas",
    allDocuments: "Todos los Documentos",
    recentDocuments: "Documentos Recientes",
    sharedWithMe: "Compartidos Conmigo",
    myDocuments: "Mis Documentos",
    createFolder: "Crear Carpeta",
    uploadDocument: "Subir Documento",
    folderName: "Nombre de Carpeta",
    documentName: "Nombre del Documento",
    lastModified: "Última Modificación",
    fileSize: "Tamaño de Archivo",
    fileType: "Tipo de Archivo",
    
    startTimer: "Iniciar Temporizador",
    stopTimer: "Detener Temporizador",
    pauseTimer: "Pausar Temporizador",
    resumeTimer: "Reanudar Temporizador",
    timerRunning: "Temporizador Activo",
    timeEntry: "Registro de Tiempo",
    timeEntries: "Registros de Tiempo",
    hoursLogged: "Horas Registradas",
    todayHours: "Hoy",
    weekHours: "Esta Semana",
    monthHours: "Este Mes",
    
    searchResults: "Resultados de Búsqueda",
    filter: "Filtrar",
    sortBy: "Ordenar Por",
    ascending: "Ascendente",
    descending: "Descendente",
    newest: "Más Reciente",
    oldest: "Más Antiguo",
    alphabetical: "Alfabético",
    
    today: "Hoy",
    yesterday: "Ayer",
    tomorrow: "Mañana",
    thisWeek: "Esta Semana",
    lastWeek: "Semana Pasada",
    thisMonth: "Este Mes",
    lastMonth: "Mes Pasado",
    custom: "Personalizado",
    selectDate: "Seleccionar Fecha",
    selectDateRange: "Seleccionar Rango de Fechas",
  },
  fr: {
    dashboard: "Tableau de Bord",
    settings: "Paramètres",
    messages: "Messages",
    tasks: "Tâches",
    home: "Accueil",
    logout: "Déconnexion",
    search: "Rechercher",
    searchPlaceholder: "Rechercher tâches, projets, clients...",
    
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    add: "Ajouter",
    remove: "Retirer",
    submit: "Soumettre",
    close: "Fermer",
    confirm: "Confirmer",
    tools: "Outils",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    finish: "Terminer",
    loading: "Chargement...",
    saving: "Enregistrement...",
    deleting: "Suppression...",
    updating: "Mise à jour...",
    yes: "Oui",
    no: "Non",
    ok: "OK",
    apply: "Appliquer",
    reset: "Réinitialiser",
    clear: "Effacer",
    refresh: "Actualiser",
    retry: "Réessayer",
    view: "Voir",
    download: "Télécharger",
    upload: "Téléverser",
    export: "Exporter",
    import: "Importer",
    duplicate: "Dupliquer",
    archive: "Archiver",
    restore: "Restaurer",
    
    settingsTitle: "Paramètres",
    settingsDescription: "Gérez les paramètres et préférences de votre compte",
    account: "Compte",
    notifications: "Notifications",
    appearance: "Apparence",
    integrations: "Intégrations",
    data: "Données",
    preferences: "Préférences",
    language: "Langue",
    languageDescription: "Choisissez votre langue d'affichage préférée",
    timezone: "Fuseau Horaire",
    dateFormat: "Format de Date",
    timeFormat: "Format de l'Heure",
    savePreferences: "Enregistrer les Préférences",
    preferencesSaved: "Vos préférences ont été mises à jour",
    profile: "Profil",
    security: "Sécurité",
    privacy: "Confidentialité",
    billing: "Facturation",
    
    myDashboard: "Mon Tableau de Bord",
    welcomeMessage: "Bienvenue ! Voici ce qui se passe avec vos tâches et projets.",
    overdue: "En Retard",
    dueSoon: "Échéance Proche",
    highPriority: "Haute Priorité",
    completedToday: "Terminé Aujourd'hui",
    timeTracking: "Suivi du Temps",
    
    clientManagement: "Gestion des Clients",
    clientManagementDesc: "Gérer les relations et l'historique des clients",
    messagesDesc: "Communication avec les clients",
    createProposal: "Créer une Proposition",
    createProposalDesc: "Propositions de projets professionnelles",
    createInvoice: "Créer une Facture",
    createInvoiceDesc: "Facturation professionnelle",
    createContract: "Créer un Contrat",
    createContractDesc: "Accords et conditions juridiques",
    createPresentation: "Créer une Présentation",
    createPresentationDesc: "Diaporamas et présentations",
    productivityTools: "Outils de Productivité",
    productivityToolsDesc: "Suivi du temps et rapports",
    agencyHub: "Centre d'Agence",
    agencyHubDesc: "Outils marketing alimentés par l'IA",
    filingCabinet: "Classeur",
    filingCabinetDesc: "Stockage de documents",
    
    agentManagement: "Gestion des Agents",
    analyticsDashboard: "Tableau de Bord Analytique",
    userManual: "Manuel d'Utilisation",
    sparkNewTask: "Nouvelle Tâche",
    
    overdueTooltip: "Tâches en retard. Cliquez pour voir et agir.",
    dueSoonTooltip: "Tâches à échéance dans les 24 prochaines heures.",
    highPriorityTooltip: "Tâches marquées comme haute priorité nécessitant une attention immédiate.",
    completedTodayTooltip: "Tâches terminées aujourd'hui. Bon travail !",
    timeTrackingTooltip: "Accédez aux outils de suivi du temps et aux informations de productivité.",
    clientManagementTooltip: "Gérez les profils clients, coordonnées et historique des relations.",
    messagesTooltip: "Envoyez et recevez des emails professionnels avec les clients.",
    createProposalTooltip: "Créez des propositions de projets professionnelles avec portée, calendrier et tarifs détaillés.",
    createInvoiceTooltip: "Générez des factures professionnelles avec services détaillés, tarifs et conditions de paiement.",
    createContractTooltip: "Rédigez et gérez des contrats juridiques avec termes, conditions et suivi des signatures.",
    createPresentationTooltip: "Créez des présentations professionnelles pour réunions clients et mises à jour de projets.",
    productivityToolsTooltip: "Suivez le temps passé sur les tâches et projets. Surveillez les tendances de productivité.",
    agencyHubTooltip: "Accédez aux outils marketing IA incluant création de contenu et génération d'images.",
    filingCabinetTooltip: "Stockez et organisez tous vos documents en un seul endroit.",
    
    projectFolders: "Dossiers de Projets",
    activeProjects: "Projets Actifs",
    noProjects: "Pas encore de projets",
    createFirstProject: "Créez votre premier projet pour commencer",
    tasksCompleted: "tâches terminées",
    outstandingItems: "éléments en attente",
    projects: "Projets",
    newProject: "Nouveau Projet",
    projectName: "Nom du Projet",
    projectDescription: "Description du Projet",
    projectDetails: "Détails du Projet",
    projectSettings: "Paramètres du Projet",
    projectMembers: "Membres du Projet",
    
    allTasks: "Toutes",
    activeTasks: "Actives",
    completedTasks: "Terminées",
    assignedTo: "Assigné à",
    everyone: "Tout le monde",
    newTask: "Nouvelle Tâche",
    taskName: "Nom de la Tâche",
    taskDescription: "Description de la Tâche",
    taskDetails: "Détails de la Tâche",
    taskPriority: "Priorité de la Tâche",
    taskStatus: "Statut de la Tâche",
    dueDate: "Date d'Échéance",
    startDate: "Date de Début",
    endDate: "Date de Fin",
    priority: "Priorité",
    status: "Statut",
    assignee: "Assigné",
    completed: "Terminé",
    inProgress: "En Cours",
    pending: "En Attente",
    notStarted: "Non Commencé",
    onHold: "En Pause",
    cancelled: "Annulé",
    low: "Basse",
    medium: "Moyenne",
    high: "Haute",
    urgent: "Urgent",
    none: "Aucun",
    
    taskDetailTitle: "Détails de la Tâche",
    taskDetailDescription: "Voir et gérer les informations de la tâche",
    progressNotes: "Notes de Progression",
    addProgressNote: "Ajouter une Note de Progression",
    progressDate: "Date",
    progressComment: "Commentaire",
    attachments: "Pièces Jointes",
    addAttachment: "Ajouter une Pièce Jointe",
    comments: "Commentaires",
    addComment: "Ajouter un Commentaire",
    activity: "Activité",
    activityFeed: "Fil d'Activité",
    markComplete: "Marquer Terminé",
    markIncomplete: "Marquer Non Terminé",
    reopenTask: "Rouvrir la Tâche",
    deleteTask: "Supprimer la Tâche",
    deleteTaskConfirm: "Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.",
    taskCompleted: "La tâche a été marquée comme terminée.",
    taskReopened: "La tâche a été rouverte.",
    progressUpdated: "La progression a été mise à jour.",
    progressAdded: "Note de progression ajoutée.",
    noAttachments: "Pas de pièces jointes",
    noComments: "Pas de commentaires",
    noActivity: "Pas d'activité",
    noProgressNotes: "Pas de notes de progression",
    writeComment: "Écrire un commentaire...",
    
    admin: "Administrateur",
    user: "Utilisateur",
    client: "Client",
    project: "Projet",
    invoice: "Facture",
    proposal: "Proposition",
    contract: "Contrat",
    
    name: "Nom",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    city: "Ville",
    state: "État",
    country: "Pays",
    zipCode: "Code Postal",
    company: "Entreprise",
    website: "Site Web",
    notes: "Notes",
    description: "Description",
    title: "Titre",
    amount: "Montant",
    quantity: "Quantité",
    rate: "Tarif",
    total: "Total",
    subtotal: "Sous-total",
    tax: "Taxe",
    discount: "Remise",
    date: "Date",
    time: "Heure",
    type: "Type",
    category: "Catégorie",
    tags: "Étiquettes",
    
    clients: "Clients",
    newClient: "Nouveau Client",
    clientName: "Nom du Client",
    clientEmail: "Email du Client",
    clientPhone: "Téléphone du Client",
    clientCompany: "Entreprise du Client",
    clientAddress: "Adresse du Client",
    clientDetails: "Détails du Client",
    clientHistory: "Historique du Client",
    clientProjects: "Projets du Client",
    clientInvoices: "Factures du Client",
    noClients: "Pas encore de clients",
    addClient: "Ajouter un Client",
    editClient: "Modifier le Client",
    deleteClient: "Supprimer le Client",
    deleteClientConfirm: "Êtes-vous sûr de vouloir supprimer ce client ?",
    clientAdded: "Client ajouté avec succès.",
    clientUpdated: "Client mis à jour avec succès.",
    clientDeleted: "Client supprimé.",
    contactInfo: "Informations de Contact",
    billingInfo: "Informations de Facturation",
    
    inbox: "Boîte de Réception",
    sent: "Envoyés",
    drafts: "Brouillons",
    trash: "Corbeille",
    compose: "Rédiger",
    reply: "Répondre",
    replyAll: "Répondre à Tous",
    forward: "Transférer",
    sendMessage: "Envoyer le Message",
    newMessage: "Nouveau Message",
    to: "À",
    from: "De",
    subject: "Objet",
    message: "Message",
    attachFile: "Joindre un Fichier",
    noMessages: "Pas de messages",
    messageSent: "Message envoyé avec succès.",
    messageDeleted: "Message supprimé.",
    
    invoices: "Factures",
    newInvoice: "Nouvelle Facture",
    invoiceNumber: "Numéro de Facture",
    invoiceDate: "Date de Facture",
    dueAmount: "Montant Dû",
    paidAmount: "Montant Payé",
    outstanding: "En cours",
    invoiceStatus: "Statut de la Facture",
    draft: "Brouillon",
    invoiceSent: "Envoyée",
    paid: "Payé",
    overdueLower: "en retard",
    partiallyPaid: "Partiellement Payé",
    voided: "Annulé",
    lineItems: "Lignes de Facture",
    addLineItem: "Ajouter une Ligne",
    removeLineItem: "Supprimer une Ligne",
    paymentTerms: "Conditions de Paiement",
    invoiceNotes: "Notes de Facture",
    sendInvoice: "Envoyer la Facture",
    markAsPaid: "Marquer comme Payé",
    
    proposals: "Propositions",
    newProposalBtn: "Nouvelle Proposition",
    proposalTitle: "Titre de la Proposition",
    proposalScope: "Portée du Travail",
    proposalTimeline: "Calendrier",
    proposalBudget: "Budget",
    proposalStatus: "Statut de la Proposition",
    accepted: "Acceptée",
    rejected: "Rejetée",
    proposalSent: "Proposition Envoyée",
    
    contracts: "Contrats",
    newContractBtn: "Nouveau Contrat",
    contractTitle: "Titre du Contrat",
    contractTerms: "Termes et Conditions",
    contractStartDate: "Date de Début",
    contractEndDate: "Date de Fin",
    contractValue: "Valeur du Contrat",
    contractStatus: "Statut du Contrat",
    active: "Actif",
    expired: "Expiré",
    terminated: "Résilié",
    
    confirmDelete: "Confirmer la Suppression",
    confirmDeleteMessage: "Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?",
    confirmAction: "Confirmer l'Action",
    unsavedChanges: "Modifications Non Enregistrées",
    unsavedChangesMessage: "Vous avez des modifications non enregistrées. Voulez-vous enregistrer avant de partir ?",
    discardChanges: "Annuler les Modifications",
    keepEditing: "Continuer à Modifier",
    areYouSure: "Êtes-vous sûr ?",
    cannotUndo: "Cette action est irréversible.",
    
    overview: "Aperçu",
    details: "Détails",
    history: "Historique",
    files: "Fichiers",
    team: "Équipe",
    analytics: "Analytique",
    reports: "Rapports",
    
    noData: "Aucune donnée disponible",
    noResults: "Aucun résultat trouvé",
    noItemsFound: "Aucun élément trouvé",
    getStarted: "Commencer",
    
    error: "Erreur",
    errorOccurred: "Une erreur s'est produite",
    tryAgain: "Réessayer",
    somethingWentWrong: "Quelque chose s'est mal passé",
    pageNotFound: "Page non trouvée",
    unauthorized: "Non autorisé",
    forbidden: "Interdit",
    
    success: "Succès",
    savedSuccessfully: "Enregistré avec succès",
    deletedSuccessfully: "Supprimé avec succès",
    updatedSuccessfully: "Mis à jour avec succès",
    createdSuccessfully: "Créé avec succès",
    
    required: "Ce champ est requis",
    invalidEmail: "Veuillez entrer une adresse email valide",
    invalidPhone: "Veuillez entrer un numéro de téléphone valide",
    minLength: "La longueur minimale est de",
    maxLength: "La longueur maximale est de",
    invalidFormat: "Format invalide",
    
    tagline: "Des outils plus intelligents pour des rêves plus audacieux",
    
    documents: "Documents",
    folders: "Dossiers",
    allDocuments: "Tous les Documents",
    recentDocuments: "Documents Récents",
    sharedWithMe: "Partagés avec Moi",
    myDocuments: "Mes Documents",
    createFolder: "Créer un Dossier",
    uploadDocument: "Téléverser un Document",
    folderName: "Nom du Dossier",
    documentName: "Nom du Document",
    lastModified: "Dernière Modification",
    fileSize: "Taille du Fichier",
    fileType: "Type de Fichier",
    
    startTimer: "Démarrer le Chrono",
    stopTimer: "Arrêter le Chrono",
    pauseTimer: "Pause",
    resumeTimer: "Reprendre",
    timerRunning: "Chrono en Cours",
    timeEntry: "Entrée de Temps",
    timeEntries: "Entrées de Temps",
    hoursLogged: "Heures Enregistrées",
    todayHours: "Aujourd'hui",
    weekHours: "Cette Semaine",
    monthHours: "Ce Mois",
    
    searchResults: "Résultats de Recherche",
    filter: "Filtrer",
    sortBy: "Trier Par",
    ascending: "Ascendant",
    descending: "Descendant",
    newest: "Plus Récent",
    oldest: "Plus Ancien",
    alphabetical: "Alphabétique",
    
    today: "Aujourd'hui",
    yesterday: "Hier",
    tomorrow: "Demain",
    thisWeek: "Cette Semaine",
    lastWeek: "Semaine Dernière",
    thisMonth: "Ce Mois",
    lastMonth: "Mois Dernier",
    custom: "Personnalisé",
    selectDate: "Sélectionner une Date",
    selectDateRange: "Sélectionner une Plage de Dates",
  },
  de: {
    dashboard: "Dashboard",
    settings: "Einstellungen",
    messages: "Nachrichten",
    tasks: "Aufgaben",
    home: "Startseite",
    logout: "Abmelden",
    search: "Suchen",
    searchPlaceholder: "Aufgaben, Projekte, Kunden suchen...",
    
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    create: "Erstellen",
    add: "Hinzufügen",
    remove: "Entfernen",
    submit: "Absenden",
    close: "Schließen",
    confirm: "Bestätigen",
    tools: "Werkzeuge",
    back: "Zurück",
    next: "Weiter",
    previous: "Zurück",
    finish: "Fertig",
    loading: "Laden...",
    saving: "Speichern...",
    deleting: "Löschen...",
    updating: "Aktualisieren...",
    yes: "Ja",
    no: "Nein",
    ok: "OK",
    apply: "Anwenden",
    reset: "Zurücksetzen",
    clear: "Löschen",
    refresh: "Aktualisieren",
    retry: "Erneut versuchen",
    view: "Ansehen",
    download: "Herunterladen",
    upload: "Hochladen",
    export: "Exportieren",
    import: "Importieren",
    duplicate: "Duplizieren",
    archive: "Archivieren",
    restore: "Wiederherstellen",
    
    settingsTitle: "Einstellungen",
    settingsDescription: "Verwalten Sie Ihre Kontoeinstellungen und Präferenzen",
    account: "Konto",
    notifications: "Benachrichtigungen",
    appearance: "Erscheinung",
    integrations: "Integrationen",
    data: "Daten",
    preferences: "Präferenzen",
    language: "Sprache",
    languageDescription: "Wählen Sie Ihre bevorzugte Anzeigesprache",
    timezone: "Zeitzone",
    dateFormat: "Datumsformat",
    timeFormat: "Zeitformat",
    savePreferences: "Einstellungen Speichern",
    preferencesSaved: "Ihre Einstellungen wurden aktualisiert",
    profile: "Profil",
    security: "Sicherheit",
    privacy: "Datenschutz",
    billing: "Abrechnung",
    
    myDashboard: "Mein Dashboard",
    welcomeMessage: "Willkommen zurück! Hier ist, was mit Ihren Aufgaben und Projekten passiert.",
    overdue: "Überfällig",
    dueSoon: "Bald Fällig",
    highPriority: "Hohe Priorität",
    completedToday: "Heute Erledigt",
    timeTracking: "Zeiterfassung",
    
    clientManagement: "Kundenverwaltung",
    clientManagementDesc: "Kundenbeziehungen und Historie verwalten",
    messagesDesc: "Kundenkommunikation",
    createProposal: "Angebot Erstellen",
    createProposalDesc: "Professionelle Projektangebote",
    createInvoice: "Rechnung Erstellen",
    createInvoiceDesc: "Professionelle Abrechnung",
    createContract: "Vertrag Erstellen",
    createContractDesc: "Rechtliche Vereinbarungen",
    createPresentation: "Präsentation Erstellen",
    createPresentationDesc: "Folien und Präsentationen",
    productivityTools: "Produktivitätswerkzeuge",
    productivityToolsDesc: "Zeiterfassung und Einblicke",
    agencyHub: "Agentur-Hub",
    agencyHubDesc: "KI-gestützte Marketing-Tools",
    filingCabinet: "Aktenschrank",
    filingCabinetDesc: "Dokumentenspeicherung",
    
    agentManagement: "Agentenverwaltung",
    analyticsDashboard: "Analyse-Dashboard",
    userManual: "Benutzerhandbuch",
    sparkNewTask: "Neue Aufgabe",
    
    overdueTooltip: "Überfällige Aufgaben. Klicken Sie zum Anzeigen und Handeln.",
    dueSoonTooltip: "Aufgaben, die in den nächsten 24 Stunden fällig sind.",
    highPriorityTooltip: "Aufgaben mit hoher Priorität, die sofortige Aufmerksamkeit erfordern.",
    completedTodayTooltip: "Heute erledigte Aufgaben. Gute Arbeit!",
    timeTrackingTooltip: "Zugriff auf Zeiterfassungstools und Produktivitätseinblicke.",
    clientManagementTooltip: "Verwalten Sie Kundenprofile, Kontaktinformationen und Beziehungshistorie.",
    messagesTooltip: "Senden und empfangen Sie professionelle E-Mails mit Kunden.",
    createProposalTooltip: "Erstellen Sie professionelle Projektangebote mit detailliertem Umfang, Zeitplan und Preisen.",
    createInvoiceTooltip: "Erstellen Sie professionelle Rechnungen mit detaillierten Leistungen, Tarifen und Zahlungsbedingungen.",
    createContractTooltip: "Verfassen und verwalten Sie rechtliche Verträge mit Bedingungen und Signaturverfolgung.",
    createPresentationTooltip: "Erstellen Sie professionelle Präsentationen für Kundenmeetings und Projektaktualisierungen.",
    productivityToolsTooltip: "Verfolgen Sie die Zeit für Aufgaben und Projekte. Überwachen Sie Produktivitätsmuster.",
    agencyHubTooltip: "Zugriff auf KI-gestützte Marketing-Tools einschließlich Inhaltserstellung und Bildgenerierung.",
    filingCabinetTooltip: "Speichern und organisieren Sie alle Ihre Dokumente an einem Ort.",
    
    projectFolders: "Projektordner",
    activeProjects: "Aktive Projekte",
    noProjects: "Noch keine Projekte",
    createFirstProject: "Erstellen Sie Ihr erstes Projekt, um zu beginnen",
    tasksCompleted: "Aufgaben erledigt",
    outstandingItems: "ausstehende Elemente",
    projects: "Projekte",
    newProject: "Neues Projekt",
    projectName: "Projektname",
    projectDescription: "Projektbeschreibung",
    projectDetails: "Projektdetails",
    projectSettings: "Projekteinstellungen",
    projectMembers: "Projektmitglieder",
    
    allTasks: "Alle",
    activeTasks: "Aktiv",
    completedTasks: "Erledigt",
    assignedTo: "Zugewiesen an",
    everyone: "Alle",
    newTask: "Neue Aufgabe",
    taskName: "Aufgabenname",
    taskDescription: "Aufgabenbeschreibung",
    taskDetails: "Aufgabendetails",
    taskPriority: "Aufgabenpriorität",
    taskStatus: "Aufgabenstatus",
    dueDate: "Fälligkeitsdatum",
    startDate: "Startdatum",
    endDate: "Enddatum",
    priority: "Priorität",
    status: "Status",
    assignee: "Zugewiesen",
    completed: "Erledigt",
    inProgress: "In Bearbeitung",
    pending: "Ausstehend",
    notStarted: "Nicht gestartet",
    onHold: "Pausiert",
    cancelled: "Abgebrochen",
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    urgent: "Dringend",
    none: "Keine",
    
    taskDetailTitle: "Aufgabendetails",
    taskDetailDescription: "Aufgabeninformationen anzeigen und verwalten",
    progressNotes: "Fortschrittsnotizen",
    addProgressNote: "Fortschrittsnotiz hinzufügen",
    progressDate: "Datum",
    progressComment: "Kommentar",
    attachments: "Anhänge",
    addAttachment: "Anhang hinzufügen",
    comments: "Kommentare",
    addComment: "Kommentar hinzufügen",
    activity: "Aktivität",
    activityFeed: "Aktivitätsfeed",
    markComplete: "Als erledigt markieren",
    markIncomplete: "Als unerledigt markieren",
    reopenTask: "Aufgabe wieder öffnen",
    deleteTask: "Aufgabe löschen",
    deleteTaskConfirm: "Sind Sie sicher, dass Sie diese Aufgabe löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
    taskCompleted: "Aufgabe wurde als erledigt markiert.",
    taskReopened: "Aufgabe wurde wieder geöffnet.",
    progressUpdated: "Fortschritt wurde aktualisiert.",
    progressAdded: "Fortschrittsnotiz wurde hinzugefügt.",
    noAttachments: "Keine Anhänge",
    noComments: "Keine Kommentare",
    noActivity: "Keine Aktivität",
    noProgressNotes: "Keine Fortschrittsnotizen",
    writeComment: "Kommentar schreiben...",
    
    admin: "Administrator",
    user: "Benutzer",
    client: "Kunde",
    project: "Projekt",
    invoice: "Rechnung",
    proposal: "Angebot",
    contract: "Vertrag",
    
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    address: "Adresse",
    city: "Stadt",
    state: "Bundesland",
    country: "Land",
    zipCode: "Postleitzahl",
    company: "Unternehmen",
    website: "Website",
    notes: "Notizen",
    description: "Beschreibung",
    title: "Titel",
    amount: "Betrag",
    quantity: "Menge",
    rate: "Satz",
    total: "Gesamt",
    subtotal: "Zwischensumme",
    tax: "Steuer",
    discount: "Rabatt",
    date: "Datum",
    time: "Zeit",
    type: "Typ",
    category: "Kategorie",
    tags: "Tags",
    
    clients: "Kunden",
    newClient: "Neuer Kunde",
    clientName: "Kundenname",
    clientEmail: "Kunden-E-Mail",
    clientPhone: "Kundentelefon",
    clientCompany: "Kundenunternehmen",
    clientAddress: "Kundenadresse",
    clientDetails: "Kundendetails",
    clientHistory: "Kundenhistorie",
    clientProjects: "Kundenprojekte",
    clientInvoices: "Kundenrechnungen",
    noClients: "Noch keine Kunden",
    addClient: "Kunde hinzufügen",
    editClient: "Kunde bearbeiten",
    deleteClient: "Kunde löschen",
    deleteClientConfirm: "Sind Sie sicher, dass Sie diesen Kunden löschen möchten?",
    clientAdded: "Kunde erfolgreich hinzugefügt.",
    clientUpdated: "Kunde erfolgreich aktualisiert.",
    clientDeleted: "Kunde gelöscht.",
    contactInfo: "Kontaktinformationen",
    billingInfo: "Abrechnungsinformationen",
    
    inbox: "Posteingang",
    sent: "Gesendet",
    drafts: "Entwürfe",
    trash: "Papierkorb",
    compose: "Verfassen",
    reply: "Antworten",
    replyAll: "Allen antworten",
    forward: "Weiterleiten",
    sendMessage: "Nachricht senden",
    newMessage: "Neue Nachricht",
    to: "An",
    from: "Von",
    subject: "Betreff",
    message: "Nachricht",
    attachFile: "Datei anhängen",
    noMessages: "Keine Nachrichten",
    messageSent: "Nachricht erfolgreich gesendet.",
    messageDeleted: "Nachricht gelöscht.",
    
    invoices: "Rechnungen",
    newInvoice: "Neue Rechnung",
    invoiceNumber: "Rechnungsnummer",
    invoiceDate: "Rechnungsdatum",
    dueAmount: "Fälliger Betrag",
    paidAmount: "Bezahlter Betrag",
    outstanding: "Ausstehend",
    invoiceStatus: "Rechnungsstatus",
    draft: "Entwurf",
    invoiceSent: "Gesendet",
    paid: "Bezahlt",
    overdueLower: "überfällig",
    partiallyPaid: "Teilweise bezahlt",
    voided: "Storniert",
    lineItems: "Rechnungspositionen",
    addLineItem: "Position hinzufügen",
    removeLineItem: "Position entfernen",
    paymentTerms: "Zahlungsbedingungen",
    invoiceNotes: "Rechnungsnotizen",
    sendInvoice: "Rechnung senden",
    markAsPaid: "Als bezahlt markieren",
    
    proposals: "Angebote",
    newProposalBtn: "Neues Angebot",
    proposalTitle: "Angebotstitel",
    proposalScope: "Leistungsumfang",
    proposalTimeline: "Zeitplan",
    proposalBudget: "Budget",
    proposalStatus: "Angebotsstatus",
    accepted: "Angenommen",
    rejected: "Abgelehnt",
    proposalSent: "Angebot gesendet",
    
    contracts: "Verträge",
    newContractBtn: "Neuer Vertrag",
    contractTitle: "Vertragstitel",
    contractTerms: "Allgemeine Geschäftsbedingungen",
    contractStartDate: "Startdatum",
    contractEndDate: "Enddatum",
    contractValue: "Vertragswert",
    contractStatus: "Vertragsstatus",
    active: "Aktiv",
    expired: "Abgelaufen",
    terminated: "Gekündigt",
    
    confirmDelete: "Löschen bestätigen",
    confirmDeleteMessage: "Diese Aktion kann nicht rückgängig gemacht werden. Sind Sie sicher, dass Sie fortfahren möchten?",
    confirmAction: "Aktion bestätigen",
    unsavedChanges: "Nicht gespeicherte Änderungen",
    unsavedChangesMessage: "Sie haben nicht gespeicherte Änderungen. Möchten Sie vor dem Verlassen speichern?",
    discardChanges: "Änderungen verwerfen",
    keepEditing: "Weiter bearbeiten",
    areYouSure: "Sind Sie sicher?",
    cannotUndo: "Diese Aktion kann nicht rückgängig gemacht werden.",
    
    overview: "Übersicht",
    details: "Details",
    history: "Verlauf",
    files: "Dateien",
    team: "Team",
    analytics: "Analytik",
    reports: "Berichte",
    
    noData: "Keine Daten verfügbar",
    noResults: "Keine Ergebnisse gefunden",
    noItemsFound: "Keine Elemente gefunden",
    getStarted: "Loslegen",
    
    error: "Fehler",
    errorOccurred: "Ein Fehler ist aufgetreten",
    tryAgain: "Erneut versuchen",
    somethingWentWrong: "Etwas ist schiefgelaufen",
    pageNotFound: "Seite nicht gefunden",
    unauthorized: "Nicht autorisiert",
    forbidden: "Verboten",
    
    success: "Erfolg",
    savedSuccessfully: "Erfolgreich gespeichert",
    deletedSuccessfully: "Erfolgreich gelöscht",
    updatedSuccessfully: "Erfolgreich aktualisiert",
    createdSuccessfully: "Erfolgreich erstellt",
    
    required: "Dieses Feld ist erforderlich",
    invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    invalidPhone: "Bitte geben Sie eine gültige Telefonnummer ein",
    minLength: "Die Mindestlänge beträgt",
    maxLength: "Die Maximallänge beträgt",
    invalidFormat: "Ungültiges Format",
    
    tagline: "Intelligentere Werkzeuge für kühnere Träume",
    
    documents: "Dokumente",
    folders: "Ordner",
    allDocuments: "Alle Dokumente",
    recentDocuments: "Aktuelle Dokumente",
    sharedWithMe: "Mit mir geteilt",
    myDocuments: "Meine Dokumente",
    createFolder: "Ordner erstellen",
    uploadDocument: "Dokument hochladen",
    folderName: "Ordnername",
    documentName: "Dokumentname",
    lastModified: "Zuletzt geändert",
    fileSize: "Dateigröße",
    fileType: "Dateityp",
    
    startTimer: "Timer starten",
    stopTimer: "Timer stoppen",
    pauseTimer: "Pausieren",
    resumeTimer: "Fortsetzen",
    timerRunning: "Timer läuft",
    timeEntry: "Zeiteintrag",
    timeEntries: "Zeiteinträge",
    hoursLogged: "Erfasste Stunden",
    todayHours: "Heute",
    weekHours: "Diese Woche",
    monthHours: "Dieser Monat",
    
    searchResults: "Suchergebnisse",
    filter: "Filtern",
    sortBy: "Sortieren nach",
    ascending: "Aufsteigend",
    descending: "Absteigend",
    newest: "Neueste",
    oldest: "Älteste",
    alphabetical: "Alphabetisch",
    
    today: "Heute",
    yesterday: "Gestern",
    tomorrow: "Morgen",
    thisWeek: "Diese Woche",
    lastWeek: "Letzte Woche",
    thisMonth: "Dieser Monat",
    lastMonth: "Letzter Monat",
    custom: "Benutzerdefiniert",
    selectDate: "Datum auswählen",
    selectDateRange: "Datumsbereich auswählen",
  },
  "pt-BR": {
    dashboard: "Painel",
    settings: "Configurações",
    messages: "Mensagens",
    tasks: "Tarefas",
    home: "Início",
    logout: "Sair",
    search: "Pesquisar",
    searchPlaceholder: "Pesquisar tarefas, projetos, clientes...",
    
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    create: "Criar",
    add: "Adicionar",
    remove: "Remover",
    submit: "Enviar",
    close: "Fechar",
    confirm: "Confirmar",
    tools: "Ferramentas",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    finish: "Concluir",
    loading: "Carregando...",
    saving: "Salvando...",
    deleting: "Excluindo...",
    updating: "Atualizando...",
    yes: "Sim",
    no: "Não",
    ok: "OK",
    apply: "Aplicar",
    reset: "Redefinir",
    clear: "Limpar",
    refresh: "Atualizar",
    retry: "Tentar novamente",
    view: "Ver",
    download: "Baixar",
    upload: "Enviar",
    export: "Exportar",
    import: "Importar",
    duplicate: "Duplicar",
    archive: "Arquivar",
    restore: "Restaurar",
    
    settingsTitle: "Configurações",
    settingsDescription: "Gerencie as configurações e preferências da sua conta",
    account: "Conta",
    notifications: "Notificações",
    appearance: "Aparência",
    integrations: "Integrações",
    data: "Dados",
    preferences: "Preferências",
    language: "Idioma",
    languageDescription: "Escolha seu idioma de exibição preferido",
    timezone: "Fuso Horário",
    dateFormat: "Formato de Data",
    timeFormat: "Formato de Hora",
    savePreferences: "Salvar Preferências",
    preferencesSaved: "Suas preferências foram atualizadas",
    profile: "Perfil",
    security: "Segurança",
    privacy: "Privacidade",
    billing: "Cobrança",
    
    myDashboard: "Meu Painel",
    welcomeMessage: "Bem-vindo de volta! Aqui está o que está acontecendo com suas tarefas e projetos.",
    overdue: "Atrasado",
    dueSoon: "Vence em Breve",
    highPriority: "Alta Prioridade",
    completedToday: "Concluído Hoje",
    timeTracking: "Controle de Tempo",
    
    clientManagement: "Gestão de Clientes",
    clientManagementDesc: "Gerenciar relacionamentos e histórico de clientes",
    messagesDesc: "Comunicação com clientes",
    createProposal: "Criar Proposta",
    createProposalDesc: "Propostas de projetos profissionais",
    createInvoice: "Criar Fatura",
    createInvoiceDesc: "Faturamento profissional",
    createContract: "Criar Contrato",
    createContractDesc: "Acordos e termos legais",
    createPresentation: "Criar Apresentação",
    createPresentationDesc: "Slides e apresentações",
    productivityTools: "Ferramentas de Produtividade",
    productivityToolsDesc: "Controle de tempo e insights",
    agencyHub: "Central da Agência",
    agencyHubDesc: "Ferramentas de marketing com IA",
    filingCabinet: "Arquivo",
    filingCabinetDesc: "Armazenamento de documentos",
    
    agentManagement: "Gestão de Agentes",
    analyticsDashboard: "Painel de Análises",
    userManual: "Manual do Usuário",
    sparkNewTask: "Nova Tarefa",
    
    overdueTooltip: "Tarefas atrasadas. Clique para ver e agir.",
    dueSoonTooltip: "Tarefas com vencimento nas próximas 24 horas.",
    highPriorityTooltip: "Tarefas de alta prioridade que precisam de atenção imediata.",
    completedTodayTooltip: "Tarefas concluídas hoje. Bom trabalho!",
    timeTrackingTooltip: "Acesse ferramentas de controle de tempo e insights de produtividade.",
    clientManagementTooltip: "Gerencie perfis de clientes, informações de contato e histórico de relacionamentos.",
    messagesTooltip: "Envie e receba emails profissionais com clientes.",
    createProposalTooltip: "Crie propostas de projetos profissionais com escopo, cronograma e preços detalhados.",
    createInvoiceTooltip: "Gere faturas profissionais com serviços detalhados, tarifas e condições de pagamento.",
    createContractTooltip: "Redija e gerencie contratos legais com termos, condições e rastreamento de assinaturas.",
    createPresentationTooltip: "Crie apresentações profissionais para reuniões com clientes e atualizações de projetos.",
    productivityToolsTooltip: "Acompanhe o tempo gasto em tarefas e projetos. Monitore padrões de produtividade.",
    agencyHubTooltip: "Acesse ferramentas de marketing com IA incluindo criação de conteúdo e geração de imagens.",
    filingCabinetTooltip: "Armazene e organize todos os seus documentos em um só lugar.",
    
    projectFolders: "Pastas de Projetos",
    activeProjects: "Projetos Ativos",
    noProjects: "Nenhum projeto ainda",
    createFirstProject: "Crie seu primeiro projeto para começar",
    tasksCompleted: "tarefas concluídas",
    outstandingItems: "itens pendentes",
    projects: "Projetos",
    newProject: "Novo Projeto",
    projectName: "Nome do Projeto",
    projectDescription: "Descrição do Projeto",
    projectDetails: "Detalhes do Projeto",
    projectSettings: "Configurações do Projeto",
    projectMembers: "Membros do Projeto",
    
    allTasks: "Todas",
    activeTasks: "Ativas",
    completedTasks: "Concluídas",
    assignedTo: "Atribuído a",
    everyone: "Todos",
    newTask: "Nova Tarefa",
    taskName: "Nome da Tarefa",
    taskDescription: "Descrição da Tarefa",
    taskDetails: "Detalhes da Tarefa",
    taskPriority: "Prioridade da Tarefa",
    taskStatus: "Status da Tarefa",
    dueDate: "Data de Vencimento",
    startDate: "Data de Início",
    endDate: "Data de Término",
    priority: "Prioridade",
    status: "Status",
    assignee: "Responsável",
    completed: "Concluído",
    inProgress: "Em Andamento",
    pending: "Pendente",
    notStarted: "Não Iniciado",
    onHold: "Em Espera",
    cancelled: "Cancelado",
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
    none: "Nenhum",
    
    taskDetailTitle: "Detalhes da Tarefa",
    taskDetailDescription: "Ver e gerenciar informações da tarefa",
    progressNotes: "Notas de Progresso",
    addProgressNote: "Adicionar Nota de Progresso",
    progressDate: "Data",
    progressComment: "Comentário",
    attachments: "Anexos",
    addAttachment: "Adicionar Anexo",
    comments: "Comentários",
    addComment: "Adicionar Comentário",
    activity: "Atividade",
    activityFeed: "Feed de Atividades",
    markComplete: "Marcar como Concluído",
    markIncomplete: "Marcar como Incompleto",
    reopenTask: "Reabrir Tarefa",
    deleteTask: "Excluir Tarefa",
    deleteTaskConfirm: "Tem certeza de que deseja excluir esta tarefa? Esta ação não pode ser desfeita.",
    taskCompleted: "A tarefa foi marcada como concluída.",
    taskReopened: "A tarefa foi reaberta.",
    progressUpdated: "O progresso foi atualizado.",
    progressAdded: "Nota de progresso adicionada.",
    noAttachments: "Sem anexos",
    noComments: "Sem comentários",
    noActivity: "Sem atividade",
    noProgressNotes: "Sem notas de progresso",
    writeComment: "Escreva um comentário...",
    
    admin: "Administrador",
    user: "Usuário",
    client: "Cliente",
    project: "Projeto",
    invoice: "Fatura",
    proposal: "Proposta",
    contract: "Contrato",
    
    name: "Nome",
    email: "Email",
    phone: "Telefone",
    address: "Endereço",
    city: "Cidade",
    state: "Estado",
    country: "País",
    zipCode: "CEP",
    company: "Empresa",
    website: "Site",
    notes: "Notas",
    description: "Descrição",
    title: "Título",
    amount: "Valor",
    quantity: "Quantidade",
    rate: "Taxa",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Imposto",
    discount: "Desconto",
    date: "Data",
    time: "Hora",
    type: "Tipo",
    category: "Categoria",
    tags: "Tags",
    
    clients: "Clientes",
    newClient: "Novo Cliente",
    clientName: "Nome do Cliente",
    clientEmail: "Email do Cliente",
    clientPhone: "Telefone do Cliente",
    clientCompany: "Empresa do Cliente",
    clientAddress: "Endereço do Cliente",
    clientDetails: "Detalhes do Cliente",
    clientHistory: "Histórico do Cliente",
    clientProjects: "Projetos do Cliente",
    clientInvoices: "Faturas do Cliente",
    noClients: "Nenhum cliente ainda",
    addClient: "Adicionar Cliente",
    editClient: "Editar Cliente",
    deleteClient: "Excluir Cliente",
    deleteClientConfirm: "Tem certeza de que deseja excluir este cliente?",
    clientAdded: "Cliente adicionado com sucesso.",
    clientUpdated: "Cliente atualizado com sucesso.",
    clientDeleted: "Cliente excluído.",
    contactInfo: "Informações de Contato",
    billingInfo: "Informações de Cobrança",
    
    inbox: "Caixa de Entrada",
    sent: "Enviados",
    drafts: "Rascunhos",
    trash: "Lixeira",
    compose: "Escrever",
    reply: "Responder",
    replyAll: "Responder a Todos",
    forward: "Encaminhar",
    sendMessage: "Enviar Mensagem",
    newMessage: "Nova Mensagem",
    to: "Para",
    from: "De",
    subject: "Assunto",
    message: "Mensagem",
    attachFile: "Anexar Arquivo",
    noMessages: "Sem mensagens",
    messageSent: "Mensagem enviada com sucesso.",
    messageDeleted: "Mensagem excluída.",
    
    invoices: "Faturas",
    newInvoice: "Nova Fatura",
    invoiceNumber: "Número da Fatura",
    invoiceDate: "Data da Fatura",
    dueAmount: "Valor Devido",
    paidAmount: "Valor Pago",
    outstanding: "Pendente",
    invoiceStatus: "Status da Fatura",
    draft: "Rascunho",
    invoiceSent: "Enviada",
    paid: "Pago",
    overdueLower: "atrasado",
    partiallyPaid: "Parcialmente Pago",
    voided: "Anulado",
    lineItems: "Itens da Fatura",
    addLineItem: "Adicionar Item",
    removeLineItem: "Remover Item",
    paymentTerms: "Condições de Pagamento",
    invoiceNotes: "Notas da Fatura",
    sendInvoice: "Enviar Fatura",
    markAsPaid: "Marcar como Pago",
    
    proposals: "Propostas",
    newProposalBtn: "Nova Proposta",
    proposalTitle: "Título da Proposta",
    proposalScope: "Escopo do Trabalho",
    proposalTimeline: "Cronograma",
    proposalBudget: "Orçamento",
    proposalStatus: "Status da Proposta",
    accepted: "Aceita",
    rejected: "Rejeitada",
    proposalSent: "Proposta Enviada",
    
    contracts: "Contratos",
    newContractBtn: "Novo Contrato",
    contractTitle: "Título do Contrato",
    contractTerms: "Termos e Condições",
    contractStartDate: "Data de Início",
    contractEndDate: "Data de Término",
    contractValue: "Valor do Contrato",
    contractStatus: "Status do Contrato",
    active: "Ativo",
    expired: "Expirado",
    terminated: "Rescindido",
    
    confirmDelete: "Confirmar Exclusão",
    confirmDeleteMessage: "Esta ação não pode ser desfeita. Tem certeza de que deseja continuar?",
    confirmAction: "Confirmar Ação",
    unsavedChanges: "Alterações Não Salvas",
    unsavedChangesMessage: "Você tem alterações não salvas. Deseja salvar antes de sair?",
    discardChanges: "Descartar Alterações",
    keepEditing: "Continuar Editando",
    areYouSure: "Tem certeza?",
    cannotUndo: "Esta ação não pode ser desfeita.",
    
    overview: "Visão Geral",
    details: "Detalhes",
    history: "Histórico",
    files: "Arquivos",
    team: "Equipe",
    analytics: "Análises",
    reports: "Relatórios",
    
    noData: "Nenhum dado disponível",
    noResults: "Nenhum resultado encontrado",
    noItemsFound: "Nenhum item encontrado",
    getStarted: "Começar",
    
    error: "Erro",
    errorOccurred: "Ocorreu um erro",
    tryAgain: "Tentar Novamente",
    somethingWentWrong: "Algo deu errado",
    pageNotFound: "Página não encontrada",
    unauthorized: "Não autorizado",
    forbidden: "Proibido",
    
    success: "Sucesso",
    savedSuccessfully: "Salvo com sucesso",
    deletedSuccessfully: "Excluído com sucesso",
    updatedSuccessfully: "Atualizado com sucesso",
    createdSuccessfully: "Criado com sucesso",
    
    required: "Este campo é obrigatório",
    invalidEmail: "Por favor, insira um email válido",
    invalidPhone: "Por favor, insira um telefone válido",
    minLength: "O comprimento mínimo é",
    maxLength: "O comprimento máximo é",
    invalidFormat: "Formato inválido",
    
    tagline: "Ferramentas mais inteligentes para sonhos mais ousados",
    
    documents: "Documentos",
    folders: "Pastas",
    allDocuments: "Todos os Documentos",
    recentDocuments: "Documentos Recentes",
    sharedWithMe: "Compartilhados Comigo",
    myDocuments: "Meus Documentos",
    createFolder: "Criar Pasta",
    uploadDocument: "Enviar Documento",
    folderName: "Nome da Pasta",
    documentName: "Nome do Documento",
    lastModified: "Última Modificação",
    fileSize: "Tamanho do Arquivo",
    fileType: "Tipo de Arquivo",
    
    startTimer: "Iniciar Cronômetro",
    stopTimer: "Parar Cronômetro",
    pauseTimer: "Pausar Cronômetro",
    resumeTimer: "Retomar Cronômetro",
    timerRunning: "Cronômetro Ativo",
    timeEntry: "Registro de Tempo",
    timeEntries: "Registros de Tempo",
    hoursLogged: "Horas Registradas",
    todayHours: "Hoje",
    weekHours: "Esta Semana",
    monthHours: "Este Mês",
    
    searchResults: "Resultados da Pesquisa",
    filter: "Filtrar",
    sortBy: "Ordenar Por",
    ascending: "Crescente",
    descending: "Decrescente",
    newest: "Mais Recente",
    oldest: "Mais Antigo",
    alphabetical: "Alfabético",
    
    today: "Hoje",
    yesterday: "Ontem",
    tomorrow: "Amanhã",
    thisWeek: "Esta Semana",
    lastWeek: "Semana Passada",
    thisMonth: "Este Mês",
    lastMonth: "Mês Passado",
    custom: "Personalizado",
    selectDate: "Selecionar Data",
    selectDateRange: "Selecionar Período",
  },
  ja: {
    dashboard: "ダッシュボード",
    settings: "設定",
    messages: "メッセージ",
    tasks: "タスク",
    home: "ホーム",
    logout: "ログアウト",
    search: "検索",
    searchPlaceholder: "タスク、プロジェクト、クライアントを検索...",
    
    save: "保存",
    cancel: "キャンセル",
    delete: "削除",
    edit: "編集",
    create: "作成",
    add: "追加",
    remove: "削除",
    submit: "送信",
    close: "閉じる",
    confirm: "確認",
    tools: "ツール",
    back: "戻る",
    next: "次へ",
    previous: "前へ",
    finish: "完了",
    loading: "読み込み中...",
    saving: "保存中...",
    deleting: "削除中...",
    updating: "更新中...",
    yes: "はい",
    no: "いいえ",
    ok: "OK",
    apply: "適用",
    reset: "リセット",
    clear: "クリア",
    refresh: "更新",
    retry: "再試行",
    view: "表示",
    download: "ダウンロード",
    upload: "アップロード",
    export: "エクスポート",
    import: "インポート",
    duplicate: "複製",
    archive: "アーカイブ",
    restore: "復元",
    
    settingsTitle: "設定",
    settingsDescription: "アカウント設定と環境設定を管理",
    account: "アカウント",
    notifications: "通知",
    appearance: "外観",
    integrations: "統合",
    data: "データ",
    preferences: "環境設定",
    language: "言語",
    languageDescription: "表示言語を選択してください",
    timezone: "タイムゾーン",
    dateFormat: "日付形式",
    timeFormat: "時刻形式",
    savePreferences: "設定を保存",
    preferencesSaved: "設定が更新されました",
    profile: "プロフィール",
    security: "セキュリティ",
    privacy: "プライバシー",
    billing: "請求",
    
    myDashboard: "マイダッシュボード",
    welcomeMessage: "おかえりなさい！タスクとプロジェクトの状況です。",
    overdue: "期限切れ",
    dueSoon: "まもなく期限",
    highPriority: "高優先度",
    completedToday: "今日完了",
    timeTracking: "時間管理",
    
    clientManagement: "クライアント管理",
    clientManagementDesc: "クライアント関係と履歴を管理",
    messagesDesc: "クライアントとのコミュニケーション",
    createProposal: "提案書を作成",
    createProposalDesc: "プロフェッショナルなプロジェクト提案",
    createInvoice: "請求書を作成",
    createInvoiceDesc: "プロフェッショナルな請求",
    createContract: "契約書を作成",
    createContractDesc: "法的契約と条件",
    createPresentation: "プレゼンテーションを作成",
    createPresentationDesc: "スライドとプレゼンテーション",
    productivityTools: "生産性ツール",
    productivityToolsDesc: "時間管理とインサイト",
    agencyHub: "エージェンシーハブ",
    agencyHubDesc: "AI搭載マーケティングツール",
    filingCabinet: "ファイルキャビネット",
    filingCabinetDesc: "ドキュメントの保存",
    
    agentManagement: "エージェント管理",
    analyticsDashboard: "分析ダッシュボード",
    userManual: "ユーザーマニュアル",
    sparkNewTask: "新しいタスク",
    
    overdueTooltip: "期限を過ぎたタスク。クリックして確認・対応。",
    dueSoonTooltip: "24時間以内に期限のタスク。",
    highPriorityTooltip: "即座の対応が必要な高優先度タスク。",
    completedTodayTooltip: "今日完了したタスク。お疲れ様です！",
    timeTrackingTooltip: "時間管理ツールと生産性インサイトにアクセス。",
    clientManagementTooltip: "クライアントプロフィール、連絡先、関係履歴を管理。",
    messagesTooltip: "クライアントとプロフェッショナルなメールを送受信。",
    createProposalTooltip: "詳細な範囲、スケジュール、価格を含むプロフェッショナルな提案書を作成。",
    createInvoiceTooltip: "詳細なサービス、料金、支払条件を含むプロフェッショナルな請求書を生成。",
    createContractTooltip: "条件と署名追跡を含む法的契約を作成・管理。",
    createPresentationTooltip: "クライアントミーティングやプロジェクト更新用のプロフェッショナルなプレゼンテーションを作成。",
    productivityToolsTooltip: "タスクとプロジェクトに費やした時間を追跡。生産性パターンを監視。",
    agencyHubTooltip: "コンテンツ作成、画像生成を含むAI搭載マーケティングツールにアクセス。",
    filingCabinetTooltip: "すべてのドキュメントを一箇所に保存・整理。",
    
    projectFolders: "プロジェクトフォルダー",
    activeProjects: "アクティブなプロジェクト",
    noProjects: "プロジェクトがまだありません",
    createFirstProject: "最初のプロジェクトを作成して始めましょう",
    tasksCompleted: "タスク完了",
    outstandingItems: "未完了アイテム",
    projects: "プロジェクト",
    newProject: "新しいプロジェクト",
    projectName: "プロジェクト名",
    projectDescription: "プロジェクト説明",
    projectDetails: "プロジェクト詳細",
    projectSettings: "プロジェクト設定",
    projectMembers: "プロジェクトメンバー",
    
    allTasks: "すべて",
    activeTasks: "アクティブ",
    completedTasks: "完了",
    assignedTo: "担当者",
    everyone: "全員",
    newTask: "新しいタスク",
    taskName: "タスク名",
    taskDescription: "タスク説明",
    taskDetails: "タスク詳細",
    taskPriority: "タスク優先度",
    taskStatus: "タスクステータス",
    dueDate: "期限",
    startDate: "開始日",
    endDate: "終了日",
    priority: "優先度",
    status: "ステータス",
    assignee: "担当者",
    completed: "完了",
    inProgress: "進行中",
    pending: "保留中",
    notStarted: "未開始",
    onHold: "一時停止",
    cancelled: "キャンセル",
    low: "低",
    medium: "中",
    high: "高",
    urgent: "緊急",
    none: "なし",
    
    taskDetailTitle: "タスク詳細",
    taskDetailDescription: "タスク情報の表示と管理",
    progressNotes: "進捗ノート",
    addProgressNote: "進捗ノートを追加",
    progressDate: "日付",
    progressComment: "コメント",
    attachments: "添付ファイル",
    addAttachment: "添付ファイルを追加",
    comments: "コメント",
    addComment: "コメントを追加",
    activity: "アクティビティ",
    activityFeed: "アクティビティフィード",
    markComplete: "完了としてマーク",
    markIncomplete: "未完了としてマーク",
    reopenTask: "タスクを再開",
    deleteTask: "タスクを削除",
    deleteTaskConfirm: "このタスクを削除してもよろしいですか？この操作は元に戻せません。",
    taskCompleted: "タスクが完了としてマークされました。",
    taskReopened: "タスクが再開されました。",
    progressUpdated: "進捗が更新されました。",
    progressAdded: "進捗ノートが追加されました。",
    noAttachments: "添付ファイルなし",
    noComments: "コメントなし",
    noActivity: "アクティビティなし",
    noProgressNotes: "進捗ノートなし",
    writeComment: "コメントを書く...",
    
    admin: "管理者",
    user: "ユーザー",
    client: "クライアント",
    project: "プロジェクト",
    invoice: "請求書",
    proposal: "提案書",
    contract: "契約書",
    
    name: "名前",
    email: "メール",
    phone: "電話",
    address: "住所",
    city: "市区町村",
    state: "都道府県",
    country: "国",
    zipCode: "郵便番号",
    company: "会社",
    website: "ウェブサイト",
    notes: "メモ",
    description: "説明",
    title: "タイトル",
    amount: "金額",
    quantity: "数量",
    rate: "単価",
    total: "合計",
    subtotal: "小計",
    tax: "税金",
    discount: "割引",
    date: "日付",
    time: "時間",
    type: "タイプ",
    category: "カテゴリ",
    tags: "タグ",
    
    clients: "クライアント",
    newClient: "新しいクライアント",
    clientName: "クライアント名",
    clientEmail: "クライアントメール",
    clientPhone: "クライアント電話",
    clientCompany: "クライアント会社",
    clientAddress: "クライアント住所",
    clientDetails: "クライアント詳細",
    clientHistory: "クライアント履歴",
    clientProjects: "クライアントプロジェクト",
    clientInvoices: "クライアント請求書",
    noClients: "クライアントがまだいません",
    addClient: "クライアントを追加",
    editClient: "クライアントを編集",
    deleteClient: "クライアントを削除",
    deleteClientConfirm: "このクライアントを削除してもよろしいですか？",
    clientAdded: "クライアントが正常に追加されました。",
    clientUpdated: "クライアントが正常に更新されました。",
    clientDeleted: "クライアントが削除されました。",
    contactInfo: "連絡先情報",
    billingInfo: "請求情報",
    
    inbox: "受信トレイ",
    sent: "送信済み",
    drafts: "下書き",
    trash: "ゴミ箱",
    compose: "作成",
    reply: "返信",
    replyAll: "全員に返信",
    forward: "転送",
    sendMessage: "メッセージを送信",
    newMessage: "新しいメッセージ",
    to: "宛先",
    from: "差出人",
    subject: "件名",
    message: "メッセージ",
    attachFile: "ファイルを添付",
    noMessages: "メッセージなし",
    messageSent: "メッセージが正常に送信されました。",
    messageDeleted: "メッセージが削除されました。",
    
    invoices: "請求書",
    newInvoice: "新しい請求書",
    invoiceNumber: "請求書番号",
    invoiceDate: "請求日",
    dueAmount: "請求額",
    paidAmount: "支払済額",
    outstanding: "未払い",
    invoiceStatus: "請求書ステータス",
    draft: "下書き",
    invoiceSent: "送信済",
    paid: "支払済",
    overdueLower: "期限切れ",
    partiallyPaid: "一部支払済",
    voided: "無効",
    lineItems: "明細項目",
    addLineItem: "明細を追加",
    removeLineItem: "明細を削除",
    paymentTerms: "支払条件",
    invoiceNotes: "請求書メモ",
    sendInvoice: "請求書を送信",
    markAsPaid: "支払済としてマーク",
    
    proposals: "提案書",
    newProposalBtn: "新しい提案書",
    proposalTitle: "提案書タイトル",
    proposalScope: "作業範囲",
    proposalTimeline: "スケジュール",
    proposalBudget: "予算",
    proposalStatus: "提案書ステータス",
    accepted: "承認済",
    rejected: "却下",
    proposalSent: "提案書送信済",
    
    contracts: "契約書",
    newContractBtn: "新しい契約書",
    contractTitle: "契約書タイトル",
    contractTerms: "契約条件",
    contractStartDate: "開始日",
    contractEndDate: "終了日",
    contractValue: "契約金額",
    contractStatus: "契約ステータス",
    active: "有効",
    expired: "期限切れ",
    terminated: "解約済",
    
    confirmDelete: "削除の確認",
    confirmDeleteMessage: "この操作は元に戻せません。続行してもよろしいですか？",
    confirmAction: "操作の確認",
    unsavedChanges: "未保存の変更",
    unsavedChangesMessage: "未保存の変更があります。保存してから終了しますか？",
    discardChanges: "変更を破棄",
    keepEditing: "編集を続ける",
    areYouSure: "よろしいですか？",
    cannotUndo: "この操作は元に戻せません。",
    
    overview: "概要",
    details: "詳細",
    history: "履歴",
    files: "ファイル",
    team: "チーム",
    analytics: "分析",
    reports: "レポート",
    
    noData: "データがありません",
    noResults: "結果が見つかりません",
    noItemsFound: "アイテムが見つかりません",
    getStarted: "始める",
    
    error: "エラー",
    errorOccurred: "エラーが発生しました",
    tryAgain: "再試行",
    somethingWentWrong: "問題が発生しました",
    pageNotFound: "ページが見つかりません",
    unauthorized: "認証されていません",
    forbidden: "禁止されています",
    
    success: "成功",
    savedSuccessfully: "正常に保存されました",
    deletedSuccessfully: "正常に削除されました",
    updatedSuccessfully: "正常に更新されました",
    createdSuccessfully: "正常に作成されました",
    
    required: "この項目は必須です",
    invalidEmail: "有効なメールアドレスを入力してください",
    invalidPhone: "有効な電話番号を入力してください",
    minLength: "最小文字数は",
    maxLength: "最大文字数は",
    invalidFormat: "無効な形式",
    
    tagline: "より大胆な夢のためのよりスマートなツール",
    
    documents: "ドキュメント",
    folders: "フォルダ",
    allDocuments: "すべてのドキュメント",
    recentDocuments: "最近のドキュメント",
    sharedWithMe: "共有されたもの",
    myDocuments: "マイドキュメント",
    createFolder: "フォルダを作成",
    uploadDocument: "ドキュメントをアップロード",
    folderName: "フォルダ名",
    documentName: "ドキュメント名",
    lastModified: "最終更新",
    fileSize: "ファイルサイズ",
    fileType: "ファイルタイプ",
    
    startTimer: "タイマー開始",
    stopTimer: "タイマー停止",
    pauseTimer: "一時停止",
    resumeTimer: "再開",
    timerRunning: "タイマー実行中",
    timeEntry: "時間入力",
    timeEntries: "時間記録",
    hoursLogged: "記録された時間",
    todayHours: "今日",
    weekHours: "今週",
    monthHours: "今月",
    
    searchResults: "検索結果",
    filter: "フィルター",
    sortBy: "並べ替え",
    ascending: "昇順",
    descending: "降順",
    newest: "最新",
    oldest: "最古",
    alphabetical: "アルファベット順",
    
    today: "今日",
    yesterday: "昨日",
    tomorrow: "明日",
    thisWeek: "今週",
    lastWeek: "先週",
    thisMonth: "今月",
    lastMonth: "先月",
    custom: "カスタム",
    selectDate: "日付を選択",
    selectDateRange: "期間を選択",
  },
};

type I18nContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: keyof TranslationKeys) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("pref_language") || "en";
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("pref_language", lang);
  };

  useEffect(() => {
    const checkLanguage = () => {
      const stored = localStorage.getItem("pref_language");
      if (stored && stored !== language) {
        setLanguageState(stored);
      }
    };
    const interval = setInterval(checkLanguage, 500);
    return () => clearInterval(interval);
  }, [language]);

  const t = (key: keyof TranslationKeys): string => {
    const langTranslations = translations[language] || translations.en;
    return langTranslations[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
