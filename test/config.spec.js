'use strict';

var chai = require('chai'),
		expect = chai.expect,
		request = require('supertest'),
		express = require('express'),
		bodyParser = require('body-parser'),
		router = express.Router();

var api = require('../lib');


describe('API configuration object', function(){
	var app = express();
	app.use(bodyParser.json());
	
	it('throw error if invalid', function(){
		expect(api.bind(api, { sample: 'test' })).to.throw(ReferenceError);
		expect(api.bind(api, { baseUrl: '/test' })).to.throw(ReferenceError);
		expect(api.bind(api, { models: 'samples' })).to.throw(ReferenceError);
		expect(api.bind(api, { baseUrl: '/test', models: 'samples' })).to.throw(ReferenceError);
	});
	
	it('contain a baseUrl string property and models array property', function(){
		expect(api.bind(api, { baseUrl: '/api', models: [ 'samples' ] }))
			.to.not.throw(ReferenceError);
	});

	it('override defaults configuration', function(done){
		var config = { baseUrl: '/newapi', models: [ 'customers' ] };
		app.use(api(config));
		
		var url = config.baseUrl + '/config';
		
		request(app)
			.get('/api/config')
			.expect(400);
		
		request(app)
			.get('/newapi/config')
			.set('Accept', 'application/json')
			.expect(200)
			.end(function(err, res){
				expect(res.body).to.have.property("baseUrl");
				expect(res.body.baseUrl).to.be.equal(config.baseUrl);
				expect(res.body).to.have.property("models");
				expect(res.body.models).to.be.an('Array');
				expect(res.body.models).to.contain('customers');
				expect(res.body.models.length).to.be.equal(1);			
				done();
			});
	});
}); 


describe('API with customers model', function(){
	var app = express();
	app.use(bodyParser.json());
	var config = { baseUrl: '/api', models: [ 'customers' ] };
	app.use(api(config));	

	describe('action GET /api/customers', function() {
		it('respond with 200', function(done){
			request(app)
				.get('/api/customers')
				.expect(200, done);
		});
		
		it('respond with an emtpy array', function(done){
			request(app)
				.get('/api/customers')
				.set('Accept', 'application/json')
				.expect(200)
				.end(function(err,res) {
					expect(res.body).to.be.an('Array');
					expect(res.body.length).to.be.empty;
					done();
				});
		});
	});

	describe('action POST /api/customers', function(){
		it('add new items in customers collection', function(done){
			var newCustomer = { firstname: 'John', lastname: 'Doe', state: 'IT', mail: 'john.doe@example.com'  };
			var newId;

			request(app)
				.post('/api/customers')
				.send(newCustomer)
				.set('Accept', 'application/json')
				.expect(201)
				.end(function(err, res){
					expect(res.body).to.have.property("id");
					expect(res.body.id).to.be.ok;
					expect(res.body).to.have.property("firstname");
					expect(res.body.firstname).to.be.deep.equal(newCustomer.firstname);
					expect(res.body).to.have.property("lastname");
					expect(res.body.lastname).to.be.deep.equal(newCustomer.lastname);
					expect(res.body).to.have.property("state");
					expect(res.body.state).to.be.deep.equal(newCustomer.state);
					expect(res.body).to.have.property("mail");
					expect(res.body.mail).to.be.deep.equal(newCustomer.mail);

					newId = res.body.id;

					request(app)
						.get('/api/customers/' + newId)
						.set('Accept', 'application/json')
						.expect(200)
						.end(function(err, res) {
							expect(res.body).to.have.property("id");
							expect(res.body.id).to.be.deep.equal(newId);
							expect(res.body).to.have.property("firstname");
							expect(res.body.firstname).to.be.deep.equal(newCustomer.firstname);
							expect(res.body).to.have.property("lastname");
							expect(res.body.lastname).to.be.deep.equal(newCustomer.lastname);
							expect(res.body).to.have.property("state");
							expect(res.body.state).to.be.deep.equal(newCustomer.state);
							expect(res.body).to.have.property("mail");
							expect(res.body.mail).to.be.deep.equal(newCustomer.mail);
							done();
					});
				});
		});
	});

	describe('action PUT /api/customers/:id', function(){
		it('respond with 400 if body is empty', function(done){
			request(app)
				.put('/api/customers/1')
				.send({})
				.set('Accept', 'application/json')
				.expect(400, done);
		});
		it('respond with 404 if "id" is not found', function(done){
			request(app)
				.put('/api/customers/22')
				.send({ name: 'sample22' })
				.set('Accept', 'application/json')
				.expect(404, done);
		});
		it('edit new items in customers collection', function(done){
			var updObj = { id: 1, firstname: 'Mark', lastname: 'White', state: 'US', mail: 'mark.white@example.com'  };
			request(app)
				.put('/api/customers/' + updObj.id)
				.send(updObj)
				.set('Accept', 'application/json')
				.expect(200)
				.end(function(err, res) {
					expect(res.body).to.be.deep.equal(updObj);
					done();
				});
		});
	});

	describe('action DELETE /api/customers/:id', function(){
		it('respond with 404 if "id" is not found', function(done){
			request(app)
				.delete('/api/customers/22')
				.expect(404, done);
		});
		it('edit new items in customers collection', function(done){
			var delId = 1;
			request(app)
				.delete('/api/customers/' + delId)
				.expect(200)
				.end(function(err, res) {

					request(app)
						.get('/api/customers/' + delId)
						.expect(404, done);
				});

		});
	});
		

	

});
