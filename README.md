<a href="https://www.lumea.cc">
   <img alt="Lumea Preview" src="https://i.imgur.com/dfiLW1v.png">
</a>

<h1 align="center" style="text-underline">Lumea</h1>

<p align="center">An open source web-based application designed to help users generate personalized study plans. Powered by <b>Meta Llama 3.1 8B Instruct</b>.</p>

## Key Features
- **Custom Study Plans**
   - Generate study plans tailored to individual learning preferences and available hours.
   - Access AI-generated summaries from internet sources.
- **Interactive Q&A**
   - Engage with Llama 3.1 to dive deeper into study topics.
- **Knowledge Confirmation**
   - Generate targeted questions to test understanding of the material.

## Technical Stack
- **Backend**
   - Python 3.11+
   - Django REST Framework
   - PostgreSQL
   - Docker Engine 24.0+
- **Frontend**
   - Next.js with Tailwind CSS
   - shadcn/ui for UI components

## Services & Integrations
- **LLM**
   - Llama 3.1 8B Instruct by Meta for language model processing.
   - Together AI for LLM inference services.
- **Monitoring**
   - Google Analytics for website traffic monitoring.
   - Helicone for tracking the usage of LLM to ensure optimal performance.
- **Search Integration**
   - Serper API for Google Search results integration.

## Configuration & Prerequisites

This application is deployed at **[Lumea](https://lumea.cc)**. For local development, follow the instructions below.

### Prerequisites

Before starting, ensure you have the following prerequisites installed:

1. **Python and pip**: Download and install from the official Python website: **[Python Downloads](https://www.python.org/downloads/)**.

2. **Node.js and NPM**: Download and install from the official Node.js website: **[Node.js Downloads](https://nodejs.org/)**. NPM is included with Node.js.

3. **Docker**: Download and install Docker from the official Docker website: **[Docker Installation](https://docs.docker.com/get-docker/)**.

### Services Setup
1. **Together AI**: Sign up at **[Together AI](https://api.together.xyz/)** for LLM inference services.
2. **Serper API**: Register at **[Serper API](https://serper.dev/signup)** for Google Search results integration.
3. **Helicone**: Create an account at **[Helicone](https://helicone.ai/signup)** for LLM usage tracking and monitoring.

### Configuration
1. Clone the repository:
    ```sh
    git clone https://github.com/arnoldrudyi/lumea.git
    cd lumea
    ```
2. Create and configure backend `.env` file (use the `.example.env` for reference) and replace the API keys and database credentials.
3. If you plan to deploy the application outside of your local environment, update the `NEXT_PUBLIC_API_URL` value in `frontend/.env`. This field specifies the backend URL (default is `http://localhost:8000`).

## Running the Application
To start the application, use the provided bash script to run both the frontend and backend:
   ```sh
   chmod +x ./start-dev.sh
   ./start-dev.sh
   ```
After executing the script, the application will be accessible at the following URLs:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

### Running using Docker (Optional)
For a containerized setup, you can deploy the application using Docker. This will build and run both the frontend and backend in Docker containers, with Nginx handling local network access. Use the following command:
   ```sh
   docker compose up --build
   ```
The application will be accessible at the same URLs; however, this setup does not support Hot Module Replacement or automatic reloading when project files are modified.

## Troubleshooting
- **Docker issues**: Ensure Docker is running and correctly configured. Try rebuilding the containers if there are any issues:
   ```sh
   docker compose down && docker compose up --build
   ```
- **Frontend/Backend Connection**: If the frontend cannot connect to the backend, verify the API URLs and CORS configuration in your environment variables.

## License
This project is licensed under the MIT License. See the **[LICENSE](LICENSE)** file for more details.

## Contributions
Contributions are welcome! Please fork the repository, create a branch, and submit a pull request for any changes.