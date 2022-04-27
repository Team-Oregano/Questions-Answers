const pool = require('./db.js');

const getQuestions = async (req, res) => {
  let { product_id, page, count } = req.query;

  count = count || 5;
  await pool.query(`SELECT row_to_json(quest)
  from(
    select product_id,
    (
      select json_agg(json_build_object('question_id', questions.id, 'question_body', body, 'question_date', to_timestamp(date_written/1000), 'asker_name', asker_name, 'question_helpfulness', helpful, 'reported', reported, 'answers',
      (
        select json_object_agg(
          id, json_build_object(
            'id', id,
            'body', body,
            'date', to_timestamp(data_written/1000),
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
  ) quest

  `, [product_id],
  // , (err, results) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     res.send(results.rows);
  //   }
  // }
  )
    .then((data) => res.status(200).send(data.rows[0].row_to_json) || [])
    .catch((err) => res.status(400).send(err));
};

const getAnswers = async (req, res) => {
  const { question_id, page, count } = req.query;
  await pool.query(
    `
SELECT json_build_object(
    'question', id,
    'page', ${page || 1},
    'count', ${count || 5},
    'results',
    (
      select json_agg(
        json_build_object(
          'answer_id', id,
          'body', body,
          'date', to_timestamp(data_written/1000),
          'answerer_name', answerer_name,
          'helpfulness', helpful,
          'photos',
          (select json_agg(
            json_build_object(
              'id', id,
              'url', url
            )
          ) from answers_photos
          where answer_id = answers.id
        )
      )
    ) as results
    from answers
    where question_id = questions.id
    )
  ) from questions where id = $1`,
    [question_id],
    (err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.status(200).send(results.rows[0].json_build_object);
      }
    },
  );
};

const markQuestionHelpful = async (req, res) => {
  const { question_id } = req.params;
  await pool.query('UPDATE questions SET helpful = helpful + 1 WHERE id = $1', [question_id], (err, results) => {
    if (err) {
      res.status(400).send('Error on marking answer helpful');
    } else {
      res.status(200).send('Updated question helpfulness');
    }
  });
};

const markAnswerHelpful = async (req, res) => {
  const { answer_id } = req.params;
  await pool.query('UPDATE answers SET helpful = helpful + 1 WHERE id = $1', [answer_id], (err, results) => {
    if (err) {
      res.status(400).send('Error on marking answer helpful');
    } else {
      res.status(200).send('Updated answer helpfulness');
    }
  });
};

const reportQuestion = async (req, res) => {
  const { question_id } = req.params;
  await pool.query('UPDATE questions SET reported = true WHERE id = $1', [question_id], (err, results) => {
    if (err) {
      res.status(400).send('Error on reporting question');
    } else {
      res.status(200).send('Question reported');
    }
  });
};

const reportAnswer = async (req, res) => {
  const { answer_id } = req.params;
  await pool.query('UPDATE answers SET reported = true WHERE id = $1', [answer_id], (err, results) => {
    if (err) {
      res.status(400).send('Error on reporting answer');
    } else {
      res.status(200).send('Answer reported');
    }
  });
};

const addPhotos = async (answer_id, newAnswer) => {
  await newAnswer.photos.forEach((photo) => {
    [answer_id].push(photo);
    return pool.query('INSERT INTO answers_photos (answer_id, url) VALUES($1, $2)', [answer_id, photo]);
  });
};

const addQuestion = async (req, res) => {
  const values = [
    req.body.product_id, req.body.body, new Date().getTime(), req.body.asker_name, req.body.asker_email,
  ];
  await pool.query(
    'INSERT INTO questions(product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES($1, $2, $3, $4, $5, false, 0)',
    values,
    (err, results) => {
      if (err) {
        res.status(400).send('Error on posting question');
      } else {
        res.status(201).send('Question added');
      }
    },
  );
};

const addAnswer = async (req, res) => {
  const values = [
    req.body.question_id, req.body.body, new Date().getTime(), req.body.answerer_name, req.body.answerer_email,
  ];
  await pool.query(
    'INSERT INTO answers(question_id, body, data_written, answerer_name, answerer_email, reported, helpful) VALUES($1, $2, $3, $4, $5, false, 0) RETURNING id',
    values,

    // (err, results) => {
    //   if (err) {
    //     res.send(err);
    //   } else {
    //     res.send('Answer added');
    //   }
    // },
  ).then((data) => {
    // console.log(data.rows[0].id);
    if (req.body.photos.length > 0) {
      const answer_id = data.rows[0].id;
      addPhotos(answer_id, req.body)
        .then(() => {
          res.status(201).send('Photo Added');
        })
        .catch((err) => {
          res.status(400).send('err adding photos');
        });
    } else {
      res.status(200).send('Answer added');
    }
  }).catch((err) => {
    console.log(err);
    res.status(400).send('err posting answer: ');
  });
};

module.exports = {
  getQuestions,
  getAnswers,
  markAnswerHelpful,
  markQuestionHelpful,
  reportQuestion,
  reportAnswer,
  addPhotos,
  addQuestion,
  addAnswer,
};
