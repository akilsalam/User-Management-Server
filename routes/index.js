var express = require('express');
var router = express.Router();
const {collection} =require('./connection')
const bcrypt =require('bcrypt')

/* GET home page. */
router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await collection.findOne({ email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Passwords match, include a redirection URL in the response
        res.json({ success: true, redirectUrl: '/' });
        
      } else {
        // Passwords do not match, include an error message in the response
        res.json({ success: false, message: 'Invalid password'  });
      }
    } else {
      // User not found, include an error message in the response
      res.json({ success: false, message: 'User Name Not Found!!🧐' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});


router.post('/signup', async function(req, res, next) {
  const inputData = {
    first_name: req.body.firstData,
    last_name: req.body.lastData,
    email: req.body.emailData,
    password: req.body.passwordData
  };
  const existingUser = await collection.findOne({ email: inputData.email });
  if (existingUser) {
    // User already exists
    res.json({ success: false, message: 'User already exists.Please enter another username' });
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(inputData.password, saltRounds);
    inputData.password = hashedPassword;

    try {
      const userdata = await collection.insertMany([inputData]);
      if (userdata) {
        res.json({ success: true, redirectUrl: '/' });
      } else {
        res.json({ success: false, message: 'Registration failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

module.exports = router;
