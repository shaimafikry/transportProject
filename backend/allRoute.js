const express = require('express');
const router = express.Router();
const { signIn, forgetPassword, logout, forgetPasswordCheck } = require('./authController');
const { dashboard } = require('./controllers');



router.post('/', signIn);
router.post('/logout', logout);

router.get('/dashboard', dashboard);
router.post('/dashboard', dashboard);
router.put('/dashboard', dashboard);
router.delete('/dashboard', dashboard);
router.get('/forget-password', forgetPasswordCheck);
router.put('/forget-password', forgetPassword);




module.exports = router;
