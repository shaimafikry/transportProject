require('dotenv').config({path: '../.env'});
const { Users, Drivers, Attendance, TransportTrips, ConstructTrips, Agents, DriversNotes } = require('./config');
const jwt = require('jsonwebtoken');
const secret_key = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");



async function validatePass(password, hashedPassword) {
	return await bcrypt.compare(password, hashedPassword);
};

//MARK: adduser
const addUser = async (req, res) => {
  const newUser = req.body;
	// username an username found
	const user = await Users.findOne({ where: { username: newUser.username } });

	const password_hash = await bcrypt.hash(newUser.password, 10);

	newUser.password = password_hash;

	try {
		if (user && user.username === newUser.username) {
			throw new Error('اسم المستخدم موجود مسبقا');
		}
	
		const userPhone = await Users.findOne({ where: { phone: newUser.phone } });
		if (userPhone && userPhone.phone === newUser.phone) {
			throw new Error('رقم الموبايل موجود مسبقا');
		}
		await Users.create(newUser);

	 return res.status(201).json('تم اضافة المستخدم بنجاح');

	}catch(error){
		console.error('error in add user', error);
		return res.status(400).json({message :`${error.message}`});


	}
};

//MARK: add driver
const addDriver = async (req, res) => {
  const newDriver = req.body;
	// username an username found
	try {

		if (newDriver.national_id) {
			const existingDriver = await Drivers.findOne({ where: { national_id: newDriver.national_id } });
	
			if (existingDriver) {
					throw new Error('الرقم القومي موجود مسبقا');
			}
	}

	if (newDriver.phone_number) {
		const existingDriver = await Drivers.findOne({ where: { phone_number: newDriver.phone_number } });

		if (existingDriver) {
				throw new Error('رقم الموبايل موجود مسبقا');
		}
}

		await Drivers.create(newDriver);

	 return res.status(201).json('تم اضافة السائق بنجاح');

	}catch(error){
		console.error('error in add driver', error);
		return res.status(400).json({message :`${error.message}`});


	}
};



//MARK: EDIT DRIVER;
const editDriver= async(req, res)=> {
	const { id, ...updateData } = req.body;


	try {

		if (updateData.national_id) {
			const existingDriver = await Drivers.findOne({ where: { national_id: updateData.national_id } });
      console.log("data",{...updateData}, existingDriver.get({ plain: true }))

	
			if (existingDriver && existingDriver.id !== id) {
					throw new Error('الرقم القومي موجود مسبقا');
			}
	}

	if (updateData.phone_number) {
		const existingDriver = await Drivers.findOne({ where: { phone_number: updateData.phone_number } });

		if (existingDriver && existingDriver.id !== id) {
				throw new Error('رقم الموبايل موجود مسبقا');
		}
}


	const response = await Drivers.update(updateData, { where: { id } });

	const updatedDriver = await Drivers.findOne({ where: { id } });
	const driverData = updatedDriver.get({ plain: true });



	return res.status(200).json({...driverData});
	
}catch(error){
	console.error('error in edit driver', error);
	return res.status(400).json({message :`${error.message}`});

}

};


//MARK: COMP1

//MARK: EDIT comp1;
const editComp1= async(req, res)=> {
	const { id, ...updateData } = req.body;
	try {
	const response = await ConstructTrips.update(updateData, { where: { id } });

	const updatedComp1 = await ConstructTrips.findOne({ where: { id } });
	const comp1Data = updatedComp1.get({ plain: true });
	// console.log("data",{...driverData})
	return res.status(200).json({...comp1Data});
	
}catch(error){
	console.error('error in edit comp1', error);
	return res.status(400).json({message :`${error.message}`});

}

};

//MARK: EDIT comp1;
const addComp1= async(req, res)=> {
	const { id, ...updateData } = req.body;
	try {
		const comp1Data = {
			...updateData,
			added_by: req.user.name
		};

		const response = await ConstructTrips.create(comp1Data);
		return res.status(200).json({ ...comp1Data, id: response.id });
	
}catch(error){
	console.error('error in add comp1', error);
	return res.status(400).json({message :`${error.message}`});

}

};



