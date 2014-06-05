/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module("Monitor Network",{
    setup:function() {
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;
        $.ajaxSetup({
             cache:true
           });
    },
    teardown: function() {
        this.server.restore();
    }
})

test("parseNetworkDetails which parse the data when we expand the row in the network summary grid",function(){
    expect(1);
    deepEqual(tenantNetworkMonitorUtils.parseNetworkDetails(monitorNetworkMockData.getInput({fnName:'parseNetworkDetails',type:'completeDetails'})),
            monitorNetworkMockData.getOutput({fnName:'parseNetworkDetails',type:'completeDetails'}),"Testing parseNetworkDetails function");
});

test("parseInstanceDetails which parse the data when we expand the row in the instance summary grid",function(){
    expect(2);
    deepEqual(tenantNetworkMonitorUtils.parseInstDetails(monitorNetworkMockData.getInput({fnName:'parseInstanceDetails',type:'completeDetails'})),
            monitorNetworkMockData.getOutput({fnName:'parseInstanceDetails',type:'completeDetails'}),"Testing parseInstanceDetails function");
    deepEqual(tenantNetworkMonitorUtils.parseInstDetails(monitorNetworkMockData.getInput({fnName:'parseInstanceDetails',type:'withFip'})),
            monitorNetworkMockData.getOutput({fnName:'parseInstanceDetails',type:'withFip'}),"Testing parseInstanceDetails function with Floating IP");
});

test("parsePortMap which parse the portMapData required for the PortMap tab in networkDetails page",function(){
    expect(1);
    deepEqual(tenantNetworkMonitorUtils.parsePortMap(monitorNetworkMockData.getInput({fnName:'parsePortMap',type:'completeDetails'})),
            monitorNetworkMockData.getOutput({fnName:'parsePortMap',type:'completeDetails'}),"Testing parsePortMap function");
});

test("instanceParseFn which parse the instance data required for the network summary grid",function(){
    expect(1);
    deepEqual(tenantNetworkMonitorUtils.instanceParseFn(monitorNetworkMockData.getInput({fnName:'instanceParseFn',type:'completeDetails'})),
            monitorNetworkMockData.getOutput({fnName:'instanceParseFn',type:'completeDetails'}),"Testing instanceParseFn function");
});

test("networkParseFn which parse the networks data required for the network summary grid",function(){
    expect(1);
    deepEqual(tenantNetworkMonitorUtils.networkParseFn(monitorNetworkMockData.getInput({fnName:'networkParseFn',type:'completeDetails'})),
            monitorNetworkMockData.getOutput({fnName:'networkParseFn',type:'completeDetails'}),"Testing networkParseFn function");
});

test("networkParseFnForPagination which filters the VN comparing the UVE response and config response",function(){
   expect(1);
   var inputData = monitorNetworkMockData.getInput({fnName:'networkParseFnForPagination',type:'completeDetails'});
   deepEqual(networkParseFnForPagination(inputData['uveData'],inputData['configVNList'],inputData['projectData']),
           monitorNetworkMockData.getOutput({fnName:'networkParseFnForPagination',type:'completeDetails'}),"Testing Network parse function for pagination");
});

test("getProjectData which constructs data required for the projectsummary grid from the networks data",function(){
   expect(1); 
   var inputData = monitorNetworkMockData.getInput({fnName:'getProjectData',type:'completeDetails'});
   deepEqual(getProjectData(inputData['vnData'],inputData['project']),monitorNetworkMockData.getOutput({fnName:'getProjectData',
       type:'completeDetails'}),"Testing the getprojetData function");
});

test("ConstructRequestUrl which constructs the url's for pages like portdistribution, networksummary,projectsummary," +
		"timeserieschart ",function(){
    expect(8);
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'projectSummaryCase'})),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'projectSummaryCase'}),
                        "Testing the ConstructRequestUrl function in projectSummaryCase");
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'portRangeDetail'})),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'portRangeDetail'}),
                        "Testing the ConstructRequestUrl portRangeDetail function");
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'portDistributionRangeDetail'})['networkDestPort']),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'portDistributionRangeDetail'})['networkDestPort'],
                        "Testing the ConstructRequestUrl portRangeDetail function network destination port case");
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'portDistributionRangeDetail'})['networkSourcePort']),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'portDistributionRangeDetail'})['networkSourcePort'],
                        "Testing the ConstructRequestUrl portRangeDetail function network source port case");
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'portDistributionRangeDetail'})['projectSourcePort']),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'portDistributionRangeDetail'})['projectSourcePort'],
                        "Testing the ConstructRequestUrl portRangeDetail function project source port case");
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'portDistributionRangeDetail'})['projectDestPort']),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'portDistributionRangeDetail'})['projectDestPort'],
                        "Testing the ConstructRequestUrl portRangeDetail function project destination port case");
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'projectPortDistributionWithRelativeTime'})),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'projectPortDistributionWithRelativeTime'}),
                        "Testing the ConstructRequestUrl portRangeDetail function project port distribution in project details page " +
                        "with relative time case");
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'networkPortDistributionWithRelativeTime'})),
        monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'networkPortDistributionWithRelativeTime'}),
        "Testing the ConstructRequestUrl portRangeDetail function project port distribution tab in network details page " +
        "with relative time case");
    /*deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'projectportDistribution'})),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'projectportDistribution'}),"Testing the ConstructRequestUrl function");
    
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'networkflowseries'})),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'networkflowseries'}),"Testing the ConstructRequestUrl function");
    
    deepEqual(constructReqURL(monitorNetworkMockData.getInput({fnName:'constructReqURL',type:'networkPortDistribution'})),
            monitorNetworkMockData.getOutput({fnName:'constructReqURL',type:'networkPortDistribution'}),"Testing the ConstructRequestUrl function");*/
});

