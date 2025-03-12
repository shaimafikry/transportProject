const { sequelize, Drivers, Agents, TransportTrips, ConstructTrips, Users, DriversNotes } = require('./config');
const { addUser, editUser,allUsers,editDriver,addDriver,comp2DelTrip, comp2EditTrip, addTripAndDriver,editComp1, updatePassword, editDriverNote, deleteDriverNote, addDriverNote, getDriverTrips } = require('./authController');
const {attendanceLog} = require('./attendanceCont');

const models = {
  comp1Trips: ConstructTrips,
  comp2Trips: TransportTrips,
  users: Users,
  drivers: Drivers,
	agents: Agents,
  driverNotes: DriversNotes // Add this line
};

// Generic CRUD handler
const handleRequest = async (model, action, data) => {
  if (!model) return { error: "Invalid action" };

  try {
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
    return { [action]: await model.findAll() };
  } catch (error) {
    console.error(`Error processing ${action}:`, error.message);
    return { error: `${error.message}` };
  }
};

const dashboard = async (req, res) => {
  const action = req.query.action;
  await sequelize.authenticate();
  const data = req.body;

  // Handle user addition separately
  if (action === "users-add") return addUser(req, res);
	if (action === "drivers-add") return addDriver(req, res);
  if (action === "comp2Trips-add") return addTripAndDriver(req, res);
  if (action === "comp2Trips-del") return comp2DelTrip(req, res);
  if (action === "comp2Trips-edit") return comp2EditTrip(req, res);
  if (action === "comp1Trips-edit") return editComp1(req, res);
  if (action === "users-edit") return editUser(req, res);
  if (action === "drivers-edit") return editDriver(req, res);
  if (action === "users") return allUsers(req, res);
  if (action === "profile") return updatePassword(req, res);
  if (action === "attendance") return attendanceLog(req, res);


// Handle trip notes separately
if (action === "driverNotes-add") return addDriverNote(req, res);
if (action === "driverNotes-edit") return editDriverNote(req, res);
if (action === "driverNotes-del") return deleteDriverNote(req, res);
if (action === "driverNotes") return getDriverTrips(req, res);



  // Handle all other actions dynamically
  const model = models[action.replace(/-(add|edit|del)$/, "")];
	console.log(model)

  const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};

module.exports = { dashboard };
