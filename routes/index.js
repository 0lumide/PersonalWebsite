var express = require('express');
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Olumide Awofeso' });
});

router.get('/resume', function(req, res){
  res.render('resume');
});
module.exports = router;
