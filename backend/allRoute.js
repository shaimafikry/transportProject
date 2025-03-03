const express = require('express');
const router = express.Router();
const { signIn, forgetPassword, logout, forgetPasswordCheck } = require('./authController');
const { dashboard } = require('./controllers');
const authToken = require('./authToken');

router.post('/', signIn); 
router.post('/logout', logout); 
router.get('/forget-password', forgetPasswordCheck); 
router.put('/forget-password', forgetPassword); 



// Apply authToken middleware to all routes below
router.use(authToken); 

router.route('/dashboard')
  .get(dashboard) 
  .post(dashboard) 
  .put(dashboard) 
  .delete(dashboard);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

module.exports = router;
