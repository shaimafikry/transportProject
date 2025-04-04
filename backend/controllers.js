const { sequelize, Drivers, Agents, TransportTrips, ConstructTrips, Users, DriversNotes } = require('./config');
const { addUser, editUser,allUsers,editDriver,addDriver,comp2DelTrip, comp2EditTrip, addTripAndDriver,editComp1, updatePassword, editDriverNote, deleteDriverNote, addDriverNote, getDriverTrips, allComp2Trips, addComp1 , importTrip} = require('./authController');
const {attendanceLog} = require('./attendanceCont');

const models = {
  construct: ConstructTrips,
  transport: TransportTrips,
  users: Users,
  drivers: Drivers,
	agents: Agents,
  driverNotes: DriversNotes 
};

// Generic CRUD handler
const handleRequest = async (model, action, data) => {
  if (!model) return { error: "Invalid action" };

  try {
    if (action) {
      if (action.includes("add")) {
			console.log("add", data)
      await model.create(data);
      return { message: "تمت الإضافة بنجاح" };
    }
    if (action.includes("edit")) {
      const { id, ...updateData } = data;
			console.log(data, id, updateData);
      await model.update(updateData, { where: { id } });
      return model.findOne({ where: { id } }); 
    }
    if (action.includes("del")) {
      const { id } = data;
      await model.destroy({ where: { id } });
      return { message: "تم الحذف بنجاح" };
    }
    }
    const modelName = Object.keys(models).find(key => models[key] === model);
    return { [modelName]: await model.findAll() };
  } catch (error) {
    console.error(`Error processing ${action}:`, error.message);
    return { error: `${error.message}` };
  }
};

const profile = async (req, res) => {
  await sequelize.authenticate();

 return updatePassword(req, res);

};


const attendance = async (req, res) => {
  await sequelize.authenticate();

  return attendanceLog(req, res);
};


const drivers = async (req, res) => {
  const action = req.query.action;
  await sequelize.authenticate();
  const data = req.body;

  // Handle user addition separately
  if (action === "add") return addDriver(req, res);
  if (action === "edit") return editDriver(req, res);
  

  // Handle all other actions dynamically
  const model = models["drivers"];
	console.log(model)

  const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};


const driversNotes = async (req, res) => {
  const action = req.query.action;
  await sequelize.authenticate();
  const data = req.body;

  // Handle user addition separately
  if (action === "add") return addDriverNote(req, res);
  if (action === "edit") return editDriverNote(req, res);
  if (action === "del") return deleteDriverNote(req, res);
  if (!action) return getDriverTrips(req, res);



  // Handle all other actions dynamically
  const model = models["driverNotes"];
	console.log(model)

  const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};


const users = async (req, res) => {
  const action = req.query.action;
  await sequelize.authenticate();
  const data = req.body;

  // Handle user addition separately
  if (action === "add") return addUser(req, res);
  if (action === "edit") return editUser(req, res);
  if (!action) return allUsers(req, res);


  const model = models["users"];
	console.log(model)

  const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};



const agents = async (req, res) => {
  const action = req.query.action;
  await sequelize.authenticate();
  const data = req.body;


  const model = models["agents"];
	console.log(model)

  const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};


const construct = async (req, res) => {
  const action = req.query.action;
  await sequelize.authenticate();
  const data = req.body;

  // Handle user addition separately
  if (action === "edit") return editComp1(req, res);
  if (action === "add") return addComp1(req, res);

  // Handle all other actions dynamically
  const model = models["construct"];
	console.log(model)

  const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};

const transport = async (req, res) => {
  const action = req.query.action;
  await sequelize.authenticate();
  const data = req.body;

  // Handle user addition separately
  if (!action) return allComp2Trips(req, res);
  if (action === "add") return addTripAndDriver(req, res);
  if (action === "del") return comp2DelTrip(req, res);
  if (action === "edit") return comp2EditTrip(req, res);
  if (action === "import") return importTrip(req, res);

  // Handle all other actions dynamically
  // const model = models[action.replace(/-(add|edit|del)$/, "")];
  // console.log(model)

  // const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};

module.exports = { construct, transport, drivers, agents, users, attendance, profile, driversNotes, importTrip };
