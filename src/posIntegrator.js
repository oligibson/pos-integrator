'use strict'

function $routerProvider(){

    function genericEventRouter(publisherData, spec){
        console.log(spec.messageType + ' message received');
        console.log('Message Received: ', publisherData);
    }

    function asyncRouter(publisherData, spec){
        if(spec.messagesAwaitingResponse.length > 0){
            var found = false;
            for(var i=0; i < spec.messagesAwaitingResponse.length; i++){
                if(this.messagesAwaitingResponse[i].id === publisherData.correlationID){
                    found = true;
                    // There is no proper error handling here to catch any errors sent by gravity or handling a timeout if no response is sent
                    spec.messagesAwaitingResponse[i].callback(null, publisherData);
                    spec.messagesAwaitingResponse.splice(i, 1);
                    break;
                }
            }
            if(found != true){ console.warn(spec.messageType + ' could not be handled')}
        }else{
            console.warn(spec.messageType + ' could not be handled');
        }
    }

    this.spec =  {
        SignOn: {
            messageType: 'SignOn',
            execute: genericEventRouter
        },
        SignOff: {
            messageType: 'SignOff',
            execute: genericEventRouter
        },
        Barcode: {
            messageType: 'Barcode',
            execute: genericEventRouter
        },
        ReadScaleResponse: {
            messageType: 'ReadScaleResponse',
            messagesAwaitingResponse: [],
            execute: asyncRouter
        },
        PrintJobResponse: {
            messageType: 'PrintJobResponse',
            messagesAwaitingResponse: [],
            execute: asyncRouter
        },
        StatusMessage: {
            messageType: 'StatusMessage',
            execute: genericEventRouter
        },
        CollectInformationRequest: {
            messageType: 'CollectInformationRequest',
            execute: genericEventRouter
        }
    };

    var that = this;
    this.$get = $get;
    function $get(){
        return {
            spec: that.spec
        };
    }
}

angular.module('pos.integrator.util', []).provider('$router', $routerProvider);

$posProvider.$inject = ['$routerProvider'];
function $posProvider($routerProvider){

    var posCtrlURI;
    var devMode = false;

    this.routePOSCtrlMessage = function (event, router) {
        var publisherData = event.data;
        if (typeof publisherData === 'object' && publisherData.messageType) {
            for(var key in router){
                if(router[key].messageType === publisherData.messageType){
                    router[key].execute(publisherData, router[key]);
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

    var that = this;
    this.init = function(posURL, dev) {
        // This should probably throw an error if no string is provided rather than setting to *
        typeof posURL === 'string' ? posCtrlURI = posURL : posCtrlURI = '*';

        if(dev){
            devMode = dev;
            posCtrlURI = '*';
        }

        if (window.addEventListener) {
            window.addEventListener('message', function(){
                that.routePOSCtrlMessage(this.event, $routerProvider.spec);
            }, false);
        }
        var message = {
            messageType: 'InitMicroservice'
        };
        sendMessage(message);
    };

    that = this;
    this.$get = $get;
    $get.$inject = ['$router'];
    function $get($router){

        var callBackListener = function(id, callback){
            this.id = id;
            this.callback = callback;
        };

        var messageBuilder = function(type, id, details){
            this.messageType = type;
            if(id != undefined){this.correlationID = id;}
            if(details != undefined){this.details = details;}
        };

        var mockMessageBuilder = function(type, id){
            messageBuilder.call(this, type, id, {"status":"success"});
            if(type === "ReadScaleResponse"){this.details.weight = "10.500";}
        };
        mockMessageBuilder.prototype = new messageBuilder();

        var printJobBuilder = function(type, id, details, logo, storeInfo, tasks){
            messageBuilder.call(this, type, id, details);
            this.details.printJob = {
                "POSReceipt": {
                    "ReceiptType": "microserviceChit",
                    "subtype": "basic",
                    "Chit": {}
                }
            };
            var chit = this.details.printJob.POSReceipt.Chit;
            logo === true ? chit.PrintHeaderLogo = "Y" : chit.PrintHeaderLogo = "N";
            storeInfo === true ? chit.PrintHeaderStoreInfo = "Y" : chit.PrintHeaderStoreInfo = "N";
            chit.Tasks = {
                Task: tasks
            };
        };
        printJobBuilder.prototype = new messageBuilder();

        var asyncMock = function(type, id){
            var event = {data: new mockMessageBuilder(type, id)};
            setTimeout(function(){
                that.routePOSCtrlMessage(event, $router.spec);
            }, 1000);
        };

        return {
            dismiss: function(){
                var message = new messageBuilder("Dismiss");
                sendMessage(message);
            },
            addItem: function(items) {
                var message = new messageBuilder("AddItem", undefined, {"items": {"item": items}});
                sendMessage(message);
            },
            collectInfoResponse: function(id, response) {
                var message = new messageBuilder("CollectInformationResponse", id, response);
                sendMessage(message);
            },
            getWeight: function(callback){
                var message = new messageBuilder("ReadScaleRequest", parseInt(Math.random()*1000000000, 10).toString(), {"timeoutMillis":"3000"});
                $router.spec.ReadScaleResponse.messagesAwaitingResponse.push(new callBackListener(message.correlationID, callback));
                sendMessage(message);
                if(devMode){asyncMock("ReadScaleResponse", message.correlationID);}
            },
            print: function(station, logo, storeInfo, tasks, callback){
                var message = new printJobBuilder("PrintJobRequest", parseInt(Math.random()*1000000000, 10).toString(), {"station": station}, logo,  storeInfo, tasks);
                $router.spec.PrintJobResponse.messagesAwaitingResponse.push(new callBackListener(message.correlationID, callback));
                sendMessage(message);
                if(devMode){asyncMock("PrintJobResponse", message.correlationID);}
            }
        };
    }
}

angular.module('pos.integrator', ['pos.integrator.util']).provider('$pos', $posProvider);