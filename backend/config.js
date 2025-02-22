const { DataTypes } = require("sequelize");

const { Sequelize } = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: "postgres",
  port: process.env.PGPORT,
  logging: false, // Disable SQL logging
	dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Important for cloud databases
    },
  },
});


const Drivers = sequelize.define("Drivers", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  leader_name: { type: DataTypes.STRING, allowNull: false },
  driver_name: { type: DataTypes.STRING, allowNull: false },
  phone_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  national_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  passport_number: { type: DataTypes.STRING, unique: true },
  trip_num: { type: DataTypes.INTEGER, allowNull: false, defaultValue : 0 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.0 },

});



const Cars = sequelize.define("Cars", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  car_type: { type: DataTypes.STRING },
  car_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  car_letters: { type: DataTypes.STRING, unique: true, allowNull: false },
});



const Trailers = sequelize.define("Trailers", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  car_type: { type: DataTypes.STRING },
  car_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  car_letters: { type: DataTypes.STRING, unique: true, allowNull: false },
});



const Agents = sequelize.define("Agents", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  agent_name: { type: DataTypes.STRING, unique: true},
  agent_type: { type: DataTypes.STRING },

});


const ConstructTrips = sequelize.define("ConstructTrips", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bon_number: { type: DataTypes.STRING, allowNull: false },
  driver_name: { type: DataTypes.STRING, allowNull: false },
  car_number: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  trip_date: { type: DataTypes.DATE, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});



const Users = sequelize.define("Users", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
	role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "data entry", // ✅ Default role set to "data entry"
  },
});



const TransportTrips = sequelize.define("TransportTrips", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  leader_name: { type: DataTypes.STRING, allowNull: false },
  driver_name: { type: DataTypes.STRING, allowNull: false },
  phone_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  national_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  passport_number: { type: DataTypes.STRING, unique: true },
  car_letters: { type: DataTypes.STRING },
  car_numbers: { type: DataTypes.STRING },
  trailer_letters: { type: DataTypes.STRING },
  trailer_numbers: { type: DataTypes.STRING },
  arrival_date: { type: DataTypes.DATE },
  driver_loading_date: { type: DataTypes.DATE },
  car_type: { type: DataTypes.STRING },
  fo_number: { type: DataTypes.STRING },
  loading_place: { type: DataTypes.STRING },
  company_loading_date: { type: DataTypes.DATE },
  cargo_type: { type: DataTypes.STRING },
  destination: { type: DataTypes.STRING },
  equipment: { type: DataTypes.STRING },
  client_name: { type: DataTypes.STRING },
  aging_date: { type: DataTypes.DATE },
  nights_count: { type: DataTypes.INTEGER },
  night_value: { type: DataTypes.DECIMAL(10, 2) },
  total_nights_value: { type: DataTypes.DECIMAL(10, 2) },
  transport_fee: { type: DataTypes.DECIMAL(10, 2) },
  expenses: { type: DataTypes.DECIMAL(10, 2) },
  total_transport: { type: DataTypes.DECIMAL(10, 2) },
  deposit: { type: DataTypes.DECIMAL(10, 2) },
  total_received_cash: { type: DataTypes.DECIMAL(10, 2) },
  transport_company: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
});




// Synchronize models with database
const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database");

    await sequelize.sync({ alter: true }); // Creates tables if not exist, updates if changed
    console.log("All models synchronized successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

syncDB();

module.exports = { sequelize, Drivers, Cars, Trailers, Agents, TransportTrips, ConstructTrips, Users };
