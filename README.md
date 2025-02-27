Welcome to Exparo testing library!

# Getting Started

The repository is monorepo with the following structure:

```
apps/
 |__ admin/
 |__ backend/
 |__ web/
packages/
 |__ library/
```

## Admin panel

The admin panel is a React application that allows you to manage your experiments and users.

### Running locally

To run the admin panel locally:

```bash
pnpm install
pnpm run dev --filter=admin
```

This will start the admin panel on http://localhost:5174. You can login with the credentials from the `.env` file: ADMIN_EMAIL and ADMIN_PASSWORD.

---

## Backend

The backend is a Django application that provides the API for the admin panel.

### Running locally

To run the backend locally:

```bash
docker-compose up
```

This will start the backend on http://localhost:8000.

---

## Web application

The web application is a React application that allows you to test your experiments.

### Running locally

To run the web application locally:

```bash
pnpm install
pnpm run dev --filter=web
```

Although it's recommended to run:

```bash
pnpm run dev
```

This will start all applications and run build for library in watch mode. That is slightly faster than building library on every change

---

## Library

The library is a React library that allows you to use experiments in your application.

### Running locally

You can't exactly run the library locally. Since it is a package, it can't be run directly. Use the web application to test it.

### Usage

To use the library read the documentation in the [docs](https://github.com/asylniet/experiment-lib/tree/main/DOCS.md).

---

# Deployment

To deploy the application you need Docker and Docker Compose.

Run:

```bash
docker-compose up -d
```

This will start the applications.