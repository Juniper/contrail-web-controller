/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'contrail-list-model',
    'monitor/infrastructure/common/ui/js/views/MonitorInfraObjectLogsPopUpView'
], function (_, ContrailView, ContrailListModel, MonitorInfraObjectLogsPopUpView) {
    var hostname;
    var ControlNodePeersGridView = ContrailView.extend({
        el: $(contentContainer),

        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            hostname = viewConfig['hostname'];
            var remoteAjaxConfig = {
                    remote: {//TODO need to verify if the pagination is actually working
                        ajaxConfig: {
                            url: contrail.format(
                                    monitorInfraConstants.
                                    monitorInfraUrls['CONTROLNODE_PEERS'],
                                    hostname, 40),
                            type: "GET",
                        },
                        dataParser: processPeerInfo
                    },
                    cacheConfig: {
//                        ucid: "controlnode_peers_list"
                    }
            }
            var contrailListModel = new ContrailListModel(remoteAjaxConfig);

            self.renderView4Config(this.$el, contrailListModel,
                    getControlNodePeersViewConfig(viewConfig));
        }
    });

    var getControlNodePeersViewConfig = function (viewConfig) {
        return {
            elementId : ctwl.CONTROLNODE_PEERS_GRID_SECTION_ID,
            view : "SectionView",
            viewConfig : {
                rows : [ {
                    columns : [ {
                        elementId : ctwl.CONTROLNODE_PEERS_GRID_ID,
                        title : ctwl.CONTROLNODE_PEERS_TITLE,
                        view : "GridView",
                        viewConfig : {
                            elementConfig :
                                getControlNodePeersGridConfig()
                        }
                    } ]
                } ]
            }
        }
    }


    function getControlNodePeersGridConfig() {

    var columns = [ {
        field : "peer_address",
        id : "peer_address",
        name : "Peer",
        width : 150,
        cssClass : 'cell-hyperlink-blue',
        events : {
            onClick : function(e, dc) {
                monitorInfraUtils.showObjLogs (dc.name,dc.encoding + '_peer');
            }
        },
        sortable : true,
        sorter : comparatorIP
    }, {
        field : "encoding",
        id : "encoding",
        name : "Peer Type",
        width : 125,
        sortable : true
    }, {
        field : "peer_asn",
        id : "peer_asn",
        name : "Peer ASN",
        width : 125,
        sortable : true
    }, {
        field : "introspect_state",
        id : "introspect_state",
        name : "Status",
        width : 250,
        sortable : true
    }, {
        field : "last_flap",
        id : "last_flap",
        name : "Last flap",
        width : 200,
        sortable : true
    }, {
        field : 'messsages_in',
        id : 'messsages_in',
        width : 160,
        name : "Messages (Recv/Sent)",
        formatter : function(r, c, v, cd, dc) {
            return dc.messsages_in + ' / ' + dc.messsages_out;
        },
        sortable : true
    } ];
    var gridElementConfig = {
        header : {
            title : {
                text : ctwl.CONTROLNODE_PEERS_TITLE
            }
        },
        columnHeader : {
            columns : columns
        },
        body : {
            options : {
                detail : ctwu.getDetailTemplateConfigToDisplayRawJSON(),
                checkboxSelectable : false
            },
            dataSource : {
                data : []
            },
            statusMessages: {
                loading: {
                   text: 'Loading Peers..',
                },
                empty: {
                   text: 'No Peers Found.'
                }
             }
        }
    };
    return gridElementConfig;

}

    this.processPeerInfo = function(peerInfo)
    {
        if(peerInfo != null && peerInfo.data != null) {
            peerInfo = peerInfo.data;
        } else {
            return [];
        }
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
      var noDataStr = monitorInfraConstants.noDataStr;
      for(var i = 0; i < bgpPeerInfo.length; i++) {
         var obj = {};
         obj['raw_json'] = bgpPeerInfo[i];
         var peerInfodata ;
         if(type == 'bgp'){
            try {
                  var nameArr = bgpPeerInfo[i]['name'].split(':');
                  if ((hostname == nameArr[4])) {
                      obj['encoding'] = 'BGP';
                      obj['peer_address'] = ifNull(
                              bgpPeerInfo[i].value.BgpPeerInfoData.peer_address,
                              noDataStr);
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
            obj['name'] = ifNull(jsonPath(bgpPeerInfo[i],'$..name')[0],
                            noDataStr);
         }catch(e){
            obj['name'] = "-"
         }
         try{
            obj['peer_asn'] = ifNull(jsonPath(peerInfodata,'$..peer_asn')[0],
                                noDataStr);
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
                obj['last_flap'] = new XDate(
                        peerInfodata['flap_info']['flap_time']/1000).
                        toLocaleString();
            } catch(e) {
                obj['last_flap'] = '-';
            }
            obj['messsages_in'] = getValueByJsonPath(
                                    peerInfodata,
                                    'peer_stats_info;rx_proto_stats;total',
                                    noDataStr);
            obj['messsages_out'] = getValueByJsonPath(
                                    peerInfodata,
                                    'peer_stats_info;tx_proto_stats;total',
                                    noDataStr);
            obj['introspect_state'] = getValueByJsonPath(obj,'state','-');
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

    return ControlNodePeersGridView;
});