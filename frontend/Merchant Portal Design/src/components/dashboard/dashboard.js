// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

// Data for different years
const yearlyData = {
    2025: {
        todaysBookings: 24,
        weekOccupancy: 78,
        weeklyRevenue: 8450,
        noShowRate: 3.2,
        staffUtilization: 85,
        satisfaction: 4.6,
        peakHour: '2-5 PM',
        totalBookings: 142,
        bookingByTime: [3, 5, 7, 4, 6, 8, 9, 12],
        bookingByDay: [20, 30, 25, 15, 10],
        weeklyBookings: [15, 20, 25, 18, 30],
        satisfactionTrend: [4, 5, 4, 3, 4, 5],
        monthlyBookings2024: [142, 165, 189, 178, 205, 218, 235, 248, 229, 267, 285, 312],
        monthlyBookings2023: [118, 135, 152, 148, 175, 188, 198, 215, 201, 225, 242, 268]
    },
    2024: {
        todaysBookings: 22,
        weekOccupancy: 72,
        weeklyRevenue: 7850,
        noShowRate: 4.1,
        staffUtilization: 80,
        satisfaction: 4.4,
        peakHour: '3-6 PM',
        totalBookings: 128,
        bookingByTime: [2, 4, 6, 5, 7, 9, 11, 14],
        bookingByDay: [18, 28, 22, 17, 15],
        weeklyBookings: [12, 18, 22, 16, 28],
        satisfactionTrend: [3, 4, 4, 4, 5, 4],
        monthlyBookings2024: [118, 135, 152, 148, 175, 188, 198, 215, 201, 225, 242, 268],
        monthlyBookings2023: [95, 112, 128, 125, 145, 158, 168, 185, 172, 195, 212, 238]
    },
    2023: {
        todaysBookings: 18,
        weekOccupancy: 65,
        weeklyRevenue: 6950,
        noShowRate: 5.3,
        staffUtilization: 75,
        satisfaction: 4.2,
        peakHour: '2-5 PM',
        totalBookings: 115,
        bookingByTime: [2, 3, 5, 4, 6, 7, 8, 10],
        bookingByDay: [15, 25, 20, 14, 12],
        weeklyBookings: [10, 15, 20, 14, 25],
        satisfactionTrend: [3, 4, 3, 4, 4, 4],
        monthlyBookings2024: [95, 112, 128, 125, 145, 158, 168, 185, 172, 195, 212, 238],
        monthlyBookings2023: [78, 92, 105, 102, 120, 132, 142, 158, 145, 168, 185, 208]
    }
};

let currentYear = 2025;
let chartInstances = {};

function updateDashboardData(year) {
    const data = yearlyData[year];
    
    // Update stat cards
    document.querySelector('.col-xl-3:nth-child(1) h2').textContent = data.todaysBookings;
    document.querySelector('.col-xl-3:nth-child(2) h2').textContent = data.weekOccupancy + '%';
    document.querySelector('.col-xl-3:nth-child(3) h2').textContent = '$' + data.weeklyRevenue.toLocaleString();
    document.querySelector('.col-xl-3:nth-child(4) h2').textContent = data.noShowRate + '%';
    
    // Update additional metrics
    const additionalCards = document.querySelectorAll('.row.mb-4.g-3')[1].querySelectorAll('.col-xl-3');
    additionalCards[0].querySelector('h3').textContent = data.staffUtilization + '%';
    additionalCards[1].querySelector('h3').textContent = data.satisfaction + '/5.0';
    additionalCards[2].querySelector('h3').textContent = data.peakHour;
    additionalCards[3].querySelector('h3').textContent = data.totalBookings;
    
    // Update charts
    updateCharts(year);
}