//MARK: edituser
const editUser= async(req, res)=> {
		const { id, ...updateData } = req.body;
	
	  // Check if the password is being updated
    if (updateData.password && updateData.password.trim() !== "") {
      const password_hash = await bcrypt.hash(updateData.password, 10);
      updateData.password = password_hash;
    }
	
		try {

			if (updateData.phone) {
				const existingUser = await Users.findOne({ where: { phone: updateData.phone } });
		
				if (existingUser && existingUser.id !== id) {
						throw new Error('رقم الموبايل موجود مسبقا');
				}
		}
	
		if (updateData.username) {
			const existingUser = await Users.findOne({ where: { username: updateData.username } });
	
			if (existingUser && existingUser.id !== id) {
					throw new Error('اسم المستخدم موجود مسبقا');
			}
	}
	

		const response = await Users.update(updateData, { where: { id } });

		const updatedUser = await Users.findOne({ where: { id } });
		const userData = updatedUser.get({ plain: true });

		console.log("data",{...userData, password:""})


		return res.status(200).json({...userData, password:""});
		
	}catch(error){
		console.error('error in edit user', error);
		return res.status(400).json({message :`${error.message}`});

	}

};



const allUsers = async (req, res) => {
  try {
    const users = await Users.findAll();

    const sanitizedUsers = users.map(user => {
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        password: "", // Explicitly set password to an empty string
        username: user.username,
        role: user.role,
      };
    });
		console.log(sanitizedUsers)

    return res.status(200).json({ users: sanitizedUsers });

  } catch (error) {
    console.error('Error in fetching users:', error);
    return res.status(500).json(`${error.message}`);
  }
};


//MARK: COMP2

const allComp2Trips = async (req, res) => {
  try {

    const trips = await TransportTrips.findAll({ raw: true }); // raw: true for plain JS objects

    // Function to get agent type asynchronously
    const getAgentType = async (client_name) => {
      const agent = await Agents.findOne({ where: { agent_name: client_name }, raw: true });
      return agent ? agent.agent_type : "منظمة"; // Fallback if agent is not found
    };

    const sanitizedComp2Trips = await Promise.all(
      trips.map(async (trip) => {
        const client_type = await getAgentType(trip.client_name); 
        return {
          ...trip,
          client_type,
        };
      })
    );

    return res.status(200).json({ comp2Trips: sanitizedComp2Trips });

  } catch (error) {
    console.error("Error in fetching comp2Trips:", error);
    return res.status(500).json(`${error.message}`);
  }
};



//MARK: EDIT TRIP
const comp2EditTrip = async (req, res) => {
  try {
    const username = req.user.name;
    const data = req.body;
    const { id, ...updateData } = data;

    if (!id) {
      throw new Error("معرف الرحلة مفقود");
    }

    const existingTrip = await TransportTrips.findOne({ where: { id } });
    if (!existingTrip) {
      throw new Error("لم يتم العثور على الرحلة");
    }

    const oldNationalId = existingTrip.national_id;
    const oldTotalTransport = existingTrip.total_transport || 0;
    const oldTotalReceivedCash = existingTrip.total_received_cash || 0;
    const oldClientName = existingTrip.client_name;

    updateData.edited_by = username;
    await TransportTrips.update(updateData, { where: { id } });

    const updatedTrip = await TransportTrips.findOne({ where: { id } });
    if (!updatedTrip) {
      throw new Error("لم يتم العثور على الرحلة بعد التحديث");
    }

    const sanitizedData = updatedTrip.get({ plain: true });
    const { national_id, total_transport = 0, total_received_cash = 0, client_name = "" } = sanitizedData;

    if (national_id !== oldNationalId) {
      if (oldNationalId) {
        let oldDriver = await Drivers.findOne({ where: { national_id: oldNationalId } });
        if (oldDriver) {
          oldDriver.trip_counter = Math.max(0, oldDriver.trip_counter - 1);
          oldDriver.total_all_transport -= oldTotalTransport;
          oldDriver.remaining_money_fees -= (oldTotalTransport - oldTotalReceivedCash);
          await oldDriver.save();
        }
      }
      if (national_id) {
        let newDriver = await Drivers.findOne({ where: { national_id } });
        if (newDriver) {
          newDriver.trip_counter += 1;
          newDriver.total_all_transport += total_transport;
          newDriver.remaining_money_fees += (total_transport - total_received_cash);
          await newDriver.save();
        }
      }
    }

    if (client_name !== oldClientName) {
      if (oldClientName) {
        let oldAgent = await Agents.findOne({ where: { agent_name: oldClientName } });
        if (oldAgent) {
          oldAgent.trip_counter -= 1;
          await oldAgent.save();
        }
      }
      if (client_name) {
        let newAgent = await Agents.findOne({ where: { agent_name: client_name } });
        if (newAgent) {
          newAgent.trip_counter += 1;
          await newAgent.save();
        }
      }
    }

    return res.status(200).json({ ...sanitizedData });
  } catch (error) {
    console.error("Error updating trip:", error);
    return res.status(400).json({message :`${error.message}`});
  }
};





