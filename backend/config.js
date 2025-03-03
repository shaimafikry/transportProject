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
  leader_name: { type: DataTypes.STRING,  allowNull: true },
  driver_name: { type: DataTypes.STRING,  allowNull: true },
  phone_number: { type: DataTypes.STRING},
  national_id: { type: DataTypes.STRING},
  passport_number: { type: DataTypes.STRING},
	company: { type: DataTypes.STRING},
  trip_num: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_all_transport: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  remaining_money_fees: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
});





const Agents = sequelize.define("Agents", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  agent_name: { type: DataTypes.STRING},
  agent_type: { type: DataTypes.STRING },

});


const ConstructTrips = sequelize.define("ConstructTrips", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bon_number: { type: DataTypes.STRING },
  driver_name: { type: DataTypes.STRING },
  car_number: { type: DataTypes.STRING },
  quantity: { type: DataTypes.DECIMAL(10, 2) },
  trip_date: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2) },
});



const Users = sequelize.define("Users", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
	role: {
    type: DataTypes.STRING,
    
    defaultValue: "data entry", // ✅ Default role set to "data entry"
  },
});


const TransportTrips = sequelize.define("TransportTrips", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  leader_name: { type: DataTypes.STRING,  defaultValue: "" },
  driver_name: { type: DataTypes.STRING,  allowNull: false },
  phone_number: { type: DataTypes.STRING,  defaultValue: "" },
  national_id: { type: DataTypes.STRING,  allowNull: false },
  passport_number: { type: DataTypes.STRING, allowNull: true },
  car_letters: { type: DataTypes.STRING, allowNull: true },
  car_numbers: { type: DataTypes.STRING, allowNull: true },
  trailer_letters: { type: DataTypes.STRING, allowNull: true },
  trailer_numbers: { type: DataTypes.STRING, allowNull: true },
  arrival_date: { type: DataTypes.STRING, allowNull: true  },
  driver_loading_date: { type: DataTypes.STRING, allowNull: true },
  car_type: { type: DataTypes.STRING, allowNull: true },
  fo_number: { type: DataTypes.STRING, allowNull: false },
  loading_place: { type: DataTypes.STRING, allowNull: true },
  company_loading_date: { type: DataTypes.STRING, allowNull: true  },
  cargo_type: { type: DataTypes.STRING, allowNull: true },
  destination: { type: DataTypes.STRING, allowNull: true },
  equipment: { type: DataTypes.STRING, allowNull: true },
  client_name: { type: DataTypes.STRING, allowNull: true },
  aging_date: { type: DataTypes.STRING,  allowNull: true  },
	nights_max:{ type: DataTypes.INTEGER, defaultValue: 0 },
  nights_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  night_value: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_nights_value: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  transport_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  expenses: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_transport: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  deposit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  total_received_cash: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
	remain_cash:{ type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  notes: { type: DataTypes.TEXT, allowNull: true },
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

module.exports = { sequelize, Drivers, Agents, TransportTrips, ConstructTrips, Users };
