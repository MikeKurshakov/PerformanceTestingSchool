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
var seriesFilter = "^(.+transaction*)(-success|-failure)?$";
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

    var data = {"OkPercent": 25.37313432835821, "KoPercent": 74.6268656716418};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2537313432835821, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2537313432835821, 500, 1500, "Log in transaction"], "isController": true}, {"data": [0.2537313432835821, 500, 1500, "Go to log in page transaction"], "isController": true}, {"data": [0.2537313432835821, 500, 1500, "Go To Main Blog page transaction"], "isController": true}, {"data": [0.2537313432835821, 500, 1500, "Go To Main Blog page"], "isController": false}, {"data": [0.2537313432835821, 500, 1500, "Go to log in page"], "isController": false}, {"data": [0.2537313432835821, 500, 1500, "Log in as Anonymous"], "isController": false}, {"data": [0.2537313432835821, 500, 1500, "Go To Contact"], "isController": false}, {"data": [0.2537313432835821, 500, 1500, "Go To Contact transaction"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1608, 1200, 74.6268656716418, 179.34203980099508, 5, 569, 369.0, 417.0, 440.0, 0.03108915338686455, 0.17205239474789355, 0.008179285216862023], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Log in transaction", 402, 300, 74.6268656716418, 188.84328358208958, 17, 442, 376.2999999999999, 418.84999999999997, 435.93999999999994, 0.007772427949882921, 0.06264877366022772, 0.004961161182368034], "isController": true}, {"data": ["Go to log in page transaction", 402, 300, 74.6268656716418, 149.2885572139303, 5, 569, 330.0, 382.0, 437.9099999999999, 0.007772375504186941, 0.011907340900391807, 0.0013131064084222078], "isController": true}, {"data": ["Go To Main Blog page transaction", 402, 300, 74.6268656716418, 199.10945273631827, 20, 442, 407.09999999999997, 421.0, 440.0, 0.007772391433177358, 0.06039135002291985, 9.26007573093396E-4], "isController": true}, {"data": ["Go To Main Blog page", 402, 300, 74.6268656716418, 199.10945273631827, 20, 442, 407.09999999999997, 421.0, 440.0, 0.007772391433177358, 0.06039135002291985, 9.26007573093396E-4], "isController": false}, {"data": ["Go to log in page", 402, 300, 74.6268656716418, 149.2885572139303, 5, 569, 330.0, 382.0, 437.9099999999999, 0.007772388878523556, 0.011907361389981545, 0.0013131086679536866], "isController": false}, {"data": ["Log in as Anonymous", 402, 300, 74.6268656716418, 188.84328358208958, 17, 442, 376.2999999999999, 418.84999999999997, 435.93999999999994, 0.007772427949882921, 0.06264877366022772, 0.004961161182368034], "isController": false}, {"data": ["Go To Contact", 402, 300, 74.6268656716418, 180.12686567164172, 12, 444, 367.0, 418.84999999999997, 440.84999999999985, 0.007772372047905189, 0.037107389537772394, 9.791367130661812E-4], "isController": false}, {"data": ["Go To Contact transaction", 402, 300, 74.6268656716418, 180.12686567164172, 12, 444, 367.0, 418.84999999999997, 440.84999999999985, 0.007772372047905189, 0.037107389537772394, 9.791367130661812E-4], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 1200, 100.0, 74.6268656716418], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1608, 1200, "503/Service Unavailable", 1200, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Go To Main Blog page", 402, 300, "503/Service Unavailable", 300, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Go to log in page", 402, 300, "503/Service Unavailable", 300, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Log in as Anonymous", 402, 300, "503/Service Unavailable", 300, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Go To Contact", 402, 300, "503/Service Unavailable", 300, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
