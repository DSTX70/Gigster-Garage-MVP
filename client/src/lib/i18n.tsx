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
  
  // Tasks section
  allTasks: string;
  activeTasks: string;
  completedTasks: string;
  assignedTo: string;
  everyone: string;
  
  // Common labels
  admin: string;
  user: string;
  client: string;
  project: string;
  invoice: string;
  proposal: string;
  contract: string;
  
  // Tagline
  tagline: string;
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
    
    allTasks: "All",
    activeTasks: "Active",
    completedTasks: "Completed",
    assignedTo: "Assigned to",
    everyone: "Everyone",
    
    admin: "Admin",
    user: "User",
    client: "Client",
    project: "Project",
    invoice: "Invoice",
    proposal: "Proposal",
    contract: "Contract",
    
    tagline: "Smarter tools for bolder dreams",
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
    
    allTasks: "Todas",
    activeTasks: "Activas",
    completedTasks: "Completadas",
    assignedTo: "Asignado a",
    everyone: "Todos",
    
    admin: "Administrador",
    user: "Usuario",
    client: "Cliente",
    project: "Proyecto",
    invoice: "Factura",
    proposal: "Propuesta",
    contract: "Contrato",
    
    tagline: "Herramientas más inteligentes para sueños más audaces",
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
    
    allTasks: "Toutes",
    activeTasks: "Actives",
    completedTasks: "Terminées",
    assignedTo: "Assigné à",
    everyone: "Tout le monde",
    
    admin: "Administrateur",
    user: "Utilisateur",
    client: "Client",
    project: "Projet",
    invoice: "Facture",
    proposal: "Proposition",
    contract: "Contrat",
    
    tagline: "Des outils plus intelligents pour des rêves plus audacieux",
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
    
    allTasks: "Alle",
    activeTasks: "Aktiv",
    completedTasks: "Erledigt",
    assignedTo: "Zugewiesen an",
    everyone: "Alle",
    
    admin: "Administrator",
    user: "Benutzer",
    client: "Kunde",
    project: "Projekt",
    invoice: "Rechnung",
    proposal: "Angebot",
    contract: "Vertrag",
    
    tagline: "Intelligentere Werkzeuge für kühnere Träume",
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
    productivityToolsDesc: "Controle de tempo e relatórios",
    agencyHub: "Central da Agência",
    agencyHubDesc: "Ferramentas de marketing com IA",
    filingCabinet: "Arquivo",
    filingCabinetDesc: "Armazenamento de documentos",
    
    agentManagement: "Gestão de Agentes",
    analyticsDashboard: "Painel de Análise",
    userManual: "Manual do Usuário",
    sparkNewTask: "Nova Tarefa",
    
    overdueTooltip: "Tarefas atrasadas. Clique para ver e agir.",
    dueSoonTooltip: "Tarefas com vencimento nas próximas 24 horas.",
    highPriorityTooltip: "Tarefas marcadas como alta prioridade que precisam de atenção imediata.",
    completedTodayTooltip: "Tarefas concluídas hoje. Bom trabalho!",
    timeTrackingTooltip: "Acesse ferramentas de controle de tempo e informações de produtividade.",
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
    
    allTasks: "Todas",
    activeTasks: "Ativas",
    completedTasks: "Concluídas",
    assignedTo: "Atribuído a",
    everyone: "Todos",
    
    admin: "Administrador",
    user: "Usuário",
    client: "Cliente",
    project: "Projeto",
    invoice: "Fatura",
    proposal: "Proposta",
    contract: "Contrato",
    
    tagline: "Ferramentas mais inteligentes para sonhos mais ousados",
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
    
    allTasks: "すべて",
    activeTasks: "アクティブ",
    completedTasks: "完了",
    assignedTo: "担当者",
    everyone: "全員",
    
    admin: "管理者",
    user: "ユーザー",
    client: "クライアント",
    project: "プロジェクト",
    invoice: "請求書",
    proposal: "提案書",
    contract: "契約書",
    
    tagline: "より大胆な夢のためのよりスマートなツール",
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
