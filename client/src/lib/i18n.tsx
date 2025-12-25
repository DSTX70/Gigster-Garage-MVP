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
    dashboard: "Panel de Control",
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
    add: "Añadir",
    remove: "Quitar",
    submit: "Enviar",
    close: "Cerrar",
    confirm: "Confirmar",
    
    settingsTitle: "Configuración",
    settingsDescription: "Administra la configuración de tu cuenta y preferencias",
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
    welcomeMessage: "¡Bienvenido! Aquí está lo que sucede con tus tareas y proyectos.",
    overdue: "Atrasado",
    dueSoon: "Próximo a Vencer",
    highPriority: "Alta Prioridad",
    completedToday: "Completado Hoy",
    timeTracking: "Seguimiento de Tiempo",
    
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
    timeFormat: "Format d'Heure",
    savePreferences: "Enregistrer les Préférences",
    preferencesSaved: "Vos préférences ont été mises à jour",
    
    myDashboard: "Mon Tableau de Bord",
    welcomeMessage: "Bienvenue! Voici ce qui se passe avec vos tâches et projets.",
    overdue: "En Retard",
    dueSoon: "Bientôt Dû",
    highPriority: "Haute Priorité",
    completedToday: "Terminé Aujourd'hui",
    timeTracking: "Suivi du Temps",
    
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
    welcomeMessage: "お帰りなさい！タスクとプロジェクトの状況をご確認ください。",
    overdue: "期限超過",
    dueSoon: "まもなく期限",
    highPriority: "高優先度",
    completedToday: "本日完了",
    timeTracking: "時間追跡",
    
    admin: "管理者",
    user: "ユーザー",
    client: "クライアント",
    project: "プロジェクト",
    invoice: "請求書",
    proposal: "提案書",
    contract: "契約書",
    
    tagline: "より大胆な夢のためのスマートなツール",
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

  // Listen for storage changes (in case language is changed in another tab or settings page)
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("pref_language") || "en";
      if (newLang !== language) {
        setLanguageState(newLang);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for changes from same-tab updates
    const interval = setInterval(() => {
      const storedLang = localStorage.getItem("pref_language") || "en";
      if (storedLang !== language) {
        setLanguageState(storedLang);
      }
    }, 500);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [language]);

  const t = (key: keyof TranslationKeys): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
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

export { translations };
export type { TranslationKeys };
