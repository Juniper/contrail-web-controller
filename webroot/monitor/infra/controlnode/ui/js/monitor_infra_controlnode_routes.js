/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Control Node Routes tab
 */
monitorInfraControlRoutesClass = (function() {
    var routesGrid;
    var RoutesViewModel = function () {
        this.routingInstances = ko.observableArray([]);
          this.routingInstanceValue = ko.observable('All');
          this.routeTables = ko.observableArray([]);
          this.routeTableValue =  ko.observable('All');
          this.peerSources = ko.observableArray([]);
          this.peerSourceValue = ko.observable('');
          this.prefix = ko.observable('');
//          this.routeLimits:$.map(['All',10, 50, 100, 200], function (value) {
//              return {text:value + ' Routes', value:value};
//          }),
          this.routeLimits = ko.observableArray(['All',10, 50, 100, 200]);
          //this.routeLimitsText = 
          this.limit = '50';
      }
      var routesViewModel = new RoutesViewModel();
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
                     var protocol = ifNullOrEmptyObject(obj['protocol'],noDataStr);
                     var nextHop = ifNullOrEmptyObject(obj['next_hop'],noDataStr);
                     var label = ifNullOrEmptyObject(obj['label'],noDataStr);
                     var prefix = ifNullOrEmptyObject(currRoute['prefix'],noDataStr);
                     src = ifNullOrEmptyObject(src, noDataStr).split(":").pop();
                     origVn = ifNullOrEmptyObject(origVn, noDataStr) ;
                     
                        if(idx == 0) {
                           routesArr.push({
                              prefix:prefix,
                              dispPrefix:prefix,
                              table:rtTable,
                              instance:routeInstances[i],
                              addrFamily:addfamily,
                              sg:ifEmpty(sg,'-'),
                              raw_json:rawJson,
                              originVn:origVn,
                              protocol:protocol,
                              source:src,
                              next_hop:nextHop,
                              label:label
                           });
                        } else {
                           routesArr.push({
                              prefix:prefix,
                              dispPrefix:'',
                              table:rtTable,
                              instance:routeInstances[i],
                              addrFamily:addfamily,
                              sg:ifEmpty(sg,'-'),
                              raw_json:rawJson,
                              originVn:origVn,
                              protocol:protocol,
                              source:src,
                              next_hop:nextHop,
                              label:label
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
    
    this.populateRoutesTab = function(obj) {
        layoutHandler.setURLHashParams({tab:'routes',node: obj['name']},{triggerHashChange:false});
         var  txtPrefixSearch = $('#txtPrefixSearch').contrailAutoComplete({
           source:[]
         });
         var routeTableList = ["All","enet","erm-vpn","evpn","inet","inetvpn","l3vpn","rtarget"];
         var routeLimits = [10, 50, 100, 200];
         var protocols = ['All','XMPP','BGP','ServiceChain','Static'];
         
         $( "#comboRoutingInstance" ).contrailCombobox({
             defaultValue:'All',
             dataSource: {
                 type:'remote',
                 url: contrail.format(monitorInfraUrls['CONTROLNODE_ROUTE_INST_LIST'], getIPOrHostName(obj)),
                 async:true,
                 parse:function(response){
                   var ret = []
                   ret =['All'].concat(response['routeInstances']);
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
                 url: contrail.format(monitorInfraUrls['CONTROLNODE_PEER_LIST'],obj['name']),
                 parse:function(response){
                   var ret = ['All']
                  if(!(response instanceof Array)){
                     response = [response];
               }
                   ret =['All'].concat(response);
//                    $.each(response,function(idx,obj){
//                       ret.push({text:obj,value:obj});
//                 })
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
            var url =  monitorInfraUrls['CONTROLNODE_ROUTES'] + '?ip=' + getIPOrHostName(obj) + '&' + $.param(routeQueryString);
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
                newAjaxConfig['url'] = monitorInfraUrls['CONTROLNODE_ROUTES'] + '?ip=' + getIPOrHostName(obj) + '&' + $.param(routeQueryString);
                routesGrid.setRemoteAjaxConfig(newAjaxConfig);
                reloadGrid(routesGrid);
            });
            
            
            $("#gridRoutes").contrailGrid({
                header : {
                    title : {
                        text : 'Routes'
                    }
                },
                columnHeader : {
                    columns : [
                       {
                          field:"table",
                          name:"Routing Table",
                          minWidth:200
                       },
                       {
                           field:"dispPrefix",
                           name:"Prefix",
                           minWidth:200
                       },
                       {
                           field:"protocol",
                           name:"Protocol",
                           minWidth:40
                       },
                       {
                           field:"source",
                           name:"Source",
                           minWidth:130
                       },
                       {
                           field:"next_hop",
                           name:"Next hop",
                           minWidth:70
                       },
                       {
                           field:"label",
                           name:"Label",
                           minWidth:40
                       },
                       {
                           field:"sg",
                           name:"Security Group",
                           minWidth:80
                       },
                       {
                          field:"originVn",
                          name:"Origin VN",
                          minWidth:180
                       }
                    ]
                },
                body : {
                    options : {
                        forceFitColumns: true,
                        detail:{
                            template: $("#gridsTemplateJSONDetails").html()
                        },
                        sortable : false
                    },
                    dataSource : {
                        remote: {
                            ajaxConfig: {
                                url: function(){
                                    routeQueryString['limit'] = '50';
                                    return monitorInfraUrls['CONTROLNODE_ROUTES'] + '?ip=' + getIPOrHostName(obj) + '&' + $.param(routeQueryString)
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
                }
            });
            routesGrid = $('#gridRoutes').data('contrailGrid');
            routesGrid.showGridMessage('loading');
        }
    }
    return {populateRoutesTab:populateRoutesTab,
        parseRoutes:parseRoutes}
})();