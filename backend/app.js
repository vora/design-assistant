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

// need so that we don't use deprecated useFindAndModify method
mongoose.set('useFindAndModify', false);

// Import Routes
const questionsRouter = require("./routes/questions");
const responsesRouter = require("./routes/responses");
const trustedAIProvidersRouter = require("./routes/trustedAIProviders");
const trustedAIResourcesRouter = require("./routes/trustedAIResources");
const usersRouter = require("./routes/users");
const submissionsRouter = require("./routes/submissions");
const metaDataRouter = require("./routes/metadata");
const dimensionsRouter = require("./routes/dimensions");
const analyticsRouter = require("./routes/analytics");


app.use("/questions", questionsRouter);
app.use("/responses", responsesRouter);
app.use("/trustedAIProviders", trustedAIProvidersRouter);
app.use("/trustedAIResources", trustedAIResourcesRouter);
app.use("/users", usersRouter);
app.use("/submissions", submissionsRouter);
app.use("/metadata", metaDataRouter);
app.use("/dimensions", dimensionsRouter);
app.use("/analytics", analyticsRouter);

if (process.env.NODE_ENV === 'test' && process.env.TEST_DB_CONNECTION) {
    // Connect to test mongoDB
    mongoose.connect(process.env.TEST_DB_CONNECTION, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, () => {
        console.log("Connected to Test DB")
        // Listen on port
        app.listen(5000, '0.0.0.0', () => {
            console.log("Listening on port " + 5000);
        });
    });
} else {
    // Connect to mongoDB
    mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, () => {
        console.log("Connected to DB")
        // Listen on port
        app.listen(port, '0.0.0.0', () => {
            console.log("Listening on port " + port);
        });
    });
}



module.exports = app;