// MARK: del trip driver
const comp2DelTrip = async (req, res) => {
  try {
    // Extract id properly
    const { id } = req.body;
    // Find the trip
    const tripToDel = await TransportTrips.findOne({ where: { id } });
    if (!tripToDel) throw new Error ("الرحلة غير موجودة");

    // Convert to plain object
    const sanitizedData = tripToDel.get({ plain: true });

    // Extract important fields
    const { national_id, total_transport = 0, total_received_cash = 0, client_name="" } = sanitizedData;

    // Delete the trip
    await TransportTrips.destroy({ where: { id } });
    console.log("تم حذف الرحلة بنجاح");

    // Find the driver
    let driver = await Drivers.findOne({ where: { national_id } });
    let agent = await Agents.findOne({ where: { agent_name: client_name } });

		

    if (driver) {
      driver.trip_counter = Math.max(0, driver.trip_counter - 1);
      driver.total_all_transport = Math.max(0, driver.total_all_transport - total_transport);
      driver.remaining_money_fees = Math.max(0, driver.remaining_money_fees - (total_transport - total_received_cash));
      await driver.save();
      console.log("تم تعديل بيانات السائق بنجاح");
    }

		if (agent) {
      agent.trip_counter = Math.max(0, agent.trip_counter - 1);
      
      await agent.save();
      console.log("تم تعديل بيانات الرحلة بنجاح");
    }

    return res.status(200).json("تم حذف الرحلة بنجاح");

  } catch (error) {
    console.error("Error deleting trip and updating driver:", error);
    return res.status(500).json(`${error.message}`);
  }
};


// MARK: ADD Trip
const addTripAndDriver = async (req, res) => {
  try {
    const username = req.user.name;
    const sanitizedData = { ...req.body, added_by: username };

    // Validate required fields
    if (!sanitizedData.driver_name) {
      throw new Error("يجب إدخال اسم السائق");
    }
    if (!sanitizedData.national_id) {
      throw new Error("يجب إدخال الرقم القومي للسائق");
    }

    // Check if the driver already exists
    let driver = await Drivers.findOne({ where: { national_id: sanitizedData.national_id } });
    let agent = await Agents.findOne({ where: { agent_name: sanitizedData.client_name || "" } });

    // Create the trip
    await TransportTrips.create(sanitizedData);
    console.log("تمت إضافة بيانات الرحلة بنجاح");

    // Update or create the driver
    if (driver) {
      driver.trip_counter += 1;
      driver.total_all_transport += sanitizedData.total_transport || 0;
      driver.remaining_money_fees += (sanitizedData.total_transport || 0) - (sanitizedData.total_received_cash || 0);
      await driver.save();
    } else {
      driver = await Drivers.create({
        leader_name: sanitizedData.leader_name,
        driver_name: sanitizedData.driver_name,
        phone_number: sanitizedData.phone_number,
        national_id: sanitizedData.national_id,
        company: "النقل",
        trip_counter: 1,
        total_all_transport: sanitizedData.total_transport || 0,
        remaining_money_fees: (sanitizedData.total_transport || 0) - (sanitizedData.total_received_cash || 0),
      });
    }

    // Update or create the agent
    if (agent) {
      agent.trip_counter += 1;
      await agent.save();
    } else if (sanitizedData.client_name) {
      await Agents.create({
        agent_name: sanitizedData.client_name,
        agent_type: sanitizedData.client_type? sanitizedData.client_type : "منظمة",
        trip_counter: 1,
      });
    }

    return res.status(201).json("تمت الإضافة بنجاح");
  } catch (error) {
    console.error("Error adding trip and driver:", error);
    return res.status(500).json(`${error.message}`);
  }
};


//MARK : IMPORT

