# ReefChallenge

## Description

This project is an advanced product and order management system engineered for absolute operational precision. It leverages JWT-based authentication and strict role-based access control to ensure only those with proper clearance can access its functions. The system simplifies product management, enables effortless order tracking, generates insightful sales reports, and provides an admin dashboard that consolidates all your key metrics into one commanding view. Consider it your central hub for secure, efficient business control.

## Getting Started

## Prerequisites

Docker and Docker Compose - [https://www.docker.com/]
Node.js (if running without Docker)
PostgreSQL (if running without Docker)

### Steps to Run the Project:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/
   ```

2. **Navigate to the project’s root directory:**

   ```bash
   cd reef-challenge
   ```

3. **Run Docker Compose to build and start the containers:**

   ```bash
   docker-compose up -d --build
   ```

4. **Wait for the containers to be fully built, then navigate to [http://localhost:5173](http://localhost:5173) to access the frontend.**  
   The backend will be available at [http://localhost:4444](http://localhost:4444/graphql) for GraphQL queries.

### Stopping and Removing Containers and Database:

To stop and remove containers along with the database, run:

```
docker-compose down -v
```

## Features Implemented

1. **Secure Login & Registration:**

   - JWT-based authentication with role‑based access control.

2. **Product Management:**

   - Create, update, and delete products (with name, description, price, and image).

3. **Order Management:**

   - View and update customer orders; supports filtering by customer name and status.

4. **Sales Reports & Admin Dashboard:**

   - Generate sales reports including total sales, order count, and average order value.
   - View revenue over time and top product sales in a consolidated admin dashboard.

5. **Real-Time Notifications:**

   - Use Socket.IO to receive notifications when products are created/deleted or when an order’s status changes.

6. **Unit Tests:**

   - Comprehensive unit tests for services using Jest and ts‑jest.

7. **Automated Seeding:**

   - On startup, the application automatically seeds the database (if empty) with sample products, an admin user (roles: ["USER", "ADMIN"]), and random orders with varied dates.

8. **Search Feature:**

   - Implemented a search feature to filter products or orders.

9. **GraphQL API:**

   - Implemented a GraphQL API as an alternative to the RESTful API for more efficient data querying.

10. **Async Thunks (Frontend):**

    - The frontend uses Redux async thunks to fetch data (e.g., dashboard metrics, sales reports) from the GraphQL API.
