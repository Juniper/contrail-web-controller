module("Infra Analytics Node",{
    //Called before executing any test case under this module
    setup: function() {
    	//aNodeView.initInfraViewModel();
    	var aNodeView = new analyticsNodeView();
    },
    //Called when any test case is completed 
    teardown: function() {

    }
});

test("testParseQEQueries", function() {
	//Declare the number of assert statements in current test case
	expect(3);
	deepEqual(aNodeView.parseQEQueries(infraAnalyticsMockData.getInput({fnName:'parseQEQueries',type:'test1'})),
	  infraAnalyticsMockData.getOutput({fnName:'parseQEQueries',type:'test1'}),'Test parseQEQueries with valid data');
	deepEqual(aNodeView.parseQEQueries(infraAnalyticsMockData.getInput({fnName:'parseQEQueries',type:'test2'})),
	      infraAnalyticsMockData.getOutput({fnName:'parseQEQueries',type:'test2'}),'Test parseQEQueries with valid data');
	deepEqual(aNodeView.parseQEQueries(infraAnalyticsMockData.getInput({fnName:'parseQEQueries',type:'test3'})),
	      infraAnalyticsMockData.getOutput({fnName:'parseQEQueries',type:'test3'}),'Test parseQEQueries with empty enqueue data');
});