const frisby = require('frisby');

it('1. Test get Question API and expect to return status code 200', () => frisby
  .get('http://localhost:3000/qa/questions?product_id=33')
  .expect('status', 200)
  .expect('bodyContains', 'asker_name'));

it('2. Test get Answers API and expect to return in correct format', () => frisby
  .get('http://localhost:3000/qa/answers?page=1&question_id=33')
  .expect('status', 200)
  .expect('json', {
    question: 33,
    page: 1,
    count: 5,
    results: [
      {
        answer_id: 40,
        body: 'This product is overstocked here!',
        date: '2020-06-11T07:36:55-05:00',
        answerer_name: 'toofast',
        helpfulness: 2,
        photos: null,
      },
    ],
  }));

it('3. Test mark Question Helpful API and expect to return status 200 OK', () => frisby
  .put('http://localhost:3000/qa/questions/2/helpful')
  .expect('status', 200));

it('4. Test mark Answer Helpful API and expect to return status 200 OK', () => frisby
  .put('http://localhost:3000/qa/answers/2/helpful')
  .expect('status', 200));

it('5. Test Report Answer API and expect to return status 200 OK', () => frisby
  .put('http://localhost:3000/qa/answers/2/report')
  .expect('status', 200));

it('6. Test Report Question API and expect to return status 200 OK', () => frisby
  .put('http://localhost:3000/qa/questions/2/report')
  .expect('status', 200));

it('7. Test Post Question API and expect to return status 201 created', () => frisby
  .post(
    'http://localhost:3000/qa/questions/',
    {
      body: {
        product_id: '1',
        body: 'I love Hack Reactor2',
        asker_name: 'eeeeeeeeee',
        asker_email: 'aaaa@aaaaaa.com',
      },
    },
  )
  .expect('status', 201));

it('8. Test Post Answers API and expect to return status 201 created', () => frisby
  .post(
    'http://localhost:3000/qa/questions/1/answers',
    {
      body: {
        question_id: '1',
        body: 'I love Hack Reactor2',
        answerer_name: 'eeeeeeeeee',
        answerer_email: 'aaaa@aaaaaa.com',
        photos: ['url3', 'url4'],
      },
    },
  )
  .expect('status', 201));
