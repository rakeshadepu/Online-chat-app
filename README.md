# Online Chat Application

This is a full-stack online chat application built using modern web technologies. It includes real-time messaging, channel creation, and user authentication.

---

## Features

- **Real-time Chat**: Communicate with other users in real-time.
- **Channel Management**: Create and manage chat channels.
- **User Authentication**: Secure login and signup functionality.

---

## Getting Started

Follow these steps to clone, set up, and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org) installed
- [Git](https://git-scm.com/) installed
- A database connection URL ( MongoDB)
- A frontend URL for CORS setup

---

### Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/rakeshadepu/Online-chat-app.git
   cd Online-chat-app
   ```

2. **Set Up the Server**

   ```bash
   cd server
   ```

   - Install dependencies:
     ```bash
     npm install
     ```

   - Create a `.env` file in the `server` directory and add the following variables:
     ```env
     PORT=your-port-number
     JWT_KEY=your-jwt-secret-key
     ORIGIN=your-frontend-url
     DATABASE_URL=your-database-url
     ```

3. **Set Up the Client**

   ```bash
   cd ../client
   ```

   - Install dependencies:
     ```bash
     npm install
     ```

4. **Run the Application**

   Open two terminals:

   - **Terminal 1**: Run the server
     ```bash
     cd server
     npm run dev
     ```

   - **Terminal 2**: Run the client
     ```bash
     cd client
     npm run dev
     ```

---

### Directory Structure

```plaintext
Online-chat-app/
├── client/        # Frontend code
├── server/        # Backend code
├── README.md      # Project documentation
```

---

### Environment Variables for Server

Create a `.env` file in the `server` directory with the following content:

```plaintext
PORT=your-port-number
JWT_KEY="your-secret-key"
ORIGIN="http://localhost:3000" # Replace with your frontend URL
DATABASE_URL="your-database-connection-url"
```

---

### Contributing

Feel free to fork this repository and submit pull requests for enhancements or bug fixes.

---

### License

This project is licensed under the [MIT License](LICENSE).

---
