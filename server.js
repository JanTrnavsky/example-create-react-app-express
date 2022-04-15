const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err && err.code == "SQLITE_CANTOPEN") {
    createDatabase();
    return;
  } else if (err) {
    console.log("Getting error " + err);
    exit(1);
  }
  runQueries(db);
});

function createDatabase() {
  var newdb = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.log("Getting error " + err);
      exit(1);
    }
    createTables(newdb);
  });
}

function createTables(newdb) {
  newdb.exec(`
    create table unicorn (
        unicorn_name text not null,
        unicorn_auth text not null
    );
   `, ()  => {
    runQueries(newdb);
  });
}

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
  
  db.exec(`
    insert into unicorn (unicorn_name, unicorn_auth)
    values (${req.body.name}, ${auth})
  `)
  res.status(201)
  res.send({content: `Unicorn ${req.body.name} added to database.`, manipulationToken: auth})
})

app.get('/api/v2/unicorns', (req, res) => {
  let result = []
  let sc = 200
  db.all(`select row_id, unicorn_name from unicorn`, (err, rows) => {
    if (err) {
      sc = 500
    }
    rows.forEach(row => {result.push(new Unicorn(row.row_id, row.unicorn_name))});
  });
  res.status(sc)
  res.send(JSON.stringify(result))
})

app.delete('/api/v2/unicorns/:unicornId', (req, res) => {
  let sc = 204
  db.all(`delete from unicorn where row_id = ${req.params.unicornId}`, (err, rows) => {
    if (err) {
      sc = 500
    }
  });
  res.status(sc)
  res.send()
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
