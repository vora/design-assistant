const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { json } = require('express');
const auth = require('../middleware/auth');
const mailService = require('../middleware/mailService');
const owasp = require('owasp-password-strength-test');

const jwtSecret = process.env.SECRET || 'devsecret';
const sessionTimeout = process.env.SESSION_TIMEOUT;

owasp.config({
  minLength: 8,
  minOptionalTestsToPass: 4,
});

// create user - for signup
router.post('/create', async (req, res) => {
  const {
    username,
    email,
    password,
    passwordConfirmation,
    organization,
    role,
    collabRole,
  } = req.body;

  // create new user, send to db
  let user = new User({
    email,
    username,
    password,
    organization,
    role,
    collabRole,
  });
  await user
    .save()
    .then((user) => {
      let emailSubject = 'Responsible AI Design Assistant Account Creation';
      let emailTemplate = 'api/emailTemplates/accountCreation.html';
      mailService.sendEmail(email, emailSubject, emailTemplate);
      jwt.sign(
        { id: user.id },
        jwtSecret,
        { expiresIn: sessionTimeout },
        (err, token) => {
          if (err)
            return res
              .status(400)
              .json({ message: 'Authorization token could not be created' });
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
            },
          });
        }
      );
    })
    .catch((err) => {
      // user already exists
      if (err.name === 'MongoError' && err.code === 11000) {
        if (Object.keys(err.keyPattern).includes('username')) {
          return res.status(409).json({
            username: {
              isInvalid: true,
              message: 'Username already exists!',
            },
          });
        }
        if (Object.keys(err.keyPattern).includes('email')) {
          return res.status(409).json({
            email: {
              isInvalid: true,
              message: 'There was an issue with your request',
            },
          });
        }
      }
      // unknown mongodb error
      return res.status(400).json(err);
    });
});

// authenticate user - for login
router.post('/auth', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ msg: 'Please fill in all the required fields' });
  }
  User.findOne({ username }).then((user) => {
    if (!user)
      return res.status(400).json({
        username: {
          isInvalid: true,
          message: 'User does not exist. Please create an account.',
        },
      });
    if (!user.authenticate(password))
      return res.status(400).json({
        password: { isInvalid: true, message: 'Incorrect password entered' },
      });
    jwt.sign(
      { id: user.id },
      jwtSecret,
      { expiresIn: sessionTimeout },
      (err, token) => {
        if (err) {
          console.warn(err);
          return res
            .status(400)
            .json({ message: 'Authorization token could not be created' });
        }
        return res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      }
    );
  });
});

// find user by auth token
// TASK-TODO: Secure endpoint.
router.get('/user', auth, (req, res) => {
  User.findById(req.user.id)
    .select('-hashedPassword -salt')
    .then((user) => res.json(user));
});

// check if valid authentication token
// TASK-TODO: Secure endpoint.
router.get('/isLoggedIn', auth, (req, res) => {
  if (req.user) {
    res.json({ isLoggedIn: 'true' });
  }
});

// Get all users
// TASK-TODO: Secure endpoint.
router.get('/', async (req, res) => {
  User.find()
    .then((users) => res.status(200).send(users))
    .catch((err) => res.status(400).send(err));
});

// Get user by id
// TASK-TODO: Secure endpoint.
router.get('/:userId', (req, res) => {
  User.findOne({ _id: req.params.userId })
    .select('-hashedPassword -salt')
    .then((user) => res.status(200).send(user))
    .catch((err) => res.status(400).send(err));
});

// TASK-TODO: Secure endpoint.
router.route('/:id').get((req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json('Error: ' + err));
});

// TASK-TODO: Secure endpoint.
router.route('/:id').delete((req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json('User deleted.'))
    .catch((err) => res.status(400).json('Error: ' + err));
});

