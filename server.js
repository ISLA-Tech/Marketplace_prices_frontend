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

app.post('/results', function(req, res, next) {
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
  axios.post('http://' + config.mp_prices_api.server + ":4224" + '/getqueryId', { SearchesList: queryJSON })
  .then(function (response) {
    console.log(response.data);
    //IF bad arguments given in input (not compying with "..", ".." synthax) : redirect to index
    if(response.data.Status){
      console.log("Bad data format!");
      res.sendFile('index.html', {root: 'static/html'});
    }else{
      console.log("Scraper launched!");
      //HOW TO SEND QueryId TO THE FRONTEND
      queryId = response.data.QueryId;
    }

  })
  .catch(function (error) {
    console.log(error);
    res.sendFile('index.html', {root: 'static/html'});
  });

  //THEN LAUNCH THE Scraper
  // api/launchscraper
  //res.render('results', {QueryId: queryId});

  return;
})

app.use(function(req, res, next) {
    res.sendFile('index.html', {root: 'static/html'});
});

const PORT = process.env.PORT || 8001
app.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`)
})
