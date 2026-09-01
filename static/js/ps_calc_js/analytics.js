
function get_finance()
    {
        dato=document.getElementById('report_date').value;
        $.ajax({
                url: "/analytics?get_finance&date="+dato,
                dataType: "json",
                type: "POST",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    sum_money_paid=data.sum_money_paid
                    sum_expenses_amount=data.sum_expenses_amount
                    profit=data.profit
                    document.getElementById('sum_money_paid').value=sum_money_paid;
                    document.getElementById('main_income').value=data.main_income;
                    document.getElementById('extra_income').value=data.extra_income;
                    document.getElementById('sum_money_paid').value=sum_money_paid;
                    document.getElementById('sum_expenses_amount').value=sum_expenses_amount;
                    document.getElementById('profit').value=profit;
                }
                
        })
    }

    
    function money_per_day() {
        google.charts.load('visualization', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(drawLineChart);
          function drawLineChart() {
            dato=document.getElementById('report_date').value
            $.ajax({
                url: "/money_per_day?date="+dato,
                dataType: "json",
                type: "GET",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    var arrSales = [['Day','Time Income','Food & Beverage Income','Total Expenses']];    // Define an array and assign columns for the chart.
    
                    // Loop through each data and populate the array.
                    $.each(data, function (index, value) {
                        arrSales.push([value.start,value.sum_money_paid,value.extra_income,value.sum_expenses_amount]);
                    });
    
                    // Set chart Options.
                    var options = {
                        title: 'Total Money Paid Per Day | مجموع الفلوس باليوم',
                        curveType: 'function',
                        legend: { position: 'side', textStyle: { color: '#555', fontSize: 14} }  // You can position the legend on 'top' or at the 'bottom'.
                    };
    
                    // Create DataTable and add the array to it.
                    var figures = google.visualization.arrayToDataTable(arrSales)
    
                    // Define the chart type (LineChart) and the container (a DIV in our case).
                    var chart = new google.visualization.ColumnChart(document.getElementById('college_anaylsis_chart'));
                    chart.draw(figures, options);      // Draw the chart with Options.
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert('Got an Error, A');
                }
            });
        }
    }
        

function money_per_month(){
    google.charts.load('visualization', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawLineChart);

      function drawLineChart() {
        dato=document.getElementById('report_date').value

        $.ajax({
            url: "/money_per_month?date="+dato,
            dataType: "json",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                var arrSales = [['Month','Time Income','Food & Beverage Income','Total Expenses']];    // Define an array and assign columns for the chart.

                // Loop through each data and populate the array.
                $.each(data, function (index, value) {
                    arrSales.push([value.start,value.sum_money_paid,value.extra_income,value.sum_expenses_amount]);
                });

                // Set chart Options.
                var options = {
                    title: 'Total Money Paid Per Month | مجموع الفلوس بالشهر',
                    curveType: 'function',
                    legend: { position: 'side', textStyle: { color: '#555', fontSize: 14} }  // You can position the legend on 'top' or at the 'bottom'.
                };

                // Create DataTable and add the array to it.
                var figures = google.visualization.arrayToDataTable(arrSales)

                // Define the chart type (LineChart) and the container (a DIV in our case).
                var chart = new google.visualization.ColumnChart(document.getElementById('day_analysis_chart'));
                chart.draw(figures, options);      // Draw the chart with Options.
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Got an Error, B');
            }
        });
    }
}
    


function money_per_year(){
    //dato=document.getElementById('report_date').value;
    google.charts.load('visualization', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawLineChart);


      function drawLineChart() {
        dato = document.getElementById('report_date').value;
        $.ajax({
            url: "/money_per_year?date="+dato,
            dataType: "json",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                var arrSales = [['Month','Time Income','Food & Beverage Income','Total Expenses']];    // Define an array and assign columns for the chart.

                // Loop through each data and populate the array.
                $.each(data, function (index, value) {
                    arrSales.push([value.start,value.sum_money_paid,value.extra_income,value.sum_expenses_amount]);
                });

                // Set chart Options.
                var options = {
                    title: 'Total Money Paid Per Annually | مجموع الفلوس في السنة',
                    curveType: 'function',
                    legend: { position: 'side', textStyle: { color: '#555', fontSize: 14} }  // You can position the legend on 'top' or at the 'bottom'.
                };

                // Create DataTable and add the array to it.
                var figures = google.visualization.arrayToDataTable(arrSales)

                // Define the chart type (LineChart) and the container (a DIV in our case).
                var chart = new google.visualization.LineChart(document.getElementById('year_analysis_chart'));
                chart.draw(figures, options);      // Draw the chart with Options.
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Got an Error, C');
            }
        });
    }
}
    

function money_per_type(){
    google.charts.load('visualization', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(drawLineChart);


      function drawLineChart() {
        dato=document.getElementById('report_date').value

        $.ajax({
            url: "/money_per_type?date="+dato,
            dataType: "json",
            type: "GET",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                var arrSales = [['Type','Total Income']];    // Define an array and assign columns for the chart.

                // Loop through each data and populate the array.
                $.each(data, function (index, value) {
                    arrSales.push([value.single_multi,value.sum_money_paid]);
                });

                // Set chart Options.
                var options = {
                    title: 'Total Money Paid Per Type | مجموع الفلوس ',
                    curveType: 'function',
                    legend: { position: 'side', textStyle: { color: '#555', fontSize: 14} }  // You can position the legend on 'top' or at the 'bottom'.
                };

                // Create DataTable and add the array to it.
                var figures = google.visualization.arrayToDataTable(arrSales)

                // Define the chart type (LineChart) and the container (a DIV in our case).
                var chart = new google.visualization.ColumnChart(document.getElementById('type_analysis_chart'));
                chart.draw(figures, options);      // Draw the chart with Options.
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('Got an Error, D');
            }
        });
    }
}


window.onload = run_analysis();

function run_analysis() {
    dato=document.getElementById('report_date').value;
    console.log(dato);
    get_finance();
    money_per_day();
    money_per_month();
    money_per_year();
    money_per_type();
}
