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
  trip_counter: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_all_transport: { type: DataTypes.INTEGER, defaultValue:0 },
  remaining_money_fees: { type: DataTypes.INTEGER, defaultValue: 0 },
});





const Agents = sequelize.define("Agents", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  agent_name: { type: DataTypes.STRING},
  agent_type: { type: DataTypes.STRING },
  trip_counter: { type: DataTypes.INTEGER, defaultValue: 0 },

});


const ConstructTrips = sequelize.define("ConstructTrips", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bon_number: { type: DataTypes.STRING },
  driver_name: { type: DataTypes.STRING },
  car_number: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  trip_date: { type: DataTypes.STRING },
  price: { type: DataTypes.INTEGER },
	added_by: { type: DataTypes.STRING, allowNull: false  },
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



const Attendance = sequelize.define("Attendance", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("in", "out"), // "in" for check-in, "out" for check-out
    allowNull: false,
  },
}, {
  tableName: "attendance",
  timestamps: false, // Since you have a timestamp column, you might not need Sequelize's default timestamps
});

module.exports = Attendance;

const TransportTrips = sequelize.define("TransportTrips", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  leader_name: { type: DataTypes.STRING,  defaultValue: "" },
  driver_name: { type: DataTypes.STRING,  allowNull: true },
  phone_number: { type: DataTypes.STRING,  defaultValue: "" },
  national_id: { type: DataTypes.STRING,  allowNull: true },
  passport_number: { type: DataTypes.STRING, allowNull: true },
  car_letters: { type: DataTypes.STRING, allowNull: true },
  car_numbers: { type: DataTypes.STRING, allowNull: true },
  trailer_letters: { type: DataTypes.STRING, allowNull: true },
  trailer_numbers: { type: DataTypes.STRING, allowNull: true },
  arrival_date: { type: DataTypes.STRING, allowNull: true  },
  driver_loading_date: { type: DataTypes.STRING, allowNull: true },
  car_type: { type: DataTypes.STRING, allowNull: true },
  fo_number: { type: DataTypes.STRING, allowNull: true },
  loading_place: { type: DataTypes.STRING, allowNull: true },
  company_loading_date: { type: DataTypes.STRING, allowNull: true  },
  cargo_type: { type: DataTypes.STRING, allowNull: true },
  destination: { type: DataTypes.STRING, allowNull: true },
  equipment: { type: DataTypes.STRING, allowNull: true },
  client_name: { type: DataTypes.STRING, allowNull: true },
  aging_date: { type: DataTypes.STRING,  allowNull: true  },
  nights_max:{ type: DataTypes.INTEGER, defaultValue: 0 },
  nights_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  night_value: { type: DataTypes.INTEGER, defaultValue: 0},
  total_nights_value: { type: DataTypes.INTEGER, defaultValue: 0 },
  transport_fee: { type: DataTypes.INTEGER, defaultValue: 0 },
  expenses: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_transport: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_received_cash: { type: DataTypes.INTEGER, defaultValue: 0 },
  remain_cash:{ type: DataTypes.INTEGER, defaultValue: 0 },
  notes: { type: DataTypes.TEXT, allowNull: true },
  added_by: { type: DataTypes.STRING, allowNull: false },
  
  // الحقول الجديدة
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "غير مطالبة" }, // حالة الرحلة
  edited_by: { type: DataTypes.STRING, allowNull: true },
  company_night_value: { type: DataTypes.INTEGER, defaultValue: 0 }, // قيمة البياتة للشركة
  company_toll_fee: { type: DataTypes.INTEGER, defaultValue: 0 }, // حساب الكارتة للشركة
  company_naulon: { type: DataTypes.INTEGER, defaultValue: 0 }, // ناولون الشركة
  total_company_nights_value: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0, 
    get() { 
      return this.getDataValue('nights_count') * this.getDataValue('company_night_value');
    }
  },
  total_company_account: { type: DataTypes.INTEGER, defaultValue: 0 }, // الحساب الاجمالي للشركة
  net_profit: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0, 
    get() { 
      return this.getDataValue('total_transport') - this.getDataValue('total_company_account');
    }
  }
});

const DriversNotes = sequelize.define("DriversNotes", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driver_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { 
      model: 'Drivers', // يفترض وجود جدول للسائقين
      key: 'id'
    }
  },
  trip_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { 
      model: 'TransportTrips', 
      key: 'id'
    }
  },
  note: { type: DataTypes.TEXT, allowNull: false }
});

const ConstructTripsNotes = sequelize.define("ConstructTripsNotes", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  driver_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { 
      model: 'Drivers', // يفترض وجود جدول للسائقين
      key: 'id'
    }
  },
  trip_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { 
      model: 'ConstructTrips', 
      key: 'id'
    }
  },
  note: { type: DataTypes.TEXT, allowNull: false }
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

module.exports = { sequelize, Drivers, Agents,Attendance, TransportTrips, ConstructTrips, Users, DriversNotes, ConstructTripsNotes };
