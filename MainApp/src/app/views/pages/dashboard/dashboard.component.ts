import { Component, OnInit } from '@angular/core';

import { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexGrid, ApexChart, ApexXAxis, ApexYAxis, ApexMarkers, ApexStroke, ApexLegend, ApexResponsive, ApexTooltip, ApexFill, ApexDataLabels, ApexPlotOptions, ApexTitleSubtitle } from 'ng-apexcharts';

import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';

// Ng2-charts
import { ChartOptions, ChartType, ChartDataSets, RadialChartOptions } from 'chart.js';
import { Label, Color, SingleDataSet } from 'ng2-charts';

// Progressbar.js
import ProgressBar from 'progressbar.js';
import { AuthService } from 'src/app/core/service/auth-service';
import { LoggedInUser } from 'src/app/core/models/user/loggedin-user';
import { ChatService } from 'src/app/core/service/chat-service';
import { GroupChatService } from 'src/app/core/service/group-chat-service';

export type apexChartOptions = {
  series: ApexAxisChartSeries;
  nonAxisSeries: ApexNonAxisChartSeries;
  colors: string[];
  grid: ApexGrid;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  markers: ApexMarkers,
  stroke: ApexStroke,
  legend: ApexLegend,
  responsive: ApexResponsive[],
  tooltip: ApexTooltip,
  fill: ApexFill
  dataLabels: ApexDataLabels,
  plotOptions: ApexPlotOptions,
  labels: string[],
  title: ApexTitleSubtitle
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  preserveWhitespaces: true
})
export class DashboardComponent implements OnInit {

  user : LoggedInUser

  public series: ApexAxisChartSeries;
  public chart: ApexChart;
  public dataLabels: ApexDataLabels;
  public markers: ApexMarkers;
  public title: ApexTitleSubtitle;
  public fill: ApexFill;
  public yaxis: ApexYAxis;
  public xaxis: ApexXAxis;
  public tooltip: ApexTooltip;
  public legend: ApexLegend;
  public stroke: ApexStroke;
  

  constructor(private authService : AuthService, private chatService : ChatService, private groupChatService : GroupChatService) { }

  dataSeries = [      {
    date: "2014-01-01",
    value: 0
  }];

  groupDataSeries = [      {
    date: "2014-01-01",
    value: 0
  }];

  ngOnInit(): void {
    this.user = this.authService.getLoggedInUserInfo();
    this.getChatData();
    this.GetGroupChatData();
    this.initChartData();
  }

  getChatData(){
    this.chatService.getChatData(this.user.sub).subscribe(
      (e : []) => {
        this.dataSeries = e;           
        this.initChartData();
      }
    )
  }

  GetGroupChatData(){
    this.groupChatService.getChatData(this.user.sub).subscribe(
      (e : []) => {
        this.groupDataSeries = e;
        this.initChartData();
      }
    )
  }

  public initChartData(): void {
    
    let dates = [];
    for (let i = 0; i < this.dataSeries.length; i++) {
      dates.push([this.dataSeries[i].date, this.dataSeries[i].value]);
    }

    let dates2 = [];
    for (let i = 0; i < this.groupDataSeries.length; i++) {
      dates2.push([this.groupDataSeries[i].date, this.groupDataSeries[i].value]);
    }

    this.series = [
      {
        name: "Messages",
        data: dates
      },
      {
        name: "Group Messages",
        data: dates2
      }
    ];

    this.chart = {
      type: "line",
      height: 350
    };

    this.dataLabels = {
      enabled: false
    };

    this.title = {
      text: "All Chat Data",
      align: "left"
    };

    this.legend = {
      tooltipHoverFormatter: function(val, opts) {
        return (
          val +
          " - <strong>" +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
          "</strong>"
        );
      }
    };
    
    this.markers = {
      size: 0,
      hover : {sizeOffset : 6}
    };

    this.tooltip = {
      y: [
        {
          title: {
            formatter: function(val) {
              return val;
            }
          }
        },
        {
          title: {
            formatter: function(val) {
              return val;
            }
          }
        }
      ]
    },

    this.xaxis = {
      labels : {
        trim : false
      },
      type: "datetime"
    };

  }
}
