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

app.post('/api/unicorns', (req, res) => {
  console.log(req.body)
  if (!req.body.name) {
    res.send('request was not valid, please give a name to your unicorn')
    return
  }
  try {
    fs.writeFile('db.txt', `${req.body.name}\n`, {flag: 'a+'}, err => {
    })
    res.send(`Unicorn ${req.body.name} added to database.`)
  } catch (err) {
    res.send('something went wrong unicorn was not added try again')
  }
})

app.get('/api/unicorns', (req, res) => {
  fs.readFile('db.txt', 'utf8' , (err, data) => {
    let result = []
    if (err) {
      res.send('sorry something went wrong')
      return
    }
    dataExploded = data.split('\n')
    for (let i = 0; i < dataExploded.length; i++) {
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
