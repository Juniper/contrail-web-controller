/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

module("Infra Dashboard",{
    //Called before executing any test case under this module
    setup: function() {
//        infraMonitorUtils.initInfraViewModel();
        //Have test cases for diffDates seperately as it takes the diff between the given date and current date and affects in matching the 
        //expected output JSON with actual JSON
        var stub = sinon.stub(window,'diffDates')
        stub.returns("");
    },
    //Called when any test case is completed 
    teardown: function() {
        //Restore the original definition
        window.diffDates.restore();
    }
});

test("testVRouterParsing", function() {
    //Declare the number of assert statements in current test case
    expect(1);
    deepEqual(infraMonitorUtils.parsevRoutersDashboardData(infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'})),
        infraMockData.getOutput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}),'Test vRouter Parsing');
});

test("test Config Nodes Parsing", function() {
    expect(1);
    deepEqual(infraMonitorUtils.parseConfigNodesDashboardData(infraMockData.getInput({fnName:'parseConfigNodesDashboardData',type:'CONFIGNODES_SUMMARY'})),
        infraMockData.getOutput({fnName:'parseConfigNodesDashboardData',type:'CONFIGNODES_SUMMARY'}),'Test Config Nodes Parsing');
});

test("test Control Nodes Parsing", function() {
    expect(1);
    var actual = infraMonitorUtils.parseControlNodesDashboardData(infraMockData.getInput({fnName:'parseControlNodesDashboardData',type:'CONTROLNODES_SUMMARY'}));
    var expected = infraMockData.getOutput({fnName:'parseControlNodesDashboardData',type:'CONTROLNODES_SUMMARY'});
    deepEqual(actual,expected,'Test Control Nodes Parsing');
        
});

test("test Analytics Nodes Parsing", function() {
    expect(1);
    deepEqual(infraMonitorUtils.parseAnalyticNodesDashboardData(infraMockData.getInput({fnName:'parseAnalyticNodesDashboardData',type:'ANALYTICSNODES_SUMMARY'})),
        infraMockData.getOutput({fnName:'parseAnalyticNodesDashboardData',type:'ANALYTICSNODES_SUMMARY'}),'Test Analytics Nodes Parsing');
});


test("testVRouterConfigMissing", function() {
    //Take a clone of mock data such that it can be modifed with out modifying the actual mock data that can be used in other test cases
    var vRouterDataInput = $.extend(true,[],infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}));
    //Reset the config data for 1st vRouter for testing
    vRouterDataInput[0]['value']['ConfigData'] = {};
    var vRouterData = infraMonitorUtils.parsevRoutersDashboardData(vRouterDataInput); 
    equal(vRouterData[0]['isConfigMissing'],true,"isConfigMissing flag to be set");
    equal(vRouterData[0]['color'],d3Colors['orange'],"vRouter color to be orange on config missing");
});

//Test vRouter parsing with UVE missing
test("testVRouterUveMissing", function() {
    //Take a clone of mock data such that it can be modifed with out modifying the actual mock data that can be used in other test cases
    var vRouterDataInput = $.extend(true,[],infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}));
    //Reset the vRouter VrouterAgent & VrouterStatsAgent keys in UVE
    vRouterDataInput[0]['value']['VrouterAgent'] = {};
    vRouterDataInput[0]['value']['VrouterStatsAgent'] = {};
    var vRouterData = infraMonitorUtils.parsevRoutersDashboardData(vRouterDataInput); 
    equal(vRouterData[0]['isUveMissing'],true,"isUveMissing flag to be set");
    equal(vRouterData[0]['color'],d3Colors['red'],"vRouter color to be red on uve missing");
});

test("testGetCores", function() {
    //Declare the number of assert statements in current test case
    expect(1);
    deepEqual(getCores(infraMockData.getInput({fnName:'getCores',type:'test1'})),
        infraMockData.getOutput({fnName:'getCores',type:'test1'}),'Testing vRouter Parsing');
});

//test("testGetAlerts", function() {
//    //Take a clone of mock data such that it can be modifed with out modifying the actual mock data that can be used in other test cases
//    var vRouterDataInput = $.extend(true,[],infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}));
//    //Reset the config data for 1st vRouter for testing
//    //vRouterDataInput[0]['value']['ConfigData'] = {};
//    vRouterDataInput = vRouterDataInput.
//    var vRouterData = infraMonitorUtils.parsevRoutersDashboardData(vRouterDataInput,); 
//    equal(vRouterData[0]['isConfigMissing'],true,"isConfigMissing flag to be set");
//    equal(vRouterData[0]['color'],d3Colors['orange'],"vRouter color to be orange on config missing");
//});

