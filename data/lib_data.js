// tools.js
// ========
module.exports = {
  getJSON: function () {

    var fs = require('fs');
    var http = require('http');
    var url = 'http://localhost:8080/service/ALPS?tutor=kmd';

    http.get(url, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var response = JSON.parse(body)
            fs.writeFile("./data/content/data/students.json", response, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
});
        });
    }).on('error', function(e) {
          console.log("Got error: ", e);
    });
      }
};