// MARK: ADD Trip
const importTrip = async (req, res) => {
  const errorList =[];
  try {
    const username = req.user.name;

    for (const trip of req.body) {
      try {
      const sanitizedData = { ...trip, added_by: username };

      // Check if the driver already exists
      let driver = await Drivers.findOne({ where: { national_id: sanitizedData.national_id } });
      let agent = await Agents.findOne({ where: { agent_name: sanitizedData.client_name || "" } });

    // Create the trip
    const respone = await TransportTrips.create(sanitizedData);
    console.log("تمت إضافة بيانات الرحلة بنجاح");

    // Update or create the driver
    if (driver) {
      driver.trip_counter += 1;
      driver.total_all_transport += sanitizedData.total_transport || 0;
      driver.remaining_money_fees += (sanitizedData.total_transport || 0) - (sanitizedData.total_received_cash || 0);
      await driver.save();
    } else {
      driver = await Drivers.create({
        leader_name: sanitizedData.leader_name,
        driver_name: sanitizedData.driver_name,
        phone_number: sanitizedData.phone_number,
        national_id: sanitizedData.national_id,
        company: "النقل",
        trip_counter: 1,
        total_all_transport: sanitizedData.total_transport || 0,
        remaining_money_fees: (sanitizedData.total_transport || 0) - (sanitizedData.total_received_cash || 0),
      });
    }

    // Update or create the agent
    if (agent) {
      agent.trip_counter += 1;
      await agent.save();
    } else if (sanitizedData.client_name) {
      await Agents.create({
        agent_name: sanitizedData.client_name,
        agent_type: sanitizedData.client_type? sanitizedData.client_type : "منظمة",
        trip_counter: 1,
      });
    }
  }catch (error) {
    console.error("Error importing trip :", error);
    console.log(error.message);
    errorList.push(error.message);
  }

  }
    return res.status(201).json({message:"تمت اضافة الرحلات بنجاح", errorList});
  } catch (error) {
    console.error("Error adding trip and driver:", error);
    return res.status(500).json(`${error.message}`);
  }
};


//MARK: Sign in
const signIn = async (req, res) => {
	// console.log(req.body, "entry");
  const { username, password } = req.body;

	try{
	const user = await Users.findOne({ where: { username: username } });
	//console.log

	if (!user) {
		throw new Error('هذا المستخدم غير موجود');
	}

	const isPasswordValid = await bcrypt.compare(password, user.password)
	if (!isPasswordValid) {
		throw new Error('كلمة السر غير صحيحة');
	}
	
// Add attendance record for sign-in
const signInRecord = {
  name: user.name, // Ensure it matches the model field
  userId: user.id,
  type: "in",
  timestamp: new Date(), // Capture current time
};

const record = await Attendance.create(signInRecord);


	// generate JWT token and send it back to the client
	const payload = {
    name: user.name,
    id: user.id,
    iat: Math.floor(Date.now() / 1000), // Current timestamp in seconds
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 24, // Expires in 24 days
  };
  
  const token = jwt.sign(payload, secret_key, { algorithm: "HS256" });
  
  return res.status(200).json({
    token: token,
    role: user.role,
    id: user.id,
    username: user.username,
    message: "Login successful",
    redirectUrl: "/dashboard",
  });
}catch(error){
	console.error('Error updating password:', error);
	return res.status(402).json({message :`${error.message}`});
}


};


//MARK: FORGET PSSWORD
const forgetPasswordCheck = async (req, res) => {
  const phone = req.query.phone;
  // console.log("phone", phone);

	try{

  const user = await Users.findOne({ where: { phone } });
  console.log(user);

  if (!user) {
    throw new Error("المستخدم غير موجود في قاعدة البيانات");
  }

  return res.status(200).json(user.id);

}catch(error){
	console.error('Error updating password:', error);
	return res.status(402).json({message :`${error.message}`});
}
};



const forgetPassword = async (req, res) => {
  const { id, newPassword } = req.body;

	try{

  const user = await Users.findOne({ where: { id } });
  // console.log(user);

  if (!user) {
    throw new Error("المستخدم غير موجود" );
  }

  // Hash the new password
  const newHash = await bcrypt.hash(newPassword, 10);

  // Update password in the database
  await Users.update({ password: newHash }, { where: { id } });

  return res.status(200).json("تم تجديد كلمة السر بنجاح" );
}catch(error) {
	console.error('Error updating password:', error);
	return res.status(402).json({message :`${error.message}`});

}
};


// MARK: RENEWPASSWORD
const updatePassword = async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
	console.log(id, oldPassword, newPassword, req.body)

  try {
    // Find user by ID
    const user = await Users.findOne({ where: { id } });
    if (!user) {
      throw new Error('هذا المستخدم غير موجود' );
    }

    // Check if both old and new passwords are provided
    if (!oldPassword || !newPassword) {
      throw new Error('كلمة السر مطلوبة' );
    }

    // Validate old password
    const isValid = await validatePass(oldPassword, user.password);
    if (!isValid) {
      throw new Error ('كلمة السر القديمة غير صحيحة' );
    }

    // Hash the new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await Users.update({ password: newHash }, { where: { id } });

    return res.status(200).json('تم تجديد كلمة السر بنجاح' );

  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(402).json({message: `${error.message}`});
  }
};


