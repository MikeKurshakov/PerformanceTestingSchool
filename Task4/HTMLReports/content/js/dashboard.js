/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Log in as Admin"], "isController": false}, {"data": [1.0, 500, 1500, "Add User"], "isController": false}, {"data": [1.0, 500, 1500, "Go To Main Blog page transaction"], "isController": true}, {"data": [1.0, 500, 1500, "Go to log in page transaction"], "isController": true}, {"data": [1.0, 500, 1500, "Open Users Page"], "isController": false}, {"data": [1.0, 500, 1500, "Go to log in page"], "isController": false}, {"data": [1.0, 500, 1500, "Log out"], "isController": false}, {"data": [1.0, 500, 1500, "Log out transaction"], "isController": true}, {"data": [1.0, 500, 1500, "Determine action for Switch Controller - JSR223 Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "Log in transaction"], "isController": true}, {"data": [1.0, 500, 1500, "Delete user"], "isController": false}, {"data": [1.0, 500, 1500, "Go To Main Blog page"], "isController": false}, {"data": [1.0, 500, 1500, "Open Admin Page"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 52, 0, 0.0, 12.596153846153845, 0, 53, 36.7, 43.349999999999994, 53.0, 38.291605301914586, 271.0378026049337, 35.892627025036816], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Log in as Admin", 2, 0, 0.0, 24.5, 22, 27, 27.0, 27.0, 27.0, 1.9305019305019306, 57.019561414092664, 2.812801640926641], "isController": false}, {"data": ["Add User", 7, 0, 0.0, 16.0, 8, 43, 43.0, 43.0, 43.0, 7.360672975814932, 3.493444400630915, 9.783081953207152], "isController": false}, {"data": ["Go To Main Blog page transaction", 2, 0, 0.0, 43.5, 34, 53, 53.0, 53.0, 53.0, 1.759014951627089, 49.9549939533861, 0.6029436015831134], "isController": true}, {"data": ["Go to log in page transaction", 2, 0, 0.0, 13.0, 6, 20, 20.0, 20.0, 20.0, 1.9157088122605364, 8.499087045019158, 0.7520653735632183], "isController": true}, {"data": ["Open Users Page", 11, 0, 0.0, 9.272727272727272, 7, 13, 12.600000000000001, 13.0, 13.0, 10.934393638170976, 80.72075360337972, 12.546789575049702], "isController": false}, {"data": ["Go to log in page", 2, 0, 0.0, 13.0, 6, 20, 20.0, 20.0, 20.0, 1.9157088122605364, 8.499087045019158, 0.7520653735632183], "isController": false}, {"data": ["Log out", 2, 0, 0.0, 40.5, 37, 44, 44.0, 44.0, 44.0, 4.514672686230248, 130.33472065462755, 6.617698927765237], "isController": false}, {"data": ["Log out transaction", 2, 0, 0.0, 40.5, 37, 44, 44.0, 44.0, 44.0, 4.514672686230248, 130.33472065462755, 6.617698927765237], "isController": true}, {"data": ["Determine action for Switch Controller - JSR223 Sampler", 11, 0, 0.0, 4.363636363636363, 0, 39, 31.600000000000026, 39.0, 39.0, 10.989010989010989, 0.0, 0.0], "isController": false}, {"data": ["Log in transaction", 2, 0, 0.0, 24.5, 22, 27, 27.0, 27.0, 27.0, 1.932367149758454, 57.074652777777786, 2.8155193236714977], "isController": true}, {"data": ["Delete user", 4, 0, 0.0, 19.25, 9, 36, 36.0, 36.0, 36.0, 11.299435028248588, 2.0082980225988702, 20.794712217514125], "isController": false}, {"data": ["Go To Main Blog page", 2, 0, 0.0, 43.5, 34, 53, 53.0, 53.0, 53.0, 1.7559262510974538, 49.86727666812994, 0.6018848770851624], "isController": false}, {"data": ["Open Admin Page", 11, 0, 0.0, 6.636363636363636, 3, 28, 23.600000000000016, 28.0, 28.0, 11.0, 100.3486328125, 12.138671875], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 52, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
