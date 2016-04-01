var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var _ = require('lodash');
//get endpoint
router.get('/signals/:endpoint/:sigid?', function(req, res, next) {
	var id;
	var objs;
	var objs_transformed;
	var endpoint = req.params.endpoint;
	id = req.params.sigid;
	var numDays = req.query.window;
	var linComData = req.query.series; //series and weights 	
	var seriesID =[];
	var weights =[];
	if (typeof linComData == 'string' && typeof linComData !== 'undefined') {
		var a = linComData.split(',');
		seriesID.push(a[0]);
		weights.push(a[1]);
	} else if (typeof linComData == 'object' && typeof linComData !== 'undefined' ) {
		for (var i = linComData.length - 1; i >= 0; i--) {
			var a = linComData[i].split(',');
			seriesID.push(a[0]);
			weights.push(a[1]);
		}
	}
    switch (endpoint) {
    case "norm":
    	makeRequest('signals',id, function(items) {
			rescaleVals(items, res);
    	});
        break;
    case "zscore":
    	makeRequest('signals',id, function(items) {
			findZscores(items,numDays,res);
    	});
        break;
    case "combine":
    	makeRequest('signals',seriesID, function(items) {
			linearCombo(items,seriesID,weights,res);
    	});
        break;
	}		
});


//******************* MAKE REQUEST *******************

function makeRequest(endpoint, id, cb) {
	console.log(id);
	var allData = {};
	async.forEachOf(id, function (value, key, callback) {
	    var requestPath = 'http://predata-challenge.herokuapp.com/' + endpoint +'/' + value;
		console.log(requestPath);
		request(requestPath, function (error, response, body) {		  
			if (!error && response.statusCode == 200) {
				allData[key] = JSON.parse(body);
				callback();
			}
		})
	}, function (err) {
	    if (err) console.error(err.message);
	    //console.log(allData);
	    cb(allData);
	})
}

//******************* END MAKE REQUEST *******************
//******************* SEND RESPONSE *******************

function sendResponse(transformedData, res) {
	res.send("<div><pre>" + JSON.stringify(transformedData, null, "\t") + "</pre></div>");	
}
	
//******************* END SEND RESPONSE *******************


//******************* NORMALIZATION *******************
function rescaleVals(allObjs, res) {
	//only using one set of data
	var objs = allObjs[0];
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
	sendResponse(objs_rescaled, res);
}
//******************* END NORMALIZATION *******************

//******************* Z-SCORES *******************
function findZscores(allObjs, numDays, res){
	//only using one set of data
	var objs = allObjs[0];
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
  sendResponse(objs_zScores, res);
}

function findOneZscore(objs,numDays,t) {
	//make subset of array corresponding to window
	var objs_window = objs.slice(t-numDays,t);
	for (var i = objs_window.length - 2; i >= 0; i--) {
		
		var date1 = new Date(objs_window[i].date);
		var date2 = new Date(objs_window[i+1].date);
		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
		//console.log(diffDays);
		if (diffDays != 1){
			console.log(date1 + "  " + date2);
		}
	}

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
function linearCombo(objs,series,weights,res) {
	var objs_linearCombo = [];
	for (var i = objs[0].length - 1; i >= 0; i--) {
		var currDate = objs[0][i].date;
		var termData = [];
		for (var j = series.length - 1; j >= 0; j--) {	
			//console.log(j + " is " + _.findKey(objs[series[j]-1], {'date': currDate}));
			if (typeof _.findKey(objs[series[j]-1], {'date': currDate}) !== 'undefined') {
				var corrKey = _.findKey(objs[series[j]-1], {'date': currDate});
				termData.push((objs[series[j]-1][corrKey].value)*weights[j]);
			}	
		}
		//console.log(termData.length == series.length);	
		if (termData.length == series.length) {
			var total = termData.reduce(function(a, b) {
  			return a + b;
			});
			objs_linearCombo.push({date: currDate, value: total});
		}
		
	}
	// var lastDateIndex = objs_linearCombo.length - 1;
	// console.log("first and last entries: ")
	// console.log(objs_linearCombo[0]);
	// console.log(objs_linearCombo[lastDateIndex]);
	sendResponse(objs_linearCombo, res);
}

//******************* END LINEAR COMBO *******************


//module.exports just means that this variable is made available
//for other files that need require it
module.exports = router;
