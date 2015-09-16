/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module("Configure Service instance", {
	//Initiate view files.
	setup: function() {
    	document.body.innerHTML+=window.__html__['webroot/config/services/instances/views/svcinstances_config.view'];
        document.body.innerHTML+=window.__html__['webroot/config/services/instances/views/svcinstances_config_ut.view'];
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

test("get Power State ucase", function() {
    expect(10);
    equal(ServicesInstancesObj.getPowerState(0), "NOSTATE", 'powerState Valid');
    equal(ServicesInstancesObj.getPowerState(1), "RUNNING", 'powerState Valid');
    equal(ServicesInstancesObj.getPowerState(3), "PAUSED", 'powerState Valid');
    equal(ServicesInstancesObj.getPowerState(4), "SHUTDOWN", 'powerState Valid');
    equal(ServicesInstancesObj.getPowerState(6), "CRASHED", 'powerState Valid');
    equal(ServicesInstancesObj.getPowerState(7), "SUSPENDED", 'powerState Valid');
	equal(ucfirst("test"),"Test", "Case converted");
	equal(getID("interface_0_ddnetwork"),0 , "Returning ID is fine");
	equal(getID(undefined),-1 , "Returning ID is fine");
    equal(getID(""),-1 , "Returning ID is fine");
});
function noop(){}
function returnTrue(){return true;}
test("refreshInstence", function() {
	svcInstanceTimer = null;
	ServicesInstancesObj.reloadSvcInstancePage();
    equal(svcInstanceTimer,null,'Reload is Fine');
    ServicesInstancesObj.refreshSvcInstances(false);	
	equal(svcInstanceTimer,null,'Valid');
	TimerLevel = 0;
	TimerArray = [20000,35000,45000,55000,65000];
	ServicesInstancesObj.reloadSvcInstancePage = noop();
    ServicesInstancesObj.refreshSvcInstances(true);
	equal(TimerLevel,1,'Valid');
	equal(typeof svcInstanceTimer,"number",'Valid');
});

/*
test("ajaxcall", function(){
    //expect(1);
    this.server.respondWith("GET", "/api/tenants/config/domains/",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(SIMock.getDomainsMockData())]);
		
    this.server.respondWith("GET", "/api/tenants/config/projects/",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(SIMock.getProjectsMockData())]);

    this.server.respondWith("GET", "/api/tenants/config/service-instance-templates/",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(SIMock.getServiceTemplateMockData())]);    

    this.server.respondWith("GET", "/api/tenants/config/service-instances-status/",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(SIMock.getServiceInstListMockData())]);
	
    this.server.respondWith("GET", "/api/tenants/config/list-service-instances/",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(SIMock.getServiceInstStatusMockData())]);
	
    this.server.respondWith("GET", "/api/tenants/config/service-template-images",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(SIMock.getImagesMockData())]);
		
    this.server.respondWith("GET", "/api/tenants/config/virtual-networks",
        [200, { "Content-Type": "application/json" },
        JSON.stringify(SIMock.getNetworkMockData())]);
    
	
	//var viewStr = SIMock.getViewData();
	//u.loadDom(viewStr);
	
	//var domStr = SIMock.getdomData();
	var domStr = SIMock.getAlldomData();
	u.loadDom(domStr);
	//ServicesInstances();
    
    //ok(ServicesInstancesObj.load(), "Instences Loaded");
	//ok(ServicesInstancesObj.init(), "Instences Loaded");
	 
	ddDomain = $("#ddDomainSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
    });
	ddProject = $("#ddProjectSwitcher").contrailDropdown({
        dataTextField:"text",
        dataValueField:"value",
    });
	ok(ServicesInstancesObj.populateDomains(SIMock.getDomainsMockData()), "Populate domail is fine");
	equal(ServicesInstancesObj.populateDomains(""),false, "Populate domail fail is fine");
	//ok(ServicesInstancesObj.populateProjects(SIMock.getProjectsMockData()),"Populate Domain is fine");
	ok(ServicesInstancesObj.successTemplateDetail(SIMock.getServiceTemplateMockData()),"Template is fine");
	equal(ServicesInstancesObj.fetchDataForGridsvcInstances(),true,"GridInstances case1 is fine");
	//ok(ServicesInstancesObj.successHandlerForGridsvcInstance(SIMock.getServiceInstListMockData()),"Instence grid is fine");
	//ok(ServicesInstancesObj.successHandlerForGridStatusUpdate(SIMock.getServiceInstStatusMockData()),"Instance Update is fine");
	ok(ServicesInstancesObj.getServiceMode("nat-template") , "Service Instence Mode case 1 is fine");
	equal(ServicesInstancesObj.getServiceMode("") ,"Unknown", "Service Instence Mode case 2 is fine");
    equal(ServicesInstancesObj.getServiceMode("Junk") ,"Unknown", "Service Instence Mode case 3 is fine");
	ok(ServicesInstancesObj.getTemplateOrder("nat-template") , "Template Order is fine");
    ok(ServicesInstancesObj.getTemplateDetail("nat-template") , "Fetching template Detail is fine");
    ok(ServicesInstancesObj.getTemplateDetail("") , "Fetching template Detail empty is fine");
	ok(ServicesInstancesObj.getTemplateDetail(null) , "Fetching template Detail empty is fine");
	templateImages = jsonPath(SIMock.getImagesMockData(), "$..name");
	equal(ServicesInstancesObj.checkServiceImage("sugarcrm") ,true, "Service Instence Image is fine.");
    equal(ServicesInstancesObj.checkServiceImage("") , false ,"Service Instence Image is fine with empty.");
    equal(ServicesInstancesObj.checkServiceImage(null) , false ,"Service Instence Image is fine with null.");
	ok(ServicesInstancesObj.svcInstancesCreateWindow, "Create Loading is fine");
	//ok(ServicesInstancesObj.closeAllStaticRout, "Close all static rout is fine.");
    //ok(ServicesInstancesObj.clearPopupValues, "clear popup is fine.");
    //ok(ServicesInstancesObj.editWindow, "Edit is fine");
	$(ddDomain).text("");
    equal(ServicesInstancesObj.fetchDataForGridsvcInstances(),false,"GridInstances empty case is fine");
	ok(ServicesInstancesObj.destroy, "Destroy is fine");
    u.clearDom();
});
*/
