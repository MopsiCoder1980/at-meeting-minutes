// Pure data – no DB, no server-only imports. Safe to import from client or server.

/** Converts flat dot-separated keys to nested objects for next-intl */
export function unflatten(flat) {
     const result = {}
     for (const [key, value] of Object.entries(flat)) {
          const parts = key.split('.')
          let cur = result
          for (let i = 0; i < parts.length - 1; i++) {
               cur[parts[i]] ??= {}
               cur = cur[parts[i]]
          }
          cur[parts[parts.length - 1]] = value
     }
     return result
}

export const DEFAULT_STRINGS = {
     // App
     'app.title': 'Meeting Minutes',
     'app.description': 'Meeting Minutes Verwaltung',

     // NavBar
     'nav.brand': 'Meeting Minutes',
     'nav.new': '+ Neu',
     'nav.options': 'Optionen',
     'nav.logout': 'Abmelden',

     // Sign-in
     'auth.title': 'Meeting Minutes',
     'auth.username': 'Benutzername',
     'auth.password': 'Passwort',
     'auth.submit': 'Anmelden',
     'auth.submitting': 'Anmelden…',

     // Dashboard
     'dashboard.overview': 'Übersicht',
     'dashboard.loggedInAs': 'Angemeldet als',
     'dashboard.adminBadge': 'Admin',

     // Filter
     'filter.onlyMine': 'Nur meine',

     // Sort
     'sort.dateDesc': 'Datum absteigend',
     'sort.dateAsc': 'Datum aufsteigend',
     'sort.ariaLabel': 'Sortierung',

     // Calendar
     'calendar.title': 'Kalender anzeigen',
     'calendar.label': '📅 Kalender',
     'calendar.removeFilter': 'Datumsfilter entfernen',

     // Search
     'search.placeholder': 'Suche nach Titel, Inhalt oder Tag…',
     'search.ariaLabel': 'Meeting Minutes durchsuchen',
     'search.noResults': 'Keine Ergebnisse',
     'search.shared': 'Geteilt',
     'search.private': 'Privat',

     // Pagination
     'pagination.nav': 'Seitennavigation',
     'pagination.prev': '‹ Zurück',
     'pagination.prevAriaLabel': 'Vorherige Seite',
     'pagination.next': 'Weiter ›',
     'pagination.nextAriaLabel': 'Nächste Seite',

     // Sidebar
     'sidebar.title': 'Ordner',

     // Folder
     'folder.all': 'Alle Meetings',
     'folder.add': '+ Ordner',
     'folder.namePlaceholder': 'Ordnername…',
     'folder.rename': 'Umbenennen',
     'folder.delete': 'Ordner löschen',
     'folder.confirmDeleteSuffix': 'löschen?',
     'folder.confirmSub': 'Enthaltene Meeting Minutes werden keinem Ordner mehr zugeordnet.',
     'folder.cancel': 'Abbrechen',
     'folder.confirmDeleteBtn': 'Löschen',

     // Tags
     'tags.remove': 'entfernen',
     'tags.inputPlaceholder': 'Tag eingeben, Enter oder Komma zum Bestätigen',

     // Minute Form
     'form.newMeeting': 'Neues Meeting',
     'form.editMeeting': 'Meeting bearbeiten',
     'form.cancel': 'Abbrechen',
     'form.projectTitle': 'Projekttitel',
     'form.title': 'Meeting-Titel',
     'form.dateTime': 'Datum & Uhrzeit',
     'form.attendees': 'Teilnehmer',
     'form.meetingOwners': 'Meeting Owner(s)',
     'form.agendaOwners': 'Agenda Owner(s)',
     'form.topics': 'Themen',
     'form.decisions': 'Entscheidungen',
     'form.actionItems': 'Action Items',
     'form.openQuestions': 'Offene Fragen',
     'form.task': 'Aufgabe',
     'form.responsible': 'Verantwortlich',
     'form.deadline': 'Deadline',
     'form.addUser': '+ User hinzufügen…',
     'form.addItem': '+ Hinzufügen',
     'form.notes': 'Notizen',
     'form.visibility': 'Sichtbarkeit',
     'form.private': 'Privat (nur ich)',
     'form.shared': 'Geteilt (alle Benutzer)',
     'form.folder': 'Ordner',
     'form.noFolder': '— Kein Ordner —',
     'form.person': '— Person —',
     'form.tags': 'Tags',
     'form.attachments': 'Dateianhänge',
     'form.attachmentsHint': 'Bilder, PDF oder Office-Dateien',
     'form.attachmentsRemove': 'Entfernen',
     'form.save': 'Speichern',
     'form.saving': 'Wird gespeichert...',

     // Minutes List
     'minutesList.empty': 'Noch keine Meeting Minutes vorhanden.',
     'minutesList.createFirst': 'Erstes Meeting anlegen',
     'minutesList.dragHandle': 'Ziehen zum Verschieben',
     'minutesList.noFolder': 'nicht zugewiesen',
     'minutesList.moveTo': 'Verschieben nach',

     // Move to folder overlay
     'moveOverlay.title': 'Verschieben nach',
     'moveOverlay.close': 'Schließen',
     'moveOverlay.noFolder': 'Kein Ordner',
     'moveOverlay.noFolders': 'Noch keine Ordner angelegt.',

     // Minute Detail
     'minute.shared': 'Geteilt',
     'minute.private': 'Privat',
     'minute.edit': 'Bearbeiten',
     'minute.delete': 'Löschen',
     'minute.confirmDelete': 'Meeting wirklich löschen?',
     'minute.back': '← Zurück zur Übersicht',
     'minute.lastEdited': 'Zuletzt bearbeitet:',
     'minute.sectionAttendees': 'Teilnehmer',
     'minute.sectionTopics': 'Themen',
     'minute.sectionDecisions': 'Entscheidungen',
     'minute.sectionActionItems': 'Action Items',
     'minute.sectionOpenQuestions': 'Offene Fragen',
     'minute.sectionNotes': 'Notizen',
     'minute.sectionAttachments': 'Dateianhänge',
     'minute.attachmentDownload': 'Herunterladen',
     'minute.meetingOwners': 'Meeting Owner(s)',
     'minute.agendaOwners': 'Agenda Owner(s)',
     'minute.attendees': 'Teilnehmer',
     'minute.actionTask': 'Aufgabe',
     'minute.actionResponsible': 'Verantwortlich',
     'minute.actionDeadline': 'Deadline',

     // Options
     'options.title': 'Optionen',
     'options.sectionPassword': 'Passwort',
     'options.sectionDisplay': 'Anzeige',
     'options.sectionUsers': 'Benutzerverwaltung',
     'options.tabUsers': 'Benutzer & Passwort',
     'options.tabDisplay': 'Anzeige',
     'options.tabLanguage': 'Sprache',
     'options.sectionLanguages': 'Sprachverwaltung',
     'options.sectionStrings': 'Texte & Übersetzungen',
     'options.stringsLocale': 'Sprache',
     'options.stringsSubmit': 'Texte speichern',
     'options.stringsSaving': 'Speichern…',
     'options.stringsSaved': 'Texte gespeichert.',

     // Change password
     'password.formTitle': 'Passwort ändern',
     'password.current': 'Aktuelles Passwort',
     'password.new': 'Neues Passwort',
     'password.confirm': 'Neues Passwort bestätigen',
     'password.save': 'Speichern',
     'password.saving': 'Speichern…',
     'password.success': 'Passwort erfolgreich geändert.',

     // Page size
     'pageSize.label': 'Einträge pro Seite',
     'pageSize.save': 'Speichern',
     'pageSize.saving': 'Speichern…',
     'pageSize.saved': 'Gespeichert.',

     // User management
     'users.createTitle': 'Neuen Benutzer anlegen',
     'users.username': 'Benutzername',
     'users.password': 'Passwort (min. 8 Zeichen)',
     'users.create': 'Anlegen',
     'users.creating': 'Anlegen…',
     'users.created': 'Benutzer angelegt.',
     'users.none': 'Noch keine Benutzer angelegt.',
     'users.colUsername': 'Benutzername',
     'users.colRole': 'Rolle',
     'users.delete': 'Löschen',
     'users.confirmDelete': 'Benutzer wirklich löschen?',

     // Error messages
     'error.authRequired': 'Benutzername und Passwort sind Pflichtfelder.',
     'error.invalidCredentials': 'Ungültige Anmeldedaten.',
     'error.noPermission': 'Keine Berechtigung.',
     'error.usernameTaken': 'Benutzername bereits vergeben.',
     'error.createUserFailed': 'Fehler beim Erstellen des Benutzers.',
     'error.notLoggedIn': 'Nicht angemeldet.',
     'error.allRequired': 'Alle Felder sind Pflichtfelder.',
     'error.passwordMin8': 'Passwort muss mindestens 8 Zeichen lang sein.',
     'error.newPasswordMin8': 'Neues Passwort muss mindestens 8 Zeichen lang sein.',
     'error.passwordMismatch': 'Passwörter stimmen nicht überein.',
     'error.userNotFound': 'Benutzer nicht gefunden.',
     'error.wrongPassword': 'Aktuelles Passwort ist falsch.',
     'error.minuteRequired': 'Projekttitel und Meeting-Titel sind Pflichtfelder.',
     'error.notFound': 'Nicht gefunden.',
     'error.nameRequired': 'Name ist erforderlich.',
     'error.pageSizeRange': 'Bitte eine Zahl zwischen 1 und 200 eingeben.',

     // Language management
     'languages.code': 'Code',
     'languages.label': 'Bezeichnung',
     'languages.default': 'Standard',
     'languages.isDefault': 'Standard',
     'languages.setDefault': 'Als Standard',
     'languages.delete': 'Löschen',
     'languages.addTitle': 'Sprache hinzufügen',
     'languages.codePlaceholder': 'z.B. en',
     'languages.labelPlaceholder': 'z.B. English',
     'languages.add': 'Hinzufügen',
     'languages.adding': 'Hinzufügen…',
     'languages.added': 'Sprache hinzugefügt.',
     'languages.confirmDelete': 'Sprache {code} wirklich löschen?',
}

