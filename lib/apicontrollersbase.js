'use strict';

var request = require('request');
var logger = require('./logger.js').logger;
var config = require('./config').config;

class APIOperationBase {
	constructor(apiRequest) {
		logger.debug('Enter APIOperationBase constructor');

		this._request = null;
		this._response = null;
		this._endpoint = null;

		if(null == apiRequest)
			logger.error('Input request cannot be null');

		this._request = apiRequest;

		logger.debug('Exit APIOperationBase constructor');
	}

	//abstract
	validateRequest(){
		return;
	}

	validate(){
		return;
	}

	getResponse(){
		return this._response;
	}

	getResultcode(){
		var resultcode = null;

		if(this._response)
			resultcode = this._response.resultCode;

		return resultcode;
	}

	getMessagetype(){
		var message = null;

		if(this._response){
			message = this._response.message;
		}
		
		return message;
	}

	beforeExecute() {
	}

	execute(callback) {
		logger.debug('Enter APIOperationBase execute');

		this._endpoint = config.endpoint;

		logger.debug(this._endpoint);

		this.beforeExecute();

		var obj = this;

		logger.debug('Request: ' + JSON.stringify(this._request, 2, null));

		var reqOpts = {
			url: this._endpoint,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': this._request.length
			},
			json: true,
			timeout: config.timeout,
			body: this._request
		};

		if(config.proxy.setProxy){
			reqOpts['proxy'] = config.proxy.proxyUrl;
		}

		request(reqOpts, function(error, response, body){
			if(error) {
				logger.error(error);
			} else 
			{
				//TODO: slice added due to BOM character. remove once BOM character is removed.
				var responseObj = JSON.parse(body.slice(1));
				logger.debug('Response: ' + JSON.stringify(responseObj, 2, null));
				obj._response = responseObj;
				/*
				var jsonResponse = JSON.stringify(body);
				console.log("escaped body : '" + escape(jsonResponse) + "'");
				console.log("body : '" + jsonResponse + "'");
				logger.debug("Response: " + JSON.stringify(body, 2, null));
				obj._response = body;
				*/
				callback();
			}
		});

		logger.debug('Exit APIOperationBase execute');
	}
}

module.exports.APIOperationBase = APIOperationBase;