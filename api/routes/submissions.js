const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Submission = require('../models/submission.model');

//get single submission
router.get('/submission/:submissionId', async (req, res) => {
  try {
    await Submission.findById(req.params.submissionId).then((submission) => {
      res.json({ submission: submission });
    });
  } catch (err) {
    res.json({ message: err });
  }
});

// Get all submissions
// TASK-TODO: Secure endpoint.
router.get('/', async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ date: -1 });
    res.json(submissions);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    await Submission.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .then((submissions) => {
        res.json({ submissions: submissions });
      });
  } catch (err) {
    res.json({ message: err });
  }
});

router.get('/:collabRole', async (req, res) => {
  try {
    await Submission.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $unwind: {
          path: '$users',
        },
      },
      {
        $match: {
          'users.collabRole': req.params.collabRole,
        },
      },
    ])
      .sort({ date: -1 })
      .then((submissions) => {
        res.json({ submissions: submissions });
      });
  } catch (err) {
    res.json({ message: err });
  }
});

// TASK-TODO: Secure endpoint.
router.post('/update/:submissionId', async (req, res) => {
  try {
    const submissions = await Submission.findOneAndUpdate(
      { _id: req.params.submissionId },
      {
        submission: req.body.submission,
        date: req.body.date,
        projectName: req.body.projectName,
        completed: req.body.completed,
        lifecycle: req.body.lifecycle,
        domain: req.body.domain,
        region: req.body.region,
        roles: req.body.roles,
        riskLevel: req.body.riskLevel,
      },
      { upsert: true, runValidators: true }
    );

    res.json(submissions);
  } catch (err) {
    res.json({ message: err });
  }
});

// TASK-TODO: Secure endpoint.
router.delete('/delete/:id', async (req, res) => {
  await Submission.findByIdAndDelete(req.params.id)
    .then(() => res.status(200).json('User submission deleted.'))
    .catch((err) => res.status(400).json('Error: ' + err));
});

// Add new submission
// TASK-TODO: Secure endpoint.
router.post('/', async (req, res) => {
  const submission = new Submission({
    userId: req.body.userId,
    projectName: req.body.projectName,
    date: req.body.date,
    lifecycle: req.body.lifecycle,
    domain: req.body.domain,
    region: req.body.region,
    roles: req.body.roles,
    submission: req.body.submission,
    completed: req.body.completed ? req.body.completed : false,
    userType: req.body.userType,
  });

  try {
    const savedSubmission = await submission.save();
    res.json(savedSubmission);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

// TASK-TODO: Secure endpoint.
router.delete('/deleteAll/:uid', async (req, res) => {
  let uid = req.params.uid;
  Submission.deleteMany({ userId: uid })
    .then(() => res.json('User submissions deleted.'))
    .catch((err) => res.status(400).json('Error: ' + err));
});

module.exports = router;
