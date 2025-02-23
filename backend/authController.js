require('dotenv').config({path: '../.env'});
const { Users, Drivers, TransportTrips } = require('./config');
const jwt = require('jsonwebtoken');
const secret_key = process.env.SECRET_KEY;
const serviceMail = process.env.SERVICE_MAIL;
const servicePassword = process.env.SERVICE_PASSWORD;
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

// MARK: mail set
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: serviceMail,
    pass: servicePassword,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function emailSender(email, link) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"To-Do HR 👻" <shaimafikry@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Confirm Registeration ✔", // Subject line
    text: "click on the link below to confirm your registeration", // plain text body
    html: link, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

//MARK: adduser
const addUser = async (req, res) => {
  const newUser = req.body;
	// username an email found
	const user = await Users.findOne({ where: { email: newUser.email } });

	if (user && user.email === newUser.email) {
		return res.status(400).json('Email already exists');
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
// MARK: ADD Trip
const addTripAndDriver = async (req, res) => {
	try {
		// دالة لتحويل القيم النصية إلى أرقام صحيحة، وإرجاع null فقط إذا لم يكن رقمًا
		// دالة لتنظيف البيانات حسب النوع
		const sanitizeInput = (key, value) => {
			if (value === "" || value === null || value === undefined) {
				// الحقول الرقمية تتحول إلى 0
				if (["nights_count", "night_value", "total_nights_value", "transport_fee", 
					 "expenses", "total_transport", "deposit", "total_received_cash"]
					.includes(key)) {
					return 0;
				}
				// باقي الحقول تبقى نص فارغ
				return "";
			}

			// لو الحقل هو `national_id` نحوله إلى نص
			if (key === "national_id" || key === "phone_number") {
				return value.toString();
			}

			// لو الحقل رقمي نحوله إلى `float`
			if (!isNaN(value) && typeof value !== "boolean") {
				return parseFloat(value);
			}

			// الباقي يظل كما هو
			return value;
		};
		
		// تنظيف جميع القيم في الطلب
		const sanitizedData = {};
		Object.keys(req.body).forEach((key) => {
			sanitizedData[key] = sanitizeInput(key, req.body[key]);
		});

		// استخراج القيم المطلوبة
		let { national_id, total_transport, total_received_cash } = sanitizedData;
		

		// تأكد من أن القيم الرقمية لا تكون null
		total_transport = total_transport ?? 0;
		total_received_cash = total_received_cash ?? 0;

		// البحث عن السائق بناءً على الرقم القومي
		let driver = await Drivers.findOne({ where: { national_id } });

		// إدخال الرحلة الجديدة
		await TransportTrips.create(sanitizedData);
		console.log("تمت إضافة بيانات الرحلة بنجاح");

		if (driver) {
			driver.trip_num += 1;
			driver.total_all_transport += total_transport;
			driver.remaining_money_fees += total_transport - total_received_cash;
			await driver.save();
			console.log("تم تعديل بيانات السائق بنجاح");
		} else {
			driver = await Drivers.create({
				...sanitizedData,
				trip_num: 1,
				total_all_transport: total_transport,
				remaining_money_fees: total_transport - total_received_cash
			});
			console.log("تمت إضافة بيانات السائق بنجاح");
		}
		
		return res.status(201).json({ message: "تمت الإضافة بنجاح" });

	} catch (error) {
		console.error("Error adding trip and driver:", error);
		return res.status(500).json({ error: `حدث خطأ أثناء معالجة الطلب, ${error.message}` });
	}
};


//MARK: Sign in
const signIn = async (req, res) => {
	console.log(req.body, "entry");
  const { email, password } = req.body;
	const user = await Users.findOne({ where: { email: email } });
	//console.log
	if (!user) {
		return res.status(400).json({ message: 'Invalid input: User not found' });
	}

	const isPasswordValid = await bcrypt.compare(password, user.password)
	if (!isPasswordValid) {
		return res.status(400).json({ message: 'Invalid input: Incorrect password' });
	}
	// generate JWT token and send it back to the client
	const payload = {
		username: user.username,
    id: user.id,
    iat: Math.floor(Date.now() / 1000) - 60 * 60 * 24 , // token will expire in 24 day
	}
	const token = jwt.sign(payload, secret_key, { algorithm: 'HS256' });

  return res.status(200).json({ token: token , role: user.role, message: 'Login successful', redirectUrl: '/dashboard' });

};


//MARK: FORGET PSSWORD
const forgetPassword = async (req, res) => {	
	const {email} = req.body;

	const user = await Users.findOne({email: email});
  console.log(user);

	if (!user) {
		return res.status(200).json({message: 'email doesnt exist'});
	}

	const verification_token = crypto.randomBytes(32).toString('hex');
	const link = `http://localhost:5000/auth/renewpassword?token=${verification_token}`;

	await Users.updateOne({email: email}, {$set :{ verification_token: verification_token}});
	await emailSender(email, link).catch(console.error)
	// return res.status(201).json(link);

	return res.status(200).json({message : 'renew password link has been sent to your mail'})

};


// MARK: RENEWPASSWORD
 const renewPassword = async (req, res)=> {
	const { token } = req.query;
	const {password} = req.body;
  try {
		const user = await Users.findOne({verification_token: token});
		if (!user) {
      return res.status(403).json('faild to verify mail');
    }

		const password_hash = await bcrypt.hash(password, 10);

      await Users.updateOne({email: user.email}, { verification_token: null, password : password_hash});
      return res.status(200).json('password updated successfully, you cn now login');
  } catch (error) {
    console.error('error in updating password', error);
    return res.status(500).json(`server error ${error}`);
  }
 };

 const logout = (req, res) => {
	res.clearCookie("token"); // حذف الكوكيز التي تحتوي على التوكن
	return res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
  };
  

module.exports = { signIn, addUser, forgetPassword, renewPassword, logout, addTripAndDriver };
