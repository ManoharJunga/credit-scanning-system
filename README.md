# Credit Scanning System - Admin Dashboard

This is a **Credit Scanning System** that includes an **Admin Dashboard** to manage users, credit requests, and scanned data. The system is built using **HTML, CSS, JavaScript (Frontend)** and **Node.js with Express.js (Backend)**, and uses **SQLite** for data storage.

---

## 🚀 Features  

### **Frontend (Client-Side)**  
- **Admin Dashboard** with user management  
- **Credit request tracking** and approvals  
- **Dark mode toggle**  
- **Scans per user tracking**  
- **Basic authentication system (username & password)**  

### **Backend (Server-Side)**  
- **User authentication** with hashed passwords  
- **Credit request and approval system**  
- **File uploads stored locally**  
- **AI-based match route for future extensions**  
- **Basic REST API using Express.js**  

### **Database**  
- **SQLite** is used for structured data storage  
- **JSON files** can be used for small-scale storage  
- **User data includes username, password (hashed), credits, and scan history**  

---

## 📚 Project Structure  

```
Credit-Scanning-System/
│── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   ├── login.css
│   │   ├── profile.css
│   │   ├── register.css
│   │   ├── scan_result.css
│   ├── js/
│   │   ├── admin.js
│   │   ├── aiscan.js
│   │   ├── dashboard.js
│   │   ├── login.js
│   │   ├── profile.js
│   │   ├── register.js
│   ├── assets/
│   ├── admin.html
│   ├── aiscan.html
│   ├── dashboard.html
│   ├── login.html
│   ├── profile.html
│   ├── register.html
│── backend/
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── creditController.js
│   │   ├── scanController.js
│   │   ├── userController.js
│   ├── db/
│   │   ├── credit_system.db
│   ├── middleware/
│   │   ├── authMiddleware.js
│   ├── models/
│   │   ├── creditRequests.js
│   │   ├── scanModel.js
│   │   ├── uploadModel.js
│   │   ├── userModel.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── creditRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── scanRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── userRoutes.js
│   ├── utils/
│   │   ├── matching.js
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   ├── database.js
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   ├── your-database.db
│── README.md
```

---

## 🛠️ Setup Instructions  

### **1️⃣ Backend Setup (Node.js + Express.js)**  

#### **🔹 Prerequisites**  
- Install **Node.js** (v14 or higher)  
- Install **SQLite3** (for database)  

#### **🔹 Install Dependencies**  

```sh
cd backend
npm install express cors body-parser dotenv sqlite3
```

#### **🔹 Create a `.env` File**  

Inside the `backend` folder, create a file named `.env` and add:  

```
PORT=3000
```

#### **🔹 Start the Backend Server**  

```sh
node server.js
```

The server will start on `http://localhost:3000`.

---

### **2️⃣ Frontend Setup**  

#### **🔹 Open `index.html` in a Browser**  
No setup is needed for the frontend. Simply open the `frontend/index.html` file in a browser.

---

## 💼 API Routes  

| Route          | Method | Description |
|---------------|--------|-------------|
| `/user`       | GET    | Fetch user details |
| `/admin`      | GET    | Admin dashboard data |
| `/credits`    | POST   | Request or update credits |
| `/upload`     | POST   | Upload files |
| `/scan`       | GET    | Retrieve scan data |
| `/api/match`  | POST   | AI Matching system |

---

## 🔒 Authentication System  

- Users log in with **username & password**  
- Passwords are **hashed** before storage  
- Admins have special access to manage credit requests  

---

## 💽 File Storage  

- Uploaded documents are stored in the `uploads/` folder  
- The backend serves uploaded files via `/uploads`  

---

## 📆 Future Improvements  

- Add JWT-based authentication  
- Implement a React-based frontend  
- Integrate AI for smart credit recommendations  

---

## 📧 Contact  

For any issues or suggestions, feel free to reach out! 🚀

