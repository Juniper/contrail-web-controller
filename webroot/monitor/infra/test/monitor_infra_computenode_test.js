/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module("Infra Compute Node",{
    //Called before executing any test case under this module
    setup: function() {
    	//cmpNodeView.initInfraViewModel();
    	var cmpNodeView = new computeNodeView();
    },
    //Called when any test case is completed 
    teardown: function() {

    }
});
/*
test("testGettingStatusForAllvRouterProcesses", function() {
    //Declare the number of assert statements in current test case
    expect(1);
    deepEqual(getStatusesForAllvRouterProcesses(infraComputeMockData.getInput({fnName:'getStatusesForAllvRouterProcesses',type:'PROCESS_STATE_LIST'})),
        infraComputeMockData.getOutput({fnName:'getStatusesForAllvRouterProcesses',type:'PROCESS_STATE_LIST'}),'Testing getStatusesForAllvRouterProcesses');
    //Test vRouter parsing with config missing
});*/

test("testParseInterfaceData", function() {
    //Declare the number of assert statements in current test case
    expect(4);
    deepEqual(cmpNodeView.parseInterfaceData(infraComputeMockData.getInput({fnName:'parseInterfaceData',type:'test1'})),
        infraComputeMockData.getOutput({fnName:'parseInterfaceData',type:'test1'}),'Test parseInterfaceData with valid data');
    deepEqual(cmpNodeView.parseInterfaceData(infraComputeMockData.getInput({fnName:'parseInterfaceData',type:'test2'})),
            infraComputeMockData.getOutput({fnName:'parseInterfaceData',type:'test2'}),'Test parseInterfaceData with valid data');
    deepEqual(cmpNodeView.parseInterfaceData(infraComputeMockData.getInput({fnName:'parseInterfaceData',type:'test3'})),
            infraComputeMockData.getOutput({fnName:'parseInterfaceData',type:'test3'}),'Test parseInterfaceData with empty object data');
    deepEqual(cmpNodeView.parseInterfaceData(infraComputeMockData.getInput({fnName:'parseInterfaceData',type:'test4'})),
            infraComputeMockData.getOutput({fnName:'parseInterfaceData',type:'test4'}),'Test parseInterfaceData with null data');
});

test("testParseVNData", function() {
    //Declare the number of assert statements in current test case
    expect(3);
    deepEqual(cmpNodeView.parseVNData(infraComputeMockData.getInput({fnName:'parseVNData',type:'test1'})),
        infraComputeMockData.getOutput({fnName:'parseVNData',type:'test1'}),'Test parseVNData with valid data');
    deepEqual(cmpNodeView.parseVNData(infraComputeMockData.getInput({fnName:'parseVNData',type:'test2'})),
            infraComputeMockData.getOutput({fnName:'parseVNData',type:'test2'}),'Test parseVNData with valid data');
    deepEqual(cmpNodeView.parseVNData(infraComputeMockData.getInput({fnName:'parseVNData',type:'test3'})),
            infraComputeMockData.getOutput({fnName:'parseVNData',type:'test3'}),'Test parseVNData with empty object data');
});

test("testParseUnicastRoutesData", function() {
    //Declare the number of assert statements in current test case
    expect(2);
    deepEqual(cmpNodeView.parseUnicastRoutesData(infraComputeMockData.getInput({fnName:'parseUnicastRoutesData',type:'test1'})),
        infraComputeMockData.getOutput({fnName:'parseUnicastRoutesData',type:'test1'}),'Test parseUnicastRoutesData with valid data');
    deepEqual(cmpNodeView.parseUnicastRoutesData(infraComputeMockData.getInput({fnName:'parseUnicastRoutesData',type:'test2'})),
            infraComputeMockData.getOutput({fnName:'parseUnicastRoutesData',type:'test2'}),'Test parseUnicastRoutesData with valid data');
});