export const STRING_GROUPS = [
     {
          label: 'App & Metadaten',
          keys: ['app.title', 'app.description'],
     },
     {
          label: 'Navigation',
          keys: ['nav.brand', 'nav.new', 'nav.options', 'nav.logout'],
     },
     {
          label: 'Anmeldung',
          keys: ['auth.title', 'auth.username', 'auth.password', 'auth.submit', 'auth.submitting'],
     },
     {
          label: 'Dashboard',
          keys: ['dashboard.overview', 'dashboard.loggedInAs', 'dashboard.adminBadge', 'filter.onlyMine'],
     },
     {
          label: 'Sortierung & Kalender',
          keys: ['sort.dateDesc', 'sort.dateAsc', 'sort.ariaLabel', 'calendar.title', 'calendar.label', 'calendar.removeFilter'],
     },
     {
          label: 'Suche',
          keys: ['search.placeholder', 'search.ariaLabel', 'search.noResults', 'search.shared', 'search.private'],
     },
     {
          label: 'Seitennavigation',
          keys: ['pagination.nav', 'pagination.prev', 'pagination.prevAriaLabel', 'pagination.next', 'pagination.nextAriaLabel'],
     },
     {
          label: 'Ordner & Sidebar',
          keys: ['sidebar.title', 'folder.all', 'folder.add', 'folder.namePlaceholder', 'folder.rename', 'folder.delete', 'folder.confirmDeleteSuffix', 'folder.confirmSub', 'folder.cancel', 'folder.confirmDeleteBtn'],
     },
     {
          label: 'Tags',
          keys: ['tags.remove', 'tags.inputPlaceholder'],
     },
     {
          label: 'Meeting-Formular',
          keys: ['form.newMeeting', 'form.editMeeting', 'form.cancel', 'form.projectTitle', 'form.title', 'form.dateTime', 'form.attendees', 'form.meetingOwners', 'form.agendaOwners', 'form.topics', 'form.decisions', 'form.actionItems', 'form.openQuestions', 'form.task', 'form.responsible', 'form.deadline', 'form.addUser', 'form.addItem', 'form.notes', 'form.attachments', 'form.attachmentsHint', 'form.attachmentsRemove', 'form.visibility', 'form.private', 'form.shared', 'form.folder', 'form.noFolder', 'form.person', 'form.tags', 'form.save', 'form.saving'],
     },
     {
          label: 'Meeting-Liste',
          keys: ['minutesList.empty', 'minutesList.createFirst', 'minutesList.dragHandle', 'minutesList.noFolder', 'minutesList.moveTo', 'moveOverlay.title', 'moveOverlay.close', 'moveOverlay.noFolder', 'moveOverlay.noFolders'],
     },
     {
          label: 'Meeting-Detailansicht',
          keys: ['minute.shared', 'minute.private', 'minute.edit', 'minute.delete', 'minute.confirmDelete', 'minute.back', 'minute.lastEdited', 'minute.sectionAttendees', 'minute.sectionTopics', 'minute.sectionDecisions', 'minute.sectionActionItems', 'minute.sectionOpenQuestions', 'minute.sectionNotes', 'minute.sectionAttachments', 'minute.attachmentDownload', 'minute.meetingOwners', 'minute.agendaOwners', 'minute.attendees', 'minute.actionTask', 'minute.actionResponsible', 'minute.actionDeadline'],
     },
     {
          label: 'Optionen-Seite',
          keys: ['options.title', 'options.tabUsers', 'options.tabDisplay', 'options.tabLanguage', 'options.sectionPassword', 'options.sectionDisplay', 'options.sectionUsers', 'options.sectionLanguages', 'options.sectionStrings', 'options.stringsLocale', 'options.stringsSubmit', 'options.stringsSaving', 'options.stringsSaved'],
     },
     {
          label: 'Passwort ändern',
          keys: ['password.formTitle', 'password.current', 'password.new', 'password.confirm', 'password.save', 'password.saving', 'password.success'],
     },
     {
          label: 'Einträge pro Seite',
          keys: ['pageSize.label', 'pageSize.save', 'pageSize.saving', 'pageSize.saved'],
     },
     {
          label: 'Benutzerverwaltung',
          keys: ['users.createTitle', 'users.username', 'users.password', 'users.create', 'users.creating', 'users.created', 'users.none', 'users.colUsername', 'users.colRole', 'users.delete', 'users.confirmDelete'],
     },
     {
          label: 'Sprachverwaltung',
          keys: ['languages.code', 'languages.label', 'languages.default', 'languages.isDefault', 'languages.setDefault', 'languages.delete', 'languages.addTitle', 'languages.codePlaceholder', 'languages.labelPlaceholder', 'languages.add', 'languages.adding', 'languages.added', 'languages.confirmDelete'],
     },
     {
          label: 'Fehlermeldungen',
          keys: ['error.authRequired', 'error.invalidCredentials', 'error.noPermission', 'error.usernameTaken', 'error.createUserFailed', 'error.notLoggedIn', 'error.allRequired', 'error.passwordMin8', 'error.newPasswordMin8', 'error.passwordMismatch', 'error.userNotFound', 'error.wrongPassword', 'error.minuteRequired', 'error.notFound', 'error.nameRequired', 'error.pageSizeRange'],
     },
]
