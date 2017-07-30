var TuTuLogger = require('./logger');
var tutu = {};
var tutuLogger = new TuTuLogger(tutu);
tutu.logger.debug('111');
tutu.logger.info('123');
tutu.logger.error('456');