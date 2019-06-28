"use strict";

const { ServiceBroker } = require("moleculer");
const axios = require("../../index");

// Create broker
const broker = new ServiceBroker({
	logger: console
});

// Load my service
broker.createService({
	name: "example",

	mixins: [axios],

	settings: {
		axios: {
			responder: "status",
			config: {
				url: "/",
				baseURL: "http://httpbin.org/"
			}
		}
	},

	created(){
		this.axios.interceptors.request.use((config) => {
			this.broker.logger.info("I do things here");
			return config;
		});
	}
});

// Start server
broker.start().then(() => {
	// Call action
	broker.call("example.get", { url: "/status/200"})
		.then(response => broker.logger.info("GOT IT", response))
		.catch(err => {
			broker.logger.error("OOPS!!!", err);
		});

}).then(() => {
	return broker.stop();
});
