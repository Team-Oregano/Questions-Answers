const pool = require('./db.js');

const getQuestions = (req, res) => {
  const { id, page, count } = req.query;
  page -= 1;
  const offset = page * count;
  pool.query(`SELECT question_id, question_body, question_date_written, asker_name, question_helpfulness, question_reported
  FROM questions WHERE product_id = $1
  ORDER BY question_helpfulness DESC
  LIMIT $2
  OFFSET $3`, [id, count, offset], (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results.rows);
    }
  });
};

const getAnswers = (req, res) => {
  const { question_id } = req.query;
  pool.query('Select * from answers where question_id=36', (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result.rows);
    }
  });
};

const markQuestionHelpful = (req, res) => {
  const { id } = req.body;
  pool.query('UPDATE questions SET question_helpfulness = question_helpfulness + 1 WHERE question_id = $1', [id], (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send('Updated question helpfulness');
    }
  });
};

const markAnswerHelpful = (req, res) => {
  const { id } = req.body;
  pool.query('UPDATE answers_format SET helpfulness = helpfulness + 1 WHERE answer_id = $1', [id], (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send('Updated answer helpfulness');
    }
  });
};

module.exports = {
  getQuestions,
  getAnswers,
  markAnswerHelpful,
  markQuestionHelpful,

};