function updateCharts(year) {
    const data = yearlyData[year];
    
    // Update Booking Time Chart
    if (chartInstances.bookingTimeChart) {
        chartInstances.bookingTimeChart.data.datasets[0].data = data.bookingByTime;
        chartInstances.bookingTimeChart.update();
    }
    
    // Update Satisfaction Score Chart
    if (chartInstances.satisfactionScoreChart) {
        chartInstances.satisfactionScoreChart.data.datasets[0].data = data.bookingByDay;
        chartInstances.satisfactionScoreChart.update();
    }
    
    // Update Bookings by Day Chart
    if (chartInstances.bookingsByDayChart) {
        chartInstances.bookingsByDayChart.data.datasets[0].data = data.weeklyBookings;
        chartInstances.bookingsByDayChart.update();
    }
    
    // Update Satisfaction Time Series Chart
    if (chartInstances.satisfactionTimeSeriesChart) {
        chartInstances.satisfactionTimeSeriesChart.data.datasets[0].data = data.satisfactionTrend;
        chartInstances.satisfactionTimeSeriesChart.update();
    }
    
    // Update Revenue Time Series Chart
    if (chartInstances.revenueTimeSeriesChart) {
        chartInstances.revenueTimeSeriesChart.data.datasets[0].data = data.monthlyBookings2024;
        chartInstances.revenueTimeSeriesChart.data.datasets[0].label = year + ' Booking Amount';
        chartInstances.revenueTimeSeriesChart.data.datasets[1].data = data.monthlyBookings2023;
        chartInstances.revenueTimeSeriesChart.data.datasets[1].label = (year - 1) + ' Booking Amount';
        chartInstances.revenueTimeSeriesChart.update();
    }
}

// Year Filter Event Listener
const yearFilter = document.getElementById('yearFilter');
if (yearFilter) {
    yearFilter.addEventListener('change', function() {
        currentYear = parseInt(this.value);
        updateDashboardData(currentYear);
    });
}

// Simulated Booking Data
const bookingData = [
    { time: '10 AM', count: 3 },
    { time: '11 AM', count: 5 },
    { time: '12 PM', count: 7 },
    { time: '1 PM', count: 4 },
    { time: '2 PM', count: 6 },
    { time: '3 PM', count: 8 },
    { time: '4 PM', count: 9 },
    { time: '5 PM', count: 12 },
];

