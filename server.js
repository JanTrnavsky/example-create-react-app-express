const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function Unicorn(id, name) {
  this.id = id;
  this.name = name;
}

// API calls
app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.post('/api/mirror', (req, res) => {
  if (req.header('authorization') !== "milujuJednorozce") {
    res.status(401)
    res.send({problem: 'You do not know our secret password, so using this endpoint is forbiden to you'})
  }
  try {
    JSON.parse(req.body);
  } catch (e) {
    res.status(400)
    res.send({problem: "Body was not a valid JSON, no mirroring for you"})
    return;
  }
  res.send(
      `${req.body}`,
  );
});

app.post('/api/unicorns', (req, res) => {
  if (!req.body.name) {
    res.status(400)
    res.send({problem: 'request was not valid, please give a name to your unicorn'})
    return
  }
  try {
    fs.writeFile('db.txt', `${req.body.name}\n`, {flag: 'a+'}, err => {
    })
    res.status(201)
    res.send({content: `Unicorn ${req.body.name} added to database.`})
  } catch (err) {
    res.status(500)
    res.send({problem: 'something went wrong unicorn was not added try again'})
  }
})

app.get('/api/unicorns', (req, res) => {
  fs.readFile('db.txt', 'utf8' , (err, data) => {
    let result = []
    if (err) {
      res.status(500)
      res.send({problem: 'sorry something went wrong'})
      return
    }
    dataExploded = data.split('\n')
    for (let i = 0; i < dataExploded.length - 1; i++) {
      result.push(new Unicorn(i, dataExploded[i]))
    }
    res.send(JSON.stringify(result))
  })
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
