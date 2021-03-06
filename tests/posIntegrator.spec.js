'use strict';

// These tests are examples to demo how you may implement testing of bower component injection etc, these will likely fail

describe('Init', function () {
    var provider, initSpy;

    // Get the provider
    beforeEach(module('pos.integrator', function ($posProvider) {
        provider = $posProvider;
    }));

    // Kick off the above function
    beforeEach(inject(function () {}));

    beforeEach(function(done){
        initSpy = spyOn(provider, 'init');
        done();
    });

    beforeEach(function(done){
        provider.init('http://pos.com');
        done();
    });

    it('should be called', function () {
        expect(initSpy).toHaveBeenCalled();
    });

});

describe('Synchronous Messages to Gravity', function () {

    var pos, provider, router;

    // Get the provider
    beforeEach(module('pos.integrator', function ($posProvider,$routerProvider) {
        provider = $posProvider;
        router = $routerProvider;
    }));

    // Kick off the above function
    beforeEach(inject(function ($pos) {
        pos = $pos;
        provider.init('*', true);
        console.info = spyOn(console, 'info');
    }));

    it('Dismiss should send a message to the console in development mode', function(){
        pos.dismiss();
        expect(console.info.calls.mostRecent().args[1].messageType).toEqual("Dismiss");
    });

    it('Add Item should send an message to the console in development mode', function(){
        var items = [{
            "itemID":"12345",
            "microserviceReferenceID":"987654321"
        }];
        pos.addItem(items);
        expect(console.info.calls.mostRecent().args[1].messageType).toEqual("AddItem");
        expect(console.info.calls.mostRecent().args[1].details.items.item).toEqual(items);
    });

    it('collectInfoResponse should send an message to the console in development mode', function(){
        var id = "123456789";
        var response = {
            "collectionType":"VATCustomerInfo",
            "status":"success",
            "customerReferenceID":"222333"
        };
        pos.collectInfoResponse(id, response);
        expect(console.info.calls.mostRecent().args[1].messageType).toEqual("CollectInformationResponse");
        expect(console.info.calls.mostRecent().args[1].correlationID).toEqual(id);
        expect(console.info.calls.mostRecent().args[1].details).toEqual(response);
    });

});


describe('pos.getWeight', function () {

    var pos, provider, router, returnedMessage;

    // Get the provider
    beforeEach(module('pos.integrator', function ($posProvider,$routerProvider) {
        provider = $posProvider;
        router = $routerProvider;
    }));

    // Kick off the above function
    beforeEach(inject(function ($pos) {
        pos = $pos;
        provider.init('*', true);
        console.info = spyOn(console, 'info')
    }));

    beforeEach(function(done){
        pos.getWeight(function(err, res){
            if(err){
                console.log(err);
            }
            returnedMessage = res;
            done();
        });
    });

    it('should send an message to the console in development mode and create a correlation id', function(){
        expect(console.info.calls.mostRecent().args[1].messageType).toEqual("ReadScaleRequest");
        expect(console.info.calls.mostRecent().args[1].correlationID).toBeDefined();
    });


    it('Should receive a response from POS Controller mock in development mode', function(){
        expect(returnedMessage.messageType).toEqual("ReadScaleResponse");
        expect(returnedMessage.details.status).toEqual("success");
    });
});



describe('pos.print', function () {

    var pos, provider, router, returnedMessage;
    var tasks = [{
        "Type":"printLine",
        "Text":"Hello World 1"
    }];

    // Get the provider
    beforeEach(module('pos.integrator', function ($posProvider,$routerProvider) {
        // This callback is only called during instantiation
        provider = $posProvider;
        router = $routerProvider;
    }));

    // Kick off the above function
    beforeEach(inject(function ($pos) {
        pos = $pos;
        provider.init('*', true);
        console.info = spyOn(console, 'info')
    }));

    beforeEach(function(done){
        pos.print("Receipt", true, false, tasks, function(err, res){
            if(err){console.log(err);}
            returnedMessage = res;
            done();
        });
    });

    it('should send an message to the console in development mode and create a correlation id', function(){
        expect(console.info.calls.mostRecent().args[1].messageType).toEqual("PrintJobRequest");
        expect(console.info.calls.mostRecent().args[1].correlationID).toBeDefined();
    });


    it('Should receive a response from POS Controller mock in development mode', function(){
        expect(returnedMessage.messageType).toEqual("PrintJobResponse");
        expect(returnedMessage.details.status).toEqual("success");
    });
});