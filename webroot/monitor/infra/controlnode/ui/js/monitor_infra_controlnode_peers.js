/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

/*
 * Control Node Peers tab
 */
monitorInfraControlPeersClass = (function() {
    var hostname,peersGrid;
    this.processPeerInfo = function(peerInfo)
    {

        var ret = [];
        //first process the bgp peers
        var bgpPeerInfo = getValueByJsonPath(peerInfo,'bgp-peer;value',[]);
        ret = self.processPeerDetails(bgpPeerInfo,'bgp',ret,hostname);
        //now process xmpp peers
        var xmppPeerInfo = getValueByJsonPath(peerInfo,'xmpp-peer;value',[]);
        ret = self.processPeerDetails(xmppPeerInfo,'xmpp',ret,hostname);
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
            obj['messsages_in'] = getValueByJsonPath(peerInfodata,'peer_stats_info;rx_proto_stats;total',noDataStr);
            obj['messsages_out'] = getValueByJsonPath(peerInfodata,'peer_stats_info;tx_proto_stats;total',noDataStr);
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
    
    this.populatePeersTab = function(obj) {
        if(obj.detailView === undefined) {
            layoutHandler.setURLHashParams({tab:'peers',node: obj['name']},{triggerHashChange:false});
        }    
        hostname = obj['name']
        var transportCfg = {
                url: contrail.format(monitorInfraUrls['CONTROLNODE_PEERS'], obj['name'], 40)
            };
            var peersDS;
        //Intialize the grid only for the first time
        if (!isGridInitialized('#gridPeers' + '_' + obj.name)) {
         peersDS = new ContrailDataView();
            getOutputByPagination(peersDS,{transportCfg:transportCfg,parseFn:self.processPeerInfo});
            $("#gridPeers" + '_' + obj.name).contrailGrid({
                header : {
                    title : {
                        text : 'Peers'
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
            }
         });
            peersGrid = $("#gridPeers" + '_' + obj.name).data("contrailGrid");
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
    return {populatePeersTab:populatePeersTab,
        processPeerInfo:processPeerInfo}
})();
