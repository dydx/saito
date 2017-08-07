//
// clean this up, the reference is 
// from the blockchain class
// 
//
var t       = exports;
    t.utils = require('./saito/utils');
var saito   = require('./saito');





var app            = {};
    app.options    = {};


///////////////////////////////////////////
// are we running in browser / lite-mode //
///////////////////////////////////////////
app.BROWSERIFY = 0;




////////////////////
// Load Variables //
////////////////////
app.crypt      = new saito.crypt();
app.storage    = new saito.storage(app);
app.wallet     = new saito.wallet(app);
app.blockchain = new saito.blockchain(app);
app.network    = new saito.network(app);
app.server     = new saito.server(app);
app.browser    = new saito.browser(app);
app.modules    = require('./modules/mods')(app);




////////////////
// Initialize //
////////////////
app.storage.initialize();
app.wallet.initialize();
app.server.initialize();
app.network.initialize();
app.blockchain.initialize();
app.modules.initialize();
app.browser.initialize();



///////////
// Start //
///////////
if (app.BROWSERIFY == 0) {
  app.blockchain.mempool.startBundling();
}














// create hooks for application closure
// these force the application to close
// sensibly and can be triggered by Cntl-C
// but not Cntl-Z

process.on('SIGTERM', function () {
  app.server.close();
  app.network.close();
  console.log("Network Shutdown");
});
process.on('SIGINT', function () {
  app.server.close();
  app.network.close();
  console.log("Network Shutdown");
});



