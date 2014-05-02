module("Infra Control Node",{
    //Called before executing any test case under this module
    setup: function() {
    	//ctrlNodeView.initInfraViewModel();
    	var ctrlNodeView = new controlNodeView();
    },
    //Called when any test case is completed 
    teardown: function() {

    }
});

test("testProcessPeerInfo", function() {
//Declare the number of assert statements in current test case
expect(4);
deepEqual(ctrlNodeView.processPeerInfo(infraControlMockData.getInput({fnName:'processPeerInfo',type:'test1'})),
  infraControlMockData.getOutput({fnName:'processPeerInfo',type:'test1'}),'Test processPeerInfo with valid data');
deepEqual(ctrlNodeView.processPeerInfo(infraControlMockData.getInput({fnName:'processPeerInfo',type:'test2'})),
      infraControlMockData.getOutput({fnName:'processPeerInfo',type:'test2'}),'Test processPeerInfo with valid data');
deepEqual(ctrlNodeView.processPeerInfo(infraControlMockData.getInput({fnName:'processPeerInfo',type:'test3'})),
      infraControlMockData.getOutput({fnName:'processPeerInfo',type:'test3'}),'Test processPeerInfo with empty object data');
deepEqual(ctrlNodeView.processPeerInfo(infraControlMockData.getInput({fnName:'processPeerInfo',type:'test4'})),
      infraControlMockData.getOutput({fnName:'processPeerInfo',type:'test4'}),'Test processPeerInfo with null data');
});

//test("testParseRoutes", function() {
//	//Declare the number of assert statements in current test case
//	expect(1);
//	deepEqual(ctrlNodeView.parseRoutes(infraControlMockData.getInput({fnName:'parseRoutes',type:'test1'})),
//	  infraControlMockData.getOutput({fnName:'parseRoutes',type:'test1'}),'Test parseRoutes with valid data');
//	deepEqual(ctrlNodeView.parseRoutes(infraControlMockData.getInput({fnName:'parseRoutes',type:'test2'})),
//	      infraControlMockData.getOutput({fnName:'parseRoutes',type:'test2'}),'Test parseRoutes with valid data');
//	deepEqual(ctrlNodeView.parseRoutes(infraControlMockData.getInput({fnName:'parseRoutes',type:'test3'})),
//	      infraControlMockData.getOutput({fnName:'parseRoutes',type:'test3'}),'Test parseRoutes with empty object data');
//	deepEqual(ctrlNodeView.parseRoutes(infraControlMockData.getInput({fnName:'parseRoutes',type:'test4'})),
//	      infraControlMockData.getOutput({fnName:'parseRoutes',type:'test4'}),'Test parseRoutes with null data');
//});