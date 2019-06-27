"use strict";

const { ServiceBroker } = require("moleculer");
const AxiosService = require("../../src");

describe("Test axios service", () => {
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
});

describe.each(AxiosService.METHODS)("Invoking action for %s", (method) => {
	const broker = new ServiceBroker();
	const service = broker.createService(AxiosService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());
	test(`should call axios.${method}`, () => {
		service.axios[method] = jest.fn();
		broker.call(`axios.${method}`).then(() => {
			expect(service.axios[method]).toBeCalledTimes(1);
		});
	});
});

describe("When used as a mixin", () => {
	const broker = new ServiceBroker();
	const service = broker.createService({
		name:"test",
		mixins: [AxiosService],
		settings: {
			axios: {
				expose: ["get", "post"]
			}
		}
	});
	
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
