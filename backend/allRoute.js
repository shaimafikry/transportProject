const express = require('express');
const router = express.Router();
const { signIn, addUser, forgetPassword, renewPassword, verifyRegister } = require('./authController');
const { dashboard } = require('./controllers');



router.post('/signin', signIn);
router.get('/dashboard', dashboard);
router.post('/dashboard', dashboard);
router.put('/dashboard', dashboard);
router.delete('/dashboard', dashboard);



module.exports = router;
