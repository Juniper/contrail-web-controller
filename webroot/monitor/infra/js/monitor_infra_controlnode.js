/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
controlNodesView = function () {
    var self = this;
    var ctrlNodesGrid,ctrlNodesData = [];
    this.load = function (obj) {
    	layoutHandler.setURLHashParams({node:'Control Nodes'},{merge:false,triggerHashChange:false});
        populateControlNodes();
    }
    this.setCtrlNodesData = function(data) {
        ctrlNodesData = data;
    }
    this.getCtrlNodesData = function() {
        return ctrlNodesData;
    }

    this.destroy = function () {
    	var kGrid = $('.contrail-grid').data('contrailGrid');
    	if(kGrid != null)
    		kGrid.destroy();
    }

    function populateControlNodes() {
        infraMonitorView.clearTimers();
        summaryChartsInitializationStatus['controlNode'] = false;
        var ctrlNodesTemplate = contrail.getTemplate4Id("controlnodes-template");
        $(pageContainer).html(ctrlNodesTemplate({}));
        var controlNodeDS = new SingleDataSource('controlNodeDS');
        var controlNodesResult = controlNodeDS.getDataSourceObj();
        var controlNodesDataSource = controlNodesResult['dataSource'];
        var controlDeferredObj = controlNodesResult['deferredObj'];
        //Initialize widget header
        $('#controlNodes-header').initWidgetHeader({title:'Control Nodes',widgetBoxId :'recent'});
        $(controlNodeDS).on('change',function() {
            updateChartsForSummary(controlNodesDataSource.getItems(),'control');
        });
        
        $('#gridControlNodes').contrailGrid({
            header : {
                title : {
                    text : 'Control Nodes',
                    cssClass : 'blue',
                },
                customControls: []
            },
            body: {
                options: {
                    rowHeight : 30,
                    autoHeight : true,
                    enableAsyncPostRender: true,
                    lazyLoading:true
                },
                dataSource: {
                    dataView: controlNodesDataSource
                },
                 statusMessages: {
                     loading: {
                         text: 'Loading Control Nodes..',
                     },
                     empty: {
                         text: 'No Control Nodes to display'
                     }, 
                     errorGettingData: {
                         type: 'error',
                         iconClasses: 'icon-warning',
                         text: 'Error in getting Data.'
                     }
                 }
            },
             footer : {
                 pager : {
                     options : {
                         pageSize : 50,
                         pageSizeSelect : [10, 50, 100, 200, 500 ]
                     }
                 }
             },
            columnHeader: {
                columns:[
                    {
                        field:"name",
                        name:"Host name",
                        formatter:function(r,c,v,cd,dc) {
                           return cellTemplateLinks({cellText:'name',name:'name',statusBubble:true,rowData:dc});
                        },
                        events: {
                           onClick: function(e,dc){
                              onCtrlNodeRowSelChange(dc);
                           }
                        },
                        cssClass: 'cell-hyperlink-blue',
                        minWidth:110
                    },
                    {
                        field:"ip",
                        name:"IP Address",
                        formatter:function(r,c,v,cd,dc){
                            return summaryIpDisplay(dc['ip'],dc['summaryIps']);
                        },
                        minWidth:110
                    },
                    {
                        field:"version",
                        name:"Version",
                        minWidth:110
                    },
                    {
                        field:"status",
                        name:"Status",
                        minWidth:150
                    },
                    {
                        field:"cpu",
                        name:"CPU (%)",
                        formatter:function(r,c,v,cd,dc) {
                            return '<div class="gridSparkline display-inline"></div><span class="display-inline">' + dc['cpu'] + '</span>';
                        },
                        asyncPostRender: renderSparkLines,
                        searchFn:function(d){
                            return d['cpu'];
                        },
                        minWidth:150
                    },
                    {
                        field:"memory",
                        name:"Memory",
                        minWidth:110
                    },
                    {
                        field:"establishedPeerCount",
                        name:"BGP Peers",
                        minWidth:140,
                        formatter:function(r,c,v,cd,dc){
                            return contrail.format("{0} Total {1}",ifNull(dc['totalBgpPeerCnt'],0),dc['downBgpPeerCntText']);
                        }
                    },
                    {
                        field:"activevRouterCount",
                        name:"vRouters",
                        formatter:function(r,c,v,cd,dc){
                            return contrail.format("{0} Total {1}",dc['totalXMPPPeerCnt'],dc['downXMPPPeerCntText']);
                        },
                        minWidth:140
                    }
                ],
            }
        });
        ctrlNodesGrid = $('#gridControlNodes').data('contrailGrid');
        controlDeferredObj.done(function() {
           ctrlNodesGrid.removeGridLoading();
        });
        controlDeferredObj.fail(function() {
           ctrlNodesGrid.showGridMessage('errorGettingData');
        });
        if(controlNodesResult['lastUpdated'] != null && (controlNodesResult['error'] == null || controlNodesResult['error']['errTxt'] == 'abort')){
            triggerDatasourceEvents(controlNodeDS);
        } else {
            ctrlNodesGrid.showGridMessage('loading');
        }
        //applyGridDefHandlers(ctrlNodesGrid, {noMsg:'No Control Nodes to display'});
    }

    function addActions(data) {
        $('.gridSparkline').each(function() {
            var rowIndex = $(this).closest('td').parent().index();
            $(this).initSparkLineChart({viewType:'line',container:'gridCell'});
        });
    }
}

