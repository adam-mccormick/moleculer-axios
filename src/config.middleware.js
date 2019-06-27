
const env = {
	get(path) {
		return process.env[path];
	}
};

module.exports = (source = env) => {
	
	return {
		created (broker) {
			broker.config = {
				get (path, schema) {
					const value = source.get(path);
					if(schema){
						broker.validator.validate({ value }, schema);
					}
				},
				
				string(path) {
					return this.get(path, { value: "string" });
				},
				
				url(path) {
					this.get(path, { value: "url" });
				},
				
				object(path, schema) {
					return this.get(path, schema);
				}
			};
		}
	};
};
