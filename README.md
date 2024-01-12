# Project Readme

## Overview

This project involves the validation of customer statement records received by the bank in CSV and XML formats. Two primary validations are required. Additionally, a report is generated at the end of the processing, displaying both the transaction reference and description of each failed record.

## Technologies Used

- **Node.js:** Chosen for its efficiency in handling asynchronous tasks and event-driven programming.
- **TypeScript:** Adds static typing to JavaScript, enhancing code quality and maintainability.
- **NestJS:** A progressive Node.js framework that facilitates building scalable and maintainable server-side applications. Its modular architecture aligns well with the organization of this project.
- **PostgreSQL:** Selected as the database to store and manage customer statement records efficiently.
- **Prisma:** An Object-Relational Mapping (ORM) tool that simplifies database interactions and provides a type-safe query builder.
- **BullMQ:** Employed for handling CPU-intensive tasks, ensuring efficient and reliable background processing.
- **Docker Compose:** Used for containerization, enabling seamless deployment across various environments.

## Project Structure

- **src/:** Contains the source code of the application.
  - **controllers/:** Handles incoming HTTP requests and manages the flow of data between the model and service.
  - **services/:** Implements the business logic, interacting with the database and other external services.
  - **queue/:** Includes background jobs powered by BullMQ for CPU-intensive tasks.
  - **middlewares/:** Custom middleware functions for request/response processing.
- **prisma/:** Prisma configuration and database schema.
- **docker-compose.yml:** Defines the services, networks, and volumes needed for the application using Docker Compose.
- **.commitlintrc.js:** Configuration file for Commitlint, ensuring adherence to conventional commits.

## Prerequisites

You need the following tools installed on your system:

- [Docker](https://www.docker.com/get-started)

## Environment Variables Configuration

Before running the API, you must configure the required environment variables.

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/SimonyanSuren/statement-api.git
   cd statement-api
   ```

### Running the Application

Use Docker Compose to start the application containers:

```bash
$ docker compose up -d
```

This command will start the Node.js server, including the database, in detached mode. You can access the application swagger UI in your web browser at http://localhost:9090/docs.

### Stopping the Application

To stop the application and remove the containers, run:

```bash
$ docker compose down
```

### Conclusion

The chosen technologies and architecture aim to create a scalable, maintainable, and efficient solution for validating customer statement records. The combination of Node.js, TypeScript, NestJS, Prisma, BullMQ, and Docker Compose provides a robust foundation for this task. The use of Commitlint ensures clear and standardized commit messages for improved collaboration and versioning.