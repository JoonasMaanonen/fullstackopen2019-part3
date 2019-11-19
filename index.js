const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())
morgan.token('body', function (req, res) { return JSON.stringify(req.body)})
app.use(morgan(':method :url :status - :response-time :body'))

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-1323123",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-32-3232323",
    id: 3
  }
]

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

app.get('/api/persons', (req, res) =>{
  res.json(persons)
})


app.get('/info', (req, res) => {
  const date =  new Date()
  res.send(
    `<p>Phoneboook has info for ${persons.length} people</p>
     <p>${date}</p>`
  )
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person){
    res.json(person)
  }
  else{
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if(!body.name || !body.number){
    return res.status(400).json({
      error: 'name or number missing'
    })
  }

  if(persons.some(person => person.name === body.name)){
    return res.status(400).json({
      error: `Person with a name ${body.name} was already found from the phonebook`
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: getRandomInt(1000000) // 1 in a million that same id
  }

  persons = persons.concat(person)
  res.json(person)
})


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
