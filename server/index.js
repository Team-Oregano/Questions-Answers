require('dotenv').config();
const express = require('express');
// const pool = require('../db/db.js');
const db = require('../db/query.js');

const app = express();
app.use(express.json());

app.get('/questions', db.getQuestions);// questions?product_id=2&page=5&count=5
app.get('/answers', db.getAnswers);// answers?question_id=2&page=5&count=5
app.put('/qa/questions/:question_id/helpful', db.markQuestionHelpful);
app.put('/qa/answers/:answer_id/helpful', db.markAnswerHelpful);
app.put('/qa/questions/:question_id/report', db.reportQuestion);
app.put('/qa/answers/:answer_id/report', db.reportAnswer);
app.post('/qa/questions', db.addQuestion);
app.post('/qa/questions/:question_id/answers', db.addAnswer);

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT || 3000}`);
});
