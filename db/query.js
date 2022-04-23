const pool = require('./db.js');

const getQuestions = (req, res) => {
  const { product_id, page, count } = req.query;
  const offset = page * count;
  pool.query(`SELECT row_to_json(quest)
  from(
    select product_id,
    (
      select json_agg(json_build_object('question_id', questions.id, 'question_body', body, 'question_date', date_written, 'asker_name', asker_name, 'question_helpfulness', helpful, 'reported', reported, 'answers',
      (
        select json_object_agg(
          id, json_build_object(
            'id', id,
            'body', body,
            'date', data_written,
            'answerer_name', answerer_name,
            'helpfulness', helpful,
            'photos',
            (select array
              (select url from answers_photos where answer_id = answers.id)
            )
          )
        )
      from answers
      where question_id = questions.id
      )
    ))
    from questions
    where product_id = $1  AND reported = false
    ) as results
    from questions where product_id = $1
  ) quest `, [product_id], (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results.rows);
    }
  });
};

// const getQuestions = (req, res) => {
//   const { product_id, page, count } = req.query;
//   const offset = page * count;
//   pool.query(`SELECT questions.id AS question_id, questions.body, questions.date_written, questions.asker_name, questions.helpful, questions.reported,
//   jsonb_agg(jsonb_build_object(
//     'answers', answers.body)) answers
//   FROM questions
//   LEFT OUTER JOIN answers ON questions.id = answers.question_id
//   WHERE product_id = $1
//   GROUP BY questions.id
//   ORDER BY helpful DESC
//   LIMIT $2
//   OFFSET $3`, [product_id, count, offset], (err, results) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(results.rows);
//     }
//   });
// };

const getAnswers = (req, res) => {
  const { question_id, page, count } = req.query;
  const offset = page * count;
  pool.query(
    `SELECT * FROM answers
  WHERE question_id = $1
  ORDER BY helpfulness DESC
  LIMIT $2
  OFFSET $3`,
    [question_id, count, offset],
    (err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.send({ question_id, results: results.rows });
      }
    },
  );
};

//   Select answers.id AS answer_id, answers.body, answers.data_written, answers.answerer_name, answers.answerer_email, answers.reported, answers.helpful
//   jsonb_agg(jsonb_build_object(
//     'answer_photos', answer_photos.url)) answer_photos
//   FROM answers
//   LEFT OUTER JOIN answers ON answers.id = answer_photos.answer_id
//   WHERE question_id = $1
//   GROUP BY answers.id
//   ORDER BY helpful DESC
//   LIMIT $2
//   OFFSET $3

// const getAnswers = (id, page = 0, count = 5, cb) => {
//   page = page - 1;
//   let offset = page * count;
//   client.query(
//   `SELECT * FROM answers_format
//   WHERE questionid = $1
//   ORDER BY helpfulness DESC
//   LIMIT $2
//   OFFSET $3`, [id, count, offset], (err, results) => {
//     if (err) {
//       cb(err, null);
//     } else {
//       cb(null, results.rows);
//     }
//   })
// }

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
