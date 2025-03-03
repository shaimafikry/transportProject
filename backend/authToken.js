// to get the token after user found in data base
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from "Bearer <token>"
  if (!token) {
    return res.status(401).json('الوصول مرفوض لعدم تسجيل الدخول');
	}

	jwt.verify(token, process.env.SECRET_KEY , (err, user) => {
	  if (err) return res.status(403).json('التوكن فير صحيح');
    req.user = user;
    next();
	});

};

module.exports = authToken ;
