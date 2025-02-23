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
  leader_name: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
  driver_name: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
  phone_number: { type: DataTypes.STRING, allowNull: false},
  national_id: { type: DataTypes.STRING, allowNull: false},
  passport_number: { type: DataTypes.STRING,},

  trip_num: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_all_transport: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  remaining_money_fees: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
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
  leader_name: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
  driver_name: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
  phone_number: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
  national_id: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
  passport_number: { type: DataTypes.STRING, defaultValue: "" },
  car_letters: { type: DataTypes.STRING, defaultValue: "" },
  car_numbers: { type: DataTypes.STRING, defaultValue: "" },
  trailer_letters: { type: DataTypes.STRING, defaultValue: "" },
  trailer_numbers: { type: DataTypes.STRING, defaultValue: "" },
  arrival_date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },
  driver_loading_date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },
  car_type: { type: DataTypes.STRING, defaultValue: "" },
  fo_number: { type: DataTypes.STRING, defaultValue: "" },
  loading_place: { type: DataTypes.STRING, defaultValue: "" },
  company_loading_date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },
  cargo_type: { type: DataTypes.STRING, defaultValue: "" },
  destination: { type: DataTypes.STRING, defaultValue: "" },
  equipment: { type: DataTypes.STRING, defaultValue: "" },
  client_name: { type: DataTypes.STRING, defaultValue: "" },
  aging_date: { type: DataTypes.DATEONLY, defaultValue: Sequelize.NOW },
  nights_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  night_value: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_nights_value: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  transport_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  expenses: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_transport: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  deposit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_received_cash: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  transport_company: { type: DataTypes.STRING, defaultValue: "" },
  notes: { type: DataTypes.TEXT, defaultValue: "" },
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


sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database schema updated successfully!");
  })
  .catch(error => console.error("Error updating schema:", error));

syncDB();

module.exports = { sequelize, Drivers, Cars, Trailers, Agents, TransportTrips, ConstructTrips, Users };
