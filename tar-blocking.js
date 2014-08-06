function processFile(callback) {
  var fs = Npm.require('fs');
  var count, finished, onData, onException, onIgnoredEntry;
  count = 0;
  finished = false;
  onException = function (error) {
	if (finished) {
	  Meteor._debug("Exception thrown after already finished:", error.stack || error);
	}
	if (finished) {
	  return;
	}
	finished = true;
	return callback(error);
  };
  onData = function(data) {
	console.log("onData");
	if (finished) {
	  return;
	}
	console.log("before sleep");
	Meteor._sleepForMs(500);
	console.log("after sleep");
	throw new Error("test");
  };
  return fs.createReadStream('../../../../../tar-blocking.js').on('data', Meteor.bindEnvironment(onData, onException)).on('end', function() {
	console.log("end");
	if (finished) {
	  return;
	}
	finished = true;
	return callback(null, count);
  }).on('error', function(error) {
	console.log("error", error);
	if (finished) {
	  return;
	}
	finished = true;
	return callback(error);
  });
};

if (Meteor.isClient) {
  Template.hello.events({
    'click input': function () {
      Meteor.call('test-tar');
    }
  });
}

if (Meteor.isServer) {
  Meteor.methods({
    'test-tar': function () {
      console.log("Calling processFile");
      Meteor._wrapAsync(processFile)();
      console.log("processFile returned");
	}
  });
}
