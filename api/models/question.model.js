const mongoose = require('mongoose');
const { schema } = require('./dimension.model');

const QuestionSchema = mongoose.Schema({
  // numbered 0 to n-1
  questionNumber: {
    type: Number,
    required: true,
  },

  // 5 possible dimensions
  trustIndexDimension: Number,
  subDimension: Number,
  domainApplicability: [Number],
  regionalApplicability: [Number],

  // mandatory or optional
  mandatory: Boolean,

  questionType: {
    type: String,
    enum: ['risk', 'mitigation', 'organization', 'tombstone'],
  },

  // question text
  question: {
    type: String,
    required: true,
  },

  removeIfNoUser: {
    type: Boolean
  },

  removeIfUserSubject: {
    type: Boolean
  },

  alt_text: {
    type: String,
  },

  prompt: {
    type: String,
  },

  // possible responses for question, could also be free text
  responses: [
    {
      responseNumber: {
        type: Number,
        required: true,
      },
      indicator: String,
      score: Number,
    },
  ],

  // how the responses will be surfaced
  responseType: {
    type: String,
    required: true,
    enum: [
      null,
      'text',
      'comment',
      'checkbox',
      'radiogroup',
      'dropdown',
      'slider',
    ],
  },

  // -1 to 1
  pointsAvailable: {
    type: Number,
    required: true,
  },

  // Low = 1, Medium = 2, High = 3
  weighting: {
    type: Number,
    required: true,
    enum: [0, 1, 2, 3],
  },

  // The recommendation?
  reference: {
    type: String,
  },

  // Which roles question should display for
  roles: [Number],

  // Question can belong to multiple lifecycles
  lifecycle: [Number],

  // Which Question and Response determine whether this question should be displayed
  child: Boolean,
  trigger: {
    parent: {
      type: String,
    },
    responses: [String],
    parentQuestion: {
      type: String,
    },
  },
  rec_links: {
    type: [String],
  },

  // TODO: Add test of schema to model
});

module.exports = mongoose.model('Question', QuestionSchema);
