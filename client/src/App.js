import React, { Component } from 'react';

import logo from './logo.svg';

import './App.css';

class App extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
    unicorns: '',
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/world', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();

    this.setState({ responseToPost: body });
  };
  
  handleUnicorns = async e => {
    e.preventDefault();
    const response = await fetch('/api/unicorns', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const body = await response.text();

    this.setState({ unicorns: body });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            This is demo app created for Czechitas testing course. For API lessons. Original project that was forked and edited is  <a href={'https://github.com/esausilva/example-create-react-app-express'}>here</a> and was just extended by Jan Trnavský
          </p>
        </header>
        <p>{this.state.response}</p>
        <form onSubmit={this.handleSubmit}>
          <p>
            <strong>Post to Server that just returns you what you sent in json key "post":</strong>
            <br />
            [POST] https://test-trello-cz.herokuapp.com/api/world
            example body: <br />
            <code>&#123;"post":"aa"&#125;</code>
            <br />
            WARNING: DOES NOT RETURN A VALID JSON!!!
          </p>
          <input
            type="text"
            value={this.state.post}
            onChange={e => this.setState({ post: e.target.value })}
          />
          <button type="submit">Submit</button>
        </form>
        <p>Response:</p>
        <p>{this.state.responseToPost}</p>
        
        <hr />
        <form onSubmit={this.handleUnicorns}>
          <p>
            <strong>Get unicorns:</strong>
            <br />
            [GET] https://test-trello-cz.herokuapp.com/api/unicorns
            <br />
            Returns: <br/>
            200 JSON list of unicorns in DB <br/>
            500 is returned in case of fail
          </p>
          <button type="submit">Get unicorns list!</button>
        </form>
        <p>Response:</p>
        <p>
          {this.state.unicorns}
        </p>
        <hr />
        <p>
          <strong>Add new unicorn to list:</strong>
          <br />
          [POST] https://test-trello-cz.herokuapp.com/api/unicorns
          <br/>
          example body: <br/>
          <code>&#123;"name":"name of fluffy unicorn"&#125;</code>
          <br/>
          <br />
          Returns: <br />
          201 in case of correct creation of unicorn
          <br/>
          400 if request is not valid
          <br />
          500 if there is an error on side of server
        </p>
<hr/>
        <p>
          <strong>just mirror:</strong>
          <br />
          [POST] https://test-trello-cz.herokuapp.com/api/mirror
          <br/>
          <code>&#123;"key":"value"&#125;</code>
          <br/>
          <br />
          Returns: <br />
          200 and sent body
          <br/>
          400 if request body was not a valid JSON
          <br />
          401 if you do not use our secret header
        </p>
      </div>
    );
  }
}

export default App;
