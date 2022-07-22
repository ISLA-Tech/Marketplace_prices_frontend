"use strict;"
const config = require('./config.json');
const axios = require('axios')
const Cors = require('cors')
const Express = require('express')
let app = Express();
var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
        extended: true
}));
// parse application/json
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/static/html');
app.use(Cors())
app.use(Express.static('static'))

app.post('/results', async function(req, res, next) {
  let query = '[' + req.body.queryInput + ']';
  let queryJSON = {};
  try{
    queryJSON = JSON.parse(query);
  }catch(err){
    console.log("Bad data. Impossible to parse into JSON");
    return res.sendFile('index.html', {root: 'static/html'});
  }

  let queryId = "";
  //Get a queryId from the API
  await axios.post('http://' + config.mp_prices_api.server + ":4224" + '/getqueryId', { SearchesList: queryJSON })
  .then(function (response) {
    console.log("/getqueryId response: " + JSON.stringify(response.data));
    //IF bad arguments given in input (not compying with "..", ".." synthax) : redirect to index
    if(response.data.Status){
      console.log("Bad data format!");
      res.sendFile('index.html', {root: 'static/html'});
    }else{
      console.log("QueryID Generated successfully");
      //HOW TO SEND QueryId TO THE FRONTEND
      queryId = response.data.QueryId;
    }
  })
  .catch(function (error) {
    console.log(error);
    res.sendFile('index.html', {root: 'static/html'});
  });

  //THEN LAUNCH THE Scraper
  await axios.post('http://' + config.mp_prices_api.server + ":4224" + '/launchscraper', { SearchesList: queryJSON, QueryId:  queryId})
  .then(function (response) {
    console.log("/launchscraper response: " + JSON.stringify(response.data));
    //IF bad arguments given in input (not compying with "..", ".." synthax) : redirect to index
    if(response.data.Status == "Scraper launched"){
      console.log("Scraper launched!");
      res.render('results', {QueryId: queryId, API_Server: 'http://' + config.mp_prices_api.server + ":4224"});
    }else{
      console.log("Scraper launch failure: " + response.data.Status);
      res.sendFile('index.html', {root: 'static/html'});
    }
  })
  .catch(function (error) {
    console.log(error);
    res.sendFile('index.html', {root: 'static/html'});
  });

  return;
})

app.use(function(req, res, next) {
    res.sendFile('index.html', {root: 'static/html'});
});

const PORT = process.env.PORT || 8001
app.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`)
})
