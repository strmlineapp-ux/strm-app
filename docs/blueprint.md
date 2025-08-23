# **App Name**: Strm_

## Core Features:

- Authentication & Authorization: Secure, multi-tenant application with a project-per-company architecture, powered by Google Auth. New user sign-ups require admin approval to join a tenancy.
- Dynamic Data Structuring: Users can create custom Collections of bespoke Labels to define their own data points. Labels can be associated with users, calendar events, tasks, and assets, and their permissions can be customized on a granular level.
- Universal Sharing & Linking: A comprehensive system for sharing entities. Users can make entities (projects, pages, teams, collections, labels, assets, deliverables) available in a shared pool for others to link to. Linking creates a live, read-only reference to the original document.
- Analysis of Meeting Notes: AI Meeting Note Analysis tool: Analyze meeting notes to automatically suggest dates, invitees, and tasks for upcoming events.
- Entity Management: The app includes a variety of entities for robust project management, including `Projects`, `Phases`, `Events`, `Tasks`, `Event Templates`, `Assets`, and `Deliverables`.
- Google Services Integration: Deep, two-way synchronization with Google Calendar, Google Tasks, and Google Drive for event, task, and file management.
- Dynamic UI & Permissions: Customizable pages with predefined tabs. The UI and user permissions are context-aware, dynamically adapting based on a user's role and their relationship to an entity.

## Style Guidelines:

- A compact, modern look with a focus on clean design.
- A vibrant orange (`#D8620E`) for key actions and highlights.
- A dark charcoal (`#141414`) for the primary application background, with a light gray text color (`#A9A9A9`).
- A clean side menu on the left for main navigation.
- Prioritizes icon-only buttons with no background or text. All icons will have tooltips to provide context.
- All body and headline text will use the 'Roboto' font family.
- Consistent use of Google Material Symbols.
- The app will use inline editing for text fields, a collapsible side panel for entity management, and modals for displaying key information like new user approval.