// update email of current user
// TASK-TODO: Secure endpoint.
router.post('/updateEmail', auth, (req, res) => {
  // error with authentication token
  if (!req.user) {
    return res.json();
  }
  let newEmail = req.body.newEmail;
  let password = req.body.password;
  User.findById(req.user.id)
    .select()
    .then((existingUser) => {
      if (!existingUser)
        return res.status(400).json({
          username: {
            isInvalid: true,
            message: 'User does not exist. Please create an account.',
          },
        });
      if (!existingUser.authenticate(password))
        return res.status(400).json({
          password: {
            isInvalid: true,
            message: 'Incorrect password entered',
          },
        });
      existingUser.email = newEmail;
      User.findByIdAndUpdate(req.user.id, existingUser, { upsert: false })
        .then((user) => {
          res.json(user);
        })
        .catch((err) => {
          // user already exists
          if (err.name === 'MongoError' && err.code === 11000) {
            if (Object.keys(err.keyPattern).includes('email')) {
              return res.status(422).json({
                email: {
                  isInvalid: true,
                  message: 'User with Email Address already exists!',
                },
              });
            }
          }
          // unknown mongodb error
          return res.status(400).json(err);
        });
    });
});

// update username of current user
// TASK-TODO: Secure endpoint.
router.post('/updateUsername', auth, (req, res) => {
  // error with authentication token
  if (!req.user) {
    return res.json();
  }
  let newUsername = req.body.newUsername;
  let password = req.body.password;
  User.findById(req.user.id)
    .select()
    .then((existingUser) => {
      if (!existingUser)
        return res.status(400).json({
          username: {
            isInvalid: true,
            message: 'User does not exist. Please create an account.',
          },
        });
      if (!existingUser.authenticate(password))
        return res.status(400).json({
          password: {
            isInvalid: true,
            message: 'Incorrect password entered',
          },
        });
      existingUser.username = newUsername;
      User.findByIdAndUpdate(req.user.id, existingUser, { upsert: false })
        .then((user) => {
          res.json(user);
        })
        .catch((err) => {
          // user already exists
          if (err.name === 'MongoError' && err.code === 11000) {
            if (Object.keys(err.keyPattern).includes('username')) {
              return res.status(422).json({
                username: {
                  isInvalid: true,
                  message: 'Username already exists!',
                },
              });
            }
          }
          // unknown mongodb error
          return res.status(400).json(err);
        });
    });
});

// /update password of current user
// TASK-TODO: Secure endpoint.
router.post('/updatePassword', auth, (req, res) => {
  // error with authentication token
  if (!req.user) {
    return res.json();
  }
  let password = req.body.password;
  let newPassword = req.body.newPassword;
  let result = owasp.test(newPassword);
  if (result.strong == false) {
    return res.status(400).json({
      newPassword: { isInvalid: true, message: result.errors.join('\n') },
    });
  }

  User.findById(req.user.id)
    .select()
    .then((existingUser) => {
      if (!existingUser)
        return res.status(400).json({
          username: {
            isInvalid: true,
            message: 'User does not exist. Please create an account.',
          },
        });
      if (!existingUser.authenticate(password))
        return res.status(400).json({
          password: {
            isInvalid: true,
            message: 'Incorrect password entered',
          },
        });
      existingUser.password = newPassword;
      User.findByIdAndUpdate(req.user.id, existingUser, { upsert: false }).then(
        (user) => {
          res.json(user);
        }
      );
    })
    .catch((err) => {
      // unknown mongodb error
      return res.status(400).json(err);
    });
});

// TASK-TODO: Secure endpoint.
router.post('/updateOrganization', auth, (req, res) => {
  // error with authentication token
  if (!req.user) {
    return res.json();
  }
  let newOrganization = req.body.newOrganization;
  let password = req.body.password;
  User.findById(req.user.id)
    .select()
    .then((existingUser) => {
      if (!existingUser)
        return res.status(400).json({
          organization: {
            isInvalid: true,
            message: 'User does not exist. Please create an account.',
          },
        });
      if (!existingUser.authenticate(password))
        return res.status(400).json({
          password: {
            isInvalid: true,
            message: 'Incorrect password entered',
          },
        });
      existingUser.organization = newOrganization;
      User.findByIdAndUpdate(req.user.id, existingUser, { upsert: true }).then(
        (user) => {
          res.json(user);
        }
      );
    });
});

// User Put endpoint
// note findOneAndUpdate does not support validation
// TASK-TODO: Secure endpoint.
router.put('/:userId', async (req, res) => {
  try {
    // Update existing user in DB
    var response = await User.findOneAndUpdate(
      { _id: req.params.userId },
      req.body
    ).select('-hashedPassword -salt');

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

module.exports = router;
