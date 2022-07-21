"use strict;"

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

app.use(Cors())

app.use(Express.static('static'))

app.use(function(req, res, next) {
    res.sendFile('index.html', {root: 'static/html'});
});

const PORT = process.env.PORT || 8001
app.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`)
})
