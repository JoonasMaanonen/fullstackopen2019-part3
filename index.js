require('dotenv').config();
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');


app.use(cors());
app.use(express.static('build'));
app.use(bodyParser.json());
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status - :response-time :body'));

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons.map((person) => person.toJSON()));
  });
});

app.get('/info', (request, response) => {
  const date = new Date();
  Person.find({}).then((persons) => {
    response.send(
      `<p>Phoneboook has info for ${persons.length} people</p>
      <p>${date}</p>`,
    );
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then((person) => {
    if (person) {
      response.json(person.toJSON());
    } else {
      response.status(404).end();
    }
  })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then((person) => {
    person.deleteOne().then(() => {
      response.status(204).end();
    })
      .catch((error) => next(error));
  });
});

app.post('/api/persons', (request, response, next) => {
  const { body } = request;
  Person.find({}).then(() => {
    const person = new Person({
      name: body.name,
      number: body.number,
    });
    person.save().then(() => {
      response.json(person.toJSON());
    })
      .catch((error) => next(error));
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;
  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson.toJSON());
    })
    .catch((error) => next(error));
});

// Handles all wrong url errors with sending 404 back
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
