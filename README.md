# 🚛 Transport Management System

A complete system for managing **heavy transport operations and finances** for logistics companies.  
It tracks **trips and shipments**, monitors **on-time arrivals and delays**, records **expenses and revenues**, and calculates **drivers’ payments and net profit** in a flexible and scalable way.

---

## 📌 Features

- Manage trips and track shipment status (arrived / delayed).  
- Record expenses and revenues for each trip.  
- Calculate drivers’ dues and track payments.  
- Generate financial summaries: revenues, expenses, net profit.  
- Manager dashboards for monitoring performance.  
- Role-based access system (workers & managers).  

---

## 🛠️ Tech Stack

### **Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)  
- [Sequelize](https://sequelize.org/) ORM with **PostgreSQL**  
- [JWT](https://jwt.io/) authentication  
- [bcrypt](https://www.npmjs.com/package/bcrypt) for password hashing  
- [Nodemailer](https://nodemailer.com/) for email notifications  

### **Frontend**
- [React](https://react.dev/)  
- [React Router](https://reactrouter.com/) for navigation  
- [React Bootstrap](https://react-bootstrap.github.io/) + [Bootstrap 5](https://getbootstrap.com/) for UI  
- [date-fns](https://date-fns.org/) for date handling  
- [xlsx](https://www.npmjs.com/package/xlsx) for exporting data  

---

## 📂 Project Structure

```
transportProject/
│
├── backend/          # Express server + API + database
│   ├── server.js
│   ├── allRoute.js
│   └── models/      # Sequelize models
│
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/shaimafikry/transportProject.git
cd transportProject
```

### 2. Setup **Backend**
```bash
cd backend
npm install
cp .env.example .env   # configure DB connection & JWT_SECRET
npm run dev
```
> Server runs on: `http://localhost:5000`

### 3. Setup **Frontend**
```bash
cd ../frontend
npm install
npm start
```
> Frontend runs on: `http://localhost:3000`

---

## 📊 Database

- **PostgreSQL** with **Sequelize ORM**  
- Main tables:  
  - Users & Roles  
  - Drivers  
  - Trips  
  - Expenses  
  - Payments  

---

## 🚀 Future Enhancements

- Advanced dashboard with analytics & charts.  
- Vehicle tracking via GPS integration.  
- SMS notifications system.  
- Multi-language support.  

---

## 👩‍💻 Contribution

1. Fork the repo  
2. Create a new branch:  
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes and push  
4. Submit a **Pull Request**  

---

## 📧 Contact

Developed by: **Shaima Fikry**  
[GitHub Profile](https://github.com/shaimafikry)  

Developed by: **Mahmoud Ragab**  
[GitHub Profile](https://github.com/foash-111)  



