module.exports = function(){
    global.unroll = function (itCallback, toUnroll) {
        /*jshint loopfunc:true */
        for (var i in toUnroll) {
            (itCallback)(toUnroll[i]);
        }
    };
};