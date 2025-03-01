
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const allRoutes = require('./allRoute');
const app = express();
const PORT = process.env.PORT || 5000;



// app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use('/', allRoutes);




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
