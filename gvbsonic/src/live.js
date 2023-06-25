//i think online support should be a thing.
//still wip.
class SERVERONLINE {
  constructor () {
    this.ws = null;
  }
  connect (server) {
    var t = this;
    return new Promise((resolve,reject) => {
      t.ws = new WebSocket("wss://"+server);
      
    })
  }
}