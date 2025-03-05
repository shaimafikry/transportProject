require('dotenv').config({path: '../.env'});
const { Users, Drivers, TransportTrips } = require('./config');
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

	if (user && user.username === newUser.username) {
		return res.status(400).json('اسم المستخدم موجود مسبقا');
	}

	const userPhone = await Users.findOne({ where: { phone: newUser.phone } });
	if (userPhone && userPhone.phone === newUser.phone) {
		return res.status(400).json('رقم الموبايل موجود مسبقا');
	}


	const password_hash = await bcrypt.hash(newUser.password, 10);

	newUser.password = password_hash;

	try {
		await Users.create(newUser);

	 return res.status(201).json({message: 'تم اضافة المستخدم بنجاح'});

	}catch(error){
		console.error('error in signup', error);
		return res.status(500).json(`server error ${error}`);

	}
};


const editUser= async(req, res)=> {
		const { id, ...updateData } = req.body;
		console.log(req.body)

	  // Check if the password is being updated
    if (updateData.password && updateData.password.trim() !== "") {
      const password_hash = await bcrypt.hash(updateData.password, 10);
      updateData.password = password_hash;
    }

		try {

		const response = await Users.update(updateData, { where: { id } });

		const updatedUser = await Users.findOne({ where: { id } });
		const userData = updatedUser.get({ plain: true });

		console.log("data",{...userData, password:""})


		return res.status(200).json({...userData, password:""});
		
	}catch(error){
		console.error('error in edit user', error);
		return res.status(500).json(`server error ${error}`);

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
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
};








// MARK: ADD Trip
// const addTripAndDriver = async (req, res) => {
// 	try {
// 		const sanitizeInput = (key, value) => {
// 			if (value === "" || value === null || value === undefined) {
// 				if (["nights_count", "night_value", "total_nights_value", "transport_fee", 
// 					 "expenses", "total_transport", "deposit", "total_received_cash"]
// 					.includes(key)) {
// 					return 0;
// 				}
// 				return "";
// 			}

// 			if (key === "national_id" || key === "phone_number") {
// 				return value.toString();
// 			}

// 			if (!isNaN(value) && typeof value !== "boolean") {
// 				return parseFloat(value);
// 			}
// 			return value;
// 		};
		
// 		const sanitizedData = {};
// 		Object.keys(req.body).forEach((key) => {
// 			sanitizedData[key] = sanitizeInput(key, req.body[key]);
// 		});

// 		let { national_id, total_transport, total_received_cash } = sanitizedData;
		

// 		total_transport = total_transport ?? 0;
// 		total_received_cash = total_received_cash ?? 0;

// 		let driver = await Drivers.findOne({ where: { national_id } });

// 		await TransportTrips.create(sanitizedData);
// 		console.log("تمت إضافة بيانات الرحلة بنجاح");

// 		if (driver) {
// 			driver.trip_num += 1;
// 			driver.total_all_transport += total_transport;
// 			driver.remaining_money_fees += total_transport - total_received_cash;
// 			await driver.save();
// 			console.log("تم تعديل بيانات السائق بنجاح");
// 		} else {
// 			driver = await Drivers.create({
// 				...sanitizedData,
// 				trip_num: 1,
// 				total_all_transport: total_transport,
// 				remaining_money_fees: total_transport - total_received_cash
// 			});
// 			console.log("تمت إضافة بيانات السائق بنجاح");
// 		}
		
// 		return res.status(201).json({ message: "تمت الإضافة بنجاح" });

// 	} catch (error) {
// 		console.error("Error adding trip and driver:", error);
// 		return res.status(500).json({ error: `حدث خطأ أثناء معالجة الطلب, ${error.message}` });
// 	}
// };

// MARK: ADD Trip
const addTripAndDriver = async (req, res) => {
  try {
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
    const { national_id, total_transport, total_received_cash } = sanitizedData;

    // Ensure numeric fields have valid values
    sanitizedData.total_transport = total_transport ?? 0;
    sanitizedData.total_received_cash = total_received_cash ?? 0;

    // Validate required fields
    if (!sanitizedData.driver_name){
      return res.status(400).json({ error: "يجب إدخال اسم السائق " });
    }
		if (!sanitizedData.client_name) {
      return res.status(400).json({ error: "يجب إدخال اسم العميل" });
    }
		if (!sanitizedData.fo_number) {
      return res.status(400).json({ error: "يجب إدخال رقم FO" });
    }

		if (!sanitizedData.national_id) {
      return res.status(400).json({ error: "يجب إدخال الرقم القومي  للسائق  " });
    }
		

    // Check if the driver already exists
    let driver = await Drivers.findOne({ where: { national_id } });

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
          sanitizedData.total_transport - sanitizedData.total_received_cash,
      });
      console.log("تمت إضافة بيانات السائق بنجاح");
    }

    // Return success response
    return res.status(201).json({ message: "تمت الإضافة بنجاح" });
  } catch (error) {
    console.error("Error adding trip and driver:", error);
    return res
      .status(500)
      .json({ error: `حدث خطأ أثناء معالجة الطلب, ${error.message}` });
  }
};


