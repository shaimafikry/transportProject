const express = require('express');
const router = express.Router();
const { signIn, forgetPassword, logout, forgetPasswordCheck } = require('./authController');
const { agents, drivers, construct, transport, users, attendance, profile, driversNotes } = require('./controllers');
const authToken = require('./authToken');

router.post('/', signIn); 

router.get('/forget-password', forgetPasswordCheck); 
router.put('/forget-password', forgetPassword); 



// Apply authToken middleware to all routes below
router.use(authToken); 

router.route('/dashboard/attendance')
  .get(attendance) 


  router.route('/dashboard/profile')
  .put(profile) 


  router.route('/dashboard/orgs')
  .get(agents) 
  .post(agents) 
  .put(agents) 
  .delete(agents);

  router.route('/dashboard/drivers')
  .get(drivers) 
  .post(drivers) 
  .put(drivers) 
  .delete(drivers);

  router.route('/dashboard/construct')
  .get(construct) 
  .post(construct) 
  .put(construct) 
  .delete(construct);

  router.route('/dashboard/transport')
  .get(transport) 
  .post(transport) 
  .put(transport) 
  .delete(transport);

  router.route('/dashboard/users')
  .get(users) 
  .post(users) 
  .put(users) 
  .delete(users);

  router.route('/dashboard/drivers/:id')
  .get(driversNotes) 
  .post(driversNotes) 
  .put(driversNotes) 
  .delete(driversNotes);


	router.post('/logout', logout); 

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

module.exports = router;
