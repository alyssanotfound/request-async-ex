var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');

/* GET home page. */
router.get('/signals/:endpoint/:sigid?', function(req, res, next) {
	var id;
	var endpoint = req.params.endpoint;
	id = req.params.sigid;
	var numDays = req.query.window;
	var series = req.query.series;
	console.log(endpoint);
	console.log(series);
	if (typeof series !== 'undefined') {
    	id = series[0];
	}

	var requestPath = 'http://predata-challenge.herokuapp.com/signals/' + id;
	//console.log(requestPath); 
	request(requestPath, function (error, response, body) {
	  
	  if (!error && response.statusCode == 200) {
	    //console.log(body);
	    var objs = JSON.parse(body);
	    var objs_transformed;
	    switch (endpoint) {
		    case "norm":
		 		objs_transformed = rescaleVals(objs);
		        break;
		    case "zscore":
		 		objs_transformed = findZscores(objs,numDays);
		        break;
		    case "combine":
		    	objs_transformed = linearCombo(objs,series);
		        break;
		    case "peaks":
		        break;
		    case "cross":
		        break;
		}
	  	res.send("<div><pre>" + JSON.stringify(objs_transformed, null, "\t") + "</pre></div>");

	  }
	})	
	
});

//******************* NORMALIZATION *******************
function rescaleVals(objs) {
  var max = objs[0].value;
  var min = objs[0].value;
  objs.map(function(num) {
    if (num.value > max) {
      max = num.value;
    }
    if (num.value < min) {
      min = num.value;
    }
  });
  var range = max - min;
  var objs_rescaled = objs.map(function(num) {
    num.value = ((num.value - min)/(range))*100;
    return num;
  });
  return objs_rescaled;
}
//******************* END NORMALIZATION *******************
//******************* Z-SCORES *******************
//should max window size be limited to some % of total num dates available?
function findZscores(objs, numDays){
	console.log(objs.length);
	console.log(numDays);
	if (numDays > objs.length) {
		console.log("Window must be fewer than " + objs.length + " days.");
		return;
	}
  	var objs_zScores = objs.map(function(num, i) {
    if (i >= numDays){
      num.value = findOneZscore(objs,numDays,i); 
    } 
    return num;
  }); 
  //once z scores are calculated cut out the objects in the array
  //that have original values still, not z scores
  objs_zScores = objs_zScores.slice(numDays,objs_zScores.length);
  return objs_zScores;
}

function findOneZscore(objs,numDays,t) {
  //make subset of array corresponding to window
  var objs_window = objs.slice(t-numDays,t);
 
  var sum = 0;
  objs_window.map(function(num) {
    sum = sum + num.value;
  });
  //console.log(sum);
  var mean = sum/(objs_window.length);
  //console.log(mean);

  var stdsum = 0;
  objs_window.map(function(num) {
    stdsum = stdsum + Math.pow((num.value-mean),2);
  });
  stddev = Math.sqrt(stdsum/(objs_window.length));
  
  var zScore = (objs_window[numDays-1].value - mean)/(stddev);
  return zScore;
}
//******************* END Z-SCORES *******************
//******************* LINEAR COMBO *******************
function linearCombo(objs,series) {
	console.log("linear combo");
	var series_data = series.split(',');
	console.log()
	return objs;
}
//******************* END LINEAR COMBO *******************


//module.exports just means that this variable is made available
//for other files that need require it
module.exports = router;
