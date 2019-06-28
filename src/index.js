/*
 * moleculer-request
 * Copyright (c) 2019 Adam McCormick (https://github.com/amccormick/moleculer-request)
 * MIT Licensed
 */
"use strict";

const _     = require("lodash");
const axios = require("axios");
const qs    = require("qs");

const MoleculerError = require("moleculer").Errors.MoleculerServerError;

const METHODS = ["get", "put", "post", "delete", "patch", "options", "head", "request"];

class MoleculerAxiosError extends MoleculerError {

}

const RESPONDERS = {
	full: (res) => res,
	data: (res) => res.data,
	headers: (res) => res.headers,
	status: (res) => res.statusCode,
	ok: (res) => res.statusCode < 399,
};

const SAFE_METHOD_PARAMS = {
	url: {
		type: "string",
		optional: true
	},
	query: [
		{
			type: "string",
			optional: true
		},
		{
			type: "object",
			optional: true
		}
	],
	config: {
		type: "object",
		optional: true
	}
};

const UNSAFE_METHOD_PARAMS = {
	url: {
		type: "string",
		optional: true
	},
	data: {
		type: "any",
		optional: true
	},
	config: {
		type: "object",
		optional: true
	}
};

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
			 * By default all axios request methods are exposed
			 *
			 * Any empty array will not expose any actions which is useful
			 * if you are using this as a mixin and want to create endpoint
			 * actions which delegate to the underlying axios instance.
			 */
			expose: null,

			/**
			 * Defines what part of the response should be sent as the result
			 * of the action call.
			 *
			 * Possible values are:
			 * - `full` return the entire response object
			 * - `data` return only the response data
			 * - `headers` return only the response headers
			 * - `status` return only the status code
			 * - `ok` return a boolean indicating if the request was successful (i.e < 400)
			 *
			 * You can also supply a function which takes the full response
			 * to return any custom result object
			 */
			responder: "full",

			/**
			 * Configure the underlying axios instance with a
			 * standard axios config object
			 *
			 * https://github.com/axios/axios#config-defaults
			 */
			config: {
				paramsSerializer: function (params) {
					return qs.stringify(params, { arrayFormat: "brackets" });
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
				config: "object"
			},

			handler(ctx) {
				return this.send(undefined, ctx);
			}
		},

		get: {
			params: SAFE_METHOD_PARAMS,

			handler(ctx) {
				return this.send("get", ctx);
			}
		},

		put: {
			params: UNSAFE_METHOD_PARAMS,

			handler(ctx) {
				return this.send("put", ctx);
			}
		},

		post: {
			params: UNSAFE_METHOD_PARAMS,

			handler(ctx) {
				return this.send("post", ctx);
			}
		},

		delete: {
			params: UNSAFE_METHOD_PARAMS,

			handler(ctx) {
				return this.send("delete", ctx);
			}
		},

		patch: {
			params: UNSAFE_METHOD_PARAMS,

			handler(ctx) {
				return this.send("patch", ctx);
			}
		},

		options: {
			params: SAFE_METHOD_PARAMS,

			handler(ctx) {
				return this.send("options", ctx);
			}
		},

		head: {
			params: SAFE_METHOD_PARAMS,

			handler(ctx) {
				return this.send("head", ctx);
			}
		}
	},

	/**
	 * Methods
	 */
	methods: {

		send(method, ctx) {

			const config = ctx.params.config || {};

			// use the action method if specified even if one was set on the config
			if(method)
				config.method = method;

			_.defaults(config, {
				url: ctx.params.url,
				params: ctx.params.query,
				ctx
			});

			return this.axios.request(config)
				.then(response => this.$responder(response))
				.catch(err => this.Promise.reject(new MoleculerAxiosError(err.message, 500, "HTTP_REQUEST_ERROR", err)));
		}
	},

	/**
	 * Service created lifecycle event handler which constructs
	 * the axios instance for this service and removes actions
	 * which are declared to not be exposed.
	 *
	 */
	created() {
		const { config, responder, expose, logging } = this.settings.axios;

		this.axios = axios.create(config);

		this.$responder = _.isFunction(responder) ? this.settings.axios.responder : RESPONDERS[responder];

		if(expose && _.isArray(expose)){
			const exclude = _.difference(METHODS, expose.map((v) => v.toLowerCase()));
			exclude.forEach(action => {
				this.actions[action] = false;
			});
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
				//this.logger.error("Error received", error);
				return this.Promise.reject(error);
			});
		}
	},

	METHODS
};

