# Post Office POS Integrator Component
--------------------------------------

The Post Office POS Integrator Component is a Bower component that provides a wrapper for the HTML5 iFrame messaging to the POS Controller.

## Still To DO
--------------
* Write methods for microservice to listen for gravity messages
* Write unit tests to get coverage above 80%
* Write a build pipeline


## Install
----------

You can install this package with bower.

```
bower install git+ssh://git@po.toolbox:7999/cm/pos-integrator.git#~0.0.6 --save  
```
Add a `<script>` to your `index.html`:


```<script src="bower_components/pos-integrator/src/posIntegrator.js"></script>
```

Then add `pos.integrator` as a dependency for your app:

```
angular.module('myApp', ['pos.integrator']);
```

## Initialisation
-----------------

After installing the package you need to initialise the POS Integrator to allow it to listen for messages from the POS Controller and confirm the Microservice has launched successfully. `$posProvider.init(posURL,devMode)` takes two parameters, `posURL` is a URL string for the POS Controller you want to message that must always be provided and `devMode`is an optional boolean value where `true` will allow the POS Integrator to mock messages to and from Toshiba Gravity.

```
App.config(function($posProvider) {
  
  $posProvider.init('http://poscontroller.com');
  
});
```

## POS Methods
--------------

POS Integrator exposes a number of methods to help you integrate with the POS Controller all of which can be accessed by passing `$pos` as a paramter into Angular Controller or Service functions.

### Dismiss

Sends a message to the POS Controller to unload the microservice.

```
$pos.dismiss();
```

### Add Item

Sends a message to the POS Controller to add items to the Toshiba Gravity basket and unload the microservice. Takes one param `items` which is an array of objects that define the items to be added to the basket.

```
var items = [{
		"itemID":"12345",
        "microserviceReferenceID":"987654321"
	},{
		"itemID":"54321",
        "microserviceReferenceID":"123456789"
	}];
	
$pos.addItem(items);
```

### Print Receipt

Sends a message to the POS Controller to print a receipt or document. The print function (`$pos.print(station, logo, storeInfo, tasks, callback)`) takes the following parameters:

* `station` - **String** - Can be either `"Receipt"` or `"Document"`.
* `logo` - **Boolean** - `true` will add the logo to the Receipt and `false` will remove it.
* `storeInfo`:  - **Boolean** - `true` will add the logo to the Receipt and `false` will remove it.
* `tasks`: - **Array** - Contains objects for each receipt line. e.g:

	```
[{
	"Type":"printLine",
	"Text":"Hello World 1"
},
{	"Type":"printImage",    "ImageNumber":"2"},{	"Type":"printBarcode",    "BarcodeType":"CODE128",    "BarcodeValue":"1234567890"}]
	```

* `callback` - **Function** - Must take `error` and `response` parameters.

Below is an example call to `$pos.print()`.


```
var tasks = [{               "Type":"printLine",               "Text":"Hello World 1"             },       		{         		"Type":"printImage",         		"ImageNumber":"2"       		}];       		
$pos.print("Receipt", true, false, tasks, function(error, response){
	if (!err) {
    	console.log(response);
  	}
});
```

### Get Weight

Sends a message to the POS Controller to request the weight from the scales attached to the Toshiba Gravity POS System. The function takes a callback function which should handle the weight response from Toshiba Gravity. The callback function should take two paramters `error` and `response`.

```
$pos.getWeight(function(error, response){
	if (!err) {
    	console.log(response);
  	}
});
```

### Collect Info Response

Sends a message to the POS Controller in response to a `collectInfoRequest` sent by Toshiba Gravity.  The function takes two params. `id` which is a string containing the correlation id that would be provided in a `collectInfoRequest` and `response` which is an object that will include the message details to be returned to Toshiba Gravity.

```
var id = "123456789";
var response = {
	"collectionType":"VATCustomerInfo",
    "status":"success",
    "customerReferenceID":"222333"
};
	
$pos.collectInfoResponse(id, response);
```


## Testing Microservice Integration
-----------------------------------

When developing microservices we need a way to test our integration with the POS Controller when it is not avaliable. To do this the POS Integrator can be used as a mock for POS Controller. 

### Mocking Outgoing Messages

Outgoing messages can be mocked by initialising the POS Integrator in dev mode. This involves passing `true` as a parameter into `$posProvider.init()`. This will prevent the POS Integrator sending messages to the POS Controller and instead log the messages to the console.

```
App.config(function($posProvider) {
  
  $posProvider.init(true);
  
});
```

### Mocking Incoming Messages

Incoming messages to the microservice can be mocked by calling the POS Integrator router function (`$posProvider.routePOSCtrlMessage()`). This should be called within microservice unit tests. An example of how to do this is below:

```
describe('Mock Incoming Messages', function () {

  var provider, router, incomingMessageSpy;

  beforeEach(module('pos.integrator', function ($posProvider,$routerProvider) {
    provider = $posProvider;
    router = $routerProvider;
    incomingMessageSpy = spyOn(provider, 'routePOSCtrlMessage').andCallThrough();
  }));

  beforeEach(inject(function () {}));

  it('should call routePOSCtrlMessage', function () {
  	// This is an example message
    var message = {data: {messageType: 'SignOn'}};
    provider.routePOSCtrlMessage(message, router.spec);
    expect(incomingMessageSpy).toHaveBeenCalled();
  });
});
```
### Example Incoming Messages

Below are example incoming messages that you may need to mock. These are for messages that will be sent from Toshiba Gravity without initiation from the microservice.

***Important***: `*** Common fields ***` are yet to be defined, do not include them in your current message testing.

#### Sign On

```
{  "messageType":"SignOn",  *** Common fields ***  "details": {    "welshLanguage":"false"   }}
```

#### Sign Off

```
{  "messageType":"SignOff",  *** Common fields ***}
```

#### Barcode Scan

```
{  "messageType":"Barcode",  *** Common fields ***  "details": {    "barcodeType":" CODE128",    "barcodeData":"1234567890"  }}
```

#### Status Message

```
{  "messageType":" StatusMessage",  *** Common fields ***  "details": {    "statusCode":"processing",    "text":"Processing…",    "canRequestCancel":"false"  }}
```

#### Collect Information Request

```
{  "messageType":" CollectInformationRequest",  "correlationID":"123456789",  *** Common fields ***  "details": {    "collectionType":"VATCustomerInfo"  }}
```