//test("testProcessAlerts", function() {
//    expect(1);
//    deepEqual(infraMonitorUtils.processAlerts(infraMockData.getInput({fnName:'processAlerts',type:'test1'})),
//        infraMockData.getOutput({fnName:'processAlerts',type:'test1'}),'Test processAlerts with valid data');
//});

//test("getNodeStatusForSummaryPages returns the alerts details for status value in the summary pages and the overall node status in the details " +
//        "page",function(){
//    expect(1);
//    var inputData = infraMockData.getInput({fnName:'getNodeStatusForSummaryPages',type:'processStopData'})
//    deepEqual(getNodeStatusForSummaryPages(inputData),
//            infraMockData.getOutput({fnName:'getNodeStatusForSummaryPages',type:'processStopData'}),"Testing getNodeStatusForSummaryPages function");
//    //var inputData = infraMockData.getInput({fnName:'getNodeStatusForSummaryPages',type:'processDownData'})
//    //deepEqual(getNodeStatusForSummaryPages(inputData['data'],inputData['nodeType']),
//            //infraMockData.getOutput({fnName:'getNodeStatusForSummaryPages',type:'processDownData'}),"Testing getNodeStatusForSummaryPages function");
//});

//test("Testing Vrouter getNodeAlerts", function() {
//    //Declare the number of assert statements in current test case
//    expect(10);
//    var emptyObj = $.extend(true,[],infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}));
//    emptyObj[0]['value'] = $.extend(true,{},{ConfigData:{},VrouterAgent:{},VrouterStatsAgent:{}});
//    emptyObj = infraMonitorUtils.parsevRoutersDashboardData(emptyObj)[0];
//    deepEqual(infraMonitorUtils.processvRouterAlerts(emptyObj),infraMockData.getOutput({fnName:'processAlerts',type:'Vrouter_UVE_ConfigMissingVrouter'}),
//            'Testing node alerts with vRouters Config and UVE empty objects');
//    equal(emptyObj['color'],d3Colors['red'],"vRouter color to be red on uve missing");
//    
//    var nullCase = $.extend(true,[],infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}));
//    nullCase[0]['value'] = $.extend(true,{},{ConfigData:null,VrouterAgent:null,VrouterStatsAgent:null});
//    nullCase = infraMonitorUtils.parsevRoutersDashboardData(nullCase)[0];
//    deepEqual(infraMonitorUtils.processvRouterAlerts(nullCase),infraMockData.getOutput({fnName:'processAlerts',type:'Vrouter_UVE_ConfigMissingVrouter'}),
//            'Testing node alerts with vRouters Config and UVE null case');
//    equal(nullCase['color'],d3Colors['red'],"vRouter color to be red on uve missing");
//    
//    var alertsData = $.extend(true,[],infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}));
//    alertsData[0]['value']['VrouterAgent']['xmpp_peer_list'] = null;
//    alertsData[0]['value']['VrouterAgent']['build_info'] = null;
//    alertsData[0]['value']['VrouterAgent']['down_interface_count'] = null;
//    alertsData[0]['value']['VrouterStatsAgent']['cpu_info'] = null;
//    alertsData = infraMonitorUtils.parsevRoutersDashboardData(alertsData)[0];
//    deepEqual(infraMonitorUtils.processvRouterAlerts(alertsData),infraMockData.getOutput({fnName:'processAlerts',type:'Vrouter_partialSystemInfo'}),
//            'Testing node alerts with vRouters partial system info case');
//    equal(alertsData['color'],d3Colors['blue'],"vRouter color should not change on partial uve missing");
//    
//    var alertsData = $.extend(true,[],infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}));
//    alertsData[0]['value']['VrouterAgent']['xmpp_peer_list'][0]['status'] = false;
//    alertsData[0]['value']['VrouterAgent']['build_info'] = {};
//    alertsData[0]['value']['VrouterAgent']['down_interface_count'] = 1;
//    alertsData[0]['value']['VrouterStatsAgent']['cpu_info'] = {};
//    alertsData = infraMonitorUtils.parsevRoutersDashboardData(alertsData)[0];
//    deepEqual(infraMonitorUtils.processvRouterAlerts(alertsData),infraMockData.getOutput({fnName:'processAlerts',type:'Vrouter_xmpp_interface_down'}),
//            'Testing node alerts with vRouters XMPP peer & interface down case');
//    equal(alertsData['color'],d3Colors['red'],"vRouter color to be red on xmpp peer or interface down");
//    
//    var alertsData = $.extend(true,[],infraMockData.getInput({fnName:'parsevRoutersDashboardData',type:'VROUTER_SUMMARY'}));
//    alertsData[0]['value']['ConfigData']['virtual-router']['virtual_router_ip_address'] = '10.204.217.113';
//    alertsData = infraMonitorUtils.parsevRoutersDashboardData(alertsData)[0];
//    deepEqual(infraMonitorUtils.processvRouterAlerts(alertsData),infraMockData.getOutput({fnName:'processAlerts',type:'Vrouter_config_ip_missing'}),
//            'Testing node alerts with vRouters configured ip mismatch case');
//    equal(alertsData['color'],d3Colors['red'],"vRouter color to be red on configured ip mismatch");
//});
//
//test("Testing Control Node getNodeAlerts", function() {
//    //Declare the number of assert statements in current test case
//    expect(10);
//    var emptyObj = $.extend(true,[],infraMockData.getInput({fnName:'parseControlNodesDashboardData',type:'CONTROLNODES_SUMMARY'}));
//    emptyObj[0]['value'] = $.extend(true,{},{BgpRouterState:{},ConfigData:{}});
//    emptyObj = infraMonitorUtils.parseControlNodesDashboardData(emptyObj)[0];
//    deepEqual(infraMonitorUtils.processControlNodeAlerts(emptyObj),infraMockData.getOutput({fnName:'processAlerts',type:'ControlNode_UVE_ConfigMissingVrouter'}),
//            'Testing node alerts with Control Node Config and UVE empty objects');
//    equal(emptyObj['color'],d3Colors['red'],"Control node color to be red on uve missing or config missing");
//    
//    var nullCase = $.extend(true,[],infraMockData.getInput({fnName:'parseControlNodesDashboardData',type:'CONTROLNODES_SUMMARY'}));
//    nullCase[0]['value'] = $.extend(true,{},{BgpRouterState:null,ConfigData:null});
//    nullCase = infraMonitorUtils.parseControlNodesDashboardData(nullCase)[0];
//    deepEqual(infraMonitorUtils.processControlNodeAlerts(nullCase),infraMockData.getOutput({fnName:'processAlerts',type:'ControlNode_UVE_ConfigMissingVrouter'}),
//            'Testing node alerts with Control Node Config and UVE null case');
//    equal(nullCase['color'],d3Colors['red'],"Control node color to be red on uve missing or config missing");
//    
//    var alertsData = $.extend(true,[],infraMockData.getInput({fnName:'parseControlNodesDashboardData',type:'CONTROLNODES_SUMMARY'}));
//    alertsData[0]['value']['BgpRouterState']['build_info'] = null;
//    alertsData[0]['value']['BgpRouterState']['num_xmpp_peer'] = 2;
//    alertsData[0]['value']['BgpRouterState']['num_bgp_peer'] = 2;
//    alertsData[0]['value']['BgpRouterState']['num_up_bgp_peer'] = 1;
//    alertsData[0]['value']['BgpRouterState']['cpu_info'] = null;
//    alertsData[0]['value']['BgpRouterState']['ifmap_info']['connection_status'] = 'Up';
//    alertsData = infraMonitorUtils.parseControlNodesDashboardData(alertsData)[0];
//    deepEqual(infraMonitorUtils.processControlNodeAlerts(alertsData),infraMockData.getOutput({fnName:'processAlerts',type:'ControlNode_partialSystemInfo_downpeers'}),
//            'Testing node alerts with Control Node partial system info case && XMPP peer down case');
//    equal(alertsData['color'],d3Colors['orange'],"Control node color to be orange on xmpp peer down");
//   
//    var alertsData = $.extend(true,[],infraMockData.getInput({fnName:'parseControlNodesDashboardData',type:'CONTROLNODES_SUMMARY'}));
//    alertsData[0]['value']['ConfigData']['bgp-router']['bgp_router_refs'] = [
//                                                                             {
//                                                                                 "to":[
//                                                                                    "default-domain",
//                                                                                    "default-project",
//                                                                                    "ip-fabric",
//                                                                                    "__default__",
//                                                                                    "nodeg2"
//                                                                                 ],
//                                                                                 "href":"http://10.204.217.44:9100/bgp-router/9180dd1d-599c-4499-a16a-71b7d577284b",
//                                                                                 "attr":{
//                                                                                    "session":[
//                                                                                       {
//                                                                                          "attributes":[
//                                                                                             {
//                                                                                                "bgp_router":null,
//                                                                                                "address_families":{
//                                                                                                   "family":[
//                                                                                                      "inet-vpn",
//                                                                                                      "e-vpn"
//                                                                                                   ]
//                                                                                                }
//                                                                                             }
//                                                                                          ],
//                                                                                          "uuid":null
//                                                                                       }
//                                                                                    ]
//                                                                                 },
//                                                                                 "uuid":"9180dd1d-599c-4499-a16a-71b7d577284b"
//                                                                              }
//                                                                           ];
//    alertsData[0]['value']['BgpRouterState']['build_info'] = {};
//    alertsData[0]['value']['BgpRouterState']['num_bgp_peer'] = 2;
//    alertsData[0]['value']['BgpRouterState']['cpu_info'] = {};
//    alertsData[0]['value']['BgpRouterState']['ifmap_info']['connection_status'] = 'Up';
//    alertsData = infraMonitorUtils.parseControlNodesDashboardData(alertsData)[0];
//    deepEqual(infraMonitorUtils.processControlNodeAlerts(alertsData),infraMockData.getOutput({fnName:'processAlerts',type:'ControlNode_bgppeer_mismatch'}),
//            'Testing node alerts with Control Node BGP peer configuration mismatch');
//    equal(alertsData['color'],d3Colors['orange'],"Control node color to be orange bgp peer configuration mismatch");
//    
//    var alertsData = $.extend(true,[],infraMockData.getInput({fnName:'parseControlNodesDashboardData',type:'CONTROLNODES_SUMMARY'}));
//    alertsData[0]['value']['ConfigData']['bgp-router']['bgp_router_parameters']['address'] = '10.204.217.113';
//    alertsData = infraMonitorUtils.parseControlNodesDashboardData(alertsData)[0];
//    deepEqual(infraMonitorUtils.processControlNodeAlerts(alertsData),infraMockData.getOutput({fnName:'processAlerts',type:'ControlNode_ip_mismatch_IfmapDown'}),
//            'Testing node alerts with Control Node configured ip mismatch case');
//    equal(alertsData['color'],d3Colors['red'],"Control node color to be red configured IP mismatch or Ifmap connection down");
//});
//
//
//
//test("Testing Analytics Node getNodeAlerts", function() {
//    //Declare the number of assert statements in current test case
//    expect(1);
//    var alertsData = $.extend(true,[],infraMockData.getInput({fnName:'parseAnalyticNodesDashboardData',type:'ANALYTICSNODES_SUMMARY'}));
//    alertsData[0]['value']['CollectorState']['build_info'] = {};
//    /*for(var i = 0; i < alertsData[0]['value']['ModuleCpuState']['module_cpu_info'].length; i++ ){
//        var cpuObj = alertsData[0]['value']['ModuleCpuState']['module_cpu_info'][i];
//        if(cpuObj['module_id'] == 'Collector') {
//            cpuObj['cpu_info'] = {};
//            alertsData[0]['value']['ModuleCpuState']['module_cpu_info'][i] = cpuObj;
//        }
//    }*/
//    alertsData = infraMonitorUtils.parseAnalyticNodesDashboardData(alertsData)[0];
//    deepEqual(infraMonitorUtils.processAnalyticsNodeAlerts(alertsData),infraMockData.getOutput({fnName:'processAlerts',type:'AnalyticsNode_partial_info'}),
//            'Testing node alerts with Control Node Config and UVE empty objects');
//    
//});
//
//test("Testing Config Node getNodeAlerts", function() {
//    //Declare the number of assert statements in current test case
//    expect(1);
//    var alertsData = $.extend(true,[],infraMockData.getInput({fnName:'parseConfigNodesDashboardData',type:'CONFIGNODES_SUMMARY'}));
//    alertsData[0]['value']['configNode']['ModuleCpuState']['build_info'] = {};
//    /*for(var i = 0; i < alertsData[0]['value']['configNode']['ModuleCpuState']['module_cpu_info'].length; i++ ){
//        var cpuObj = alertsData[0]['value']['configNode']['ModuleCpuState']['module_cpu_info'][i];
//        if(cpuObj['module_id'] == 'ApiServer') {
//            cpuObj['cpu_info'] = {};
//            alertsData[0]['value']['configNode']['ModuleCpuState']['module_cpu_info'][i] = cpuObj;
//        }
//    }*/
//    alertsData = infraMonitorUtils.parseConfigNodesDashboardData(alertsData)[0];
//    deepEqual(infraMonitorUtils.processConfigNodeAlerts(alertsData),infraMockData.getOutput({fnName:'processAlerts',type:'ConfigNode_partial_info'}),
//            'Testing node alerts with Control Node partial system info');
//    
//});
