const { sequelize, Drivers, Agents, TransportTrips, ConstructTrips, Users } = require('./config');
const { addUser, editUser,allUsers,editDriver,addDriver, addTripAndDriver, updatePassword} = require('./authController');

const models = {
  comp1Trips: ConstructTrips,
  comp2Trips: TransportTrips,
  users: Users,
  drivers: Drivers,
	agents: Agents
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
  if (action === "users-edit") return editUser(req, res);
  if (action === "drivers-edit") return editDriver(req, res);
  if (action === "users") return allUsers(req, res);
  if (action === "profile") return updatePassword(req, res);







  // Handle all other actions dynamically
  const model = models[action.replace(/-(add|edit|del)$/, "")];
	console.log(model)

  const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};

module.exports = { dashboard };
