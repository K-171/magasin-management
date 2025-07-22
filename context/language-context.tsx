"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "es" | "fr" | "de"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    newItems: "New Items",
    allStock: "All Stock",
    reports: "Reports",
    settings: "Settings",
    adminPanel: "Admin Panel",
    movementLog: "Movement Log",
    addMovement: "Add Movement",
    manageStock: "Manage Stock",
    logMovement: "Log Movement",

    // Common
    search: "Search",
    filters: "Filters",
    actions: "Actions",
    status: "Status",
    category: "Category",
    quantity: "Quantity",
    itemName: "Item Name",
    itemId: "Item ID",
    dateAdded: "Date Added",

    // Buttons
    addNewItem: "Add New Item",
    editItem: "Edit Item",
    updateItem: "Update Item",
    deleteItem: "Delete Item",
    importData: "Import Data",
    exportExcel: "Export Excel",
    exportCSV: "Export CSV",
    clearFilters: "Clear Filters",
    checkout: "Check-out",
    checkin: "Check-in",

    // Placeholders
    searchPlaceholder: "Search for items...",
    enterItemName: "Enter item name",
    enterQuantity: "Enter quantity",
    selectCategory: "Select category",

    // Pages
    newlyAddedItems: "Newly Added Items",
    queryResults: "Query Results",
    inventoryItems: "Inventory Items",
    allStockTitle: "All Stock",
    inventoryReports: "Inventory Reports",
    movementHistory: "Movement History",

    // Movement Log
    movementDate: "Movement Date",
    movementType: "Movement Type",
    handledBy: "Handled By",
    expectedReturnDate: "Expected Return Date",
    checkoutDate: "Checkout Date",

    // Movement Types
    entry: "Entry",
    exit: "Exit",

    // Movement Status
    onLoan: "On Loan",
    returned: "Returned",
    overdue: "Overdue",

    // Other
    companyName: "Your Company",
    logout: "Logout",
    noAlertsMessage: "No alerts at this time",
    totalInventory: "Total Inventory",
    lowStockItems: "Low Stock Items",
    outOfStock: "Out of Stock",
    quickActions: "Quick Actions",
    importInventoryData: "Import Inventory Data",
    recentActivity: "Recent Activity",
    inventoryStatus: "Inventory Status",
    inStock: "In Stock",
    lowStock: "Low Stock",
    inventoryAlerts: "Inventory Alerts",
    consumableTurnover: "Consumable Turnover",
    overdueItems: "Overdue Items",
    mostActiveItems: "Most Active Items",
    mostActiveUsers: "Most Active Users",
    checkouts: "Checkouts",
    userName: "User Name",
    selectMovementType: "Select movement type",
    selectItem: "Select item",
    enterHandlerName: "Enter handler's name",
    "Outillage": "Tooling",
    "Pièce consomable": "Consumable Part",
    clearLog: "Clear Log",
    confirmClearLog: "Are you sure you want to permanently delete the entire movement log? This action cannot be undone.",
    timeFrame: "Time Frame",
    allTime: "All Time",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastQuarter: "Last Quarter",
    inventoryReport: "Inventory Report",
    distributionAnalysis: "Distribution Analysis",
    categoryDistribution: "Category Distribution",
    statusDistribution: "Status Distribution",
    items: "items",
    invitationSentSuccess: "Invitation sent successfully!",
    failedToCreateInvitation: "Failed to create invitation",
    unexpectedError: "An unexpected error occurred",
    confirmRevokeInvitation: "Are you sure you want to revoke this invitation?",
    invitationRevokedSuccess: "Invitation revoked successfully",
    failedToRevokeInvitation: "Failed to revoke invitation",
    used: "Used",
    expired: "Expired",
    pending: "Pending",
    totalInvitations: "Total Invitations",
    userInvitations: "User Invitations",
    manageUserAccess: "Manage user access to the inventory system",
    inviteUser: "Invite User",
    createInvitation: "Create Invitation",
    emailAddress: "Email Address",
    emailPlaceholder: "user@example.com",
    role: "Role",
    selectRole: "Select role",
    userRole: "User",
    managerRole: "Manager",
    adminRole: "Administrator",
    sending: "Sending...",
    sendInvitation: "Send Invitation",
    noInvitationsYet: "No invitations created yet",
    status: "Status",
    email: "Email",
    created: "Created",
    expires: "Expires",
    actions: "Actions",
    revoke: "Revoke",
    profile: "Profile",
    notifications: "Notifications",
    security: "Security",
    dataManagement: "Data Management",
    profileSettings: "Profile Settings",
    manageAccountInfo: "Manage your account information and preferences.",
    changeAvatar: "Change Avatar",
    avatarUploadInfo: "JPG, GIF or PNG. Max size of 800K",
    firstName: "First Name",
    lastName: "Last Name",
    username: "Username",
    emailAddress: "Email Address",
    saveChanges: "Save Changes",
    notificationSettings: "Notification Settings",
    configureNotifications: "Configure how you receive notifications and alerts.",
    emailNotifications: "Email Notifications",
    receiveEmailUpdates: "Receive email notifications for important updates",
    lowStockAlerts: "Low Stock Alerts",
    getNotifiedLowStock: "Get notified when items are running low",
    systemUpdates: "System Updates",
    receiveSystemUpdates: "Receive notifications about system updates and maintenance",
    weeklyActivitySummary: "Weekly Activity Summary",
    getWeeklySummary: "Get a weekly summary of inventory changes and activities",
    securitySettings: "Security Settings",
    manageSecurityOptions: "Manage your account security and authentication options.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    twoFactorAuth: "Two-Factor Authentication",
    addExtraSecurity: "Add an extra layer of security to your account",
    sessionTimeout: "Session Timeout",
    selectTimeout: "Select timeout",
    minutes: "minutes",
    hours: "hours",
    saveSecuritySettings: "Save Security Settings",
    dataManagementTitle: "Data Management",
    dataManagementDescription: "Guidelines and information for importing and exporting inventory data.",
    importingData: "Importing Data",
    supportedFileFormats: "Supported File Formats",
    importFileFormats: "You can import data using Microsoft Excel (.xlsx) or Comma-Separated Values (.csv) files.",
    requiredColumns: "Required Columns",
    requiredColumnsInfo: "Your file must contain the following columns (the header names must match exactly):",
    importingTips: "Importing Tips",
    ensureColumnsPresent: "Ensure all required columns are present and correctly named.",
    uniqueId: "The id for each item must be unique. If an ID already exists, the import for that row will fail.",
    quantityWholeNumber: "The quantity must be a whole number.",
    categoryAutoCreated: "If a category does not exist, it will be automatically created.",
    systemSetsDateStatus: "The system automatically sets the date added and initial status based on the quantity.",
    exportingData: "Exporting Data",
    "use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "es" | "fr" | "de"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [translations, setTranslations] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`)
        if (!response.ok) {
          console.error(`Failed to fetch translations for ${language}`)
          // Fallback to English if the selected language fails
          if (language !== 'en') {
            const fallbackResponse = await fetch(`/locales/en.json`);
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
          return
        }
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error("Error loading translations:", error)
        // Fallback to English on any error
        if (language !== 'en') {
            const fallbackResponse = await fetch(`/locales/en.json`);
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
      }
    }

    fetchTranslations()
  }, [language])

  const t = (key: string): string => {
    return translations[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

    avatarUpdatedSuccess: "Avatar updated successfully!",
    failedToUpdateAvatar: "Failed to update avatar",
    avatarUploadError: "An unexpected error occurred during avatar upload.",
    profileUpdatedSuccess: "Profile updated successfully!",
    failedToUpdateProfile: "Failed to update profile",
  },
  es: {
    // Navigation
    dashboard: "Panel de Control",
    newItems: "Nuevos Artículos",
    allStock: "Todo el Stock",
    reports: "Reportes",
    settings: "Configuración",
    adminPanel: "Panel de Administrador",
    movementLog: "Registro de Movimientos",
    addMovement: "Agregar Movimiento",
    manageStock: "Gestionar Stock",
    logMovement: "Registrar Movimiento",

    // Common
    search: "Buscar",
    filters: "Filtros",
    actions: "Acciones",
    status: "Estado",
    category: "Categoría",
    quantity: "Cantidad",
    itemName: "Nombre del Artículo",
    itemId: "ID del Artículo",
    dateAdded: "Fecha Agregada",

    // Buttons
    addNewItem: "Agregar Nuevo Artículo",
    editItem: "Editar Artículo",
    updateItem: "Actualizar Artículo",
    deleteItem: "Eliminar Artículo",
    importData: "Importar Datos",
    exportExcel: "Exportar Excel",
    exportCSV: "Exportar CSV",
    clearFilters: "Limpiar Filtros",
    checkout: "Prestar",
    checkin: "Devolver",

    // Placeholders
    searchPlaceholder: "Buscar artículos...",
    enterItemName: "Ingrese nombre del artículo",
    enterQuantity: "Ingrese cantidad",
    selectCategory: "Seleccione categoría",

    // Pages
    newlyAddedItems: "Artículos Recién Agregados",
    queryResults: "Resultados de Consulta",
    inventoryItems: "Artículos del Inventario",
    allStockTitle: "Todo el Stock",
    inventoryReports: "Reportes de Inventario",
    movementHistory: "Historial de Movimientos",

    // Movement Log
    movementDate: "Fecha de Movimiento",
    movementType: "Tipo de Movimiento",
    handledBy: "Manejado Por",
    expectedReturnDate: "Fecha de Devolución Esperada",
    checkoutDate: "Fecha de Préstamo",

    // Movement Types
    entry: "Entrada",
    exit: "Salida",

    // Movement Status
    onLoan: "En Préstamo",
    returned: "Devuelto",
    overdue: "Vencido",

    // Other
    companyName: "Su Empresa",
    logout: "Cerrar Sesión",
    noAlertsMessage: "No hay alertas en este momento",
    totalInventory: "Inventario Total",
    lowStockItems: "Artículos con Stock Bajo",
    outOfStock: "Agotado",
    quickActions: "Acciones Rápidas",
    importInventoryData: "Importar Datos de Inventario",
    recentActivity: "Actividad Reciente",
    inventoryStatus: "Estado del Inventario",
    inStock: "En Stock",
    lowStock: "Stock Bajo",
    inventoryAlerts: "Alertas de Inventario",
    consumableTurnover: "Rotación de Consumibles",
    overdueItems: "Artículos Vencidos",
    mostActiveItems: "Artículos Más Activos",
    mostActiveUsers: "Usuarios Más Activos",
    checkouts: "Préstamos",
    userName: "Nombre de Usuario",
    selectMovementType: "Seleccionar tipo de movimiento",
    selectItem: "Seleccionar artículo",
    enterHandlerName: "Ingrese el nombre del responsable",
    "Outillage": "Herramientas",
    "Pièce consomable": "Pieza Consumible",
    clearLog: "Limpiar Registro",
    confirmClearLog: "¿Está seguro de que desea eliminar permanentemente todo el registro de movimientos? Esta acción no se puede deshacer.",
    timeFrame: "Período de Tiempo",
    allTime: "Todo el Tiempo",
    lastWeek: "Última Semana",
    lastMonth: "Último Mes",
    lastQuarter: "Último Trimestre",
    inventoryReport: "Reporte de Inventario",
    distributionAnalysis: "Análisis de Distribución",
    categoryDistribution: "Distribución por Categoría",
    statusDistribution: "Distribución por Estado",
    items: "artículos",
    invitationSentSuccess: "¡Invitación enviada con éxito!",
    failedToCreateInvitation: "Error al crear la invitación",
    unexpectedError: "Ocurrió un error inesperado",
    confirmRevokeInvitation: "¿Está seguro de que desea revocar esta invitación?",
    invitationRevokedSuccess: "Invitación revocada con éxito",
    failedToRevokeInvitation: "Error al revocar la invitación",
    used: "Usada",
    expired: "Expirada",
    pending: "Pendiente",
    totalInvitations: "Total de Invitaciones",
    userInvitations: "Invitaciones de Usuario",
    manageUserAccess: "Administrar el acceso de usuarios al sistema de inventario",
    inviteUser: "Invitar Usuario",
    createInvitation: "Crear Invitación",
    emailAddress: "Dirección de Correo Electrónico",
    emailPlaceholder: "usuario@ejemplo.com",
    role: "Rol",
    selectRole: "Seleccionar rol",
    userRole: "Usuario",
    managerRole: "Gerente",
    adminRole: "Administrador",
    sending: "Enviando...",
    sendInvitation: "Enviar Invitación",
    noInvitationsYet: "No se han creado invitaciones aún",
    status: "Estado",
    email: "Correo Electrónico",
    created: "Creada",
    expires: "Expira",
    actions: "Acciones",
    revoke: "Revocar",
    profile: "Perfil",
    notifications: "Notificaciones",
    security: "Seguridad",
    dataManagement: "Gestión de Datos",
    profileSettings: "Configuración del Perfil",
    manageAccountInfo: "Administre la información y preferencias de su cuenta.",
    changeAvatar: "Cambiar Avatar",
    avatarUploadInfo: "JPG, GIF o PNG. Tamaño máximo de 800K",
    firstName: "Nombre",
    lastName: "Apellido",
    username: "Nombre de Usuario",
    emailAddress: "Dirección de Correo Electrónico",
    saveChanges: "Guardar Cambios",
    notificationSettings: "Configuración de Notificaciones",
    configureNotifications: "Configure cómo recibe notificaciones y alertas.",
    emailNotifications: "Notificaciones por Correo Electrónico",
    receiveEmailUpdates: "Reciba notificaciones por correo electrónico para actualizaciones importantes",
    lowStockAlerts: "Alertas de Stock Bajo",
    getNotifiedLowStock: "Reciba notificaciones cuando los artículos se estén agotando",
    systemUpdates: "Actualizaciones del Sistema",
    receiveSystemUpdates: "Reciba notificaciones sobre actualizaciones y mantenimiento del sistema",
    weeklyActivitySummary: "Resumen Semanal de Actividad",
    getWeeklySummary: "Obtenga un resumen semanal de los cambios y actividades del inventario",
    securitySettings: "Configuración de Seguridad",
    manageSecurityOptions: "Administre la seguridad de su cuenta y las opciones de autenticación.",
    currentPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    confirmNewPassword: "Confirmar Nueva Contraseña",
    twoFactorAuth: "Autenticación de Dos Factores",
    addExtraSecurity: "Agregue una capa adicional de seguridad a su cuenta",
    sessionTimeout: "Tiempo de Espera de Sesión",
    selectTimeout: "Seleccionar tiempo de espera",
    minutes: "minutos",
    hours: "horas",
    saveSecuritySettings: "Guardar Configuración de Seguridad",
    dataManagementTitle: "Gestión de Datos",
    dataManagementDescription: "Directrices e información para importar y exportar datos de inventario.",
    importingData: "Importación de Datos",
    supportedFileFormats: "Formatos de Archivo Compatibles",
    importFileFormats: "Puede importar datos usando archivos de Microsoft Excel (.xlsx) o Valores Separados por Comas (.csv).",
    requiredColumns: "Columnas Requeridas",
    requiredColumnsInfo: "Su archivo debe contener las siguientes columnas (los nombres de los encabezados deben coincidir exactamente):",
    importingTips: "Consejos de Importación",
    ensureColumnsPresent: "Asegúrese de que todas las columnas requeridas estén presentes y nombradas correctamente.",
    uniqueId: "El ID de cada artículo debe ser único. Si un ID ya existe, la importación de esa fila fallará.",
    quantityWholeNumber: "La cantidad debe ser un número entero.",
    categoryAutoCreated: "Si una categoría no existe, se creará automáticamente.",
    systemSetsDateStatus: "El sistema establece automáticamente la fecha de adición y el estado inicial según la cantidad.",
    exportingData: "Exportación de Datos",
    exportDataInfo: "Puede exportar sus datos de inventario desde las páginas \"Todo el Stock\" o \"Reportes\". La herramienta de exportación le permite descargar la vista actual como un archivo de Excel (.xlsx). Puede seleccionar qué columnas incluir en el informe final.",
    avatarUpdatedSuccess: "¡Avatar actualizado con éxito!",
    failedToUpdateAvatar: "Error al actualizar el avatar",
    avatarUploadError: "Ocurrió un error inesperado durante la carga del avatar.",
    profileUpdatedSuccess: "¡Perfil actualizado con éxito!",
    failedToUpdateProfile: "Error al actualizar el perfil"}
  },
  fr: {
    // Navigation
    dashboard: "Tableau de Bord",
    newItems: "Nouveaux Articles",
    allStock: "Tout le Stock",
    reports: "Rapports",
    settings: "Paramètres",
    adminPanel: "Panneau d'Administration",
    movementLog: "Journal des Mouvements",
    addMovement: "Ajouter un Mouvement",
    manageStock: "Gérer le Stock",
    logMovement: "Enregistrer un Mouvement",

    // Common
    search: "Rechercher",
    filters: "Filtres",
    actions: "Actions",
    status: "Statut",
    category: "Catégorie",
    quantity: "Quantité",
    itemName: "Nom de l'Article",
    itemId: "ID de l'Article",
    dateAdded: "Date Ajoutée",

    // Buttons
    addNewItem: "Ajouter Nouvel Article",
    editItem: "Modifier Article",
    updateItem: "Mettre à Jour Article",
    deleteItem: "Supprimer Article",
    importData: "Importer Données",
    exportExcel: "Exporter Excel",
    exportCSV: "Exporter CSV",
    clearFilters: "Effacer Filtres",
    checkout: "Emprunter",
    checkin: "Retourner",

    // Placeholders
    searchPlaceholder: "Rechercher des articles...",
    enterItemName: "Entrez le nom de l'article",
    enterQuantity: "Entrez la quantité",
    selectCategory: "Sélectionnez la catégorie",

    // Pages
    newlyAddedItems: "Articles Récemment Ajoutés",
    queryResults: "Résultats de Requête",
    inventoryItems: "Articles d'Inventaire",
    allStockTitle: "Tout le Stock",
    inventoryReports: "Rapports d'Inventaire",
    movementHistory: "Historique des Mouvements",

    // Movement Log
    movementDate: "Date de Mouvement",
    movementType: "Type de Mouvement",
    handledBy: "Géré Par",
    expectedReturnDate: "Date de Retour Prévue",
    checkoutDate: "Date d'Emprunt",

    // Movement Types
    entry: "Entrée",
    exit: "Sortie",

    // Movement Status
    onLoan: "En Prêt",
    returned: "Retourné",
    overdue: "En Retard",

    // Other
    companyName: "Votre Entreprise",
    logout: "Déconnexion",
    noAlertsMessage: "Aucune alerte pour le moment",
    totalInventory: "Inventaire Total",
    lowStockItems: "Articles à Stock Faible",
    outOfStock: "En Rupture de Stock",
    quickActions: "Actions Rapides",
    importInventoryData: "Importer les Données d'Inventaire",
    recentActivity: "Activité Récente",
    inventoryStatus: "État de l'Inventaire",
    inStock: "En Stock",
    lowStock: "Stock Faible",
    inventoryAlerts: "Alertes d'Inventaire",
    consumableTurnover: "Rotation des Consommables",
    overdueItems: "Articles en Retard",
    mostActiveItems: "Articles les Plus Actifs",
    mostActiveUsers: "Utilisateurs les Plus Actifs",
    checkouts: "Emprunts",
    userName: "Nom d'Utilisateur",
    selectMovementType: "Sélectionner le type de mouvement",
    selectItem: "Sélectionner l'article",
    enterHandlerName: "Entrez le nom du responsable",
    "Outillage": "Outillage",
    "Pièce consomable": "Pièce Consomable",
    clearLog: "Effacer le Journal",
    confirmClearLog: "Êtes-vous sûr de vouloir supprimer définitivement tout le journal des mouvements ? Cette action est irréversible.",
    timeFrame: "Période",
    allTime: "Tout le Temps",
    lastWeek: "La Semaine Dernière",
    lastMonth: "Le Mois Dernier",
    lastQuarter: "Le Dernier Trimestre",
    inventoryReport: "Rapport d'Inventaire",
    distributionAnalysis: "Analyse de la Distribution",
    categoryDistribution: "Distribution par Catégorie",
    statusDistribution: "Distribution par Statut",
    items: "articles",
    invitationSentSuccess: "Invitation envoyée avec succès !",
    failedToCreateInvitation: "Échec de la création de l'invitation",
    unexpectedError: "Une erreur inattendue est survenue",
    confirmRevokeInvitation: "Êtes-vous sûr de vouloir révoquer cette invitation ?",
    invitationRevokedSuccess: "Invitation révoquée avec succès",
    failedToRevokeInvitation: "Échec de la révocation de l'invitation",
    used: "Utilisée",
    expired: "Expirée",
    pending: "En attente",
    totalInvitations: "Total des Invitations",
    userInvitations: "Invitations d'Utilisateur",
    manageUserAccess: "Gérer l'accès des utilisateurs au système d'inventaire",
    inviteUser: "Inviter un Utilisateur",
    createInvitation: "Créer une Invitation",
    emailAddress: "Adresse E-mail",
    emailPlaceholder: "utilisateur@exemple.com",
    role: "Rôle",
    selectRole: "Sélectionner le rôle",
    userRole: "Utilisateur",
    managerRole: "Manager",
    adminRole: "Administrateur",
    sending: "Envoi...",
    sendInvitation: "Envoyer l'Invitation",
    noInvitationsYet: "Aucune invitation créée pour l'instant",
    status: "Statut",
    email: "E-mail",
    created: "Créée",
    expires: "Expire",
    actions: "Actions",
    revoke: "Révoquer",
    profile: "Profil",
    notifications: "Notifications",
    security: "Sécurité",
    dataManagement: "Gestion des Données",
    profileSettings: "Paramètres du Profil",
    manageAccountInfo: "Gérez les informations de votre compte et vos préférences.",
    changeAvatar: "Changer l'Avatar",
    avatarUploadInfo: "JPG, GIF ou PNG. Taille maximale de 800K",
    firstName: "Prénom",
    lastName: "Nom de Famille",
    username: "Nom d'Utilisateur",
    emailAddress: "Adresse E-mail",
    saveChanges: "Enregistrer les Modifications",
    notificationSettings: "Paramètres de Notification",
    configureNotifications: "Configurez la façon dont vous recevez les notifications et les alertes.",
    emailNotifications: "Notifications par E-mail",
    receiveEmailUpdates: "Recevez des notifications par e-mail pour les mises à jour importantes",
    lowStockAlerts: "Alertes de Stock Faible",
    getNotifiedLowStock: "Soyez averti lorsque les articles sont en faible quantité",
    systemUpdates: "Mises à Jour du Système",
    receiveSystemUpdates: "Recevez des notifications concernant les mises à jour et la maintenance du système",
    weeklyActivitySummary: "Résumé Hebdomadaire d'Activité",
    getWeeklySummary: "Obtenez un résumé hebdomadaire des changements et activités de l'inventaire",
    securitySettings: "Paramètres de Sécurité",
    manageSecurityOptions: "Gérez la sécurité de votre compte et les options d'authentification.",
    currentPassword: "Mot de Passe Actuel",
    newPassword: "Nouveau Mot de Passe",
    confirmNewPassword: "Confirmer le Nouveau Mot de Passe",
    twoFactorAuth: "Authentification à Deux Facteurs",
    addExtraSecurity: "Ajoutez une couche de sécurité supplémentaire à votre compte",
    sessionTimeout: "Délai d'Expiration de la Session",
    selectTimeout: "Sélectionner le délai",
    minutes: "minutes",
    hours: "heures",
    saveSecuritySettings: "Enregistrer les Paramètres de Sécurité",
    dataManagementTitle: "Gestion des Données",
    dataManagementDescription: "Directives et informations pour l'importation et l'exportation des données d'inventaire.",
    importingData: "Importation de Données",
    supportedFileFormats: "Formats de Fichier Pris en Charge",
    importFileFormats: "Vous pouvez importer des données en utilisant des fichiers Microsoft Excel (.xlsx) ou des fichiers de valeurs séparées par des virgules (.csv).",
    requiredColumns: "Colonnes Requises",
    requiredColumnsInfo: "Votre fichier doit contenir les colonnes suivantes (les noms d'en-tête doivent correspondre exactement) :",
    importingTips: "Conseils d'Importation",
    ensureColumnsPresent: "Assurez-vous que toutes les colonnes requises sont présentes et nommées correctement.",
    uniqueId: "L'ID de chaque article doit être unique. Si un ID existe déjà, l'importation de cette ligne échouera.",
    quantityWholeNumber: "La quantité doit être un nombre entier.",
    categoryAutoCreated: "Si une catégorie n'existe pas, elle sera automatiquement créée.",
    systemSetsDateStatus: "Le système définit automatiquement la date d'ajout et le statut initial en fonction de la quantité.",
    exportingData: "Exportation de Données",
    exportDataInfo: "Vous pouvez exporter vos données d'inventaire depuis les pages \"Tout le Stock\" ou \"Rapports\". L'outil d'exportation vous permet de télécharger la vue actuelle sous forme de fichier Excel (.xlsx). Vous pouvez sélectionner les colonnes à inclure dans le rapport final.",
    avatarUpdatedSuccess: "Avatar mis à jour avec succès !",
    failedToUpdateAvatar: "Échec de la mise à jour de l'avatar",
    avatarUploadError: "Une erreur inattendue est survenue lors du téléchargement de l'avatar.",
    profileUpdatedSuccess: "Profil mis à jour avec succès !",
    failedToUpdateProfile: "Échec de la mise à jour du profil"}
  },
  de: {
    // Navigation
    dashboard: "Dashboard",
    newItems: "Neue Artikel",
    allStock: "Gesamter Bestand",
    reports: "Berichte",
    settings: "Einstellungen",
    adminPanel: "Admin-Panel",
    movementLog: "Bewegungsprotokoll",
    addMovement: "Bewegung hinzufügen",
    manageStock: "Bestand verwalten",
    logMovement: "Bewegung protokollieren",

    // Common
    search: "Suchen",
    filters: "Filter",
    actions: "Aktionen",
    status: "Status",
    category: "Kategorie",
    quantity: "Menge",
    itemName: "Artikelname",
    itemId: "Artikel-ID",
    dateAdded: "Hinzugefügt am",

    // Buttons
    addNewItem: "Neuen Artikel hinzufügen",
    editItem: "Artikel bearbeiten",
    updateItem: "Artikel aktualisieren",
    deleteItem: "Artikel löschen",
    importData: "Daten importieren",
    exportExcel: "Excel exportieren",
    exportCSV: "CSV exportieren",
    clearFilters: "Filter löschen",
    checkout: "Ausleihen",
    checkin: "Zurückgeben",

    // Placeholders
    searchPlaceholder: "Nach Artikeln suchen...",
    enterItemName: "Artikelname eingeben",
    enterQuantity: "Menge eingeben",
    selectCategory: "Kategorie auswählen",

    // Pages
    newlyAddedItems: "Neu hinzugefügte Artikel",
    queryResults: "Abfrageergebnisse",
    inventoryItems: "Inventarartikel",
    allStockTitle: "Gesamter Bestand",
    inventoryReports: "Inventarberichte",
    movementHistory: "Bewegungshistorie",

    // Movement Log
    movementDate: "Bewegungsdatum",
    movementType: "Bewegungstyp",
    handledBy: "Bearbeitet von",
    expectedReturnDate: "Erwartetes Rückgabedatum",
    checkoutDate: "Ausleihdatum",

    // Movement Types
    entry: "Eingang",
    exit: "Ausgang",

    // Movement Status
    onLoan: "Ausgeliehen",
    returned: "Zurückgegeben",
    overdue: "Überfällig",

    // Other
    companyName: "Ihr Unternehmen",
    logout: "Abmelden",
    noAlertsMessage: "Keine Benachrichtigungen zu diesem Zeitpunkt",
    totalInventory: "Gesamtinventar",
    lowStockItems: "Artikel mit geringem Lagerbestand",
    outOfStock: "Nicht vorrätig",
    quickActions: "Schnellaktionen",
    importInventoryData: "Inventurdaten importieren",
    recentActivity: "Letzte Aktivitäten",
    inventoryStatus: "Lagerstatus",
    inStock: "Auf Lager",
    lowStock: "Geringer Lagerbestand",
    inventoryAlerts: "Inventarwarnungen",
    consumableTurnover: "Verbrauchsmaterial-Umsatz",
    overdueItems: "Überfällige Artikel",
    mostActiveItems: "Aktivste Artikel",
    mostActiveUsers: "Aktivste Benutzer",
    checkouts: "Ausleihen",
    userName: "Benutzername",
    selectMovementType: "Bewegungsart auswählen",
    selectItem: "Artikel auswählen",
    enterHandlerName: "Name des Bearbeiters eingeben",
    "Outillage": "Werkzeuge",
    "Pièce consomable": "Verbrauchsteil",
    clearLog: "Protokoll löschen",
    confirmClearLog: "Möchten Sie das gesamte Bewegungsprotokoll wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    timeFrame: "Zeitrahmen",
    allTime: "Gesamte Zeit",
    lastWeek: "Letzte Woche",
    lastMonth: "Letzter Monat",
    lastQuarter: "Letztes Quartal",
    inventoryReport: "Inventarbericht",
    distributionAnalysis: "Verteilungsanalyse",
    categoryDistribution: "Kategorieverteilung",
    statusDistribution: "Statusverteilung",
    items: "artikel",
    invitationSentSuccess: "Einladung erfolgreich gesendet!",
    failedToCreateInvitation: "Einladung konnte nicht erstellt werden",
    unexpectedError: "Ein unerwarteter Fehler ist aufgetreten",
    confirmRevokeInvitation: "Möchten Sie diese Einladung wirklich widerrufen?",
    invitationRevokedSuccess: "Einladung erfolgreich widerrufen",
    failedToRevokeInvitation: "Einladung konnte nicht widerrufen werden",
    used: "Verwendet",
    expired: "Abgelaufen",
    pending: "Ausstehend",
    totalInvitations: "Gesamte Einladungen",
    userInvitations: "Benutzereinladungen",
    manageUserAccess: "Benutzerzugriff auf das Inventarsystem verwalten",
    inviteUser: "Benutzer einladen",
    createInvitation: "Einladung erstellen",
    emailAddress: "E-Mail-Adresse",
    emailPlaceholder: "benutzer@beispiel.com",
    role: "Rolle",
    selectRole: "Rolle auswählen",
    userRole: "Benutzer",
    managerRole: "Manager",
    adminRole: "Administrator",
    sending: "Senden...",
    sendInvitation: "Einladung senden",
    noInvitationsYet: "Noch keine Einladungen erstellt",
    status: "Status",
    email: "E-Mail",
    created: "Erstellt",
    expires: "Läuft ab",
    actions: "Aktionen",
    revoke: "Widerrufen",
    profile: "Profil",
    notifications: "Benachrichtigungen",
    security: "Sicherheit",
    dataManagement: "Datenverwaltung",
    profileSettings: "Profileinstellungen",
    manageAccountInfo: "Verwalten Sie Ihre Kontoinformationen und Präferenzen.",
    changeAvatar: "Avatar ändern",
    avatarUploadInfo: "JPG, GIF oder PNG. Maximale Größe 800K",
    firstName: "Vorname",
    lastName: "Nachname",
    username: "Benutzername",
    emailAddress: "E-Mail-Adresse",
    saveChanges: "Änderungen speichern",
    notificationSettings: "Benachrichtigungseinstellungen",
    configureNotifications: "Konfigurieren Sie, wie Sie Benachrichtigungen und Warnungen erhalten.",
    emailNotifications: "E-Mail-Benachrichtigungen",
    receiveEmailUpdates: "Erhalten Sie E-Mail-Benachrichtigungen für wichtige Updates",
    lowStockAlerts: "Warnungen bei niedrigem Lagerbestand",
    getNotifiedLowStock: "Benachrichtigung erhalten, wenn Artikel zur Neige gehen",
    systemUpdates: "System-Updates",
    receiveSystemUpdates: "Benachrichtigungen über System-Updates und Wartung erhalten",
    weeklyActivitySummary: "Wöchentliche Aktivitätsübersicht",
    getWeeklySummary: "Erhalten Sie eine wöchentliche Zusammenfassung der Bestandsänderungen und -aktivitäten",
    securitySettings: "Sicherheitseinstellungen",
    manageSecurityOptions: "Verwalten Sie Ihre Kontosicherheit und Authentifizierungsoptionen.",
    currentPassword: "Aktuelles Passwort",
    newPassword: "Neues Passwort",
    confirmNewPassword: "Neues Passwort bestätigen",
    twoFactorAuth: "Zwei-Faktor-Authentifizierung",
    addExtraSecurity: "Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu",
    sessionTimeout: "Sitzungs-Timeout",
    selectTimeout: "Timeout auswählen",
    minutes: "Minuten",
    hours: "Stunden",
    saveSecuritySettings: "Sicherheitseinstellungen speichern",
    dataManagementTitle: "Datenverwaltung",
    dataManagementDescription: "Richtlinien und Informationen zum Import und Export von Inventardaten.",
    importingData: "Daten importieren",
    supportedFileFormats: "Unterstützte Dateiformate",
    importFileFormats: "Sie können Daten mit Microsoft Excel (.xlsx) oder durch Kommas getrennten Werten (.csv) importieren.",
    requiredColumns: "Erforderliche Spalten",
    requiredColumnsInfo: "Ihre Datei muss die folgenden Spalten enthalten (die Kopfzeilennamen müssen exakt übereinstimmen):",
    importingTips: "Import-Tipps",
    ensureColumnsPresent: "Stellen Sie sicher, dass alle erforderlichen Spalten vorhanden und korrekt benannt sind.",
    uniqueId: "Die ID für jeden Artikel muss eindeutig sein. Wenn eine ID bereits existiert, schlägt der Import dieser Zeile fehl.",
    quantityWholeNumber: "Die Menge muss eine ganze Zahl sein.",
    categoryAutoCreated: "Wenn eine Kategorie nicht existiert, wird sie automatisch erstellt.",
    systemSetsDateStatus: "Das System legt das Hinzufügedatum und den anfänglichen Status automatisch basierend auf der Menge fest.",
    exportingData: "Daten exportieren",
    exportDataInfo: "Sie können Ihre Inventardaten von den Seiten \"Gesamter Bestand\" oder \"Berichte\" exportieren. Das Export-Tool ermöglicht es Ihnen, die aktuelle Ansicht als Excel-Datei (.xlsx) herunterzuladen. Sie können auswählen, welche Spalten in den endgültigen Bericht aufgenommen werden sollen.",
    avatarUpdatedSuccess: "Avatar erfolgreich aktualisiert!",
    failedToUpdateAvatar: "Avatar-Aktualisierung fehlgeschlagen",
    avatarUploadError: "Ein unerwarteter Fehler ist beim Hochladen des Avatars aufgetreten.",
    profileUpdatedSuccess: "Profil erfolgreich aktualisiert!",
    failedToUpdateProfile: "Profil-Aktualisierung fehlgeschlagen"
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
