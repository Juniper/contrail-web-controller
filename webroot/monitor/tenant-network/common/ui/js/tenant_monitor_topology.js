/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var topologyView = new topologyRenderer();
var topologyColors = {
        blue: '#3182BD',
        red: '#E4564F'
};
//Connectivity Details for Project/Network
function topologyRenderer() {
    var self = this;
    this.drawTopology  = function(fqName) {
        var url,type,name;
        var framework="d3";//[cytoscape,d3]
        url='/api/tenant/monitoring/network-topology?fqName='+fqName;
        if(fqName.split(':').length==2){
            type='project';
            name=fqName.split(':').pop();
        }if(fqName.split(':').length==3){
            type='network';
        }
        var divId = escape(fqName).replace(/%/g,'_').replace(/\*/g,'-').replace(/@/g,':').replace(/\+/g,'.');
        $.getJSON(url,function(response){
            if(response!=null){
                var result = topologyView.filterResponse(response.nodes,response.links);
                response.nodes=result.nodes;
                response.links=result.links;
                response.framework=framework;
                response.fqName=fqName;
                response.divId=divId;
                /*Hide the connectivity details if there are no links
                    if(type=='network' && response.links.length==0){
                    $("#networkSummaryTab").hide();
                    return;}
                $("#networkSummaryTab").show();*/
                if($("#topology").find('#'+divId).length == 0)
                    $("#topology").append("<div id=\""+divId+"\"></div>");
                else
                    $("#topology").find('#'+divId).html('');
                $("#"+divId).data('topology',response);
                $("#"+divId).data('fqName',fqName);
                self.renderTopology(response);
            }else{
                $("#topology").addClass('text-center');
                $("#topology").html("An unexpected error occured.<br/>Please try reloading the page");
            }
        })
    }

    this.renderTopology =  function(response){
        var divId = response.divId;
        var fqName = response.fqName,domain,project;
        domain = fqName.split(':')[0];
        project = fqName.split(':')[1];
        if(response.nodes == undefined || response.nodes.length==0){
            $("#topology").html("No Networks to display");
            return;
        }
        if(response.framework=='d3'){
            var networkTopology = new topology();
            //var width=600;
            var dynamicBubbleSize = false;
            var divHeight = 650;
            var nodes = response.nodes;
            var data = {};
            var size = 400;
            var links = response.links;
            if(nodes.length > 0 && nodes.length < 5){
                divHeight = 160;}
            else if(nodes.length >= 5 && nodes.length < 10){
                divHeight=230;}
            else if(nodes.length >= 10 && nodes.length < 20){
            	divHeight=330;}
            else if(nodes.length >= 20 && nodes.length < 30){
                divHeight=400}
            else if(nodes.length >= 30 && nodes.length < 40){
                divHeight=470;}
            else if(nodes.length >= 40 && nodes.length < 50){
                divHeight=580;}
                for(var i = 0;i<nodes.length;i++){
                    var configData = {};
                    var dmn = nodes[i].name.split(':')[0],prj = nodes[i].name.split(':')[1];
                    var bw_rng = topologyView.getBandwidthRangeForNode(nodes);
                    configData['id'] = nodes[i]['name'];
                    configData['name'] = nodes[i]['name'].split(':').pop();
                    configData['type'] = nodes[i]['node_type'];
                    configData['selected'] = false;
                    configData['shape'] = 'circle';
                    configData['vm_count'] = 0;
                    configData['fip_count'] = 0;
                    configData['in_bytes'] = 0;
                    configData['in_tpkts'] = 0;
                    configData['out_tpkts'] = 0;
                    configData['out_bytes'] = 0;
                    if(nodes[i]['node_type'] == 'virtual-network' && nodes[i]['more_attr'] != undefined){
                        var in_bytes = nodes[i]['more_attr']['in_bytes'],out_bytes = nodes[i]['more_attr']['out_bytes'];
                        if(dynamicBubbleSize)
                            configData['size'] = getNodeSize(bw_rng[0],bw_rng[bw_rng.length-1],in_bytes+out_bytes);
                        else 
                        	configData['size'] = size;
                    	configData['vm_count'] = ifNull(nodes[i]['more_attr']['vm_cnt'],'-');
                        configData['fip_count'] = ifNull(nodes[i]['more_attr']['fip_cnt'],'-');
                        configData['in_bytes'] = formatBytes(nodes[i]['more_attr']['in_bytes']);
                        configData['out_bytes'] = formatBytes(nodes[i]['more_attr']['out_bytes']);
                        configData['out_tpkts'] = ifNull(nodes[i]['more_attr']['out_tpkts'],'-');
                        configData['in_tpkts'] = ifNull(nodes[i]['more_attr']['in_tpkts'],'-');
                        configData['latest_in_bytes'] = formatBytes(nodes[i]['more_attr']['latest_in_bytes']);
                        configData['latest_out_bytes'] = formatBytes(nodes[i]['more_attr']['latest_out_bytes']);
                        configData['latest_out_tpkts'] = ifNull(nodes[i]['more_attr']['latest_out_tpkts'],'-');
                        configData['latest_in_tpkts'] = ifNull(nodes[i]['more_attr']['latest_in_tpkts'],'-');
                    }
                    if(nodes[i]['node_type'] == 'service-instance'){
                        var siData=ifNull(jsonPath(response,'$..service-instances')[0],[]);
                        for(var j=0;j<siData.length;j++){
                            if(siData[j]['service-instance']['fq_name'].join(':') == nodes[i]['name'])
                                configData['vm_count'] = ifNull(siData[j]['service-instance']['virtual_machine_back_refs'],[]).length;
                        }
                        // Bubble size in case of service instance is constant 
                        configData['size'] = size;
                        //var ser_insts=configData.
                        configData['shape'] = 'square';}
                    if( nodes[i]['name'] == fqName)
                        configData['selected'] = true;
                    //configData.size=size;
                    if(domain == dmn && project == prj)
                        configData['display_name'] = nodes[i]['name'].split(':')[2];
                    else if(domain == dmn && project != prj)
                        configData['display_name'] = nodes[i]['name'].split(':')[1]+":"+nodes[i]['name'].split(':')[2];
                    else if(domain != dmn && project != prj)
                        configData['display_name'] = nodes[i]['name'].split(':')[0]+":"+nodes[i]['name'].split(':')[1]+":"+nodes[i]['name'].split(':')[2];
                    networkTopology.addNode_d3(configData);
                }
                for(var j=0;j<links.length;j++){
                    var bw_rng = topologyView.getBandwidthRange(response);
                    if(links[j]['service_inst'] != undefined){   //Creating links for connecting service instances
                        var svInst = links[j]['service_inst'];
                        var firstLink = {},secondLink = {};
                        $.extend(firstLink,{src:links[j]['src'],dst:svInst[0],dir:links[j]['dir'],orgDest:links[j]['dst'],
                                            orgSrc:links[j]['src'],more_attributes:links[j]['more_attributes']});
                        var result = topologyView.constructLinkData(links[j],links.length,bw_rng);
                        $.extend(firstLink,{loss:result['loss'],packets:result['packets'],bytes:result['bytes'],
                        	                toolTip:result['toolTip'],lineColor:result['lineColor'],width:result['width']});
                        if(result['error'] != undefined){
                            firstLink['error'] = result.error;
                            firstLink['partialConnected'] = true;}
                        if(result['tooltipTitle'] != undefined)
                            firstLink['tooltipTitle'] = result['tooltipTitle'];
                        networkTopology.addLink_d3(firstLink);
                        if(svInst.length==1){
                        	$.extend(secondLink,{src:svInst[0],dst:links[j]['dst'],dir:links[j]['dir'],orgDest:links[j]['dst'],
                                                 orgSrc:links[j]['src'],more_attributes:links[j]['more_attributes'],loss:result['loss'],
                                                 packets:result['packets'],bytes:result['bytes'],toolTip:result['toolTip'],
                                                 lineColor:result['lineColor'],width:result['width']});
                            if(result['error'] != undefined){
                                secondLink['error'] = result['error'];
                                secondLink['partialConnected'] = true;}
                            if(result['tooltipTitle'] != undefined)
                                secondLink['tooltipTitle'] = result['tooltipTitle'];
                            networkTopology.addLink_d3(secondLink);
                        } else {
                            for(var i = 0;i < svInst.length;i++){      
                                var link = {};
                                if(svInst[i+1] == undefined)
                                    link['dst'] = links[j]['dst'];
                                else
                                    link['dst'] = svInst[i+1];
                                var result = topologyView.constructLinkData(links[j],links.length,bw_rng);
                                $.extend(link,{src:svInst[i],dir:links[j]['dir'],loss:result['loss'],packets:result['packets'],bytes:result['bytes'],
                                	           orgDest:links[j]['dst'],orgSrc:links[j]['src'],toolTip:result['toolTip'],lineColor:result['lineColor'],
                                	           width:result['width'],more_attributes:links[j]['more_attributes']});
                                if(result['error'] != undefined){
                                    link['error'] = result['error'];
                                    configData['partialConnected'] = true;}
                                if(result['tooltipTitle'] != undefined)
                                    link['tooltipTitle'] = result['tooltipTitle'];
                                networkTopology.addLink_d3(link);
                             }
                        }
                    } else {
                        var configData={};
                        var result = topologyView.constructLinkData(links[j],links.length,bw_rng);
                        $.extend(configData,{src:links[j]['src'],dst:links[j]['dst'],dir:links[j]['dir'],orgDest:links[j]['dst'],
                        	                 orgSrc:links[j]['src'],loss:result['loss'],packets:result['packets'],bytes:result['bytes'],
                        	                 toolTip:result['toolTip'],lineColor:result['lineColor'],width:result['width'],
                        	                 more_attributes:links[j]['more_attributes']});
                        if(result['error'] != undefined){
                           configData['error'] = result['error'];
                           configData['partialConnected'] = true;}
                        if(result['tooltipTitle'] != undefined)
                           configData['tooltipTitle'] = result['tooltipTitle'];
                    networkTopology.addLink_d3(configData);}
                }	
                $("#"+divId).data('topology',response);
                $("#"+divId).data('fqName',fqName);
                $("#topology").css('width','100%');
                $("#topology").css('height',divHeight);
                $("#"+divId).css('width','100%');
                $("#"+divId).css('height',divHeight);
                networkTopology.loadD3(divId);
        }
    }
    
    this.getBandwidthRangeForNode = function(nodes){
    	var nodes = ifNull(nodes,[]);
    	var bwArray = [];
    	for(var i = 0;i < nodes.length;i++){
    		if(nodes[i]['node_type'] == 'virtual-network') {
	    		var moreAttr = nodes[i]['more_attr'];
	    		var in_bytes = 0,out_bytes = 0;
	    		if(moreAttr['in_bytes'] != undefined)
	    			in_bytes = moreAttr['in_bytes'];
	    		if(moreAttr['out_bytes'] != undefined)
	    			out_bytes = moreAttr['out_bytes'];
	    		bwArray.push(in_bytes+out_bytes);
	    		bwArray.sort(function(a,b){return b-a;});
    		}
    	}
    	return bwArray;
    }
    /* istanbul ignore next */
    function getNodeSize(maxBwidth,minBwidth,bw){
    	var minSize = 200;
    	var maxSize = 700;
    	//function for scale ((b-a)(x - min)/(max-min))+a;
    	if(bw == minBwidth)
    		return minSize;
    	else if(bw == maxBwidth)
    		return maxSize;
    	else
    		return ((maxSize - minSize)*(bw - minBwidth)/(maxBwidth - minBwidth))+minSize;
    }
    
    this.filterResponse = function(nodes,links){
        var result = {};
        var nodesActive = [];
        var linksActive = [];
        var ipFabricName =  'default-domain:default-project:ip-fabric';
        if(nodes != undefined && links != undefined) {
        for(var i = 0;i < nodes.length;i++) {
            if(nodes[i]['status'] == 'Active' && (nodes[i]['name'] != ipFabricName))
                nodesActive.push(nodes[i]);
        }
        for(var i = 0;i < links.length;i++) {
            var srcActive = false,dstActive = false,svcExists = false,svcActive = true;
            //Filter link if any of src/destination of the link is ip-fabric
            if(links[i]['src'] == ipFabricName || links[i]['dst'] == ipFabricName)
                continue;
            for(var j = 0;j < nodes.length;j++) {
                if(links[i]['src'] == nodes[j]['name'] && nodes[j]['status'] == 'Active')
                    srcActive = true;
                else if(links[i]['dst'] == nodes[j]['name'] && nodes[j]['status'] == 'Active')
                    dstActive = true;
                else if(links[i]['service_inst'] != undefined && links[i]['service_inst'].length>0){
                    svcExists = true;
                    for(var k = 0;k < links[i]['service_inst'].length;k++){
                        if(links[i]['service_inst'][k] == nodes[j]['name'] && nodes[j]['status'] == 'Deleted')
                            svcActive = false;
                    }
                }
            }
            if(svcExists) {
                if(srcActive && dstActive && svcActive)
                   linksActive.push(links[i]);}
            else if(srcActive && dstActive)
                linksActive.push(links[i]);
        }
       }
        result['nodes'] = nodesActive;
        result['links'] = linksActive;
        return result;
    }

    this.checkPacketLoss = function(data){
        var inStats = data['more_attributes']['in_stats'];
        var outStats = data['more_attributes']['out_stats'],lossPercent = 0,inPktDiff = 0,outPktDiff = 0;
        var inByteDiff = 0,outByteDiff = 0,inPkts = 0,inBytes = 0,outPkts = 0,outBytes = 0,result = {},diff = false;
        //To handle back end bug (getting one set of data in case bidirecitonal)  
        if(inStats.length == 1 && outStats.length == 1 && data['dir'] == 'bi') {
               if(data['src'] == inStats[0]['src']){
                   var obj = {};
                   obj['src'] = data['dst'],obj['dst'] = data['src'],obj['pkts'] = 0,obj['bytes'] = 0;
                   inStats[1] = obj,outStats[1] = obj;
               } else if(data['dst'] == inStats[0]['src']) {
                   var obj = {};
                   obj['src'] = data['src'],obj['dst'] = data['dst'],obj['pkts'] = 0,obj['bytes'] = 0;
                   inStats[1] = obj,outStats[1] = obj;
               } 
           }
           for(var i = 0;i < inStats.length;i++) {
                if(data['src'] == inStats[i]['src']) {
                    for(var j = 0;j < outStats.length;j++) {
                        if(data['src'] == outStats[j]['dst'] && outStats[j]['pkts'] != inStats[i]['pkts']){
                            diff = true;
                            inPkts = Math.max(outStats[j]['pkts'],inStats[i]['pkts']);
                            inBytes = Math.max(outStats[j]['bytes'],inStats[i]['bytes']);
                            inPktDiff = Math.abs(inStats[i]['pkts'] - outStats[j]['pkts']);
                            inByteDiff = Math.abs(inStats[i]['bytes'] - outStats[j]['bytes']);}
                    }
                } else if(data['dst'] == inStats[i]['src']) {
                    for(var k = 0;k < outStats.length;k++){
                        if(data['dst'] == outStats[k]['dst'] && outStats[k]['pkts'] != inStats[i]['pkts']){
                            diff = true;
                            outPkts = Math.max(outStats[k]['pkts'],inStats[i]['pkts']);
                            outBytes = Math.max(outStats[k]['bytes'],inStats[i]['bytes']);
                            outPktDiff = Math.abs(inStats[i]['pkts'] - outStats[k]['pkts']);
                            outByteDiff = Math.abs(inStats[i]['bytes'] - outStats[k]['bytes']);}
                    }
                }
            }
        if(diff)
        lossPercent = ((inByteDiff+outByteDiff))*(100/(inBytes+outBytes));
        result['diff'] = diff;
        result['loss_percent'] = lossPercent.toFixed(2);
        return result;
    }

    this.constructLinkData = function(link,linksCount,bwRng) {
    	var configData = {};
    	configData['lineColor'] = topologyColors['blue'];
    	configData['partialConnected'] = false;
    	if(link['more_attributes'] != undefined && link['more_attributes']['in_stats'] != undefined && link['more_attributes']['out_stats'] != undefined
        			&& link['more_attributes']['in_stats'].length>0 && link['more_attributes']['out_stats'].length>0 ){
        	var loss = topologyView.checkPacketLoss(link);
        	var result = topologyView.getLinkInfo(link);
        	if(link['error'] != undefined){
        		configData['partialConnected'] = true;
        		configData['error'] = link['error'];}
        	configData['width'] = 1.25;//default width value
        	configData['packets'] = result['pkts_new'];
        	configData['bytes'] = formatBytes(result['bytes_new']);
        	configData['more_attributes'] = link['more_attributes'];
        	configData['dir'] = link['dir'];
        	configData['loss'] = loss;
        	/*if(link['error'] != null || loss['loss_percent'] > 10 ) {
            configData['lineColor'] = '#E4564F';
            }*/
            //currently we are marking the link as red only if it partially connected 
            if(link['error'] != null)
                configData['lineColor'] = topologyColors['red'];
            if(linksCount > 1 && (loss['loss_percent'] < 10 || !loss['diff']) && !configData['partialConnected'])
                configData['width'] = topologyView.getLinkWidth(bwRng['bytes'][0],bwRng.bytes[bwRng['bytes'].length-1],result['bytes_new']);
        } else {
            if(link['error'] != undefined) {
                configData['partialConnected'] = true;
                configData['error'] = link['error'];
                configData['lineColor'] = topologyColors['red'];
                //configData['lineColor'] = '#3182bd';
            }
        	configData['width'] = 1.25;
        	configData['packets'] = 0;
        	configData['bytes'] = 0;
       }
       return configData;
    }

    this.getLinkInfo = function(data){
    	if(data['more_attributes'] != undefined && data['more_attributes']['in_stats'] != undefined && data['more_attributes']['out_stats'] != undefined){
    		var inStats = data['more_attributes']['in_stats'];
    		var outStats = data['more_attributes']['out_stats'];
    		var result = {};
    		var pktsArr = [],bytesArr = [];
    		for(var i = 0;i < inStats.length;i++){
    			pktsArr.push(inStats[i]['pkts']);
    			bytesArr.push(inStats[i]['bytes']);
    		}
    		for(var i=0;i<outStats.length;i++){
    			pktsArr.push(outStats[i]['pkts']);
    			bytesArr.push(outStats[i]['bytes']);
    		}
    		pktsArr.sort(function(a,b){return b-a;});
    		bytesArr.sort(function(a,b){return b-a});
    		result['bytes_new'] = bytesArr[0];
    		result['pkts_new'] = pktsArr[0];
    		return result;
    		}
    }
    
    this.getBandwidthRange = function(response){
        var result = {};
        var pktslst = new Array();
        var byteslst = new Array();
        for(var i = 0;i < response['links'].length;i++){
            var src = response['links'][i]['src'];
            var dst = response['links'][i]['dst'];
            var pkts = [];
            var bytes = [];
            if(response['links'][i]['more_attributes'] != undefined){
            var inStats = response['links'][i]['more_attributes']['in_stats'];
            var outStats = response['links'][i]['more_attributes']['out_stats'];
            if((inStats != undefined && outStats !=undefined)){
            for(var j = 0;j < inStats.length;j++) {
                pkts.push(inStats[j]['pkts']);
                bytes.push(inStats[j]['bytes']);
            } for(var j = 0;j < outStats.length;j++) {
                pkts.push(outStats[j]['pkts']);
                bytes.push(outStats[j]['bytes']);
            }
            pkts.sort(function(a,b){return b-a});
            bytes.sort(function(a,b){return b-a});
            pktslst.push(pkts[0]);
            byteslst.push(bytes[0]);
            }
           }		
        }
        pktslst.sort(function(a,b){return b-a});
        byteslst.sort(function(a,b){return b-a});
        result['bytes'] = byteslst;
        result['pkts'] = pktslst;
        return result;
    }
    
    this.getLinkWidth = function(bwMax,bwMin,bw){
        //function for scale ((b-a)(x - min)/(max-min))+a;
        var result = 1.25;
        if(bwMax == bw) {
            result = 4.5;
            return result;
        } else if(bwMin == bw || bwMin == undefined || bwMax == undefined) {
            result = 2.5;
            return result;
        } else if(bwMax != bwMin) {
          var lwidthMin = 2.5,lwidthMax = 4.5; 
          result = ((lwidthMax-lwidthMin)*(bw-bwMin)/(bwMax-bwMin))+lwidthMin;
          if(result < 1)
            result = 1.25;//Setting min. link width to 1.25, to avoid very thin links
        }
        return result;
    }
}
