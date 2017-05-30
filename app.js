var restify = require('restify');
var restifyValidator = require('restify-validator');
var util = require('util');

var models = require('./models/index');

var error_messages = null;

function getAllContacts(request,response,next){
    models.Contact.findAll({})
        .then(function(contacts) {
        var data = {
            error: "false",
            data: contacts
        };

        response.send(data);
        next();
    });
}

function getAllDists(request,response,next){
    models.Dist.findAll({})
        .then(function(dists) {
        var data = {
            error: "false",
            data: dists
        };

        response.send(data);
        next();
    });
}

function getContact(request,response,next){

    models.Contact.find({
        where: {
            'id': request.params.id
        }
    }).then(function(contact) {
        var data = {
            error: "false",
            data: contact
        };

        response.send(data);
        next();
    });
}

function verifyRequiredParams(request){
    request.assert('first_name', 'first_name field is required').notEmpty();
    request.assert('last_name', 'last_name field is required').notEmpty();
    request.assert('mobile_no', 'mobile_no field is required').notEmpty();
    request.assert('email', 'email field is required').notEmpty();
    request.assert('email', 'valid email address is required').isEmail();

    var errors = request.validationErrors();
    if (errors) {
        error_messages = {
            error: "true",
            message : util.inspect(errors)
        };

        return false;
    }else{
        return true;
    }
}

function verifyRequiredParamsDist(request){
    request.assert('dist', 'dist field is required').notEmpty();

    var errors = request.validationErrors();
    if (errors) {
        error_messages = {
            error: "true",
            message : util.inspect(errors)
        };

        return false;
    }else{
        return true;
    }
}

function addContact(request,response,next){
    if (!verifyRequiredParams(request)){
        response.send(422,error_messages);
        return;
    }

    models.Contact.create({
        first_name: request.params['first_name'],
        last_name: request.params['last_name'],
        mobile_no: request.params['mobile_no'],
        email: request.params['email'],
    }).then(function(contact) {
        var data = {
            error: "false",
            message: "New contact created successfully",
            data: contact
        };

        response.send(data);
        next();
    });
}

function addDist(request,response,next){
    if (!verifyRequiredParamsDist(request)){
        response.send(422,error_messages);
        return;
    }

    models.Dist.create({
        dist: request.params['dist'],

    }).then(function(dist) {
        var data = {
            error: "false",
            message: "New dist created successfully",
            data: dist
        };

        response.send(data);
        next();
    });
}

function updateContact(request,response,next){
    if (!verifyRequiredParams(request)){
        response.send(422,error_messages);
        return;
    }

    models.Contact.find({
        where: {
            'id': request.params.id
        }
    }).then(function(contact) {
        if(contact){
            contact.updateAttributes({
                first_name: request.params['first_name'],
                last_name: request.params['last_name'],
                mobile_no: request.params['mobile_no'],
                email: request.params['email'],
            }).then(function(contact) {
                var data = {
                    error: "false",
                    message: "Updated contact successfully",
                    data: contact
                };

                response.send(data);
                next();
            });
        }
    });
}

function deleteContact(request,response,next){
    models.Contact.destroy({
        where: {
            id: request.params['id']
        }
    }).then(function(contact) {
        var data = {
            error: "false",
            message: "Deleted contact successfully",
            data: contact
        };

        response.send(data);
        next();
    });
}

var server = restify.createServer();

server.use(restify.bodyParser());
server.use(restify.queryParser());
server.use(restifyValidator);

server.get('/api/v1/contacts',getAllContacts);
server.get('/api/v1/dists',getAllDists);
server.get('/api/v1/contacts/:id',getContact);
server.post('/api/v1/contacts',addContact);
server.post('/api/v1/dists',addDist);
server.put('/api/v1/contacts/:id',updateContact);
server.del('/api/v1/contacts/:id',deleteContact);

server.listen(3000, function() {
    console.log('REST API Server listening at http://localhost:3000');
});