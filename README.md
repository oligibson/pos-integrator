# Post Office POS Integrator Component
=============================

The Post Office POS Integrator Component is a Bower component that provides a wrapper for the HTML5 iFrame messaging to the POS Controller.

## Install
----------

You can install this package with bower.

```
bower install git+ssh://git@po.toolbox:7999/cm/pos-integrator.git#~0.0.2  
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

After installing the package you need to initialise the POS Integrator to allow it to listen for messages from the POS Controller and confirm the Microservice has launched successfully.

```
App.config(function($posProvider) {
  
  $posProvider.init();
  
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

  var provider, incomingMessageSpy;

  beforeEach(module('pos.integrator', function ($posProvider) {
    provider = $posProvider;
    incomingMessageSpy = spyOn(provider, 'routePOSCtrlMessage');
  }));

  beforeEach(inject(function () {}));

  it('should call routePOSCtrlMessage', function () {
  	// This is an example message
    var message = {data: {messageType: 'SignOn'}};
    provider.routePOSCtrlMessage(message);
    expect(incomingMessageSpy).toHaveBeenCalled();
  });
});
```

