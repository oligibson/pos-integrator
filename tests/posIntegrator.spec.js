'use strict';

// These tests are examples to demo how you may implement testing of bower component injection etc, these will likely fail

describe('Init', function () {
    var provider, initSpy, outgoingSpy;

    // Get the provider
    beforeEach(module('pos.integrator', function ($posProvider) {
        // This callback is only called during instantiation
        provider = $posProvider;
    }));

    // Kick off the above function
    beforeEach(inject(function () {}));

    beforeEach(function(done){
        initSpy = spyOn(provider, 'init');
        //outgoingSpy = spyOn(parent, 'postMessage');
        done();
    });

    beforeEach(function(done){
        provider.init('http://pos.com');
        done();
    });

    it('should be called', function () {
        expect(initSpy).toHaveBeenCalled();
    });

    //it('send a message to pos controller to show completed initialisation', function () {
    //    expect(outgoingSpy).toHaveBeenCalled();
    //});
});

describe('Synchronous Messages to Gravity', function () {

    var pos, provider, router;

    var items = [{
        "itemID":"12345",
        "microserviceReferenceID":"987654321"
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
        console.info = spyOn(console, 'info');
    }));

    it('Dismiss should send a message to the console in development mode', function(){
        pos.dismiss();
        expect(console.info.calls.mostRecent().args[1].messageType).toEqual("Dismiss");
    });

    it('Add Item should send an message to the console in development mode', function(){
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


describe('Get Scale Weights', function () {

    var pos, provider, router, incomingMessageSpy, returnedMessage;

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



    //beforeEach(function () {
    //    incomingMessageSpy = spyOn(provider, 'routePOSCtrlMessage').and.callThrough();
    //});

    it('Should send a message to POS Controller and receive a response', function(){
        expect(returnedMessage).toBeDefined();

        //var message = {data: {messageType: 'ReadScaleResponse', correlationID: '987654321'}};
        //// This needs to have a spec passed in!
        //provider.routePOSCtrlMessage(message, router.spec);
        //expect(incomingMessageSpy).toHaveBeenCalled();
    })

    //it('should call routePOSCtrlMessage', function () {
    //    var message = {data: {messageType: 'ReadScaleResponse', correlationID: '123456789'}};
    //    provider.routePOSCtrlMessage(message);
    //    expect(incomingMessageSpy).toHaveBeenCalled();
    //});
});


//describe('POS Integrator outbound functions', function () {
//    var pos, outgoingSpy;
//
//    beforeEach(function(){
//        module('pos.integrator');
//    });
//
//    beforeEach(inject(function($pos){
//        pos = $pos;
//    }));
//
//    beforeEach(function(){
//        outgoingSpy = spyOn(parent, 'postMessage');
//    });
//
//    it('should send a dismiss message', function(){
//        var message = {
//            messageType: 'Dismiss'
//        };
//        pos.dismiss();
//        expect(outgoingSpy).toHaveBeenCalledWith(message, '*');
//    });
//
//    it('should send an add item message', function(){
//        var message = {
//            "messageType":"AddItem",
//            "details": {
//                "items": {
//                    "item": [
//                        {
//                            "itemID":"12345",
//                            "microserviceReferenceID":"987654321"
//                        }
//                    ]
//                }
//            }
//        };
//        pos.addItem(message.details.items.item);
//        expect(outgoingSpy).toHaveBeenCalledWith(message, '*');
//    });
//
//    it('should send a collect information response', function(){
//        var message = {
//            "messageType": " CollectInformationResponse",
//            "correlationID": "123456789",
//            "details": {
//                "collectionType":"VATCustomerInfo",
//                "status":"success",
//                "customerReferenceID":"222333"
//            }
//        };
//        pos.collectInfoResponse(message.correlationID, message.details);
//        expect(outgoingSpy).toHaveBeenCalledWith(message, '*');
//    });
//
//});
//
//describe('POS Integrator outbound functions', function () {
//    var pos, outgoingSpy;
//
//    beforeEach(function(){
//        module('pos.integrator');
//    });
//
//    beforeEach(inject(function($pos){
//        pos = $pos;
//    }));
//
//    it('should send a dismiss message', function(){
//        pos.test();
//    });
//
//});
//
//describe('Print', function () {
//
//    var pos, provider, incomingMessageSpy;
//
//    // Get the provider
//    beforeEach(module('pos.integrator', function ($posProvider) {
//        // This callback is only called during instantiation
//        provider = $posProvider;
//    }));
//
//    // Kick off the above function
//    beforeEach(inject(function ($pos) {
//        pos = $pos;
//    }));
//
//    beforeEach(function () {
//        incomingMessageSpy = spyOn(provider, 'routePOSCtrlMessage').and.callThrough();
//    });
//
//    it('Should send a message to POS Controller and receive a response', function(){
//        pos.print("Receipt", function(err, res){
//            if(err){
//                console.log(err);
//            }
//            console.log(res);
//            //expect(res).toBeDefined();
//        });
//
//        //var message = {data: {messageType: 'ReadScaleResponse', correlationID: '987654321'}};
//        //provider.routePOSCtrlMessage(message);
//        //expect(incomingMessageSpy).toHaveBeenCalled();
//    })
//
//    it('should call routePOSCtrlMessage', function () {
//        var message = {data: {messageType: 'ReadScaleResponse', correlationID: '123456789'}};
//        provider.routePOSCtrlMessage(message);
//        expect(incomingMessageSpy).toHaveBeenCalled();
//    });
//});
//
//describe('Message', function () {
//
//    var spy, pos;
//
//    beforeEach(function(){
//        module('pos.integrator');
//    });
//
//    beforeEach(inject(function($pos){
//        pos = $pos;
//        pos.init();
//    }));
//
//    //beforeEach(function(done) {
//    //
//    //    spy = spyOn(pos, 'routePOSCtrlMessage');
//    //    spy();
//    //    done();
//    //
//    //});
//
//    beforeEach(function(done) {
//
//        self.postMessage('test', '*');
//        done();
//
//    });
//
//    it('Should trigger message event', function (done) {
//        //expect(spy).toHaveBeenCalled();
//        done();
//    });
//
//
//});

//describe('Message', function () {
//
//    var spy;
//
//    beforeEach(function(done) {
//
//        spy = jasmine.createSpy('message');
//
//        window.addEventListener('message', function (e) {
//            console.log(Object.keys(e), e.data);
//            spy();
//            done();
//        });
//
//        self.postMessage('test', '*');
//
//    });
//
//    it('Should trigger message event', function () {
//        expect(spy).toHaveBeenCalled();
//    });
//
//});