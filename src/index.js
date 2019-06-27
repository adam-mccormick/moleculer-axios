/*
 * moleculer-request
 * Copyright (c) 2019 Adam McCormick (https://github.com/amccormick/moleculer-request)
 * MIT Licensed
 */
"use strict";

const _     = require("lodash");
const axios = require("axios");

const METHODS = ["get", "put", "post", "delete", "patch", "options", "head", "request"];

module.exports = {

	name: "axios",
	
	settings: {

		/**
		 * Axios configuration settings.
		 */
		axios: {
			
			/**
			 * An array of axios methods to expose as actions of this 
			 * service. Any methods NOT listed here will be removed
			 * from the resulting service instance.
			 * 
			 * Any empty array will not expose default any actions.
			 * 
			 * By default all HTTP methods are exposed
			 */
			expose: METHODS,

			/**
			 * Configure the underlying axios instance. 
			 */
			config: {
				
			},

			/**
			 * Request and response interceptors. 
			 */
			interceptors: {
				
				request: {
					
					/**
					 * An array of functions or method names which will be
					 * added as request interceptors for when the request is 
					 * successful
					 */
					config: [],

					/**
					 * An array of functions or method names which will be
					 * added as request interceptors for when the request has
					 * errors
					 */
					error: []
				},
				
				response: {

					/**
					 * An array of functions or method names which will be
					 * added as response interceptors for when the response is
					 * successful
					 */
					success: [],

					/**
					 * An array of functions or method names which will be
					 * added as response interceptors for when the response 
					 * has errors
					 */
					error: []
				}
			},

			/**
			 * Configure how request and responses should be
			 * logged.
			 */
			logging: {
				level: "info",
				request: {
					include: ["url", "method"]
				},
				response: {
					include: ["config.url", "status", "statusText"]
				}
			}
		},
	},

	/**
	 * Actions
	 */
	actions: {
		request: {
			params: {
				url: "string",
				config: "object"
			},
			
			handler(ctx) {
				return this.axios.request({url: ctx.params.url, ...ctx.params.config });
			}
		},
		
		get: {
			params: {
				url: "string",
				config: {
					type: "object",
					optional: true
				}
			},

			handler(ctx) {
				return this.axios.get(ctx.params.url, ctx.params.config);
			}
		},
		
		put: {
			params: {
				url: "string",
				config: "object"
			},

			handler(ctx) {
				return this.axios.put(ctx.params.url, ctx.params.config);
			}
		},
		
		post: {
			params: {
				url: "string",
				config: "object"
			},

			handler(ctx) {
				return this.axios.post(ctx.params.url, ctx.params.config);
			}
		},
		
		delete: {
			params: {
				url: "string",
				config: "object"
			},

			handler(ctx) {
				return this.axios.delete(ctx.params.url, ctx.params.config);
			}
		},
		
		patch: {
			params: {
				url: "string",
				config: "object"
			},

			handler(ctx) {
				return this.axios.patch(ctx.params.url, ctx.params.config);
			}
		},
		
		options: {
			params: {
				url: "string",
				config: "object"
			},

			handler(ctx) {
				return this.axios.options(ctx.params.url, ctx.params.config);
			}
		},
		
		head: {
			params: {
				url: "string",
				config: "object"
			},

			handler(ctx) {
				return this.axios.head(ctx.params.url, ctx.params.config);
			}
		}
	},

	/**
	 * Methods
	 */
	methods: {
		
		send(ctx) {
			let config = { url: ctx.url, ...ctx.params.config, ctx };
			return this.axios.request(config);
		}
	},

	/**
	 * Service created lifecycle event handler which constructs
	 * the axios instance for this service.
	 * 
	 */
	created() {
		const { config, expose, interceptors, logging } = this.settings.axios;
		
		this.axios = axios.create(config);
		
		if(expose && _.isArray(expose)){
			_.difference(METHODS, expose.map((v) => v.toLowerCase())).forEach(exclude => {
				this.actions[exclude] = false;
			});
		}
		
		this.$interceptors = {};


		if(interceptors) {
			
			const isMethod = (name) => {
				if(_.isFunction(this.methods[name])){
					return true;
				} else {
					this.logger.warn("");
					return false;
				}
			};

			_.get(interceptors, "request.config",   []).filter(isMethod).map(i => this.axios.interceptors.request.use(this.methods[i]));
			_.get(interceptors, "request.error",    []).filter(isMethod).map(i => this.axios.interceptors.request.use(undefined, this.methods[i]));
			_.get(interceptors, "response.success", []).filter(isMethod).map(i => this.axios.interceptors.response.use(this.methods[i]));
			_.get(interceptors, "response.error",   []).filter(isMethod).map(i => this.axios.interceptors.response.use(undefined, this.methods[i]));

		}
		
		
		if(logging && logging.level in this.logger) {
			this.axios.interceptors.request.use((config) => {
				this.logger[logging.level]("Request sent", _.pick(config, logging.request.include));
				return config;
			}, (error) => {
				this.logger.error("Could not send request", error);
				return this.Promise.reject(error);
			});
			
			this.axios.interceptors.response.use((response) => {
				this.logger[logging.level]("Response received", _.pick(response, logging.response.include));
				return response;
			}, (error) => {
				this.logger.error("Error received", error);
				return Promise.reject(error);
			});
		}
	},
	
	METHODS
};