//MARK: log out
const logout = async(req, res) => {
  try {
		const user = req.user;
		console.log(user);
		// Add attendance record for sign-out
		const signInRecord = {
				name: user.name, // Ensure it matches the model field
				userId: user.id,
				type: "out",
				timestamp: new Date(), // Capture current time
		};
		

		const record = await Attendance.create(signInRecord);

    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "strict" }); // حذف الكوكيز

    return res.status(200).json("تم تسجيل الخروج بنجاح" );
  } catch (error) {
    console.error("Error during logout:", error);
		return res.status(400).json({message:`${error.message}`});
  }
};

  


//MARK: getDriverTrips
const getDriverTrips = async (req, res) => {
  try {
		console.log(req.query)
    const { id } = req.params;

    const driver = await Drivers.findOne({ where: { id } });

    if (!driver) {
      return res.status(404).json({ error: "السائق غير موجود" });
    }

		
    // Fetch all trips related to this driver
    const trips = await TransportTrips.findAll({ where: { national_id: driver.national_id } });

    // Fetch notes for each trip and attach them
    const tripsWithNotes = await Promise.all(
      trips.map(async (trip) => {
        const notes = await DriversNotes.findAll({ where: { trip_id: trip.id },
					raw: true  });
        return { ...trip.get({ plain: true }), trip_notes: notes };
      })
    );
     
		//  console.log({ driver, trips: tripsWithNotes })

    res.json({ driver, trips: tripsWithNotes });
  } catch (error) {
    console.error("Error fetching driver trips and notes:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات السائق والرحلات" });
  }
};




//MARK: getDriverNotes
// const getDriverNotes = async (req, res) => {
//   try {
//     const { trip_id } = req.query; // Use query param

//     if (!trip_id) {
//       return res.status(400).json({ error: "يجب إدخال معرف الرحلة" });
//     }

//     const notes = await DriversNotes.findAll({ where: { trip_id } });

//     res.json(notes);
//   } catch (error) {
//     console.error("Error fetching driver notes:", error);
//     res.status(500).json({ error: "حدث خطأ أثناء جلب الملاحظات" });
//   }
// };


//MARK: addDriverNote
const addDriverNote = async (req, res) => {
  try {
    const { driver_id, trip_id, note } = req.body;
		const added_by = req.user.name;

    if (!driver_id || !trip_id || !note) {
      return res.status(400).json({ error: "يجب إدخال معرف السائق، الرحلة والملاحظة" });
    }

    const newNote = await DriversNotes.create({ driver_id, trip_id, note, added_by });

    res.json({ message: "تمت إضافة الملاحظة بنجاح", newNote });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إضافة الملاحظة" });
  }
};


//MARK: editDriverNote
const editDriverNote = async (req, res) => {
  try {
    const { note_id, note } = req.body;

    if (!note_id || !note) {
      return res.status(400).json({ error: "يجب إدخال معرف الملاحظة والمحتوى الجديد" });
    }

    const existingNote = await DriversNotes.findOne({ where: { id: note_id } });

    if (!existingNote) {
      return res.status(404).json({ error: "الملاحظة غير موجودة" });
    }

    const edited_by = req.user.name;

    await existingNote.update({ note, edited_by });

    res.json({ message: "تم تحديث الملاحظة بنجاح", updatedNote: existingNote });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث الملاحظة" });
  }
};


//MARK: deleteDriverNote
const deleteDriverNote = async (req, res) => {
  try {
    const { note_id } = req.body;

    if (!note_id) {
      return res.status(400).json({ error: "يجب إدخال معرف الملاحظة للحذف" });
    }

    const existingNote = await DriversNotes.findOne({ where: { id: note_id } });

    if (!existingNote) {
      return res.status(404).json({ error: "الملاحظة غير موجودة" });
    }

    await existingNote.destroy();

    res.json({ message: "تم حذف الملاحظة بنجاح" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حذف الملاحظة" });
  }
};


module.exports = { signIn, addUser,editUser,editDriver,addDriver,comp2DelTrip, allUsers, forgetPassword,forgetPasswordCheck, updatePassword, logout, addTripAndDriver, editComp1, comp2EditTrip, getDriverTrips, editDriverNote, addDriverNote, deleteDriverNote, allComp2Trips, addComp1, importTrip };
