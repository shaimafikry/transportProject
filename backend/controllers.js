const { sequelize, Leaders, Drivers, Cars, Trailers, Orgs, TransportTrips, ConstructTrips, Users } = require('./config')



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
						id: data.id,
					},
				},);
			return res.status(200).json({message: "تم تعديل الرحلة بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
	}
	}

	if (action === "comp1-del"){
		try {
			const trips = await ConstructTrips.destroy(	{where: { id: data,	},},);
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
		const data = req.body;
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
						id: data.id,
					},
				},);
			return res.status(200).json({message: "تم تعديل الرحلة بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
	}
		
	}

	if (action === "comp2-del"){
		try {
			const trips = await TransportTrips.destroy(	{where: { id: data,	},},);
			return res.status(200).json({message: "تم حذف الرحلة بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
	}

	}

	if (action === "user-add"){
		try {
			const user = await Users.create(data);
			return res.status(200).json({message: "تم اضافة مستخدم بنجاح"})
		} catch (error) {
			console.error('Error fetching users:', error);
	}

	}

	if (action === "users"){
		try {
			const users = await Users.findAll();
			return res.status(200).json({users: users})
		} catch (error) {
			console.error('Error fetching users:', error);
	}

	}

}


module.exports = { dashboard};
