const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send("Home");
});

// Connect to mongoDB
mongoose.connect(process.env.DB_CONNECTION , {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}, () => {
    console.log("Connected to DB")
});

// need so that we don't use deprecated useFindAndModify method
mongoose.set('useFindAndModify', false);

// Import Routes
const questionsRouter = require("./routes/questions");
const responsesRouter = require("./routes/responses");
const trustedAIProvidersRouter = require("./routes/trustedAIProviders")

app.use("/questions", questionsRouter);
app.use("/responses", responsesRouter);
app.use("/trustedAIProviders", trustedAIProvidersRouter);

// Listen on port
app.listen(port, '0.0.0.0',  () => {
    console.log("Listening on port " + port);
});

module.exports = app;