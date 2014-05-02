module("Configure DNS Record", {
	//Initiate view files.
    setup: function() {
    },
    //Called when any test case is completed 
    teardown: function() {
    }
});

test('isSpclChar', function(){
    equal(dnsRecordsConfigObj.isSpclChar('abc'), true, 'The API return value for input "abc" is true');
    equal(dnsRecordsConfigObj.isSpclChar(null), false, 'The API return value for input null is false');
    equal(dnsRecordsConfigObj.isSpclChar(undefined), false, 'The API return value for input undefined is false');
});