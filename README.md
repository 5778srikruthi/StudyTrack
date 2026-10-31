# StudyTrack

A full-stack student study and task management application designed to help students organize academic tasks, track deadlines, and manage their study schedules efficiently.

## Features

- User registration and login
- Personalized student dashboard
- Create, view, edit, and delete tasks
- Task priority management (High, Medium, Low)
- Due date and overdue task tracking
- Calendar-based task management
- Folder creation and organization
- Task completion tracking
- User-specific task management
- Data persistence using MySQL

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Maven

### Database
- MySQL

### Development Tools
- Visual Studio Code
- Git and GitHub
- Postman
- MySQL Workbench

## Project Structure

```text
StudyTrack/
├── frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── dashboard.html
│   ├── login.html
│   └── register.html
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── mvnw.cmd
│
└── README.md
```

## Prerequisites

Make sure the following are installed:

- Java JDK 21
- MySQL Server
- Visual Studio Code
- Git
- A modern web browser

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/5778srikruthi/StudyTrack.git
cd StudyTrack
```

### 2. Create the database

Open MySQL Workbench and execute:

```sql
CREATE DATABASE studytrack;
```

### 3. Configure database connection

Open:

`backend/src/main/resources/application.properties`

Configure your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/studytrack
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Set the `DB_USERNAME` and `DB_PASSWORD` environment variables on your computer before starting the backend.

### 4. Run the backend

Open a terminal inside the `backend` directory and execute:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend will run at:

`http://localhost:8080`

### 5. Run the frontend

Open the `frontend` folder using Visual Studio Code and launch `index.html` with Live Server.

Access the application through the local Live Server URL.

## Testing

The application has been manually tested for:

- User registration and login
- Invalid login and duplicate registration handling
- Task creation, retrieval, updating, and deletion
- User-specific task data isolation
- Database persistence after backend restart
- Frontend-backend integration
- Calendar and folder functionality
- Responsive layout on laptop and mobile screens

Backend API endpoints were tested using Postman.

## Repository

GitHub: https://github.com/5778srikruthi/StudyTrack

## Project

**StudyTrack — Student Study and Task Management System**