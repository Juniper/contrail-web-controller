module("Configure DNS Server", {
	//Initiate view files.
    setup: function() {
    },
    //Called when any test case is completed 
    teardown: function() {
    }
});

test('ucfirst', function(){
    equal(ucfirst(null), '-', 'valid value for input null');
    equal(ucfirst('abc'), 'Abc', 'valid value for input abc');    
});
