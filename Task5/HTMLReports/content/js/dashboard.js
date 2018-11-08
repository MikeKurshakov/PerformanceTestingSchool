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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9578313253012049, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Edit post transaction"], "isController": true}, {"data": [1.0, 500, 1500, "Log in transaction"], "isController": true}, {"data": [1.0, 500, 1500, "Go to log in page transaction"], "isController": true}, {"data": [1.0, 500, 1500, "Go To Main Blog page transaction"], "isController": true}, {"data": [1.0, 500, 1500, "Open Random Post"], "isController": true}, {"data": [0.99, 500, 1500, "Change Post"], "isController": true}, {"data": [1.0, 500, 1500, "Go To Main Blog page"], "isController": false}, {"data": [1.0, 500, 1500, "Go to log in page"], "isController": false}, {"data": [1.0, 500, 1500, "Log out"], "isController": false}, {"data": [0.91, 500, 1500, "Open Predefined Date"], "isController": false}, {"data": [1.0, 500, 1500, "Log out transaction"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 56, 0, 0.0, 171.98214285714292, 8, 919, 625.3000000000001, 883.15, 919.0, 3.32107697781995, 100.9710721592931, 2.7882591033092163], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Edit post transaction", 2, 0, 0.0, 7244.0, 6235, 8253, 8253.0, 8253.0, 8253.0, 0.235626767200754, 340.9599857887606, 28.3058159313148], "isController": true}, {"data": ["Log in transaction", 2, 0, 0.0, 61.0, 51, 71, 71.0, 71.0, 71.0, 28.169014084507044, 898.5750440140846, 30.562279929577468], "isController": true}, {"data": ["Go to log in page transaction", 2, 0, 0.0, 28.5, 8, 49, 49.0, 49.0, 49.0, 40.816326530612244, 178.0532525510204, 6.736288265306122], "isController": true}, {"data": ["Go To Main Blog page transaction", 2, 0, 0.0, 60.5, 48, 73, 73.0, 73.0, 73.0, 23.52941176470588, 723.828125, 2.7113970588235294], "isController": true}, {"data": ["Open Random Post", 50, 0, 0.0, 21.2, 16, 59, 27.499999999999993, 46.34999999999999, 59.0, 3.0387747660143427, 76.0442108491856, 2.69133360429075], "isController": true}, {"data": ["Change Post", 50, 0, 0.0, 81.3, 39, 1385, 79.9, 222.5999999999997, 1385.0, 3.0554876558298703, 4.459639395166218, 9.260753406868735], "isController": true}, {"data": ["Go To Main Blog page", 2, 0, 0.0, 60.5, 48, 73, 73.0, 73.0, 73.0, 23.52941176470588, 723.828125, 2.7113970588235294], "isController": false}, {"data": ["Go to log in page", 2, 0, 0.0, 28.5, 8, 49, 49.0, 49.0, 49.0, 40.816326530612244, 178.0532525510204, 6.736288265306122], "isController": false}, {"data": ["Log out", 2, 0, 0.0, 45.0, 33, 57, 57.0, 57.0, 57.0, 5.449591280653951, 170.20393392370573, 5.5081318119891005], "isController": false}, {"data": ["Open Predefined Date", 50, 0, 0.0, 187.26000000000002, 30, 919, 637.9, 889.4499999999999, 919.0, 3.030486696163404, 95.14875901569793, 2.6931082944420877], "isController": false}, {"data": ["Log out transaction", 2, 0, 0.0, 45.0, 33, 57, 57.0, 57.0, 57.0, 5.449591280653951, 170.20393392370573, 5.5081318119891005], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 56, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
