'use strict';
Element.prototype.isRequired = function(){
    expect(angular.element(this).attr('required')).toBeDefined();
    return this;
};
Element.prototype.isNotRequired = function(){
    expect(angular.element(this).attr('required')).toBeUndefined();
    return this;
};
Element.prototype.hasCorrectNamingConvention = function(){
    var name = this.getAttribute('name');
    expect(this.getAttribute('id')).toEqual(name);
    expect(this.getAttribute('ng-model')).toEqual(name);
    return this;
};
Element.prototype.hasMaxLength = function(maxLength){
    expect(this.getAttribute('maxlength')).toEqual(maxLength);
    return this;
};
Element.prototype.hasMinLength = function(minLength){
    expect(this.getAttribute('minlength')).toEqual(minLength);
    return this;
};
Element.prototype.hasPoFormsInputClass = function(){
    expect(angular.element(this).hasClass('po-forms-input')).toBe(true);
    return this;
};
Element.prototype.hasValidPlaceholder = function(placeholder){
    expect(this.getAttribute('placeholder')).toEqual(placeholder); //'messages.' + this.getAttribute('name')
    return this;
};
Element.prototype.hasPattern = function(pattern){
    expect(this.getAttribute('ng-pattern')).toEqual(pattern);
    return this;
};