test("testParseMulticastRoutesData", function() {
    //Declare the number of assert statements in current test case
    expect(2);
    deepEqual(cmpNodeView.parseMulticastRoutesData(infraComputeMockData.getInput({fnName:'parseMulticastRoutesData',type:'test1'})),
        infraComputeMockData.getOutput({fnName:'parseMulticastRoutesData',type:'test1'}),'Test parseMulticastRoutesData with valid data');
    deepEqual(cmpNodeView.parseMulticastRoutesData(infraComputeMockData.getInput({fnName:'parseMulticastRoutesData',type:'test2'})),
            infraComputeMockData.getOutput({fnName:'parseMulticastRoutesData',type:'test2'}),'Test parseMulticastRoutesData with no data');
});

test("testParseL2RoutesData", function() {
    //Declare the number of assert statements in current test case
    expect(2);
    deepEqual(cmpNodeView.parseL2RoutesData(infraComputeMockData.getInput({fnName:'parseL2RoutesData',type:'test1'})),
        infraComputeMockData.getOutput({fnName:'parseL2RoutesData',type:'test1'}),'Test parseL2RoutesData with valid data');
    deepEqual(cmpNodeView.parseL2RoutesData(infraComputeMockData.getInput({fnName:'parseL2RoutesData',type:'test2'})),
            infraComputeMockData.getOutput({fnName:'parseL2RoutesData',type:'test2'}),'Test parseL2RoutesData with no data');
});

test("testParseACLData", function() {
	//Declare the number of assert statements in current test case
	expect(5);
	deepEqual(cmpNodeView.parseACLData(infraComputeMockData.getInput({fnName:'parseACLData',type:'test1'})),
	  infraComputeMockData.getOutput({fnName:'parseACLData',type:'test1'}),'Test parseACLData with valid data');
	deepEqual(cmpNodeView.parseACLData(infraComputeMockData.getInput({fnName:'parseACLData',type:'test2'})),
	      infraComputeMockData.getOutput({fnName:'parseACLData',type:'test2'}),'Test parseACLData with no data');
	deepEqual(cmpNodeView.parseACLData(infraComputeMockData.getInput({fnName:'parseACLData',type:'test3'})),
		      infraComputeMockData.getOutput({fnName:'parseACLData',type:'test3'}),'Test parseACLData with no data');
	deepEqual(cmpNodeView.parseACLData(infraComputeMockData.getInput({fnName:'parseACLData',type:'test4'})),
		      infraComputeMockData.getOutput({fnName:'parseACLData',type:'test4'}),'Test parseACLData with null data');
	deepEqual(cmpNodeView.parseACLData(infraComputeMockData.getInput({fnName:'parseACLData',type:'test5'})),
		      infraComputeMockData.getOutput({fnName:'parseACLData',type:'test5'}),'Test parseACLData with null data');
});

test("testParseFlowsData", function() {
	//Declare the number of assert statements in current test case
	expect(1);
	deepEqual(cmpNodeView.parseACLData(infraComputeMockData.getInput({fnName:'parseFlowsData',type:'test1'})),
	  infraComputeMockData.getOutput({fnName:'parseFlowsData',type:'test1'}),'Test parseFlowsData with valid data');
//	deepEqual(cmpNodeView.parseFlowsData(infraComputeMockData.getInput({fnName:'parseFlowsData',type:'test2'})),
//	      infraComputeMockData.getOutput({fnName:'parseFlowsData',type:'test2'}),'Test parseFlowsData with no data');
//	deepEqual(cmpNodeView.parseFlowsData(infraComputeMockData.getInput({fnName:'parseFlowsData',type:'test3'})),
//		      infraComputeMockData.getOutput({fnName:'parseFlowsData',type:'test3'}),'Test parseFlowsData with no data');
//	deepEqual(cmpNodeView.parseFlowsData(infraComputeMockData.getInput({fnName:'parseFlowsData',type:'test4'})),
//		      infraComputeMockData.getOutput({fnName:'parseFlowsData',type:'test4'}),'Test parseFlowsData with null data');
//	deepEqual(cmpNodeView.parseFlowsData(infraComputeMockData.getInput({fnName:'parseFlowsData',type:'test5'})),
//		      infraComputeMockData.getOutput({fnName:'parseFlowsData',type:'test5'}),'Test parseFlowsData with null data');
});
