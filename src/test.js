const History = require("./model/orm/history");

History.query().then(x => {console.log(x.prototype)})