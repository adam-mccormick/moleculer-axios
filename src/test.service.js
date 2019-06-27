
module.exports = (broker) => {
	return {
		name: "test",
		
		settings: {
			api: {
				endpoint: broker.config.url("APEX")
			}
		},
		
		actions: {
			greet: {
				handler(ctx) {
					return `Hello ${ctx.params.name}! You should go to ${this.settings.api.endpoint}`;
				}
			}
		}
	};
};
