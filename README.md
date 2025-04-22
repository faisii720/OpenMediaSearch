# OpenMedia Search Application

A web application for searching open-license media using the Openverse API.

## Features

- User authentication (registration and login)
- Search for open-license images and audio
- Advanced search filters (license type, file extension)
- Save and manage search queries
- Responsive design

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Openverse API

## Setup

1. Clone this repository
2. Open `index.html` in a web browser
3. Register an account or use the demo credentials:
   - Email: demo@example.com
   - Password: demo123

## Notes

- This is a frontend-only implementation for demonstration purposes
- User data is stored in localStorage (not secure for production)
- In a production environment, you would need:
  - A proper backend API for authentication
  - Secure password storage
  - Proper session management
  - Database for persistent storage

## Docker

You can run this project in a Docker container using nginx to serve the static files.

### Steps

1. Ensure you have [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
2. Build the Docker image:
   ```sh
   docker build -t openmediasearch .
   ```
3. Run the Docker container:
   ```sh
   docker run -d -p 8080:80 openmediasearch
   ```
4. Open your browser and visit [http://localhost:8080](http://localhost:8080)

This will serve the app using nginx inside Docker. If you make changes to the code, rebuild the image to see updates.

