// to get the token after user found in data base
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authToken = (req, res, next) => {
  // get the token frm the request
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Access Denied');
	}

	jwt.verify(token, process.env.SECRET_KEY , (err, user) => {
	  if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
	});

};

module.exports = authToken ;
