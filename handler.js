'use strict';
require('date-utils');
var client = require('cheerio-httpcli');
module.exports.scrape = (event, context, callback) => {
  let PARAMS = event.queryStringParameters;
  var queries = {}
  for (var i = 0; i < 10; i++) {
    var q = PARAMS['query[' + i + ']'];
    if (q) {
      var d = {
        query: q
      };
      d.datatype = PARAMS['datatype[' + i + ']'];
      d.label = PARAMS['label[' + i + ']'];
      queries[i] = d;
    }
  }
  client.fetch(PARAMS.url, {}, function(err, $, res) {
    var cast = function(data, datatype) {
      switch (datatype) {
        case 'float':
          return parseFloat(data);
        case 'int':
          return parseInt(data);
        case 'string':
          return data.trim();
      }
      return data;
    }
    var result = [];
    if (PARAMS.query) {

      result = {
        query: PARAMS.query,
        value: cast($(PARAMS.query).text() || '', PARAMS.datatype)
      };
      if (PARAMS.label) result.label = PARAMS.label;

    } else {
      for (var queryIndex in queries) {
        var d = {
          index: queryIndex,
          query: queries[queryIndex].query,
          value: cast($(queries[queryIndex].query).text() || '',
            queries[queryIndex].datatype)
        };
        if (queries[queryIndex].label) d.label = queries[queryIndex].label;
        result.push(d);
      }
    }
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        datetime: new Date().toFormat("YYYY-MM-DD HH:MI:SS"),
        url: PARAMS.url,
        result: result
      }),
    };
    callback(null, response);
  });
};
