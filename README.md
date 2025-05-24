# Welcome to your Lovable project

## Project Overview

This project is an AI-powered application designed to help users prepare for interviews. It leverages artificial intelligence to analyze documents, such as resumes and job descriptions, suggesting relevant questions tailored to the user's specific needs. The application also allows users to search through a growing database of interview questions, making it a comprehensive tool for interview preparation.

## Key Features

*   **AI-Driven Document Analysis:** Analyzes PDF documents (e.g., resumes, job descriptions) to identify key terms and concepts.
*   **Intelligent Question Generation:** Generates relevant interview questions based on the content of uploaded PDF documents.
*   **Comprehensive Question Database:** Stores and indexes an ever-expanding collection of interview questions.
*   **Semantic Search:** Enables users to efficiently find specific questions using semantic search capabilities.
*   **User-Friendly Interface:** Provides an intuitive web interface for easy interaction with the application.
*   **User Authentication and Profile Management:** Allows users to create accounts and manage their profiles for a personalized experience.
*   **Mock Interview Practice:** Offers mock interview sessions to help users practice and refine their responses.

## Project info

**URL**: https://lovable.dev/projects/57b28676-c7b6-4cc4-9ab2-30a8b4962f90

## Setup and Installation Instructions

This guide will walk you through setting up the project for local development.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js and npm (or yarn):** Required for running the frontend application. You can download Node.js from [https://nodejs.org/](https://nodejs.org/) which includes npm.
*   **Python 3.x and pip:** Required for running the backend server. Python can be downloaded from [https://www.python.org/](https://www.python.org/). Pip is included with Python 3.x installations.

### Frontend Setup

1.  **Clone the Repository:**
    Open your terminal and clone the project repository (replace `<YOUR_GIT_URL>` with the actual repository URL):
    ```sh
    git clone <YOUR_GIT_URL>
    ```

2.  **Navigate to the Project Directory:**
    Change into the project's root directory (replace `<YOUR_PROJECT_NAME>` with the actual folder name):
    ```sh
    cd <YOUR_PROJECT_NAME>
    ```

3.  **Install Dependencies:**
    Install the necessary frontend packages using npm:
    ```sh
    npm install
    ```
    (Alternatively, if you prefer yarn: `yarn install`)

4.  **Supabase Configuration:**
    The Supabase URL and public anonymous key are pre-configured in `src/integrations/supabase/client.ts`. No separate `.env` file or environment variable setup is needed for the frontend to connect to Supabase during local development.

5.  **Run the Development Server:**
    Start the frontend development server:
    ```sh
    npm run dev
    ```
    This will typically open the application in your default web browser at `http://localhost:5173` (or another port if 5173 is in use).

### Backend Setup

1.  **Navigate to the Backend Directory:**
    From the project's root directory, navigate to the `Backend` folder:
    ```sh
    cd Backend
    ```

2.  **Create and Activate a Python Virtual Environment:**
    It's highly recommended to use a virtual environment to manage Python dependencies for the backend.

    *   Create the virtual environment:
        ```sh
        python -m venv venv
        ```
    *   Activate the virtual environment:
        *   On macOS and Linux:
            ```sh
            source venv/bin/activate
            ```
        *   On Windows:
            ```sh
            venv\Scripts\activate
            ```

3.  **Install Python Dependencies:**
    With the virtual environment activated, install the required Python packages using pip:
    ```sh
    pip install flask sentence-transformers faiss-cpu PyMuPDF scikit-learn google-generativeai pdfplumber numpy
    ```
    *Note: `faiss-cpu` is recommended for wider compatibility. If you have a compatible NVIDIA GPU and CUDA installed, you can opt for `faiss-gpu` for potentially faster performance, but this may require additional setup.*

4.  **Set GEMINI_API_KEY Environment Variable:**
    The backend requires an API key for Google Gemini services. You need to set this as an environment variable.

    *   You can set it temporarily in your terminal session (it will be lost when the session closes):
        *   On macOS and Linux:
            ```sh
            export GEMINI_API_KEY="YOUR_API_KEY"
            ```
        *   On Windows (Command Prompt):
            ```sh
            set GEMINI_API_KEY="YOUR_API_KEY"
            ```
        *   On Windows (PowerShell):
            ```sh
            $env:GEMINI_API_KEY="YOUR_API_KEY"
            ```
    *   Alternatively, you can create a `.env` file in the `Backend` directory and add the following line (ensure `.env` is listed in your `.gitignore` file to prevent committing your key):
        ```
        GEMINI_API_KEY="YOUR_API_KEY"
        ```
        The application's `main.py` (if configured to use a library like `python-dotenv`) would then load this variable. *You may need to add `python-dotenv` to the pip install command above if you choose this method and it's not already handled.*

5.  **Run the Flask Server:**
    Once the dependencies are installed and the API key is set, you can start the Flask backend server:
    ```sh
    python main.py
    ```
    The backend server will typically start on `http://127.0.0.1:5000`.

## Project Structure

Here's an overview of the key directories and files within the project:

*   **`Backend/`**: Contains the Python Flask backend application.
    *   `main.py`: The main application file, defining API endpoints for document processing, question generation, and search.
    *   `faiss_index.index`: A binary file storing the FAISS index for efficient similarity search of question embeddings.
    *   `questions_db.json`: A JSON file storing the raw text of the interview questions, corresponding to the embeddings in the FAISS index.
    *   `resume.pdf`: An example placeholder for uploaded PDF documents (like resumes or job descriptions) that the backend processes. Actual uploaded files are temporarily stored and processed here.

*   **`src/`**: Contains the source code for the React frontend application.
    *   `App.tsx`: The main application component that sets up routing and global context.
    *   `main.tsx`: The entry point for the React application, responsible for rendering the root component.
    *   `components/`: Directory for reusable UI components (e.g., buttons, input fields, modals) used throughout the application.
    *   `pages/`: Directory for top-level page components, each representing a distinct view or route (e.g., HomePage, LoginPage, DashboardPage).
    *   `integrations/`: Contains modules for integrating with third-party services.
        *   `supabase/client.ts`: Configuration and client setup for Supabase (authentication, database).
    *   `services/`: Holds frontend logic for making API calls to the backend, managing application state, and other business logic.

*   **`public/`**: Contains static assets for the frontend application that are served directly by the web server. This includes images, favicons, and other files that don't require processing by the build tool.

*   **`supabase/`**: Contains configuration files related to the Supabase integration.
    *   `config.toml`: Configuration for the Supabase CLI, defining local development settings, database migrations, and linked project details. *(Note: This file is typically used by the Supabase CLI and might not be directly edited for client-side Supabase setup, which is handled in `src/integrations/supabase/client.ts`)*.

## API Endpoints

The backend (`Backend/main.py`) provides the following API endpoints:

### 1. Store Question

*   **Method:** `POST`
*   **Path:** `/store_question/`
*   **Description:** Stores a new question in the database (`questions_db.json`) and updates the FAISS index (`faiss_index.index`).
*   **Payload (JSON):**
    *   `question` (string, required): The text of the interview question. It must be at least 5 words long and end with a question mark '?'.
*   **Success Response Example (200 OK):**
    ```json
    {
      "message": "Question stored successfully",
      "question": "What are the main principles of object-oriented programming?",
      "embedding_shape": [1, 384]
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: If the question is too short, does not end with '?', or if a similar question already exists.
        ```json
        {
          "error": "Question must be at least 5 words long and end with a '?'."
        }
        ```
        ```json
        {
          "error": "A very similar question already exists in the database."
        }
        ```

### 2. Analyze PDF and Get Similar Questions

*   **Method:** `POST`
*   **Path:** `/analyze_pdf_and_get_similar_questions/`
*   **Description:** This endpoint processes a PDF file specified by its path. It extracts text from the PDF, sends this text to the Gemini API to identify key terms/keywords, and then uses these keywords to find and return similar questions from the existing FAISS index and question database.
*   **Payload (JSON):**
    *   `file_path` (string, required): The path to the PDF file (e.g., `"resume.pdf"`). The file should be located in the `Backend` directory or a path accessible by the backend.
    *   `threshold` (float, optional, default: `0.75`): The similarity score threshold (between 0 and 1) for considering a question as a match.
    *   `top_k` (int, optional, default: `5`): The maximum number of top matching questions to return.
*   **Success Response Example (200 OK):**
    ```json
    {
      "file_path": "resume.pdf",
      "keywords": ["python", "flask", "api", "javascript", "react"],
      "detailed_results": [
        {
          "question": "Can you explain your experience with Python and Flask in building APIs?",
          "similarity": 0.88,
          "matched_keywords": ["python", "flask", "api"],
          "match_count": 3
        }
      ],
      "matched_questions": [
        "Can you explain your experience with Python and Flask in building APIs?"
      ]
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: If `file_path` is missing.
        ```json
        {
          "error": "file_path is required."
        }
        ```
    *   `404 Not Found`: If the specified PDF file does not exist.
        ```json
        {
          "error": "File not found at path: resume.pdf"
        }
        ```
    *   `500 Internal Server Error`: If there's an issue with PDF processing, Gemini API communication, or FAISS search.
        ```json
        {
          "error": "An error occurred during PDF processing or question retrieval."
        }
        ```

### 3. Semantic Search for Questions

*   **Method:** `POST`
*   **Path:** `/search/`
*   **Description:** Performs a semantic search for questions in the database that are similar to the provided query string.
*   **Payload (JSON):**
    *   `query` (string, required): The search query or question phrase.
*   **Success Response Example (200 OK):**
    ```json
    {
      "query": "Tell me about REST APIs",
      "results": [
        {
          "question": "What are the key characteristics of a RESTful API?",
          "similarity": 0.92
        }
      ]
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: If the `query` is missing.
        ```json
        {
          "error": "Query parameter is required."
        }
        ```

## Usage/Workflow Examples

This section outlines typical user interactions with the AI Interview Prep application.

1.  **User Registration/Login:**
    *   A new user creates an account using their email and password, or an existing user logs into the application. This is managed via the Supabase integration on the frontend.

2.  **Job/Resume Analysis:**
    *   The user navigates to the "Analyze Document" section of the application.
    *   They upload a PDF document, such as a job description for a position they are interested in, or their own resume.
    *   The frontend sends this document to the backend's `/analyze_pdf_and_get_similar_questions/` endpoint.
    *   The backend processes the PDF, extracts key terms and concepts using Google Gemini, and then searches its FAISS-indexed database for relevant interview questions.
    *   The frontend receives and displays a list of suggested questions tailored to the content of the uploaded document, helping the user prepare for specific scenarios.

3.  **Question Search:**
    *   The user goes to the "Search Questions" page.
    *   They type a topic, keyword, or a partial question into the search bar (e.g., "Tell me about your leadership style?", "python data structures", "handling team conflict").
    *   The frontend sends this query to the backend's `/search/` endpoint.
    *   The application returns a list of semantically similar questions from the database, allowing the user to explore various question types and topics.

4.  **Store New Questions (Admin/Future Contribution):**
    *   An administrator or a user with contribution privileges might add new, high-quality interview questions to the system.
    *   This can be done by directly interacting with the `/store_question/` backend endpoint (e.g., using a tool like Postman or a custom admin interface) or through a dedicated UI feature if implemented. This ensures the question database remains current and comprehensive.

5.  **Practice Interview:**
    *   The user selects a set of questions they want to practice. These questions might come from the document analysis results, search results, or a curated list.
    *   They enter a "Mock Interview" mode within the application.
    *   Questions are presented one by one, simulating a real interview environment.
    *   (Future Enhancement based on potential frontend capabilities like `speechService.js` or `videoService.js`): The user might be able to record their answers (audio or video) using their device's microphone and camera. These recordings could then be available for self-review, allowing the user to assess their delivery, body language, and the content of their responses.

## Technology Stack

This project utilizes a modern technology stack to deliver a robust and efficient AI-powered interview preparation platform.

### Frontend

*   **Vite:** A fast build tool that provides a quicker and leaner development experience for modern web projects.
*   **React:** A JavaScript library for building user interfaces, enabling the creation of dynamic and interactive components.
*   **TypeScript:** A superset of JavaScript that adds static typing, improving code quality and maintainability.
*   **Shadcn UI:** A collection of re-usable UI components built with Radix UI and Tailwind CSS, ensuring a consistent and accessible design.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom user interfaces.
*   **Supabase:** Used for frontend services such as user authentication and direct database interactions from the client-side where appropriate.

### Backend

*   **Python:** A versatile and widely-used programming language, ideal for AI and machine learning tasks.
*   **Flask:** A lightweight WSGI web application framework in Python, used to build the backend API.
*   **Sentence Transformers (all-MiniLM-L6-v2):** A Python library for generating embeddings for sentences and paragraphs. The `all-MiniLM-L6-v2` model is used for creating vector representations of interview questions.
*   **FAISS (Facebook AI Similarity Search):** A library for efficient similarity search and clustering of dense vectors. Used to store and search through the question embeddings.
*   **Google Gemini:** Utilized for its advanced AI capabilities, specifically for extracting keywords and key phrases from PDF documents (resumes, job descriptions).
*   **pdfplumber:** A Python library for extracting text and other data from PDF files.
*   **scikit-learn:** A machine learning library used for TF-IDF (Term Frequency-Inverse Document Frequency) vectorization and L2 normalization of text data.

### Database/Storage (Backend)

*   **FAISS index file (`Backend/faiss_index.index`):** This binary file stores the vector embeddings of all interview questions, enabling fast similarity searches.
*   **JSON file (`Backend/questions_db.json`):** This file stores the actual text of the interview questions, indexed in a way that corresponds to the FAISS index.

## How to Contribute

We welcome contributions to the AI Interview Prep project! Whether you're fixing a bug, adding a new feature, or improving documentation, your help is appreciated. Please follow these guidelines to contribute:

1.  **Fork the Repository:**
    Start by forking the main project repository to your own GitHub account.

2.  **Create a New Branch:**
    Create a new branch in your forked repository for your changes. Use a descriptive name, such as:
    *   For features: `git checkout -b feature/your-feature-name`
    *   For bug fixes: `git checkout -b bugfix/issue-description`

3.  **Make Your Changes:**
    Implement your feature or bug fix. Ensure your code is clear, well-commented, and follows the project's existing coding style.

4.  **Commit Your Changes:**
    Commit your changes with clear and concise commit messages. This helps in understanding the history of changes.
    ```sh
    git commit -m "feat: Implement X feature"
    ```
    or
    ```sh
    git commit -m "fix: Resolve Y bug in Z component"
    ```

5.  **Push to Your Fork:**
    Push your changes to your forked repository.
    ```sh
    git push origin feature/your-feature-name
    ```

6.  **Create a Pull Request (PR):**
    Go to the main project repository on GitHub and create a Pull Request from your forked repository's branch to the main project's `main` (or `master`) branch.
    *   Provide a clear title and description for your PR, explaining the changes you've made and why.
    *   If your PR addresses an existing issue, please link to it.

7.  **Code Quality and Testing:**
    *   Ensure your code is well-formatted. This project uses `eslint` (as noted in `package.json`) for frontend code; please adhere to its configurations.
    *   If you're adding new features or fixing bugs, please add or update tests as applicable to ensure code quality and prevent regressions. (Note: Specific testing frameworks and coverage expectations will be further defined as the project evolves).

We will review your PR as soon as possible and provide feedback. Thank you for contributing!

## License

This project is currently unlicensed. It is highly recommended to add a `LICENSE` file to the repository to clarify how others can use, modify, and distribute the code. This ensures legal clarity and encourages community participation.

If you are unsure which license to choose, resources like [choosealicense.com](https://choosealicense.com/) provide excellent guidance. For many open-source software projects, the [MIT License](https://opensource.org/licenses/MIT) is a popular and permissive choice.

Please consider adding a `LICENSE` file to the root of your project directory.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/57b28676-c7b6-4cc4-9ab2-30a8b4962f90) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
