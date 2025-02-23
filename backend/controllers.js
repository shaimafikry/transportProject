// const { sequelize, Leaders, Drivers, Cars, Trailers, Orgs, TransportTrips, ConstructTrips, Users } = require('./config')
// const { signIn, addUser, forgetPassword, renewPassword } = require('./authController');



// const dashboard = async(req, res) => {
// 	const action = req.query.action;
//   await sequelize.authenticate(); // Ensure connection
//   const data = req.body;

// 	if (action === "comp1Trips"){
// 		try {
// 			const trips = await ConstructTrips.findAll();
// 			return res.status(200).json({trips: trips})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}

// 	}

// 	if (action === "comp1-add"){
// 		try {
// 			const trips = await ConstructTrips.create(data);
// 			return res.status(200).json({message: "تم اضافة الرحلة بنجاح"})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}

// 	}

// 	if (action === "comp1-edit"){
// 		const { id, ...updateData } = req.body;
// 		try {
// 			const trips = await ConstructTrips.update( updateData,
// 				{
// 					where: {
// 						id: id,
// 					},
// 				},);
// 			const updatedTrip = await ConstructTrips.findOne({ where: { id: id } });

// 			return res.status(200).json(updatedTrip)
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}
// 	}

// 	if (action === "comp1-del"){
// 		try {
// 			const { id, ...updateData } = req.body;
// 			const trips = await ConstructTrips.destroy(	{where: { id: id,	},},);
// 			return res.status(200).json({message: "تم حذف الرحلة بنجاح"})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}
		
// 	}

// 	if (action === "comp2Trips"){
// 		try {
// 			const trips = await TransportTrips.findAll();
// 			return res.status(200).json({trips: trips})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}
		
// 	}

// 	if (action === "comp2-add"){
// 		try {
// 			const trips = await TransportTrips.create(data);
// 			return res.status(200).json({message: "تم اضافة الرحلة بنجاح"})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
		
// 	}
// }

// 	if (action === "comp2-edit"){
// 		const { id, ...updateData } = req.body;
// 		try {
// 			const trips = await TransportTrips.update( updateData,
// 				{
// 					where: {
// 						id: id,
// 					},
// 				},);

// 			const updatedTrip = await TransportTrips.findOne({ where: { id: id } });
// 			return res.status(200).json(updatedTrip)
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}
		
// 	}

// 	if (action === "comp2-del"){
// 		try {
// 			const { id, ...updateData } = req.body;
// 			const trips = await TransportTrips.destroy(	{where: { id: id,	},},);
// 			return res.status(200).json({message: "تم حذف الرحلة بنجاح"})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}

// 	}

// 	if (action === "user-add"){
// 		addUser(req, res);
// 	}

// 	if (action === "users"){
// 		try {
// 			const users = await Users.findAll();
// 			return res.status(200).json({users: users})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}

// 	}

	
// 	if (action === "user-edit"){
// 		const { id, ...updateData } = req.body;
// 		try {
// 			const users = await Users.update( updateData,
// 				{
// 					where: {
// 						id: id,
// 					},
// 				},);

// 			const updatedUser = await Users.findOne({ where: { id: id } });
// 			return res.status(200).json(updatedUser)
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}
		
// 	}

// 	if (action === "user-del"){
// 		try {
// 			const { id, ...updateData } = req.body;
// 			const users = await Users.destroy(	{where: { id: id,	},},);
// 			return res.status(200).json({message: "تم حذف المستخدم بنجاح"})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}

// 	}

// 	//MARK: DRIVERS
	
// 	if (action === "drivers"){
// 		try {
// 			const trips = await TransportTrips.findAll();
// 			return res.status(200).json({trips: trips})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}
		
// 	}

// 	if (action === "driver-add"){
// 		try {
// 			const drivers = await Drivers.create(data);
// 			return res.status(200).json({message: "تم اضافة السائق بنجاح"})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
		
// 	}
// }

// 	if (action === "driver-edit"){
// 		const { id, ...updateData } = req.body;
// 		try {
// 			const drivers = await Drivers.update( updateData,
// 				{
// 					where: {
// 						id: id,
// 					},
// 				},);

// 			const updatedDriver = await Drivers.findOne({ where: { id: id } });
// 			return res.status(200).json(updatedDriver)
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}
		
// 	}

// 	if (action === "driver-del"){
// 		try {
// 			const { id, ...updateData } = req.body;
// 			const drivers = await Drivers.destroy(	{where: { id: id,	},},);
// 			return res.status(200).json({message: "تم حذف السائق بنجاح"})
// 		} catch (error) {
// 			console.error('Error fetching users:', error);
// 	}

// 	}

// }


// module.exports = { dashboard};

const { sequelize, Leaders, Drivers, Agents, TransportTrips, ConstructTrips, Users } = require('./config');
const { addUser, addTripAndDriver } = require('./authController');

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
      await model.create(data);
      return { message: "تمت الإضافة بنجاح" };
    }
    if (action.includes("edit")) {
      const { id, ...updateData } = data;
      await model.update(updateData, { where: { id } });
      return model.findOne({ where: { id } }); // Return updated record
    }
    if (action.includes("del")) {
      const { id } = data;
      await model.destroy({ where: { id } });
      return { message: "تم الحذف بنجاح" };
    }
    return { [action]: await model.findAll() };
  } catch (error) {
    console.error(`Error processing ${action}:`, error);
    return { error: "حدث خطأ أثناء معالجة الطلب" };
  }
};

const dashboard = async (req, res) => {
  const action = req.query.action;
	console.log(action)
  await sequelize.authenticate();
  const data = req.body;

  // Handle user addition separately
  if (action === "users-add") return addUser(req, res);
  if (action === "comp2-add") return addTripAndDriver(req, res);



  // Handle all other actions dynamically
  const model = models[action.replace(/-(add|edit|del)$/, "")];
	console.log(model)

  const result = await handleRequest(model, action, data);
  
  return res.status(result.error ? 500 : 200).json(result);
};

module.exports = { dashboard };
