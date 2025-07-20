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