test("parsePortDistribution which parses the portdistribution response and constructs the data needed for the chart",function(){
    expect(2);
    deepEqual(tenantNetworkMonitorUtils.parsePortDistribution(monitorNetworkMockData.getInput({fnName:'parsePortDistribution',type:'srcPortData'})['result'],
    monitorNetworkMockData.getInput({fnName:'parsePortDistribution',type:'srcPortData'})['cfg']),
            monitorNetworkMockData.getOutput({fnName:'parsePortDistribution',type:'srcPortData'}),
            "Testing the parsePortDistribution function with source port data");
    
    deepEqual(tenantNetworkMonitorUtils.parsePortDistribution(monitorNetworkMockData.getInput({fnName:'parsePortDistribution',type:'dstPortData'})['result'],
            monitorNetworkMockData.getInput({fnName:'parsePortDistribution',type:'dstPortData'})['cfg']),
                    monitorNetworkMockData.getOutput({fnName:'parsePortDistribution',type:'dstPortData'}),
                    "Testing the parsePortDistribution function with destination port data");
});

test("getProtocolName returns the protocolName based on the protocolNumber",function(){
   expect(2);
   deepEqual(getProtocolName(monitorNetworkMockData.getInput({fnName:'getProtocolName',type:'validProtocol'})),
           monitorNetworkMockData.getOutput({fnName:'getProtocolName',type:'validProtocol'}));
   deepEqual(getProtocolName(monitorNetworkMockData.getInput({fnName:'getProtocolName',type:'InvalidProtocol'})),
        monitorNetworkMockData.getOutput({fnName:'getProtocolName',type:'InvalidProtocol'}));
});

test("parseIpListofInstance returns the total IP of the instance",function(){
    expect(2);
    var input = monitorNetworkMockData.getInput({fnName:'parseIpListofInstance',type:'ipList'});
    deepEqual(instSummaryView.parseIpListofInstance(input['response'],input['deferredObj'],input['data']),
            monitorNetworkMockData.getOutput({fnName:'parseIpListofInstance',type:'ipList'}));
    
    var input = monitorNetworkMockData.getInput({fnName:'parseIpListofInstance',type:'withoutIpList'});
    deepEqual(instSummaryView.parseIpListofInstance(input['response'],input['deferredObj'],input['data']),
            monitorNetworkMockData.getOutput({fnName:'parseIpListofInstance',type:'withoutIpList'}));
});

test("getMultiValueStr returns the formatted text",function(){
    expect(1);
    deepEqual(getMultiValueStr(monitorNetworkMockData.getInput({fnName:'getMultiValueStr',type:'data'})),
            monitorNetworkMockData.getOutput({fnName:'getMultiValueStr',type:'data'}),"Testing the getMultiValueStr function");
});

/*test("getFromToUTC returns an array with start and end time in millisecs",function(){
    expect(1);
    deepEqual(tenantNetworkMonitorUtils.getFromToUTC(monitorNetworkMockData.getInput({fnName:'getFromToUTC',type:'data'})),
            monitorNetworkMockData.getOutput({fnName:'getFromToUTC',type:'data'}),"Testing the getFromToUTC function");
});*/

