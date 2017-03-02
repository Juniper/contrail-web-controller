/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define(
        [ 'underscore', 'contrail-view'],
    function(
            _, ContrailView, GlobalControllerListModel) {
            var GlobalControllerListView = ContrailView.extend({
                el: $(contentContainer),
                renderCGCView : function() {
                    this.renderView4Config(this.$el, null,
                            getGlobalControllerListViewConfig());
                }
            });
            function getGlobalControllerListViewConfig() {
                var viewConfig = {
                        rows : [
                                {
                                    columns : [
                                               {
                                        elementId: 'globalcontrioller-carousel-view',
                                        view: "CarouselView",
                                        viewConfig: {
                                            pages : [
                                                 {
                                                     page: {
                                                         elementId : 'globalcontroller-grid-stackview-0',
                                                         view : "GridStackView",
                                                         viewConfig : {
                                                            elementId : 'globalcontroller-grid-stackview-0',
                                                            gridAttr : {
                                                                defaultWidth :3,
                                                                defaultHeight : 4.2
                                                            },
                                                            widgetCfgList: getWCViewConfigList()
                                                         }
                                                     },
                                                 },
                                            ]
                                        }
                                    }]
                                }]
                       };
                return {
                    elementId : cowu.formatElementId([
                         ctwl.GLOBAL_CONTROLER_LIST_VIEW_SECTION_ID ]),
                    view : "SectionView",
                    viewConfig : viewConfig
                };
            }
            return GlobalControllerListView;
        });
    function getWCViewConfigList () {
        var gcArray = [],
            regionVC,
            regionList = globalObj['webServerInfo']['regionList'],
            index = regionList.indexOf('All Regions');
            if (index > -1) {
                    regionList.splice(index, 1);
              }
              gcArray = [{
                  "id": "bar-view"
                }
              ];
              _.each(regionList, function(region){
                regionVC = {
                        "id": ""+region+"",
                   };
                gcArray.push(regionVC);
              })
              return gcArray;
        }
    function globalControllerRegion(regionName){
            if(regionName === 'All Regions') {
                $("#page-content").css("padding","0px");
            }
            else{
              $("#page-content").css("padding","2px 10px 5px");
            }
            var oldRegion = contrail.getCookie('region');
            var region = regionName;
            if ((null != region) && (oldRegion != region) &&
                ('null' != region) && ('undefined' != region)) {
                contrail.setCookie('region', region);
                loadUtils.isAuthenticated();
            }
        }
    $(document).ready(function() {
        var region = contrail.getCookie('region');
        if(region === 'All Regions') {
                $("#page-content").css("padding","0px");
            }
            else{
              $("#page-content").css("padding","2px 10px 5px");
            }
     });
