'use strict';

var chai = require('chai'),
		expect = chai.expect,
		request = require('supertest'),
		express = require('express'),
		bodyParser = require('body-parser'),
		router = express.Router();

var api = require('../lib');
var app;

app = express();
app.use(bodyParser.json());

describe('API request', function(){
	describe('with default configuration,', function() {
		beforeEach(function(done){
			app.use(api());
			done();
		});
		
		describe('action GET /api/config', function() {
			it('respond with 200', function(done){
				request(app)
					.get('/api/config')
					.expect(200, done);
			});

			it('respond with a json config data', function(done) {
				request(app)
					.get('/api/config')
					.set('Accept', 'application/json')
					.end(function(err, res) {
						expect(res.body).to.have.property("baseUrl");
						expect(res.body).to.have.property("models");
						done();
					});
			});

			it('contains as baseURL /api', function(done) {
				request(app)
					.get('/api/config')
					.set('Accept', 'application/json')
					.end(function(err, res) {
						expect(res.body).to.have.property("baseUrl");
						expect(res.body.baseUrl).to.be.equal('/api');
						done();
					});
			});
			
			it('contains just one resource named "samples"', function(done) {
				app.use(api());
				request(app)
					.get('/api/config')
					.set('Accept', 'application/json')
					.end(function(err, res) {
						expect(res.body.models).to.be.an('Array');
						expect(res.body.models).to.contain('samples');
						expect(res.body.models.length).to.be.equal(1);
						done();
					});
			});			
		});
		
		describe('action GET /api/samples', function() {
			it('respond with 200', function(done){
				request(app)
					.get('/api/samples')
					.expect(200, done);
			});
			it('respond with an emtpy array', function(done){
				request(app)
					.get('/api/samples')
					.set('Accept', 'application/json')
					.expect(200)
					.end(function(err,res) {
						expect(res.body).to.be.an('Array');
						expect(res.body.length).to.be.empty;
						done();
					});
			});
		});
		
		describe('action POST /api/samples', function(){
			it('respond with 400 if body is empty', function(done){
				request(app)
					.post('/api/samples')
					.send({})
					.expect(400, done);
			});
			it('add new items in samples collection', function(done){
				var newObj = { name: 'sample01', msg: 'test function' };
				var newId;
				
				request(app)
					.post('/api/samples')
					.send(newObj)
					.set('Accept', 'application/json')
					.expect(201)
					.end(function(err, res){
						expect(res.body).to.have.property("id");
						expect(res.body.id).to.be.ok;
						expect(res.body).to.have.property("name");
						expect(res.body.name).to.be.deep.equal(newObj.name);
						expect(res.body).to.have.property("msg");
						expect(res.body.msg).to.be.deep.equal(newObj.msg);
					
						newId = res.body.id;

						request(app)
							.get('/api/samples/' + newId)
							.set('Accept', 'application/json')
							.expect(200)
							.end(function(err, res) {
								expect(res.body).to.have.property("id");
								expect(res.body.id).to.be.deep.equal(newId);
								expect(res.body).to.have.property("name");
								expect(res.body.name).to.be.deep.equal(newObj.name);
								expect(res.body).to.have.property("msg");
								expect(res.body.msg).to.be.deep.equal(newObj.msg);						
								done();
						});
					});
				
				
			});
		});

		describe('action PUT /api/samples/:id', function(){
			it('respond with 400 if body is empty', function(done){
				request(app)
					.put('/api/samples/1')
					.send({})
					.set('Accept', 'application/json')
					.expect(400, done);
			});
			it('respond with 404 if "id" is not found', function(done){
				request(app)
					.put('/api/samples/22')
					.send({ name: 'sample22' })
					.set('Accept', 'application/json')
					.expect(404, done);
			});
			it('edit new items in samples collection', function(done){
				var updObj = { id: 1, name: 'sample01 updated', msg: 'test function updated' };
				
				request(app)
					.put('/api/samples/' + updObj.id)
					.send(updObj)
					.set('Accept', 'application/json')
					.expect(200)
					.end(function(err, res) {
						expect(res.body).to.have.property("id");
						expect(res.body.id).to.be.deep.equal(updObj.id);
						expect(res.body).to.have.property("name");
						expect(res.body.name).to.be.deep.equal(updObj.name);
						expect(res.body).to.have.property("msg");
						expect(res.body.msg).to.be.deep.equal(updObj.msg);						
						done();
					});
			});
		});

		describe('action DELETE /api/samples/:id', function(){
			it('respond with 404 if "id" is not found', function(done){
				request(app)
					.delete('/api/samples/22')
					.expect(404, done);
			});
			it('edit new items in samples collection', function(done){
				var delId = 1;
				request(app)
					.delete('/api/samples/' + delId)
					.expect(200)
					.end(function(err, res) {
						
						request(app)
							.get('/api/samples/' + delId)
							.expect(404, done);
					});
			
			});
		});
		
		describe('action GET for a different resource than samples', function() {
			it('respond with 404', function(done){
				request(app)
					.get('/api/customers')
					.expect(404);

				request(app)
					.get('/api/users')
					.expect(404);
				
				request(app)
					.get('/api/products')
					.expect(404, done);				
			});
		});		
		
		describe('outside baseUrl', function() {
			it('respond with 400', function(done) {
				request(app)
					.get('/')
					.expect(400);

				request(app)
					.post('/')
					.expect(400);
				
				request(app)
					.get('/sample')
					.expect(400, done);			
			});
		});
	});

}); 