//MARK: Sign in
const signIn = async (req, res) => {
	console.log(req.body, "entry");
  const { username, password } = req.body;

	try{
	const user = await Users.findOne({ where: { username: username } });
	//console.log

	if (!user) {
		return res.status(400).json({ message: 'هذا المستخدم غير موجود' });
	}

	const isPasswordValid = await bcrypt.compare(password, user.password)
	if (!isPasswordValid) {
		return res.status(400).json({ message: 'كلمة السر غير صحيحة' });
	}
	// generate JWT token and send it back to the client
	const payload = {
		name: user.name,
    id: user.id,
    iat: Math.floor(Date.now() / 1000) - 60 * 60 * 24 , // token will expire in 24 day
	}
	const token = jwt.sign(payload, secret_key, { algorithm: 'HS256' });

  return res.status(200).json({ token: token , role: user.role, id: user.id, username:  user.username, message: 'Login successful', redirectUrl: '/dashboard' });
}catch(error){
	console.error('Error updating password:', error);
	return res.status(500).json({ message: 'خطأ في الاتصال' });
}


};


//MARK: FORGET PSSWORD
const forgetPasswordCheck = async (req, res) => {
  const phone = req.query.phone;
  console.log("phone", phone);

  const user = await Users.findOne({ where: { phone } });
  console.log(user);

  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود في قاعدة البيانات" });
  }

  return res.status(200).json(user.id);
};



const forgetPassword = async (req, res) => {
  const { id, newPassword } = req.body;

  const user = await Users.findOne({ where: { id } });
  // console.log(user);

  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }

  // Hash the new password
  const newHash = await bcrypt.hash(newPassword, 10);

  // Update password in the database
  await Users.update({ password: newHash }, { where: { id } });

  return res.status(200).json({ message: "تم تجديد كلمة السر بنجاح" });
};


// MARK: RENEWPASSWORD
const updatePassword = async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
	console.log(id, oldPassword, newPassword, req.body)

  try {
    // Find user by ID
    const user = await Users.findOne({ where: { id } });
    if (!user) {
      return res.status(403).json({ message: 'هذا المستخدم غير موجود' });
    }

    // Check if both old and new passwords are provided
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'كلمة السر مطلوبة' });
    }

    // Validate old password
    const isValid = await validatePass(oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'كلمة السر القديمة غير صحيحة' });
    }

    // Hash the new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await Users.update({ password: newHash }, { where: { id } });

    return res.status(200).json({ message: 'تم تجديد كلمة السر بنجاح' });

  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ message: 'حدثت مشكلة أثناء تجديد كلمة السر' });
  }
};


//MARK: log out
 const logout = (req, res) => {
  try{

    res.clearCookie("token"); // حذف الكوكيز التي تحتوي على التوكن
  
    return res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
  }
  catch(error){
    console.log(error)
    return res.status(400).json({ message: error.message });

  }
  };
  

module.exports = { signIn, addUser,editUser, allUsers, forgetPassword,forgetPasswordCheck, updatePassword, logout, addTripAndDriver };
