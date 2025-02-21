const { sequelize, Leaders, Drivers, Cars, Trailers, Orgs, TransportTrips, ConstructTrips, Users } = require('./config')
const { signIn, addUser, forgetPassword, renewPassword } = require('./authController');



const dashboard = async(req, res) => {
	const action = req.query.action;
  await sequelize.authenticate(); // Ensure connection
  const data = req.body;

	if (action === "comp1Trips"){
		try {
			const trips = await ConstructTrips.findAll();
			return res.status(200).json({trips: trips})
		} catch (error) {
			console.error('Error fetching users:', error);
	}

	}

	if (action === "comp1-add"){
		try {
			const trips = await ConstructTrips.create(data);
			return res.status(200).json({message: "تم اضافة الرحلة بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
	}

	}

	if (action === "comp1-edit"){
		const { id, ...updateData } = req.body;
		try {
			const trips = await ConstructTrips.update( updateData,
				{
					where: {
						id: id,
					},
				},);
			const updatedTrip = await ConstructTrips.findOne({ where: { id: id } });

			return res.status(200).json(updatedTrip)
		} catch (error) {
			console.error('Error fetching users:', error);
	}
	}

	if (action === "comp1-del"){
		try {
			const { id, ...updateData } = req.body;
			const trips = await ConstructTrips.destroy(	{where: { id: id,	},},);
			return res.status(200).json({message: "تم حذف الرحلة بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
	}
		
	}

	if (action === "comp2Trips"){
		try {
			const trips = await TransportTrips.findAll();
			return res.status(200).json({trips: trips})
		} catch (error) {
			console.error('Error fetching users:', error);
	}
		
	}

	if (action === "comp2-add"){
		try {
			const trips = await TransportTrips.create(data);
			return res.status(200).json({message: "تم اضافة الرحلة بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
		
	}
}

	if (action === "comp2-edit"){
		const { id, ...updateData } = req.body;
		try {
			const trips = await TransportTrips.update( updateData,
				{
					where: {
						id: id,
					},
				},);

			const updatedTrip = await TransportTrips.findOne({ where: { id: id } });
			return res.status(200).json(updatedTrip)
		} catch (error) {
			console.error('Error fetching users:', error);
	}
		
	}

	if (action === "comp2-del"){
		try {
			const { id, ...updateData } = req.body;
			const trips = await TransportTrips.destroy(	{where: { id: id,	},},);
			return res.status(200).json({message: "تم حذف الرحلة بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
	}

	}

	if (action === "user-add"){
		addUser(req, res);
	}

	if (action === "users"){
		try {
			const users = await Users.findAll();
			return res.status(200).json({users: users})
		} catch (error) {
			console.error('Error fetching users:', error);
	}

	}

	
	if (action === "user-edit"){
		const { id, ...updateData } = req.body;
		try {
			const users = await Users.update( updateData,
				{
					where: {
						id: id,
					},
				},);

			const updatedUser = await Users.findOne({ where: { id: id } });
			return res.status(200).json(updatedUser)
		} catch (error) {
			console.error('Error fetching users:', error);
	}
		
	}

	if (action === "user-del"){
		try {
			const { id, ...updateData } = req.body;
			const users = await Users.destroy(	{where: { id: id,	},},);
			return res.status(200).json({message: "تم حذف المستخدم بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
	}

	}

}


module.exports = { dashboard};
