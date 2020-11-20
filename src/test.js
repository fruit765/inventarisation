const { packError, valueError } = require("./model/libs/exceptionHandling");

Promise.reject(Error("ddd")).catch(packError("yy")).catch(packError("ee")).catch(valueError(x=>3))