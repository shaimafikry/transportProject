require('dotenv').config({path: '../.env'});
const { Users, Drivers, TransportTrips, ConstructTrips, Agents } = require('./config');
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
		return res.status(400).json(`${error.message}`);


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
		return res.status(400).json(`${error.message}`);


	}
};



//MARK: EDIT DRIVER;
const editDriver= async(req, res)=> {
	const { id, ...updateData } = req.body;


	try {

		if (updateData.national_id) {
			const existingDriver = await Drivers.findOne({ where: { national_id: updateData.national_id } });
	
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

	console.log("data",{...driverData})


	return res.status(200).json({...driverData});
	
}catch(error){
	console.error('error in edit driver', error);
	return res.status(400).json(`${error.message}`);

}

};



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
	return res.status(400).json(`${error.message}`);

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
		return res.status(400).json(`${error.message}`);

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

//MARK: EDit comp2
const comp2EditTrip = async (req, res) => {
  try {
    const data = req.body;
    const { id, ...updateData } = data;

    if (!id) {
      throw new Error("معرف الرحلة مفقود");
    }

    // console.log("Received Data:", data, "ID:", id, "Update Data:", updateData);

    // Fetch the existing trip before updating
    const existingTrip = await TransportTrips.findOne({ where: { id } });
    if (!existingTrip) {
      throw new Error("لم يتم العثور على الرحلة");
    }

    const oldNationalId = existingTrip.national_id;
    const oldTotalTransport = existingTrip.total_transport || 0;
    const oldTotalReceivedCash = existingTrip.total_received_cash || 0;


    const oldClientName = existingTrip.client_name;


    // Update trip data
    await TransportTrips.update(updateData, { where: { id } });

    // Fetch the updated trip data
    const updatedComp2 = await TransportTrips.findOne({ where: { id } });
    if (!updatedComp2) {
      throw new Error("لم يتم العثور على الرحلة بعد التحديث");
    }

    const sanitizedData = updatedComp2.get({ plain: true });
		// console.log("Updated Trip Data:", sanitizedData);


    // Extract updated values
    const { national_id, total_transport = 0, total_received_cash = 0, client_name="" } = sanitizedData;
		// console.log("Updated after Data:", sanitizedData);


    // Check if national_id changed
    if (national_id !== oldNationalId) {
      if (oldNationalId) {
        // Find the old driver and subtract values
        let oldDriver = await Drivers.findOne({ where: { national_id: oldNationalId } });
        if (oldDriver) {
          oldDriver.trip_num = Math.max(0, oldDriver.trip_num - 1);
          oldDriver.total_all_transport = Math.max(0, oldDriver.total_all_transport - oldTotalTransport);
          oldDriver.remaining_money_fees = Math.max(0, oldDriver.remaining_money_fees - (oldTotalTransport - oldTotalReceivedCash));
          await oldDriver.save();
          console.log(`تم تحديث بيانات السائق القديم (${oldNationalId})`);
        }
      }

      if (national_id) {
        // Find the new driver and add values
        let newDriver = await Drivers.findOne({ where: { national_id } });
        if (newDriver) {
          newDriver.trip_num = (newDriver.trip_num || 0) + 1;
          newDriver.total_all_transport = (newDriver.total_all_transport || 0) + total_transport;
          newDriver.remaining_money_fees = (newDriver.remaining_money_fees || 0) + (total_transport - total_received_cash);
          await newDriver.save();
          console.log(`تم تحديث بيانات السائق الجديد (${national_id})`);
        }
      }
    } else if (total_transport !== oldTotalTransport || total_received_cash !== oldTotalReceivedCash) {
      // Update the same driver’s financials if transport/fees changed
      let driver = await Drivers.findOne({ where: { national_id } });
      if (driver) {
        driver.total_all_transport = Math.max(0, driver.total_all_transport - oldTotalTransport + total_transport);
        driver.remaining_money_fees = Math.max(0, driver.remaining_money_fees - (oldTotalTransport - oldTotalReceivedCash) + (total_transport - total_received_cash));
        await driver.save();
        console.log(`تم تعديل بيانات السائق (${national_id})`);
      }
			console.log("driver", driver.get({ plain: true }))

    }

		 // Check if client changed
		 if (client_name !== oldClientName) {
      if (oldClientName) {
        // Find the old driver and subtract values
        let oldAgent = await Agents.findOne({ where: { agent_name: oldClientName } });
        if (oldAgent) {
          oldAgent.trip_num = Math.max(0, oldAgent.trip_num - 1);
          await oldAgent.save();
          console.log(`تم تحديث بيانات العميل القديم (${oldClientName})`);
        }
      }

      if (client_name) {
        // Find the new driver and add values
        let newAgent = await Agents.findOne({ where: { agent_name: client_name } });
        if (newAgent) {
          newAgent.trip_num = (newAgent.trip_num || 0) + 1;
          await newAgent.save();
          console.log(`تم تحديث بيانات العميل الجديد (${client_name})`);
        }
      }
    } 

    return res.status(200).json({ ...sanitizedData });
  } catch (error) {
    console.error("Error updating trip:", error);
    return res.status(400).json(`${error.message}`);
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
      driver.trip_num = Math.max(0, driver.trip_num - 1);
      driver.total_all_transport = Math.max(0, driver.total_all_transport - total_transport);
      driver.remaining_money_fees = Math.max(0, driver.remaining_money_fees - (total_transport - total_received_cash));
      await driver.save();
      console.log("تم تعديل بيانات السائق بنجاح");
    }

		if (agent) {
      agent.trip_num = Math.max(0, agent.trip_num - 1);
      
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
     // Extract token from the Authorization header
     const authHeader = req.headers.authorization;
     if (!authHeader || !authHeader.startsWith("Bearer ")) {
       return res.status(401).json({ error: "Unauthorized: No token provided" });
     }
 
     const token = authHeader.split(" ")[1]; // Extract the token after "Bearer"
     let decoded;
     try {
       decoded = jwt.verify(token, secret_key); // Verify and decode the token
     } catch (err) {
       return res.status(403).json({ error: "Invalid or expired token" });
     }
 
     const username = decoded.name; // Extract username from the token payload
 
    // Sanitize input data
    const sanitizeInput = (key, value) => {
      if (value === "" || value === null || value === undefined) {
        // For numeric fields, default to 0 if null or empty
        if (
          [
            "nights_count",
            "night_value",
            "total_nights_value",
            "transport_fee",
            "expenses",
            "total_transport",
            "deposit",
            "total_received_cash",
          ].includes(key)
        ) {
          return 0;
        }
        // For other fields, return null
        return null;
      }

      // Convert national_id and phone_number to strings
      if (key === "national_id" || key === "phone_number") {
        return value.toString();
      }

      // Convert numeric fields to numbers
      if (!isNaN(value) && typeof value !== "boolean") {
        return parseFloat(value);
      }

      // Return the value as-is
      return value;
    };

    // Sanitize all fields in the request body
    const sanitizedData = {};
    Object.keys(req.body).forEach((key) => {
      sanitizedData[key] = sanitizeInput(key, req.body[key]);
    });

    // Extract required fields for calculations
    const { national_id, total_transport, total_received_cash, client_name="" } = sanitizedData;
		console.log(client_name)

    // Ensure numeric fields have valid values
    sanitizedData.total_transport = total_transport ?? 0;
    sanitizedData.total_received_cash = total_received_cash ?? 0;

    // Validate required fields
    if (!sanitizedData.driver_name){
      throw new Error("يجب إدخال اسم السائق " );
    }
		// if (!sanitizedData.client_name) {
    //   return res.status(400).json({ error: "يجب إدخال اسم العميل" });
    // }
		// if (!sanitizedData.fo_number) {
    //   return res.status(400).json({ error: "يجب إدخال رقم FO" });
    // }

		if (!sanitizedData.national_id) {
      throw new Error("يجب إدخال الرقم القومي  للسائق  ");
    }
		

    // Check if the driver already exists
    let driver = await Drivers.findOne({ where: { national_id } });
    let agent = await Agents.findOne({ where: { agent_name: client_name } });
		console.log(agent);


    sanitizedData.added_by = username;
    // Create the trip
    await TransportTrips.create(sanitizedData);
    console.log("تمت إضافة بيانات الرحلة بنجاح");

    // Update or create the driver
    if (driver) {
      driver.trip_num += 1;
      driver.total_all_transport += sanitizedData.total_transport;
      driver.remaining_money_fees +=
        sanitizedData.total_transport - sanitizedData.total_received_cash;
      await driver.save();
      console.log("تم تعديل بيانات السائق بنجاح");
    } else {
      driver = await Drivers.create({
        ...sanitizedData,
        trip_num: 1,
        total_all_transport: sanitizedData.total_transport,
        remaining_money_fees:
          parseInt(sanitizedData.total_transport) - parseInt(sanitizedData.total_received_cash),
      });
      console.log("تمت إضافة بيانات السائق بنجاح");
    }

		 // Update or create the agents
		 if (agent) {
      agent.trip_num += 1;
      await agent.save();
      console.log("تمت إضافة بيانات السائق بنجاح");
    }

    // Return success response
    return res.status(201).json("تمت الإضافة بنجاح");
  } catch (error) {
    console.error("Error adding trip and driver:", error);
    return res
      .status(500)
      .json(`${error.message}`);
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
	return res.status(402).json(`${error.message}`);
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
	return res.status(402).json(`${error.message}`);
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
	return res.status(402).json(`${error.message}`);

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
    return res.status(402).json(`${error.message}`);
  }
};


//MARK: log out
const logout = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "strict" }); // حذف الكوكيز

    return res.status(200).json("تم تسجيل الخروج بنجاح" );
  } catch (error) {
    console.error("Error during logout:", error);
		return res.status(400).json(`${error.message}`);
  }
};

  

module.exports = { signIn, addUser,editUser,editDriver,addDriver,comp2DelTrip, allUsers, forgetPassword,forgetPasswordCheck, updatePassword, logout, addTripAndDriver, editComp1, comp2EditTrip };
