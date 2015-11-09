'use strict'

function $posProvider(){

    var posCtrlURI = '*';

    this.routePOSCtrlMessage = function (event) {
        console.log(event.data.messageType);
        var publisherData = event.data;
        if (typeof publisherData === 'object' && publisherData.messageType) {
            if (publisherData.messageType === 'SignOn') {
                console.log('Sign On message received');
            }
            else if (publisherData.messageType === 'SignOff') {
                console.log('SignOff message received');
            }
            else if (publisherData.messageType === 'Product') {
                console.log('Product message received');
            }
            else if (publisherData.messageType === 'Barcode') {
                console.log('Barcode message received');
            }
            else if (publisherData.messageType === 'ReadScaleResponse') {
                console.log('ReadScaleResponse message received');
            }
            else if (publisherData.messageType === 'PrintJobResponse') {
                console.log('PrintJobResponse message received');
            }
            else if (publisherData.messageType === 'StatusMessage') {
                console.log('StatusMessage message received');
            }
            else if (publisherData.messageType === 'CollectInformationRequest') {
                console.log('CollectInformationRequest message received');
            }
            else if (publisherData.messageType === 'CardEntry') {
                console.log('CardEntry message received');
            }
            else if (publisherData.messageType === 'BankingTransactionResponse') {
                console.log('BankingTransactionResponse message received');
            }
            else if (publisherData.messageType === 'PrePayResponse') {
                console.log('PrePayResponse message received');
            }
            else if (publisherData.messageType === 'NonPaymentResponse') {
                console.log('NonPaymentResponse message received');
            }
        }
    };

    function sendMessage(message) {
        parent.postMessage(message, posCtrlURI);
    }

    this.init = function() {
        console.log('POS Integrator Initiated');
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
        return {
            dismiss: function(){
                console.log('Dismiss');
                var message = {
                    messageType: 'Dismiss'
                };
                sendMessage(message);
            },
            addItem: function (items) {
                var message = {
                    "messageType": "AddItem",
                    "details": {
                        "items": {
                            "item": items
                        }
                    }
                };
                sendMessage(message);
            },
            collectInfoResponse: function (id, response) {
                var message = {
                    "messageType": " CollectInformationResponse",
                    "correlationID": id,
                    "details": response
                };
                sendMessage(message);
            }
        };
    }
}

angular.module('pos.integrator', []).provider('$pos', $posProvider);