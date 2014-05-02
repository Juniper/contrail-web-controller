module("Configure Service instance", {
	//Initiate view files.
	setup: function() {
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;
        $.ajaxSetup({
            cache:true
        });
    },
    //Called when any test case is completed 
    teardown: function() {
    }
});
test("generalFunction", function() {
	ok(ServiceTemplatesObj,"Service Template Object available");
	equal(getID("interface_0_ddnetwork"),0 , "Returning ID is fine");
	equal(getID(undefined),-1 , "Returning ID is fine");
    equal(getID(""),-1 , "Returning ID is fine");
	equal(ucfirst("test"),"Test", "Case converted");
});
test("ajaxcall", function(){
    expect(0);
    this.server.respondWith("GET", "/api/tenants/config/domains/",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(STMock.getDomainsMockData())]);
		
    this.server.respondWith("GET", "/api/tenants/config/projects/",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(STMock.getProjectsMockData())]);
});