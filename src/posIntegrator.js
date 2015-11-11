'use strict'

var $routerSpec =  {
    SignOn: {
        messageType: 'SignOn',
        execute: function(){
            console.log('Sign On message received');
        }
    },
    SignOff: {
        messageType: 'SignOff',
        execute: function(){
            console.log('SignOff message received');
        }
    },
    Barcode: {
        messageType: 'Barcode',
        execute: function(){
            console.log('Barcode message received');
        }
    },
    ReadScaleResponse: {
        messageType: 'ReadScaleResponse',
        messagesAwaitingResponse: [],
        execute: function(publisherData){
            if(this.messagesAwaitingResponse.length > 0){
                var found = false;
                for(var i=0; i < this.messagesAwaitingResponse.length; i++){
                    if(this.messagesAwaitingResponse[i].id === publisherData.correlationID){
                        found = true;
                        this.messagesAwaitingResponse[i].callback(null, publisherData);
                        this.messagesAwaitingResponse.splice(i, 1);
                        break;
                    }
                }
                if(found != true){ console.warn('ReadScaleResponse could not be handled')}
            }else{
                console.warn('ReadScaleResponse could not be handled');
            }
        }
    },
    PrintJobResponse: {
        messageType: 'PrintJobResponse',
        messagesAwaitingResponse: [],
        execute: function(){
            console.log('PrintJobResponse message received');
        }
    },
    StatusMessage: {
        messageType: 'StatusMessage',
        execute: function () {
            console.log('StatusMessage message received');
        }
    },
    CollectInformationRequest: {
        messageType: 'CollectInformationRequest',
        execute: function(){
            console.log('CollectInformationRequest message received');
        }
    }
};

function $posProvider(){

    var posCtrlURI = '*';

    var devMode = false;

    this.routePOSCtrlMessage = function (event) {

        var router = $routerSpec;

        var publisherData = event.data;
        if (typeof publisherData === 'object' && publisherData.messageType) {
            for(var key in router){
                if(router[key].messageType === publisherData.messageType){
                    router[key].execute(publisherData);
                    break;
                }
            }
        }
    };

    function sendMessage(message) {
        if(devMode){
            console.info('Mock Message Sent to POS Controller in Development Mode. Message:', message);
        }else{
            parent.postMessage(message, posCtrlURI);
        }
    }

    this.init = function(dev) {
        if(dev){
            devMode = dev;
        }
        if (window.addEventListener) {
            window.addEventListener('message', this.routePOSCtrlMessage, false);
        }
        var message = {
            messageType: 'InitMicroservice'
        };
        sendMessage(message);
    };


    this.$get = $get;
    function $get(){

        var callBackListener = function(id, callback){
            this.id = id;
            this.callback = callback;
        };

        var messageBuilder = function(type, id, details){
            this.messageType = type;
            if(id != undefined){this.correlationID = id;}
            if(details != undefined){this.details = details;}
        };

        return {
            dismiss: function(){
                var message = new messageBuilder("Dismiss");
                sendMessage(message);
            },
            addItem: function (items) {
                var message = new messageBuilder("AddItem", undefined, {"items": {"item": items}});
                sendMessage(message);
            },
            collectInfoResponse: function (id, response) {
                var message = new messageBuilder("CollectInformationResponse", id, response);
                sendMessage(message);
            },
            getWeight: function(callback){
                var message = new messageBuilder("ReadScaleRequest", parseInt(Math.random()*1000000000, 10).toString(), {"timeoutMillis":"3000"});
                $routerSpec.ReadScaleResponse.messagesAwaitingResponse.push(new callBackListener(message.correlationID, callback));
                sendMessage(message);
            },
            print: function(items, callback){
                
            }
        };
    }
}

angular.module('pos.integrator', []).provider('$pos', $posProvider);