function onCtrlNodeRowSelChange(dc) {
	ctrlNodesGrid = $('#gridControlNodes').data('contrailGrid');
   ctrlNodeView.load({name:dc['name'], ip:dc['ip']});
}

controlNodeView = function () {
    var peersGrid, routesGrid, consoleGrid;
    var ctrlNodeTabStrip = "control_tabstrip";
    var ctrlNodeInfo = {}, self = this;
    var ctrlNodeData = {};
    var RoutesViewModel = function () {
    	this.routingInstances = ko.observableArray([]);
        this.routingInstanceValue = ko.observable('All');
        this.routeTables = ko.observableArray([]);
        this.routeTableValue =  ko.observable('All');
        this.peerSources = ko.observableArray([]);
        this.peerSourceValue = ko.observable('');
        this.prefix = ko.observable('');
//        this.routeLimits:$.map(['All',10, 50, 100, 200], function (value) {
//            return {text:value + ' Routes', value:value};
//        }),
        this.routeLimits = ko.observableArray(['All',10, 50, 100, 200]);
        //this.routeLimitsText = 
        this.limit = '50';
    }
    var routesViewModel = new RoutesViewModel();
    /*Selenium Testing*/
    var ctrlNodeDetailsData;
    this.getCtrlNodeDetailsData = function(){
        return ctrlNodeDetailsData; 
    } 
    /*End of Selenium Testing*/
    this.load = function (obj) {
        pushBreadcrumb([obj['name']]);
    	ctrlNodeInfo = obj;
    	if((ctrlNodeInfo == null || ctrlNodeInfo.ip ==  null ||  ctrlNodeInfo.ip == '') && ctrlNodeInfo.tab != null){
			//issue details call and populate ip
			var controlNodeDeferredObj = $.Deferred();
			self.getControlNodeDetails(controlNodeDeferredObj,ctrlNodeInfo);
			controlNodeDeferredObj.done(function(data) {
				try{
					ctrlNodeInfo['ip'] = data.BgpRouterState.bgp_router_ip_list[0];
				}catch(e){}
    	        self.populateControlNode(ctrlNodeInfo);
            });
		} else {
	        self.populateControlNode(ctrlNodeInfo);
		}
    }

    this.destroy = function () {
        //contView.destroy();
    }
    
    this.getControlNodeDetails = function(deferredObj,obj) {
        $.ajax({
            url:'/api/admin/monitor/infrastructure/controlnode/details?hostname=' + obj['name']
        }).done(function(result) {
            deferredObj.resolve(result);
        });
    }
        
    this.processPeerInfo = function(peerInfo)
    {
    	var ret = [];
    	var hostname = ctrlNodeInfo['name'];
        try {
        	//first process the bgp peers
        	var bgpPeerInfo = peerInfo['bgp-peer']['value'];
        	ret = self.processPeerDetails(bgpPeerInfo,'bgp',ret,hostname);
        	//now process xmpp peers
        	var xmppPeerInfo = peerInfo['xmpp-peer']['value'];
        	ret = self.processPeerDetails(xmppPeerInfo,'xmpp',ret,hostname);
        } catch(e) {}
        return ret;
    }
    
    this.processPeerDetails = function(bgpPeerInfo,type,ret,hostname){
    	for(var i = 0; i < bgpPeerInfo.length; i++) {
    		var obj = {};
    		obj['raw_json'] = bgpPeerInfo[i];
    		var peerInfodata ;
    		if(type == 'bgp'){
        		try {
    	            var nameArr = bgpPeerInfo[i]['name'].split(':');
    	            if ((hostname == nameArr[4])) {
    	                obj['encoding'] = 'BGP';
    	                obj['peer_address'] = ifNull(bgpPeerInfo[i].value.BgpPeerInfoData.peer_address,noDataStr);
    	            } else {
    	            	continue;//skip if it is not for this control node
    	            }
    	            peerInfodata = bgpPeerInfo[i].value.BgpPeerInfoData;
    	        } catch(e) {
    	        	obj['peer_address'] = '-';
    	        }
    		} else if (type == 'xmpp') {
    			try{
                    var nameArr = bgpPeerInfo[i]['name'].split(':');
                    obj['peer_address'] = nameArr[1];
                    obj['encoding'] = 'XMPP';
                    peerInfodata = bgpPeerInfo[i].value.XmppPeerInfoData;
    			} catch(e){}
    		}
    		try{
    			obj['name'] = ifNull(jsonPath(bgpPeerInfo[i],'$..name')[0],noDataStr);
    		}catch(e){
    			obj['name'] = "-"
    		}
    		try{
    			obj['send_state'] = ifNull(jsonPath(peerInfodata,'$..send_state'),noDataStr);
    			if(obj['send_state'] == false) 
                	obj['send_state'] = '-';
    		}catch(e){
    			obj['send_state'] = '-';
    		}
    		try{
    			obj['peer_asn'] = ifNull(jsonPath(peerInfodata,'$..peer_asn')[0],noDataStr);
    			if(obj['peer_asn'] == null) 
                	obj['peer_asn'] = '-';
    		}catch(e){
    			obj['peer_asn'] = '-';
    		}
    		try{
    			obj = self.copyObject(obj, peerInfodata['state_info']);
    		}catch(e){}
    		try{
    			obj = self.copyObject(obj, peerInfodata['event_info']);
    		}catch(e){
    			obj['routing_tables'] = '-';
    		}	
    		try{
            	obj['routing_tables'] = peerInfodata['routing_tables'];
    		}catch(e){}
            try {
                obj['last_flap'] = new XDate(peerInfodata['flap_info']['flap_time']/1000).toLocaleString();
            } catch(e) {
                obj['last_flap'] = '-';
            }
            try {
                obj['messsages_in'] = peerInfodata['peer_stats_info']['rx_proto_stats']['total'];
            } catch(e) {
                obj['messsages_in'] = '-';
            }
            try {
                obj['messsages_out'] = peerInfodata['peer_stats_info']['tx_proto_stats']['total'];
            } catch(e) {
                obj['messsages_out'] = '-';
            }
            try {
                var state = obj['state'];
                var introspecState = null;
                if (null == state) {
                    introspecState = '' + obj['send_state'];
                } else {
                    introspecState = state + ', ' + obj['send_state'];
                }
                obj['introspect_state'] = introspecState;
            } catch(e) {
                obj['introspect_state'] = '-';
            }
            ret.push(obj);
    	}//for loop for bgp peers END
    	return ret;
    }
    
    this.copyObject = function(dest, src)
    {
        for (key in src) {
            dest[key] = src[key];
        }
        return dest;
    }
    
    this.parseRoutes = function(response,selectedValues){

        var routesArr = [], routeTables = [], routeInstances = [];
        var routes = response;
        var selAddFamily = selectedValues['selAddFamily'];
        var selPeerSrc = selectedValues['selPeerSrc'];
        var selProtocol = selectedValues['selProtocol'];
        routes = jsonPath(response, '$..ShowRoute');
        routeTables = jsonPath(response, '$..routing_table_name');
        routeInstances = jsonPath(response, '$..routing_instance');
        //routes = flattenList(routes);
        var routesLen = routes.length;
        for (var i = 0; i < routesLen; i++) {
        	var isRtTableDisplayed = false;
        	if(!(routes[i] instanceof Array)) {
        		routes[i] = [routes[i]];
            }
            $.each(routes[i], function (idx, value) {
                var currRoute = value;
                var paths = jsonPath(currRoute,"$..ShowRoutePath")[0];
                if(!(paths instanceof Array)) {
                	paths = [paths];
                }
                var pathsLen = paths.length;
                var alternatePaths = [],bestPath = {};
                var rtTable = routeTables[i];
                var securityGroup = "--";
                //Multiple paths can be there for a given prefix
                $.each(paths, function (idx,obj) {
                	if(isRtTableDisplayed){
                    	rtTable = '';
                    } 
                	var rtable= routeTables[i];
                	var origVn = obj['origin_vn'];
                	var addfamily = '-';
                	if(rtable != null){
                		addfamily = (rtable.split('.').length == 3) ? rtable.split('.')[1] : rtable;
                	}
                	var rawJson = obj;
                	var sg = getSecurityGroup(jsonPath(obj,"$..communities..element")[0]);
                	//Fitering based on Address Family, Peer Source and Protocol selection
                	if((selAddFamily == "All" || selAddFamily == addfamily) && 
                			(selPeerSrc == "All" || selPeerSrc == obj['source']) &&
                			(selProtocol == "All" || selProtocol == obj['protocol'])){
                		var src = obj['source'];
                		src = ifNullOrEmptyObject(src, "-").split(":").pop();
                    	origVn = ifNullOrEmptyObject(origVn, "-") ;
                        if(idx == 0) {
                        	routesArr.push({
                        		prefix:currRoute['Prefix'],
                            	dispPrefix:currRoute['prefix'],
                            	table:rtTable,
                            	instance:routeInstances[i],
                            	addrFamily:addfamily,
                            	sg:ifEmpty(sg,'-'),
                            	raw_json:rawJson,
                            	originVn:origVn,
                            	protocol:obj['protocol'],
                            	source:src,
                            	next_hop:obj['next_hop'],
                            	label:obj['label']
                        	});
                        } else {
                        	routesArr.push({
                        		prefix:currRoute['Prefix'],
                            	dispPrefix:'',
                            	table:rtTable,
                            	instance:routeInstances[i],
                            	addrFamily:addfamily,
                            	sg:ifEmpty(sg,'-'),
                            	raw_json:rawJson,
                            	originVn:origVn,
                            	protocol:obj['protocol'],
                            	source:src,
                            	next_hop:obj['next_hop'],
                            	label:obj['label']
                        	});
                        }
                        isRtTableDisplayed = true;
                	}
                });
            });
        }
        routesArr = flattenList(routesArr);
        return routesArr;
    
    }

    function populatePeersTab(obj) {
        layoutHandler.setURLHashParams({tab:'peers',node:'Control Nodes:' + obj['name']},{triggerHashChange:false});
        var transportCfg = {
                url:'/api/admin/monitor/infrastructure/controlnode/paged-bgppeer?hostname=' + obj['name'] + '&count=' + 40
            };
            var peersDS;
        //Intialize the grid only for the first time
        if (!isGridInitialized('#gridPeers')) {
        	peersDS = new ContrailDataView();
            getOutputByPagination(peersDS,{transportCfg:transportCfg,parseFn:self.processPeerInfo});
            $("#gridPeers").contrailGrid({
                header : {
                    title : {
                        text : 'Peers',
                        cssClass : 'blue'
                    },
                    defaultControls: {
                        collapseable: true,
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    }
                },
                columnHeader : {
                	columns:[
                             {
                                 field:"peer_address",
                                 id:"peer_address",
                                 name:"Peer",
                                 width:150,
                                 cssClass: 'cell-hyperlink-blue',
		                     	 events: {
		                     		onClick: function(e,dc){
		                     			showObjLog(dc.name, dc.encoding + '_peer'); 
		                     		}
		                     	},
		                     	sortable:true
                             },
                             {
                                 field:"encoding",
                                 id:"encoding",
                                 name:"Peer Type",
                                 width:125,
 		                     	 sortable:true
                             },
                             {
                                 field:"peer_asn",
                                 id:"peer_asn",
                                 name:"Peer ASN",
                                 width:125,
 		                     	 sortable:true
                             },
                             {
                                 field:"introspect_state",
                                 id:"introspect_state",
                                 name:"Status",
                                 width:250,
 		                     	 sortable:true
                             },
                             {
                                 field:"last_flap",
                                 id:"last_flap",
                                 name:"Last flap",
                                 width:200,
 		                     	 sortable:true                    
                             },
                             {
                                 field:'messsages_in',
                                 id:'messsages_in',
                                 width:160,
                                 name:"Messages (Recv/Sent)",
                                 formatter : function(r, c, v, cd, dc) {
                         			return dc.messsages_in + ' / ' + dc.messsages_out;
                         		 },
 		                     	 sortable:true
                             }
                         ],
                },
        		body : {
        			options : {
        				//checkboxSelectable: true,
        				forceFitColumns: true,
        				detail:{
        					template: $("#gridsTemplateJSONDetails").html()
        				}
        			},
        			dataSource : {
	        			dataView : peersDS
        			},
        			statusMessages: {
        				loading: {
        					text: 'Loading Peers..',
        				},
        				empty: {
        					text: 'No Peers to display'
        				}, 
        				errorGettingData: {
        					type: 'error',
        					iconClasses: 'icon-warning',
        					text: 'Error in getting Data.'
        				}
        			}
        		},
    			footer : {
    				pager : {
    					options : {
    						pageSize : 50,
    						pageSizeSelect : [10, 50, 100, 200, 500 ]
    					}
    				}
    			}
        	});
            peersGrid = $("#gridPeers").data("contrailGrid");
            peersGrid.showGridMessage('loading');
        } else {
            reloadGrid(peersGrid);
        }

        function initGridSparkline(data) {

        }

        function onPeerRowSelChange() {
            var selRowDataItem = peersGrid.dataItem(peersGrid.select());
            if (currView != null) {
                currView.destroy();
            }
            currView = peerNodeView;
            peerNodeView.load({name:selRowDataItem['address']});
        }
    }

    function populateRoutesTab(obj) {
        layoutHandler.setURLHashParams({tab:'routes',node:'Control Nodes:' + obj['name']},{triggerHashChange:false});
	      var  txtPrefixSearch = $('#txtPrefixSearch').contrailAutoComplete({
	    	  source:[]
	      });
	      var routeTableList = ["All","enet","evpn","inet","inetmcast","l3vpn"];
	      var routeLimits = [10, 50, 100, 200];
	      var protocols = ['All','XMPP','BGP','ServiceChain','Static'];
	      
         $( "#comboRoutingInstance" ).contrailCombobox({
//             dataTextField: 'text',
//             dataValueField: 'id',
             dataSource: {
            	 type:'remote',
                 url: '/api/admin/monitor/infrastructure/controlnode/routes/rout-inst-list?ip=' + getIPOrHostName(ctrlNodeInfo),
                 parse:function(response){
                	 var ret = []
                	 ret =['All'].concat(response['routeInstances']);
//                	 $.each(response,function(idx,obj){
//                		 ret.push({'text':obj,'id':obj});
//                	 })
                	 return ret; 
                 }
             },
         });
         var comboRoutingInstance = $( "#comboRoutingInstance" ).data('contrailCombobox');
         
         $( "#comboRoutingTable" ).contrailDropdown({
         	data:routeTableList
         });
         var comboRoutingTable = $( "#comboRoutingTable" ).data('contrailDropdown');
        
         $.each(routeLimits,function(idx,obj){
         	routeLimits[idx] = {'value':obj,'text':obj+' Routes'};
         });
         routeLimits = [{'text':'All','value':'All'}].concat(routeLimits);
         $( "#comboRouteLimit" ).contrailDropdown({
         	dataTextField: 'text',
             dataValueField: 'value',
         	data:routeLimits
         });
         var comboLimit = $( "#comboRouteLimit" ).data('contrailDropdown');
         
         $( "#comboPeerSource" ).contrailDropdown({
             //dataTextField: 'text',
             //dataValueField: 'value',
             dataSource: {
             	type: 'remote',
                 url: '/api/admin/monitor/infrastructure/controlnode/peer-list?hostname=' + obj['name'],
                 parse:function(response){
                	 var ret = ['All']
                	if(!(response instanceof Array)){
                		response = [response];
         		}
                	 ret =['All'].concat(response);
//                	 $.each(response,function(idx,obj){
//                		 ret.push({text:obj,value:obj});
//               	 })
                	 return ret; 
                 }
             },
         });
         var comboPeerSource = $( "#comboPeerSource" ).data('contrailDropdown');
         
        $( "#comboProtocol" ).contrailDropdown({
        	data:protocols
        });
        var comboProtocol = $( "#comboProtocol" ).data('contrailDropdown');
        var routeQueryString = {}, routeTableSel = '';
        
        //Bug : 2360 : Setting default values before the responses for the particular comboboxes are retrieved
        function setDefaults(){
        	comboRoutingInstance.value('All');
        	comboRoutingTable.value('All');
            comboPeerSource.value('All');
            comboProtocol.value('All');
            comboLimit.value('50');
            txtPrefixSearch.val('');
        }
        setDefaults();//Set all to defaults initially
        
        function getRouteTableVal() {
            if (routeTableSel == '')
                return routeTableSel;
            else
                return '.' + routeTableSel + '.';
        }

        function filterRoutes() {
            var routeDS = routesGrid.dataSource;
            if (routesGrid.dataSource.filter() == null) {
                routesGrid.dataSource.filter([
                    {
                        //field:'table',
                        field:function(d) {
                            return d;
                        },
                        operator:function (a, b) {
                            //console.info('customFilter',a,routeTableSel);
                            if ((typeof(a) == 'string') && (a != null) && (routeTableSel != '')) {
                                if (a.indexOf(routeTableSel) > -1)
                                    return true;
                            }
                            if (routeTableSel == '' || (typeof(a) != 'string'))
                                return true;
                            return false;
                        },
                        //operator:'contains',
                        //value:getRouteTableVal()
                        //value:'inet'
                    }
                ])
            }
        }

        function onRouteChange() {
            var name;
            if (name = isCellSelectable(this.select())) {
                if (name == 'source') {
                    selectTab(ctrlNodeTabStrip, 0);
                }
            }
        }
        if (!isGridInitialized($('#gridRoutes'))) {
            var routesGrid = $('#gridRoutes').data('contrailGrid');
            var url = '/api/admin/monitor/infrastructure/controlnode/routes?ip=' + getIPOrHostName(ctrlNodeInfo) + '&' + $.param(routeQueryString);
            var ajaxConfig = {
                    url: url,
                    type: 'GET'
                };
            $('#btnRouteReset').on('click', function () {
                setDefaults();
                $('#btnDisplayRoutes').trigger('click');
            });

            $('#btnDisplayRoutes').on('click', function (e) {
                //Frame the filter query string
                var newAjaxConfig = {url:url,type:'Get'};
                routeQueryString = { };
                var routeInst = comboRoutingInstance.value(), routeTable = comboRoutingTable.value(),
                    peerSource = comboPeerSource.value(), protocol = comboProtocol.value(), limit = comboLimit.value(), prefix = txtPrefixSearch.val();
                if (routeInst != 'All')
                    routeQueryString['routingInst'] = routeInst;
                if (routeTable != 'All') {
                	routeQueryString['addrFamily'] = routeTable;
                } else
                	routeQueryString['addrFamily'] = '';
                if (peerSource != 'All')
                    routeQueryString['peerSource'] = peerSource;
                if (protocol != 'All')
                    routeQueryString['protocol'] = protocol;
                if (prefix != '')
                    routeQueryString['prefix'] = prefix;
                if (limit != 'All')
                    routeQueryString['limit'] = limit;
               // filterRoutes();
                newAjaxConfig['url'] = '/api/admin/monitor/infrastructure/controlnode/routes?ip=' + getIPOrHostName(ctrlNodeInfo) + '&' + $.param(routeQueryString);
                routesGrid.setRemoteAjaxConfig(newAjaxConfig);
                reloadGrid(routesGrid);
            });
            
            
            $("#gridRoutes").contrailGrid({
                header : {
                    title : {
                        text : 'Routes',
                        cssClass : 'blue'
                    },
                    defaultControls: {
                        collapseable: true,
                        exportable: false,
                        refreshable: false,
                        searchable: true
                    }
                },
                columnHeader : {
                    columns : [
	                    {
						    field:"table",
						    name:"Routing Table",
						    width:250
						},
	                    {
	                        field:"dispPrefix",
	                        name:"Prefix",
	                        width:200
	                    },
						{
	                        field:"protocol",
	                        name:"Protocol",
	                        //width:75
	                    },
	                    {
	                        field:"source",
	                        name:"Source",
	                        width:130,
	                      //  template:cellTemplate({cellText:'#= source.split(":").pop() #', tooltip:true})
	                    },
	                    {
	                        field:"next_hop",
	                        name:"Next hop",
	                        width:100
	                    },
	                    {
	                        field:"label",
	                        name:"Label",
	                        width:70
	                    },
	                    {
	                        field:"sg",
	                        name:"Security Group",
	                        width:80
	                    },
	                    {
		                    field:"originVn",
		                    name:"Origin VN",
		                    /*cssClass: 'cell-hyperlink-blue',
		                    events: {
                                onClick: function(e,dc){
                                    var tabIdx = $.inArray("networks", ctrlNodeTabStrip);
                                    selectTab(ctrlNodeTabStrip,tabIdx);
                                }
                             },*/
		                    width:180
	                    }
                    ]
                },
        		body : {
        			options : {
        				//checkboxSelectable: true,
        				forceFitColumns: true,
        				detail:{
        					template: $("#gridsTemplateJSONDetails").html()
        				}
        			},
        			dataSource : {
        				remote: {
	        		        ajaxConfig: {
	                            url: function(){
	                                routeQueryString['limit'] = '50';
	                                return '/api/admin/monitor/infrastructure/controlnode/routes?ip=' + getIPOrHostName(ctrlNodeInfo) + '&' + $.param(routeQueryString)
	                            }(),
	                            type: 'GET'
	                        },
		                    dataParser: function(response){
		                    	var selValues = {};
		                    	selValues['selAddFamily'] = comboRoutingTable.value();
		                    	selValues['selPeerSrc'] = comboPeerSource.value();
		                    	selValues['selProtocol'] = comboProtocol.value();
		                    	var parsedData = self.parseRoutes(response,selValues);
		                    	var prefixArray = [];
		                    	$.each(parsedData,function(i,d){
		                    		prefixArray.push(d.dispPrefix);
		                    	});
		                    	txtPrefixSearch.autocomplete( "option", "source" ,prefixArray);
		                    	return parsedData;
	                    	}
	        			}
        			},
        			statusMessages: {
        				loading: {
        					text: 'Loading Routes..',
        				},
        				empty: {
        					text: 'No Routes to display for the given search criteria'
        				}, 
        				errorGettingData: {
        					type: 'error',
        					iconClasses: 'icon-warning',
        					text: 'Error in getting Data.'
        				}
        			}
        		},
    			footer : {
    				pager : {
    					options : {
    						pageSize : 50,
    						pageSizeSelect : [10, 50, 100, 200, 500 ]
    					}
    				}
    			}
        	});
            routesGrid = $('#gridRoutes').data('contrailGrid');
            routesGrid.showGridMessage('loading');
        }
    }
    
    
    function populateDetailsTab(obj) {
        var endTime = getCurrentTime4MemCPUCharts(), startTime = endTime - 600000;
        var slConfig = {startTime: startTime, endTime: endTime};
        var nodeIp;
        //Compute the label/value pairs to be displayed in dashboard pane
        //As details tab is the default tab,don't update the tab state in URL
        layoutHandler.setURLHashParams({tab:'', node:'Control Nodes:' + obj['name']},{triggerHashChange:false});
        //showProgressMask('#controlnode-dashboard', true);
        startWidgetLoading('control-sparklines');
        var dashboardTemplate = contrail.getTemplate4Id('dashboard-template');
        $('#controlnode-dashboard').html(dashboardTemplate({title:'Control Node',colCount:2, showSettings:true, widgetBoxId:'dashboard'}));
        startWidgetLoading('dashboard');   
        $.ajax({
            url:'/api/admin/monitor/infrastructure/controlnode/details?hostname=' + obj['name']
        }).done(function (result) {
                ctrlNodeData = result;
                var parsedData = infraMonitorView.parseControlNodesDashboardData([{name:obj['name'],value:result}])[0];
                var noDataStr = "--";
                var cpu = "N/A",
                    memory = "N/A",
                    ctrlNodeDashboardInfo, oneMinCPU, fiveMinCPU, fifteenMinCPU,
                    usedMemory, totalMemory;   
                $('#control-sparklines').initMemCPUSparkLines(result, 'parseMemCPUData4SparkLines', {'BgpRouterState':[{name: 'cpu_share', color: 'blue-sparkline'}, {name: 'virt_mem', color: 'green-sparkline'}]}, slConfig);
                endWidgetLoading('control-sparklines');
                var procStateList, overallStatus = noDataStr;
                var controlProcessStatusList = [];
                var statusTemplate = contrail.getTemplate4Id("statusTemplate");
                try{
                    overallStatus = getOverallNodeStatusForDetails(parsedData);
                }catch(e){overallStatus = "<span> "+statusTemplate({sevLevel:sevLevels['ERROR'],sevLevels:sevLevels})+" Down</span>";}
                try{
                	procStateList = jsonPath(ctrlNodeData,"$..process_state_list")[0];
                	controlProcessStatusList = getStatusesForAllControlProcesses(procStateList);
                }catch(e){}
                ctrlNodeDashboardInfo = [
                 	{lbl:'Hostname', value:obj['name']},
                    {lbl:'IP Address',value:(function(){
                        try{
                        	var ips = ifNull(jsonPath(ctrlNodeData,'$..bgp_router_ip_list')[0],[]);
                        	var ip = ifNullOrEmpty(getControlIpAddresses(ctrlNodeData,"details"),noDataStr);
                        	return ip;
                        } catch(e){return noDataStr;}
                    })()},
                    {lbl:'Version', value:parsedData['version'] != '-' ? parsedData['version'] : noDataStr},
                    {lbl:'Overall Node Status', value:overallStatus},
                    {lbl:'Processes', value:" "},
                    {lbl:INDENT_RIGHT+'Control Node', value:(function(){
                    	try{
                    		return ifNull(controlProcessStatusList['contrail-control'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},
                    /*{lbl:INDENT_RIGHT+'Control Node Manager', value:(function(){
                    	try{
                    		return ifNull(controlProcessStatusList['contrail-control-nodemgr'],noDataStr);
                    	}catch(e){return noDataStr;}
                    })()},*/
                    {lbl:'Ifmap Connection', value:(function(){
                    	var cnfNode = '';
                    	try{
	                    	var url = ctrlNodeData.BgpRouterState.ifmap_info.url;
	                    	if(url != null && url != undefined && url != ""){
		                    	var pos = url.indexOf(':8443');
		                    	if(pos != -1)
		                    		cnfNode = url.substr(0, pos);
		                        pos = cnfNode.indexOf('https://');
		                        if(pos != -1)
		                        	cnfNode = cnfNode.slice(pos + 8) ;
	                    	}
	                        var status = ctrlNodeData.BgpRouterState.ifmap_info.connection_status;
	                        var stateChangeAtTime = ctrlNodeData.BgpRouterState.ifmap_info.connection_status_change_at;
	                        var stateChangeSince = "";
	                        var statusString = "";
	                        if(stateChangeAtTime != null){
	                        	var stateChangeAtTime = new XDate(stateChangeAtTime/1000);
	                            var currTime = new XDate();
	                            stateChangeSince = diffDates(stateChangeAtTime,currTime);
	                        }
	                        if(status != null && status != undefined && status != ""){
	                        	if(stateChangeSince != ""){
	                        		if(status.toLowerCase() == "up" || status.toLowerCase() == "down"){
		                        		status = status + " since";
		                        	}
	                        		statusString = status + " " + stateChangeSince;
	                        	} else {
	                        		statusString = status;
	                        	}
	                        }
	                        if(statusString != ""){
	                        	cnfNode = cnfNode.concat( ' (' + statusString + ')');
	                        }
                    	}catch (e){}
                        return ifNull(cnfNode,noDataStr);
                    })()},
                    {lbl:'Analytics Node', value:(function(){
                    	var anlNode = noDataStr; 
                    	var secondaryAnlNode, status;
                    	try{
                    		//anlNode = ifNull(computeNodeData.VrouterAgent.collector,noDataStr);
                    		anlNode = jsonPath(ctrlNodeData,"$..ModuleClientState..primary")[0].split(':')[0];
                    		status = jsonPath(ctrlNodeData,"$..ModuleClientState..status")[0];
                    		secondaryAnlNode = jsonPath(ctrlNodeData,"$..ModuleClientState..secondary")[0].split(':')[0];
                    	}catch(e){
                    		anlNode = "--";
                    	}
                    	try{
                    		if(anlNode != null && anlNode != noDataStr && status.toLowerCase() == "established")
                    			anlNode = anlNode.concat(' (Up)');
                    	}catch(e){
                    		if(anlNode != null && anlNode != noDataStr) {
                    			anlNode = anlNode.concat(' (Down)');
                    		}
                    	}
                    	if(secondaryAnlNode != null && secondaryAnlNode != "" && secondaryAnlNode != "0.0.0.0"){
                    		anlNode.concat(', ' + secondaryAnlNode);
                    	}
                    	return ifNull(anlNode,noDataStr);
                    })()},
                    //TODO{lbl:'Config Messages', value:ctrlNodeData['configMessagesIn'] + ' In, ' + ctrlNodeData['configMessagesOut'] + ' Out'},
                    {lbl:'Analytics Messages', value:(function(){
                        var msgs = getAnalyticsMessagesCountAndSize(ctrlNodeData,['ControlNode']);
                        return msgs['count']  + ' [' + formatBytes(msgs['size']) + ']';
                    })()},
            		{lbl:'Peers', value:(function(){
            			var totpeers= 0,uppeers=0;
            			try{
	            			totpeers= ifNull(parsedData['totalBgpPeerCnt'],0);
	            			uppeers = ifNull(parsedData['upBgpPeerCnt'],0);
            			}catch(e){}
            			var downpeers = 0;
            			if(totpeers > 0){
            				downpeers = totpeers - uppeers;
            			}
            			if (downpeers > 0){
            				downpeers = ", <span class='text-error'>"+ downpeers +" Down</span>";
            			} else {
            				downpeers = "";
            			}
            			return contrail.format('BGP Peers: {0} Total {1}',totpeers,downpeers);
            		})()},
                    {lbl:'',value:(function(){
                    	var totXmppPeers = 0,upXmppPeers = 0,downXmppPeers = 0,subsCnt = 0;
                    	try{
                    		totXmppPeers = parsedData['totalXMPPPeerCnt'];
                    		upXmppPeers = parsedData['upXMPPPeerCnt'];
                    		subsCnt = ifNull(jsonPath(ctrlNodeData,'$..BgpRouterState.ifmap_server_info.num_peer_clients')[0],0)
                    		if(totXmppPeers > 0){
                    			downXmppPeers = totXmppPeers - upXmppPeers;
                			}
                    		if (downXmppPeers > 0){
                    			downXmppPeers = ", <span class='text-error'>"+ downXmppPeers +" Down</span>";
                			} else {
                				downXmppPeers = "";
                			}
                    		if (subsCnt > 0){
                    			subsCnt = ", "+ subsCnt +" subscribed for configuration";
                			} else {
                				subsCnt = ""
                			}
                    	}catch(e){return noDataStr;}
                    	return contrail.format('vRouters: {0} Established in Sync{1}{2} ',
                    			upXmppPeers,downXmppPeers,subsCnt);
                    })()},
                    {lbl:'CPU', value:$.isNumeric(parsedData['cpu']) ? parsedData['cpu'] + ' %' : noDataStr},
                    {lbl:'Memory', value:parsedData['memory'] != '-' ? parsedData['memory'] : noDataStr},
                    {lbl:'Last Log', value: (function(){
                    	var lmsg;
                		lmsg = getLastLogTimestamp(ctrlNodeData,"control");
                		if(lmsg != null){
                			try{
                				return new Date(parseInt(lmsg)/1000).toLocaleString();	
                			}catch(e){return noDataStr;}
                		} else return noDataStr;
                    })()}
                ]
                /*Selenium Testing*/
                ctrlNodeDetailsData = ctrlNodeDashboardInfo;
                /*End of Selenium Testing*/
                var cores=getCores(ctrlNodeData);
                for(var i=0;i<cores.length;i++)
                	ctrlNodeDashboardInfo.push(cores[i]);
                var dashboardBodyTemplate = Handlebars.compile($("#dashboard-body-template").html());
                $('#dashboard-box .widget-body').html(dashboardBodyTemplate({colCount:2, d:ctrlNodeDashboardInfo, nodeData:ctrlNodeData, showSettings:true, ip:nodeIp}));
                var ipList = getControlNodeIpAddressList(ctrlNodeData);
                var ipDeferredObj = $.Deferred();
            	getReachableIp(ipList,"8083",ipDeferredObj);
            	ipDeferredObj.done(function(nodeIp){
	                if(nodeIp != null && nodeIp != noDataStr) {
	                	$('#linkIntrospect').unbind('click');
	                    $('#linkIntrospect').click(function(){
	                        window.open('/proxy?proxyURL=http://'+nodeIp+':8083&indexPage', '_blank');
	                    });
	                    $('#linkStatus').unbind('click');
	                    $('#linkStatus').on('click', function(){
	                        showStatus(nodeIp);
	                    });
	                    $('#linkLogs').unbind('click');
	                    $('#linkLogs').on('click', function(){
	                        showLogs(nodeIp);
	                    });
	                }
            	});

                endWidgetLoading('dashboard');
                initWidget4Id('#control-chart-box');
            }).fail(displayAjaxError.bind(null, $('#controlnode-dashboard')));
        $('#control-chart').initMemCPULineChart($.extend({url:function() {
            return '/api/tenant/networking/flow-series/cpu?moduleId=ControlNode&minsSince=30&sampleCnt=10&source=' + ctrlNodeInfo['name']  + '&endTime=' + endTime;
        }, parser: "parseProcessMemCPUData", plotOnLoad: true, showWidgetIds: [], hideWidgetIds: [], titles: {memTitle:'Memory',cpuTitle:'% CPU Utilization'}}),110);
    }

    this.populateControlNode = function (obj) {
        //Render the view only if URL HashParam doesn't match with this view
        //Implies that we are already in control node details page
        if (!isInitialized('#control_tabstrip')) {
            var ctrlNodeTemplate = Handlebars.compile($("#controlnode-template").html());
            $(pageContainer).html(ctrlNodeTemplate(ctrlNodeInfo));

            //Set the height of all tabstrip containers to viewheight - tabstrip
            var tabContHeight = layoutHandler.getViewHeight() - 42;
            //$('#control_tabstrip > div').height(tabContHeight);

            $("#control_tabstrip").contrailTabs({
                //height:"300px",
//                animation:{
//                    open:{
//                        effects:"fadeIn"
//                    }
//                },
                activate:function (e, ui) {
                    infraMonitorView.clearTimers();
                    var selTab = ui.newTab.context.innerText;
                    if (selTab == 'Peers') {
                        populatePeersTab(ctrlNodeInfo);
                        $('#gridPeers').data('contrailGrid').refreshView();
                    } else if (selTab == 'Routes') {
                        populateRoutesTab(ctrlNodeInfo);
                        $('#gridRoutes').data('contrailGrid').refreshView();
                    } else if (selTab == 'Console') {
                        infraMonitorView.populateMessagesTab('control', {source:ctrlNodeInfo['name']}, ctrlNodeInfo);
                    } else if (selTab == 'Details') {
                        populateDetailsTab(ctrlNodeInfo);
                    } 
                }
            });
        }
        var tabIdx = $.inArray(obj['tab'], controlNodetabs);
        if (tabIdx == -1){
            tabIdx = 0;
            populateDetailsTab(ctrlNodeInfo);
        }
        //If any tab is stored in URL,select it else select the first tab
        selectTab(ctrlNodeTabStrip,tabIdx);
    }
}

ctrlNodesView = new controlNodesView();
ctrlNodeView = new controlNodeView();

function getStatusesForAllControlProcesses(processStateList){
	var ret = [];
	if(processStateList != null){
		for(var i=0; i < processStateList.length; i++){
			var currProc = processStateList[i];
			if(currProc.process_name == "contrail-control-nodemgr"){
				ret['contrail-control-nodemgr'] = getProcessUpTime(currProc);
			} else if(currProc.process_name == "contrail-control"){
				ret['contrail-control'] = getProcessUpTime(currProc);
			}
		}
	}
	return ret;
}

function getControlNodeIpAddressList(data){
	var ips = getValueByJsonPath(data,'$..bgp_router_ip_list',[]);
	var configip = jsonPath(data,'$..ConfigData..bgp_router_parameters.address')[0];
	var ipList = [];
	if(ips.length > 0){
		$.each(ips,function(idx,obj){
			if(obj != null && ipList.indexOf(obj) == -1){
				ipList.push(obj);
			}
		});
	}
	if(configip != null && ipList.indexOf(configip) == -1){
		ipList.push(configip);
	}
	return ipList;
}
