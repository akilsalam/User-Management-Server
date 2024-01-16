// In your Node.js server
var express = require('express');
var router = express.Router();
const { collection } = require('./connection');
const { admin_collection } = require('./connection')
const bcrypt = require('bcrypt')


router.get('/', async function(req, res, next) {
  try {
    const users = await collection.find()
    res.json(users);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});

router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await admin_collection.findOne({ email });
    if (user) {
      const isPasswordValid = await admin_collection.findOne({ password });
      if (isPasswordValid) {
        // Passwords match, include a redirection URL in the response
        res.json({ success: true, redirectUrl: '/admin' });
        
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


router.post('/createUser', async function(req, res, next) {
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
        res.json({ success: true, redirectUrl: '/admin' });
      } else {
        res.json({ success: false, message: 'Registration failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

router.delete('/delete/:id', async (req, res, next) => {
  try {
    const deletedDocument = await collection.findOneAndDelete({ _id: req.params.id });
    if (deletedDocument.value) {
      res.json({ success: true, redirectUrl: '/admin' });
    } else {
      console.log(`Document with ID ${req.params.id} not found`);
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error(`Error deleting document with ID ${req.params.id}: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/edit-user/:id',async (req,res) => {
  const userId = req.params.id;
  const selectUser = await collection.findById(userId);
  res.send(selectUser)
})

// Express route to handle editing user data
router.post('/edit-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    // Update the user data in the database (use your database library here)
      const editedData = await collection.findByIdAndUpdate(
        userId,
        { $set: { first_name: updates.firstData,last_name:updates.lastData,email:updates.emailData } },
        { new: true }
      );
      console.log("Edited Data:",editedData);
      if (editedData) {
        res.json({ success: true, redirectUrl: '/admin' });
      } else {
        res.json({ success: false, message: 'Registration failed' });
      }
    const updatedDocument = await collection.findOne({ _id: userId });
    console.log(updatedDocument);
  } catch (error) {
    console.error('Error editing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
