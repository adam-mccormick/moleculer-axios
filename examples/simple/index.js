"use strict";

const { ServiceBroker } = require("moleculer");
const Axios 			  = require("../../index");

// Create broker
const broker = new ServiceBroker({
	logger: console
});

// Load my service
broker.createService(Axios);

// Start server
broker.start().then(() => {
	// Call action
	broker
		.call("axios.get", {url: "https://httpbin.org/status/200"})
		.then(response => broker.logger.info(response.data))
		.catch(broker.logger.error);

});
