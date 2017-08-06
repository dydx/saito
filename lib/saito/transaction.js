var saito         = require('../saito');


function Transaction(txjson="") {

  if (!(this instanceof Transaction)) {
    return new Transaction(txjson);
  }


  ////////////////////////
  // included in blocks //
  ////////////////////////
  this.transaction               = {};
  this.transaction.from          = [];    // from (payslip)
  this.transaction.to            = [];    // to (payslip)
  this.transaction.ts            = "";    // timestamp / unixtime
  this.transaction.sig           = "";    // signature of block
  this.transaction.ver           = 1;
  this.transaction.path          = [];    // transaction path
  this.transaction.id            = 1;
  this.transaction.gt            = null;  // golden ticket
  this.transaction.msg           = {};    // message field
  this.transaction.msig          = "";    // signature of message field
  this.transaction.ps            = 0;     // paysplit


  ////////////////////////////
  // not included in blocks //
  ////////////////////////////
  this.fee                               = -1;


  /////////////////////////
  // or create from JSON //
  /////////////////////////
  if (txjson != "") {
    this.transaction = JSON.parse(txjson);
    for (i = 0; i < this.transaction.from.length; i++) {
      this.transaction.from[i] = new saito.slip(this.transaction.from[i].add, this.transaction.from[i].amt);
    }
    for (i = 0; i < this.transaction.to.length; i++) {
      this.transaction.to[i] = new saito.slip(this.transaction.to[i].add, this.transaction.to[i].amt);
    }
  }

  return this;

}
module.exports = Transaction;





//////////////
// Validate //
//////////////
Transaction.prototype.validate = function validate() {

  if (!saito.crypt().verifyMessage(this.paymentSignatureSource(),this.transaction.sig,this.transaction.from[0].returnAddress())) {
    console.log("transaction signature does not verify");
    return 0;
  }

  // does the sender have enough cash
  //
  // check balances later - once we have
  // tested enough to be sure basic transaction-
  // related mempool activities work, etc.
  return 1;

}




Transaction.prototype.signTransaction = function signTransaction() {
  this.transaction.msig   = this.signMessage(JSON.stringify(this.transaction.msg));
  this.transaction.sig  = this.signMessage(this.paymentSignatureSource());
}
Transaction.prototype.signMessage = function signMessage(message) {
  return saito.crypt().signMessage(message, this.app.wallet.returnPrivateKey());
}

Transaction.prototype.addTo = function addTo(toAddress, toAmount) {
  this.to.push(new saito.slip(toAddress, toAmount));
}
Transaction.prototype.addFrom = function addFrom(fromAddress, fromAmount) {
  this.from.push(new saito.slip(fromAddress, fromAmount));
}
Transaction.prototype.returnSlipTo = function returnSlipTo(toAddress) {
  for (v = 0; v < this.transaction.to.length; v++) {
    if (this.transaction.to[v].returnAddress() == toAddress) { return this.transaction.to[v]; }
  }
  return null;
}
Transaction.prototype.returnSlipFrom = function returnSlipFrom(fromAddress) {
  for (v = 0; v < this.transaction.from.length; v++) {
    if (this.transaction.from[v].returnAddress() == fromAddress) { return this.transaction.from[v]; }
  }
  return null;
}
Transaction.prototype.isFrom = function isFrom(senderPublicKey) {
  if (this.returnSlipFrom(senderPublicKey) != null) { return 1; }
  return 0;
}
Transaction.prototype.isTo = function isTo(receiverPublicKey) {
  if (this.returnSlipTo(receiverPublicKey) != null) { return 1; }
  return 0;
}


Transaction.prototype.paymentSignatureSource = function paymentSignatureSource() {

  // the transaction to and from is validated, along with the message
  // (user-included data) and any relevant votes/id numbers. The path
  // is excluded from validation as there can be many of them associated
  // with the same transaction, and we need a single hash.

  return        JSON.stringify(this.transaction.from) +
                JSON.stringify(this.transaction.to) +
                this.transaction.ts +
                this.transaction.paysplit +
                JSON.stringify(this.transaction.msig) +
                JSON.stringify(this.transaction.ver) +
                JSON.stringify(this.transaction.gt);
}


// check the actual fees paid from the perspective of the
// node that is going to bundle this into a block. This
// is not the total amount of money in the transaction
// but rather the amount after network transmission
// is paid for out-of-pocket.
Transaction.prototype.returnFee = function returnFee() {

  if (this.fee == -1) {

    // we haven't calculated the fee for this transaction yet
    // so we do it, and save it to a local variable so we don't
    // need to do this computationally intensive work in the
    // future.

    inputs = 0.0;
    for (v = 0; v < this.transaction.from.length; v++) {
      inputs += this.transaction.from[v].amount;
    }
    outputs = 0.0;
    for (v = 0; v < this.transaction.to.length; v++) {
      outputs += this.transaction.to[v].amount;
    }

    this.starting_fee = inputs - outputs;
    this.fee = this.starting_fee;

    pathlength = this.returnPathLength();

    for (x = 1; x < pathlength; x++) {
      this.fee = this.fee/2;
      this.fee.toFixed(8);
    }

    return this.fee;

  } else {
    return this.fee;
  }

}









Transaction.prototype.returnTransactionJson = function returnTransactionJson() {
  return JSON.stringify(this.returnTransaction());
}
Transaction.prototype.returnTransaction = function returnTransaction() {
  return this.transaction;
}
Transaction.prototype.returnPathLength = function returnPathLength() {
  return this.transaction.path.length;
}