test("constructDataForPortdistribution returns an array with start and end time in millisecs",function(){
    expect(2);
    var dstData = monitorNetworkMockData.getInput({fnName:'constructDataForPortdistribution',type:'dstData'});
    var dstDeferredObj = $.Deferred();
    portSummaryView.constructDataForPortdistribution(dstData['response'],dstDeferredObj,dstData['obj']);
    dstDeferredObj.done(function(result){
        deepEqual(result,monitorNetworkMockData.getOutput({fnName:'constructDataForPortdistribution',type:'dstData'}),
        "Testing the constructDataForPortdistribution function with source port data");
    })
    
    var srcData = monitorNetworkMockData.getInput({fnName:'constructDataForPortdistribution',type:'srcData'});
    var srcdeferredObj = $.Deferred();
    portSummaryView.constructDataForPortdistribution(srcData['response'],srcdeferredObj,srcData['obj']);
    srcdeferredObj.done(function(result){
        deepEqual(result,monitorNetworkMockData.getOutput({fnName:'constructDataForPortdistribution',type:'srcData'}),
        "Testing the constructDataForPortdistribution function with destination port data");
    })
    
});
module("Monitor Network Topology",{
    setup:function() {
        var topologyView = new topologyRenderer();
        var networkTopology = new topology();
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;
        $.ajaxSetup({
             cache:true
           });
    },
    teardown: function() {
        this.server.restore();
    }
})

test("filterResponse parses the nodes and links removes the deleted networks and corresponding links from response",function(){
    expect(1);
    deepEqual(topologyView.filterResponse(monitorNetworkMockData.getInput({fnName:'filterResponse',type:'withDeletedNetworks'})['nodes'], 
            monitorNetworkMockData.getInput({fnName:'filterResponse',type:'withDeletedNetworks'})['links']),
            monitorNetworkMockData.getOutput({fnName:'filterResponse',type:'withDeletedNetworks'}));
});

test("getBandwidthRangeForNodes parses the nodes array and returns the bandwidth range of the nodes",function(){
    expect(1);
    deepEqual(topologyView.getBandwidthRangeForNode(monitorNetworkMockData.getInput({fnName:'getBandwidthRangeForNodes',type:'data'})),
            monitorNetworkMockData.getOutput({fnName:'getBandwidthRangeForNodes',type:'data'}));
});

test("getBandwidthRange parses the links arrays and returns the bandwidth range of the links",function(){
    expect(1);
    deepEqual(topologyView.getBandwidthRange(monitorNetworkMockData.getInput({fnName:'getBandwidthRange',type:'data'})), 
            monitorNetworkMockData.getOutput({fnName:'getBandwidthRange',type:'data'}));
});

test("constructLinkData returns the object with packet loss %,color of the link,linkWidth etc which are required for plotting the link ",function(){
    expect(1);
    deepEqual(topologyView.constructLinkData(monitorNetworkMockData.getInput({fnName:'constructLinkData',type:'data'})['link'],
            monitorNetworkMockData.getInput({fnName:'constructLinkData',type:'data'})['linksCount'],
            monitorNetworkMockData.getInput({fnName:'constructLinkData',type:'data'})['bwRng']), 
            monitorNetworkMockData.getOutput({fnName:'constructLinkData',type:'data'}));
});

test("checkPacketLoss returns the object with packet loss % and flag regarding the packet loss",function(){
    expect(1);
    deepEqual(topologyView.checkPacketLoss(monitorNetworkMockData.getInput({fnName:'checkPacketLoss',type:'data'})), 
            monitorNetworkMockData.getOutput({fnName:'checkPacketLoss',type:'data'}));
});

test("getLinkInfo returns the link bandwidth",function(){
    expect(1);
    deepEqual(topologyView.getLinkInfo(monitorNetworkMockData.getInput({fnName:'getLinkInfo',type:'data'})), 
            monitorNetworkMockData.getOutput({fnName:'getLinkInfo',type:'data'}));
});

test("getLinkWidth,returns the linkwidth based on the bandwidth range ",function(){
    expect(3);
    var minWidth = monitorNetworkMockData.getInput({fnName:'getLinkWidth',type:'minWidth'});
    var maxWidth = monitorNetworkMockData.getInput({fnName:'getLinkWidth',type:'maxWidth'});
    var avgWidth = monitorNetworkMockData.getInput({fnName:'getLinkWidth',type:'avgWidth'});
    deepEqual(topologyView.getLinkWidth(minWidth['bwMax'],minWidth['bwMin'],minWidth['bw']),monitorNetworkMockData.getOutput({fnName:'getLinkWidth',
                                                                                                                                type:'minWidth'}));
    deepEqual(topologyView.getLinkWidth(maxWidth['bwMax'],maxWidth['bwMin'],maxWidth['bw']),monitorNetworkMockData.getOutput({fnName:'getLinkWidth',
                                                                                                                                type:'maxWidth'}));
    deepEqual(topologyView.getLinkWidth(avgWidth['bwMax'],avgWidth['bwMin'],avgWidth['bw']),monitorNetworkMockData.getOutput({fnName:'getLinkWidth',
                                                                                                                                type:'avgWidth'}));
});


