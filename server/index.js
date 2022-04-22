require('dotenv').config();
const express = require('express');
// const pool = require('../db/db.js');
const db = require('../db/query.js');

const app = express();
app.use(express.json());

app.get('/questions', db.getQuestions);

app.get('/answers', db.getAnswers);

app.put('/questions/helpful/:id', db.markQuestionHelpful);

app.put('/answers/helpful/:id', db.markAnswerHelpful);


// app.get('/questions', (req, res) => {
//   getQuestions(req.query.product_id, req.query.page, req.query.count, (err, questions) => {
//     if (err) {
//       console.error(err);
//       res.status(404).send(err);
//     } else {
//       let filteredQs = questions.filter(question => question.question_reported === false)
//       let formattedResponse = {
//         "product_id": req.query.product_id,
//         "results": filteredQs
//       };
//       res.status(200).send(formattedResponse);
//     }
//   })
// });

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT || 3000}`);
});
