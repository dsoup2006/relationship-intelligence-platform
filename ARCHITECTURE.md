# Nexus 3.0 Architecture

## Core Design

Nexus uses a modular, entity-first architecture.

The application is divided into:

- Presentation components
- Feature modules
- Intelligence engines
- Backend services
- Shared data models

`App.tsx` coordinates the application but should not contain complete features.

---

## Project Structure

```text
src/
├── app/
│   ├── App.tsx
│   ├── AppShell.tsx
│   └── routes.ts
│
├── components/
│   ├── Explorer/
│   ├── Toolbar/
│   ├── Inspector/
│   ├── Search/
│   └── common/
│
├── features/
│   ├── entities/
│   ├── relationships/
│   ├── graph/
│   ├── timeline/
│   ├── dashboard/
│   ├── research/
│   ├── intelligence/
│   ├── documents/
│   └── maps/
│
├── engine/
│   ├── graph/
│   ├── matching/
│   ├── scoring/
│   ├── layout/
│   └── timeline/
│
├── services/
│   ├── api/
│   ├── storage/
│   ├── research/
│   ├── importExport/
│   └── ai/
│
├── state/
│   ├── project/
│   ├── selection/
│   └── preferences/
│
├── config/
├── types/
└── utilities/