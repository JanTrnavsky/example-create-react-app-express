const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;
let id = 0

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
  res.send(
      req.body
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


app.post('/api/v2/unicorns', (req, res) => {
  
  let auth
  if (!req.body.name) {
    res.status(400)
    res.send({problem: 'request was not valid, please give a name to your unicorn'})
    return
  }
  if (!req.body.auth) {
    auth = (Math.random() + 1).toString(36).substring(7)
  } else {
    auth = req.body.auth
  }
  
  try {
    id++;
    fs.writeFile('db2.txt', `${id}";,;"${req.body.name}";,;"${auth}"\n`, {flag: 'a+'}, err => {
    })
  } catch (err) {
    res.status(500)
    res.send({problem: 'something went wrong unicorn was not added try again'})
    return
  }
  
  res.status(201)
  res.send({content: `Unicorn ${req.body.name} added to database.`, manipulationToken: auth})
})

app.get('/api/v2/unicorns', (req, res) => {

  fs.readFile('db2.txt', 'utf8' , (err, data) => {
    let result = []
    if (err) {
      res.status(500)
      res.send({problem: 'sorry something went wrong'})
      return
    }
    let dataExploded = data.split('\n')
    for (let i = 0; i < dataExploded.length - 1; i++) {
      let row = dataExploded[i].split(`";,;"`)
      result.push(new Unicorn(row[0], row[1]))
    }
    res.send(JSON.stringify(result))
  })
})

app.delete('/api/v2/unicorns/:unicornId(\d+)', (req, res) => {
  let sc = 404
  fs.readFile('db2.txt', 'utf8' , (err, data) => {
    if (err) {
      res.status(500)
      res.send({problem: 'sorry something went wrong'})
      return
    }
    let dataExploded = data.split('\n')
    for (let i = 0; i < dataExploded.length - 1; i++) {
      let row = dataExploded[i].split(`";,;"`)
      if (row.startsWith(`${req.params.unicornId}";,;"`)) {
        sc = 204
      } else {
        result.push(dataExploded[i])
      }
    }
    fs.writeFile('db2.txt', result, (err) => {
      if (err) {
        res.status(500)
        res.send({problem: 'sorry something went wrong'})
        return
      }
    })
  })
  res.status(sc)
  res.send()
})

app.put('/api/v2/unicorns/:unicornId(\d+)', (req, res) => {
  let sc = 404
  fs.readFile('db2.txt', 'utf8' , (err, data) => {
    if (err) {
      res.status(500)
      res.send({problem: 'sorry something went wrong'})
      return
    }
    let dataExploded = data.split('\n')
    for (let i = 0; i < dataExploded.length - 1; i++) {
      let row = dataExploded[i].split(`";,;"`)
      if (row.startsWith(`${req.params.unicornId}";,;"`)) {
        sc = 200
        let row = dataExploded[i].split(`";,;"`)
        result.push(`${row[0]}";,;"${req.body.name}";,;${row[2]}"\n`)
      } else {
        result.push(dataExploded[i])
      }
    }
    fs.writeFile('db2.txt', result, (err) => {
      if (err) {
        res.status(500)
        res.send({problem: 'sorry something went wrong'})
        return
      }
    })
  })
  res.status(sc)
  res.send()
})

app.get('/api/v2/status', (req, res) => {
  let sc = 200
  if(req.query.status && req.query.status > 100 && req.query.status < 600) {
    sc = req.query.status
  }
  res.status(sc)
  res.end()
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
