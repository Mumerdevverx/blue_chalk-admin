# BlueChalk Admin Panel

React and Vite admin dashboard for managing BlueChalk website content through the MERN backend API.

## Requirements

- Node.js 18 or newer
- npm
- A running BlueChalk backend API

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Vite will print the local URL in the terminal, normally `http://localhost:5173`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Admin Sections

- **Home**: Manage homepage videos and images, including ordering and media URLs.
- **News**: Manage news articles with images, dates, descriptions, excerpts, and rich content.
- **Work**: Manage portfolio entries, categories, images, overlays, and rich HTML content.
- **About Content**: Manage the main About page content.
- **Gallery**: Upload, edit, reorder, and delete gallery images.
- **Clients**: Manage client and partner logos.
- **Awards**: Manage awards, years, categories, descriptions, and images.
- **Team**: Manage team member profiles, images, contact links, and descriptions.
- **Contacts**: View submitted contact messages.
- **Footer**: Manage footer settings and content.

## Project Structure

```text
src/
	api/             Axios API client
	components/      Shared UI components and page managers
	services/        Backend service wrappers
	allRoutes.jsx    Application routes
	App.jsx          Application shell
	main.jsx         React entry point
```

## Backend Integration

API requests use the Axios client in `src/api/axios.js`. The client reads its base URL from `VITE_API_URL`.

The frontend expects backend endpoints for authentication, home media, news, work, gallery, About content, clients, awards, team members, contacts, footer settings, uploads, and media operations.

Keep the backend running and configure CORS to allow requests from the Vite development URL.
