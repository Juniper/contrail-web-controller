/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var bgpNode = require('../../monitor/infrastructure/controlnode/jobs/controlnode.jobs.api'),
    computeNode = require('../../monitor/infrastructure/vrouter/jobs/vrouternode.jobs.api'),
    nwMonJobsApi = require('../../monitor/networking/jobs/network.mon.jobs');

var jobsProcess = module.exports;

jobsProcess.processControlNodeRequestByJob = function (pubChannel, saveChannelKey, jobData, done) {
    bgpNode.processNodes(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processNodesRequestByJob = function (pubChannel, saveChannelKey, jobData, done) {
    bgpNode.processNodes(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processControlNodesTreeRequestByJob = function (pubChannel,
                                                               saveChannelKey,
                                                               jobData, done) {
    bgpNode.getControlNodeLists(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processControlNodeBgpPeerRequestByJob = function(pubChannel,
                                                             saveChannelKey,
                                                             jobData, done) {
    bgpNode.processControlNodeBgpPeer(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processControlNodesSummaryRequestByJob = function(pubChannel,
                                                             saveChannelKey,
                                                             jobData, done) {
    bgpNode.processControlNodesSummary(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processComputeNodeInterfaceRequestByJob = function(pubChannel,
                                                             saveChannelKey,
                                                             jobData, done) {
    computeNode.processComputeNodeInterface(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processComputeNodeAclRequestByJob = function(pubChannel,
                                                         saveChannelKey,
                                                         jobData, done) {
    computeNode.processComputeNodeAcl(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processTopFlowsByConnectedNetworkRequestByJob = function(pubChannel, 
                                                               saveChannelKey, 
                                                               jobData, done) {
    nwMonJobsApi.processTopFlowsByConnectedNetwork(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processTopPortByNetworkRequestByJob = function(pubChannel, 
                                                          saveChannelKey, 
                                                          jobData, done) {
    nwMonJobsApi.getTrafficStatsByPort(pubChannel, saveChannelKey, jobData,
                                       done);
}

jobsProcess.processVNFlowSeriesDataRequestByJob = function(pubChannel, 
                                                           saveChannelKey, 
                                                           jobData, done) {
    nwMonJobsApi.processVNFlowSeriesData(pubChannel, saveChannelKey, 
                                          jobData, done);
}

jobsProcess.processVNsFlowSeriesDataRequestByJob = function(pubChannel, 
                                                           saveChannelKey, 
                                                           jobData, done) {
    nwMonJobsApi.processVNsFlowSeriesData(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processFlowSeriesByVMRequestByJob = function(pubChannel, 
                                                      saveChannelKey, 
                                                      jobData, done) {
    nwMonJobsApi.processVMFlowSeriesData(pubChannel, saveChannelKey, jobData, done); 
}

jobsProcess.processCPULoadFlowSeriesRequestByJob = function(pubChannel,
                                                            saveChannelKey,
                                                            jobData,
                                                            done) {
    nwMonJobsApi.processCPULoadFlowSeries(pubChannel, saveChannelKey,
                                          jobData, done);
}

function processvRoutersSummaryRequestByJob (pubChannel, saveChannelKey,
                                             jobData, done)
{
    computeNode.getvRouterSummaryByJob(pubChannel, saveChannelKey, jobData,
                                       done);
}

function processvRoutersGenRequestByJob (pubChannel, saveChannelKey,
                                         jobData, done)
{
    computeNode.getvRouterGenByJob(pubChannel, saveChannelKey, jobData,
                                   done);
}

function processVNStatsPerVRouter (pubChannel, saveChannelKey,
                                   jobData, done)
{
    nwMonJobsApi.processVNFlowSeriesData(pubChannel, saveChannelKey, jobData,
                                         done)
}

jobsProcess.mainJobprocessControlNodesSummaryRequestByJob = 
    function(pubChannel, saveChannelKey, dependData, storedData, jobData, done) {
    bgpNode.getControlNodesSummary(pubChannel, saveChannelKey, JSON.parse(dependData), 
                                   storedData, jobData, done);
}

jobsProcess.mainJobprocessControlNodeBgpPeerRequestByJob =   
    function(pubChannel, saveChannelKey, dependData, storedData, jobData, done) {
    bgpNode.getControlNodeBgpPeer(pubChannel, saveChannelKey, dependData, 
                                  storedData, jobData, done);
}

jobsProcess.mainJobprocessComputeNodeInterfaceRequestByJob =
    function(pubChannel, saveChannelKey, dependData, storedData, jobData, done) {
    computeNode.getComputeNodeInterface(pubChannel, saveChannelKey, dependData, 
                                        storedData, jobData, done);
}

jobsProcess.mainJobprocessComputeNodeAclRequestByJob =
    function(pubChannel, saveChannelKey, dependData, storedData, jobData, done) {
    computeNode.getComputeNodeAcl(pubChannel, saveChannelKey, dependData, 
                                  storedData, jobData, done);
}

jobsProcess.processControlNodeAutoCompleteListRequestByJob =   
    function(pubChannel, saveChannelKey, jobData, done) {
    bgpNode.getControlNodeAutoCompleteList(pubChannel, saveChannelKey, jobData, done);
}
  
jobsProcess.processvRouterListRequestByJob =   
    function(pubChannel, saveChannelKey, jobData, done) {
    computeNode.getvRouterList(pubChannel, saveChannelKey, jobData, done);
}

jobsProcess.processcRouterAclFlowsRequestByJob =
    function(pubChannel, saveChannelKey, jobData, done) {
    computeNode.getvRouterAclFlows(pubChannel, saveChannelKey, jobData, done);
}

exports.processvRoutersSummaryRequestByJob = processvRoutersSummaryRequestByJob;
exports.processvRoutersGenRequestByJob = processvRoutersGenRequestByJob;
exports.processVNStatsPerVRouter = processVNStatsPerVRouter;

