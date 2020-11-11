const fs = require('fs');
const Question = require('../models/question.model');
const TrustIndexDimension = require('../models/dimension.model');

function populateDB() {
    let json_temp = fs.readFileSync("json/questionsJSON.json", "utf-8");
    let parsed_questions = JSON.parse(json_temp);
    for (let i = 0; i < parsed_questions.length; ++i) {
        let q_responses = [];
        if (parsed_questions[i].responses) {
            for (let j = 0; j < parsed_questions[i].responses.length; ++j) {
                const q_response = {
                    responseNumber: j,
                    indicator: parsed_questions[i].responses[j].indicator || null,
                    score: parsed_questions[i].responses[j].score || null
                };
                q_responses.push(q_response);
            }
        }

        // need to create new models for trustIndexDimension, domainApplicability, regionalApplicability
        // roles, and lifecycle

        // We are iterating over a json file with all of the data for each question, blank or not
        // We want to load in the information directly into the field if it's a field
        // If not we want to look for model with same name. For example



        // let trustIndexDimensionString = parsed_questions[i].trustIndexDimension;
        // if trustIndexDimension

        Question.findOneAndUpdate({questionNumber: i}, {
            trustIndexDimension: ((typeof parsed_questions[i].trustIndexDimension === 'string') ? parsed_questions[i].trustIndexDimension.toLowerCase() : null),
            domainApplicability: parsed_questions[i].domainApplicability || null,
            regionalApplicability: parsed_questions[i].regionalApplicability || null,
            mandatory: parsed_questions[i].mandatory || true,
            questionType: ((parsed_questions[i].questionType) ? (parsed_questions[i].questionType.toLowerCase().trim()) : null),
            question: parsed_questions[i].question || "",
            alt_text: parsed_questions[i].alt_text || null,
            prompt: parsed_questions[i].prompt || null,
            responses: q_responses,
            responseType: parsed_questions[i].responseType || null,
            pointsAvailable: parsed_questions[i].pointsAvailable || 0,
            weighting: parsed_questions[i].weighting || 0,
            reference: parsed_questions[i].reference || null,
            roles: parsed_questions[i].roles || null,
            lifecycle: parsed_questions[i].lifecycle || null,
            parent: parsed_questions[i].parent || null
        }, {upsert:true, runValidators: true});
    }
}

populateDB();

// try {
//     let json_temp = fs.readFileSync("./questionsJSON.json", "utf-8");
//     let parsed_questions = JSON.parse(json_temp);
//     for (let i = 0; i < parsed_questions.length; ++i) {
//         let q_responses = [];
//         if (parsed_questions[i].responses) {
//             for (let j = 0; j < parsed_questions[i].responses.length; ++j) {
//                 const q_response = {
//                     responseNumber: j,
//                     indicator: parsed_questions[i].responses[j].indicator || null,
//                     score: parsed_questions[i].responses[j].score || null
//                 };
//                 q_responses.push(q_response);
//             }
//         }

//         // let trustIndexDimensionString = parsed_questions[i].trustIndexDimension;
//         // if trustIndexDimension

//         await Question.findOneAndUpdate({questionNumber: i}, {
//             trustIndexDimension: ((typeof parsed_questions[i].trustIndexDimension === 'string') ? parsed_questions[i].trustIndexDimension.toLowerCase() : null),
//             domainApplicability: parsed_questions[i].domainApplicability || null,
//             regionalApplicability: parsed_questions[i].regionalApplicability || null,
//             mandatory: parsed_questions[i].mandatory || true,
//             questionType: ((parsed_questions[i].questionType) ? (parsed_questions[i].questionType.toLowerCase().trim()) : null),
//             question: parsed_questions[i].question || "",
//             alt_text: parsed_questions[i].alt_text || null,
//             prompt: parsed_questions[i].prompt || null,
//             responses: q_responses,
//             responseType: parsed_questions[i].responseType || null,
//             pointsAvailable: parsed_questions[i].pointsAvailable || 0,
//             weighting: parsed_questions[i].weighting || 0,
//             reference: parsed_questions[i].reference || null,
//             roles: parsed_questions[i].roles || null,
//             lifecycle: parsed_questions[i].lifecycle || null,
//             parent: parsed_questions[i].parent || null
//         }, {upsert:true, runValidators: true});
//     }

//     res.json(parsed_questions);
// } catch (err) {
//     console.log(err);
// }