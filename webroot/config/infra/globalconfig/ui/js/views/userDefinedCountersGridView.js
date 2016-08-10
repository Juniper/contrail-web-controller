/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'config/infra/globalconfig/ui/js/models/userDefinedCountersModel',
    'config/infra/globalconfig/ui/js/views/userDefinedCountersCreateEditView',
    'config/infra/globalconfig/ui/js/globalConfigFormatters'
], function (_, ContrailView, UserDefinedCountersModel,
        UserDefindCountersCreateEditView,GlobalConfigFormatters) {
   var userDefinedCountersCreateEditView = new  UserDefindCountersCreateEditView(),
        globalConfigFormatters = new GlobalConfigFormatters(),
        gridElId = "#"+ctwc.USER_DEFINED_COUNTRERS_GRID_ID;

    var userDefinedCountersGridView = ContrailView.extend({
        el: $(contentContainer),
        render: function () {
            var self = this,
                viewConfig = this.attributes.viewConfig;
            self.renderView4Config(self.$el, self.model,
                                   getuserDefinedCountersViewConfig());
        }
    });

    var getuserDefinedCountersViewConfig = function () {
        return {
            elementId: ctwc.USER_DEFINED_COUNTRERS_LIST_ID,
            view: "SectionView",
            viewConfig: {
                rows: [
                    {
                        columns: [
                            {
                                elementId: ctwc.USER_DEFINED_COUNTRERS_GRID_ID,
                                view: "GridView",
                                viewConfig: {
                                    elementConfig: getConfiguration()
                                }
                            }
                        ]
                    }
                ]
            }
        };
    };

    var getConfiguration = function () {
        var gridElementConfig = {
            header: {
                title: {
                    text: ctwl.TITLE_USER_DEFINED_COUNTERS
                },
                advanceControls: getHeaderActionConfig(),
            },
            body: {
                options: {
                    checkboxSelectable: {
                        onNothingChecked: function(e){
                            $('#btnDeleteCounters').addClass('disabled-link');
                        },
                        onSomethingChecked: function(e){
                            $('#btnDeleteCounters').
                                removeClass('disabled-link');
                        }
                    },
                    actionCell: getRowActionConfig(),
                    detail: false,
                },
                dataSource: {
                },
                statusMessages: {
                    loading: {
                        text: 'Loading Patterns..'
                    },
                    empty: {
                        text: 'No Patterns Found.'
                    },
                    errorGettingData: {
                        type: 'error',
                        iconClasses: 'fa fa-warning',
                        text: 'Error in getting Patterns.'
                    }
                }
            },
            columnHeader: {
                columns: userDefinedCounterOptionsColumns
            }
        };
        return gridElementConfig;
    };

    function getRowActionConfig() {
        var rowActionConfig = [
            ctwgc.getEditAction(function (rowIndex) {
                var gridObj = $(gridElId).data('contrailGrid'),
                    gridData = gridObj._dataView.getItems(),
                    dataItem = gridObj._dataView.getItem(rowIndex),
                    userDefinedCountersModel = new UserDefinedCountersModel(dataItem),
                    checkedRow = dataItem,
                    title =
                        ctwl.TITLE_EDIT_USER_DEFINDED_COUNTER;
                    userDefinedCountersCreateEditView.model = userDefinedCountersModel;
                    userDefinedCountersCreateEditView.renderCreateEditUserDefinedCounter(
                    {
                        "title": title,
                        checkedRow: checkedRow,
                        callback: function () {
                            gridObj._dataView.refreshData();
                        },
                        mode : ctwl.EDIT_ACTION,
                        gridData: gridData,
                        rowIndex: rowIndex,
                        disabled:true
                    }
                );
                }, "Edit"),
              ctwgc.getDeleteAction(function (rowIndex) {
              var gridObj = $(gridElId).data('contrailGrid'),
                  gridData = gridObj._dataView.getItems(),
                  dataItem = gridObj._dataView.getItem(rowIndex),
                  userDefinedCountersModel = new UserDefinedCountersModel(),
                  checkedRow = [dataItem];
                  userDefinedCountersCreateEditView.model = userDefinedCountersModel;
                  userDefinedCountersCreateEditView.renderDeleteCounters(
                  {"title": ctwl.TITLE_DEL_USER_DEFINDED_COUNTER,
                      checkedRows: checkedRow,
                      callback: function () {
                          gridObj._dataView.refreshData();
                      },
                      gridData: gridData,
                      rowIndexes: [rowIndex],
                  }
              );
        })];
        return rowActionConfig;
    };

    var userDefinedCounterOptionsColumns = [
        {
            field: 'name',
            name: 'Name',
            sortable: true
        },
        {
            field: 'pattern',
            name: 'RegEx Pattern',
            sortable: true
        },
    ];

    function getHeaderActionConfig() {
        var headerActionConfig = [
              {
                  "type" : "link",
                  "title" :  ctwl.COUNTERS_MUTI_SELECT_DELETE,
                  "iconClass": 'fa fa-trash',
                  "linkElementId": 'btnDeleteCounters',
                  "onClick" : function() {
                      var gridObj = $(gridElId).data('contrailGrid'),
                          gridData = gridObj._dataView.getItems(),
                          rowIndexes = gridObj._grid.getSelectedRows();
                          userDefinedCountersModel = new UserDefinedCountersModel(),
                          checkedRows = gridObj.getCheckedRows();
                          if(checkedRows && checkedRows.length > 0) {
                          userDefinedCountersCreateEditView.model = userDefinedCountersModel;
                          userDefinedCountersCreateEditView.renderDeleteCounters(
                              {
                                  "title":
                                      ctwl.TITLE_DEL_USER_DEFINDED_COUNTERS,
                                  checkedRows: checkedRows,
                                  callback: function () {
                                      gridObj._dataView.refreshData();
                                      gridObj.setCheckedRows([]);
                                  },
                                  gridData: gridData,
                                  rowIndexes: rowIndexes
                              }
                          );
                      }
                  }
              },
            {
                "type": "link",
                "title": ctwl.TITLE_CREATE_USER_DEFINDED_COUNTER,
                "iconClass": 'fa fa-plus',
                "onClick": function() {
                    var gridObj = $(gridElId).data('contrailGrid'),
                        userDefinedCountersModel = new UserDefinedCountersModel();
                        userDefinedCountersCreateEditView.model = userDefinedCountersModel;
                        userDefinedCountersCreateEditView.renderCreateEditUserDefinedCounter(
                        {
                            "title": ctwl.TITLE_CREATE_USER_DEFINDED_COUNTER,
                            callback: function () {
                                gridObj._dataView.refreshData();
                            },
                            disabled: false
                        }
                    );
                }
            }
        ];
        return headerActionConfig;
    }

   return userDefinedCountersGridView;
});

