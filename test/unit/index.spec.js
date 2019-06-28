"use strict";

const { ServiceBroker } = require("moleculer");
const AxiosService = require("../../src");

describe("The axios service", () => {
	const broker = new ServiceBroker();
	const service = broker.createService(AxiosService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it("should be created", () => {
		expect(service).toBeDefined();
	});

	it("should contain axios instance", () => {
		expect(service.axios).toBeDefined();
	});

	it("should have all default actions", () => {
		expect(Object.keys(service.actions)).toEqual(expect.arrayContaining([
			"get","put","post","delete","patch","options","head","request"
		]));
	});

	describe("should invoke axios with correct config", () => {
		it.each(AxiosService.METHODS)("when using %s", (method => {
			service.axios.request = jest.fn(() => Promise.resolve());
			if(method === "request"){
				const config = {
					url: "http://httpbin.org/status/200",
					method: "get"
				};
				return broker.call("axios.request", { config }).then(() => {
					expect(service.axios.request).toHaveBeenNthCalledWith(1, config);
				});
			}
			return broker.call(`axios.${method}`, { url: "http://httpbin.org/status/200" }).then(() => {
				expect(service.axios.request).toBeCalledTimes(1);
				if(method !== "request") {
					expect(service.axios.request).toHaveBeenCalledWith(expect.objectContaining({
						method: method
					}));
				}
			});
		}));
	});
});


describe("When used as a mixin", () => {
	const broker = new ServiceBroker();
	const service = broker.createService({
		name:"test",
		mixins: [AxiosService],
		settings: {
			axios: {
				expose: ["get", "post"],
			}
		}
	});

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	it("should only contain exposed actions", () => {
		expect(service.actions.get).toBeInstanceOf(Function);
		expect(service.actions.post).toBeInstanceOf(Function);
		expect(service.actions.delete).toBeFalsy();
		expect(service.actions.put).toBeFalsy();
		expect(service.actions.patch).toBeFalsy();
		expect(service.actions.options).toBeFalsy();
		expect(service.actions.head).toBeFalsy();
		expect(service.actions.request).toBeFalsy();
	});
});