// Booking Data by Time (Bar Chart)
const ctx1 = document.getElementById('bookingTimeChart');
if (ctx1) {
const bookingTimeChart = new Chart(ctx1.getContext('2d'), {
    type: 'bar',
    data: {
        labels: bookingData.map(data => data.time),
        datasets: [{
            label: 'Bookings by Time',
            data: bookingData.map(data => data.count),
            backgroundColor: 'rgba(13, 110, 253, 0.7)',
            borderColor: 'rgba(13, 110, 253, 1)',
            borderWidth: 2,
            borderRadius: 8
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            y: { 
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});
chartInstances.bookingTimeChart = bookingTimeChart;
}

// Satisfaction Score by Day (Pie Chart)
const ctx2 = document.getElementById('satisfactionScoreChart');
if (ctx2) {
const satisfactionScoreChart = new Chart(ctx2.getContext('2d'), {
    type: 'doughnut',
    data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        datasets: [{
            label: 'Satisfaction Score by Day',
            data: [20, 30, 25, 15, 10],
            backgroundColor: [
                'rgba(13, 110, 253, 0.8)',
                'rgba(25, 135, 84, 0.8)',
                'rgba(255, 193, 7, 0.8)',
                'rgba(220, 53, 69, 0.8)',
                'rgba(111, 66, 193, 0.8)'
            ],
            borderWidth: 3,
            borderColor: '#fff'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            }
        }
    }
});
chartInstances.satisfactionScoreChart = satisfactionScoreChart;
}

// Bookings by Day (Line Chart)
const ctx3 = document.getElementById('bookingsByDayChart');
if (ctx3) {
const bookingsByDayChart = new Chart(ctx3.getContext('2d'), {
    type: 'line',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{
            label: 'Bookings by Day',
            data: [15, 20, 25, 18, 30],
            borderColor: 'rgba(13, 110, 253, 1)',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(13, 110, 253, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});
chartInstances.bookingsByDayChart = bookingsByDayChart;
}

// Time Series Data: Customer Satisfaction (Line Chart)
const ctx4 = document.getElementById('satisfactionTimeSeriesChart');
if (ctx4) {
const satisfactionTimeSeriesChart = new Chart(ctx4.getContext('2d'), {
    type: 'line',
    data: {
        labels: ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM'],
        datasets: [{
            label: 'Customer Satisfaction Over Time',
            data: [4, 5, 4, 3, 4, 5],
            borderColor: 'rgba(220, 53, 69, 1)',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(220, 53, 69, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});
chartInstances.satisfactionTimeSeriesChart = satisfactionTimeSeriesChart;
}

// Revenue Time Series Data (Line Chart with Multiple Datasets)
const revenueTimeSeriesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
            label: '2024 Booking Amount',
            data: [142, 165, 189, 178, 205, 218, 235, 248, 229, 267, 285, 312],
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: 'rgba(102, 126, 234, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 8
        },
        {
            label: '2023 Booking Amount',
            data: [118, 135, 152, 148, 175, 188, 198, 215, 201, 225, 242, 268],
            borderColor: 'rgba(118, 75, 162, 1)',
            backgroundColor: 'rgba(118, 75, 162, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 4,
            pointBackgroundColor: 'rgba(118, 75, 162, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7
        }
    ]
};

const ctxRevenue = document.getElementById('revenueTimeSeriesChart');
if (ctxRevenue) {
const revenueTimeSeriesChart = new Chart(ctxRevenue.getContext('2d'), {
    type: 'line',
    data: revenueTimeSeriesData,
    options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    padding: 20,
                    font: {
                        size: 13,
                        weight: 'bold'
                    },
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.parsed.y + ' bookings';
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    callback: function(value) {
                        return value + ' bookings';
                    },
                    font: {
                        size: 11
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            }
        }
    }
});
chartInstances.revenueTimeSeriesChart = revenueTimeSeriesChart;
}

// Service Completion Rate Chart (Area Chart)
const ctxCompletion = document.getElementById('completionRateChart');
if (ctxCompletion) {
const completionRateChart = new Chart(ctxCompletion.getContext('2d'), {
    type: 'line',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Completion Rate (%)',
            data: [92, 88, 95, 90, 97, 85, 93],
            borderColor: 'rgba(168, 237, 234, 1)',
            backgroundColor: 'rgba(168, 237, 234, 0.3)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 6,
            pointBackgroundColor: 'rgba(168, 237, 234, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: 'rgba(168, 237, 234, 1)',
            pointHoverBorderWidth: 3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y + '%';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});
}

// Rating by Customers (Bar Chart)
const ctx5 = document.getElementById('ratingChart');
if (ctx5) {
const ratingChart = new Chart(ctx5.getContext('2d'), {
    type: 'bar',
    data: {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [{
            label: 'Customer Ratings',
            data: [5, 10, 15, 20, 50],
            backgroundColor: [
                'rgba(220, 53, 69, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(13, 202, 240, 0.7)',
                'rgba(25, 135, 84, 0.7)',
                'rgba(111, 66, 193, 0.7)'
            ],
            borderColor: [
                'rgba(220, 53, 69, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(13, 202, 240, 1)',
                'rgba(25, 135, 84, 1)',
                'rgba(111, 66, 193, 1)'
            ],
            borderWidth: 2,
            borderRadius: 8
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});
}

// Booking Channels Chart (Doughnut Chart)
const ctxChannels = document.getElementById('bookingChannelsChart');
if (ctxChannels) {
    const bookingChannelsChart = new Chart(ctxChannels.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['WhatsApp', 'Web Portal'],
            datasets: [{
                label: 'Booking Source',
                data: [68, 32],
                backgroundColor: [
                    'rgba(37, 211, 102, 0.8)',
                    'rgba(13, 110, 253, 0.8)'
                ],
                borderColor: [
                    'rgba(37, 211, 102, 1)',
                    'rgba(13, 110, 253, 1)'
                ],
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed + '%';
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Initialize FullCalendar
const calendarEl = document.getElementById('calendar');
if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        initialDate: '2025-11-15',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: 'auto',
        events: [
            {
                title: 'Haircut - Sarah Johnson',
                start: '2025-11-15T10:00:00',
                end: '2025-11-15T11:00:00',
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd'
            },
            {
                title: 'Hair Coloring - Mike Chen',
                start: '2025-11-15T14:00:00',
                end: '2025-11-15T16:00:00',
                backgroundColor: '#198754',
                borderColor: '#198754'
            },
            {
                title: 'Beard Trim - David Lee',
                start: '2025-11-16T09:30:00',
                end: '2025-11-16T10:00:00',
                backgroundColor: '#ffc107',
                borderColor: '#ffc107'
            },
            {
                title: 'Haircut & Style - Emma Wilson',
                start: '2025-11-16T11:00:00',
                end: '2025-11-16T12:00:00',
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd'
            },
            {
                title: 'Deep Conditioning - Lisa Brown',
                start: '2025-11-17T13:00:00',
                end: '2025-11-17T14:30:00',
                backgroundColor: '#6f42c1',
                borderColor: '#6f42c1'
            },
            {
                title: 'Haircut - James Taylor',
                start: '2025-11-18T10:00:00',
                end: '2025-11-18T11:00:00',
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd'
            },
            {
                title: 'Hair Coloring - Anna Martinez',
                start: '2025-11-18T15:00:00',
                end: '2025-11-18T17:00:00',
                backgroundColor: '#198754',
                borderColor: '#198754'
            },
            {
                title: 'Beard Trim - Robert Davis',
                start: '2025-11-19T09:00:00',
                end: '2025-11-19T09:30:00',
                backgroundColor: '#ffc107',
                borderColor: '#ffc107'
            },
            {
                title: 'Haircut & Style - Jennifer White',
                start: '2025-11-19T14:00:00',
                end: '2025-11-19T15:00:00',
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd'
            },
            {
                title: 'Deep Conditioning - Maria Garcia',
                start: '2025-11-20T11:00:00',
                end: '2025-11-20T12:30:00',
                backgroundColor: '#6f42c1',
                borderColor: '#6f42c1'
            },
            {
                title: 'Hair Coloring - Patricia Johnson',
                start: '2025-11-21T13:00:00',
                end: '2025-11-21T15:00:00',
                backgroundColor: '#198754',
                borderColor: '#198754'
            },
            {
                title: 'Haircut - Kevin Anderson',
                start: '2025-11-21T16:00:00',
                end: '2025-11-21T17:00:00',
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd'
            },
            {
                title: 'Beard Trim - Thomas Moore',
                start: '2025-11-22T10:30:00',
                end: '2025-11-22T11:00:00',
                backgroundColor: '#ffc107',
                borderColor: '#ffc107'
            },
            {
                title: 'Haircut & Style - Nancy Williams',
                start: '2025-11-22T14:00:00',
                end: '2025-11-22T15:00:00',
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd'
            },
            {
                title: 'Hair Coloring - Sandra Martinez',
                start: '2025-11-25T10:00:00',
                end: '2025-11-25T12:00:00',
                backgroundColor: '#198754',
                borderColor: '#198754'
            },
            {
                title: 'Deep Conditioning - Betty Harris',
                start: '2025-11-25T15:00:00',
                end: '2025-11-25T16:30:00',
                backgroundColor: '#6f42c1',
                borderColor: '#6f42c1'
            },
            {
                title: 'Haircut - Charles Clark',
                start: '2025-11-26T11:00:00',
                end: '2025-11-26T12:00:00',
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd'
            },
            {
                title: 'Beard Trim - Daniel Lewis',
                start: '2025-11-27T09:00:00',
                end: '2025-11-27T09:30:00',
                backgroundColor: '#ffc107',
                borderColor: '#ffc107'
            },
            {
                title: 'Hair Coloring - Susan Walker',
                start: '2025-11-27T14:00:00',
                end: '2025-11-27T16:00:00',
                backgroundColor: '#198754',
                borderColor: '#198754'
            },
            {
                title: 'Haircut & Style - Steven Hall',
                start: '2025-11-28T10:00:00',
                end: '2025-11-28T11:00:00',
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd'
            }
        ],
        eventClick: function(info) {
            alert('Booking: ' + info.event.title + '\nTime: ' + info.event.start.toLocaleString());
        }
    });
    calendar.render();
}

}); // End of DOMContentLoaded
