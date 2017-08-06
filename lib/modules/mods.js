


function Mods(app) {

  if (!(this instanceof Mods)) {
    return new Mods(app);
  }

  this.app     = app;
  this.mods    = [];   // array of objects

  return this;

}
module.exports = Mods



////////////////////////
// Initialize Modules //
////////////////////////
Mods.prototype.initialize = function initialize() {


  /////////////////////////
  // Insert Modules Here //
  /////////////////////////
  this.mods.push(require('./email/email')(this.app));
  //this.mods.push(require('./auth/auth')(this.app));
  //this.mods.push(require('./ping/ping')(this.app));
  //this.mods.push(require('./vpn/vpn')(this.app));
  //this.mods.push(require('./server/server')(this.app));
  //this.mods.push(require('./socialnetwork/socialnetwork')(this.app));



  // make sure our options object exists
  if (this.app.options.modules == null) {
    this.app.options.modules = [];
  }


  // install modules as needed
  for (i = 0; i < this.mods.length; i++) {
    module_installed = 0;
    for (j = 0; j < this.app.options.modules.length; j++) {
      if (this.mods[i].name == this.app.options.modules[j]) { module_installed = 1; }
    }
    if (module_installed == 0) {
      this.mods[i].installModule(this.app);
      this.app.options.modules.push(this.mods[i].name);
      this.app.storage.saveOptions();
    };
  }

}






Mods.prototype.addMessageToInbox = function addMessageToInbox(tx, modname) {
  for (i = 0; i < this.mods.length; i++) {
    if (modname == this.mods[i].name) {
      this.mods[i].addMessageToInbox(tx, this.app);
    }
  }
  return null;
}
Mods.prototype.affixCallbacks = function affixCallbacks(txindex, message, callbackArray, callbackIndexArray) {
  for (i = 0; i < this.mods.length; i++) {
    if (message.module == this.mods[i].name) {
     callbackArray.push(this.mods[i].onConfirmation);
      callbackIndexArray.push(txindex);
    }
  }
}
Mods.prototype.displayUserInputForm = function displayUserInputForm(modname) {
  for (i = 0; i < this.mods.length; i++) {
    if (modname == this.mods[i].name) {
      this.mods[i].displayUserInputForm();
    }
  }
  return null;
}
Mods.prototype.displayMessage = function displayMessage(message_id, modname) {
  for (i = 0; i < this.mods.length; i++) {
    if (modname == this.mods[i].name) {
      return this.mods[i].displayMessage(message_id, this.app);
    }
  }
  return null;
}
Mods.prototype.formatTransaction = function formatTransaction(tx, modname) {
  for (i = 0; i < this.mods.length; i++) {
    if (modname == this.mods[i].name) {
      return this.mods[i].formatTransaction(tx, this.app);
    }
  }
  return null;
}






