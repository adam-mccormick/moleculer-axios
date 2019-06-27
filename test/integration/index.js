const { ServiceBroker } = require("moleculer");
const config = require("../../src/config.middleware");

process.env.APEX = "http://apex.com";

const broker = new ServiceBroker({
	middlewares: [config()]
});

broker.start().then(async () => {
	await broker.loadService("../../src/test.service.js");
	console.log("Started");
	broker.call("test.greet", {name: "adam"}).then(r => console.log(r));
});



