var app = angular.module('myApp', []);

        app.controller('TaskController', function($scope) {
            
            $scope.tasks = JSON.parse(localStorage.getItem('tasks')) || [];

            // Function to start a task
            $scope.startTask = function(task) {
                task.inProgress = true;
                task.completed = false;
                $scope.saveTasks();
            };

            // Function to complete a task
            $scope.completeTask = function(task) {
                task.completed = true;
                task.inProgress = false;
                $scope.saveTasks();
            };

            // Function to add a new task
            $scope.addTask = function() {
                if ($scope.newTask) {
                    $scope.tasks.push({ name: $scope.newTask, completed: false, inProgress: false });
                    $scope.newTask = ''; 
                    $scope.saveTasks(); 
                }
            };

            // Function to save tasks 
            $scope.saveTasks = function() {
                localStorage.setItem('tasks', JSON.stringify($scope.tasks));
                updatePieChart(); // Update the pie chart after saving tasks
            };

            // Function to delete a task
            $scope.deleteTask = function(task) {
                var index = $scope.tasks.indexOf(task);
                if (index !== -1) {
                    $scope.tasks.splice(index, 1); 
                    $scope.saveTasks(); 
                }
            };

            // Function to edit a task
            $scope.editTask = function(task) {
                $scope.editingTask = task;
                $scope.editedTaskName = task.name;
            };

            // Function to save edited task
            $scope.saveTask = function() {
                if ($scope.editingTask) {
                    $scope.editingTask.name = $scope.editedTaskName;
                    $scope.cancelEdit();
                    $scope.saveTasks(); // Save tasks to local storage
                }
            };

            // Function to cancel editing task
            $scope.cancelEdit = function() {
                $scope.editingTask = null;
                $scope.editedTaskName = '';
            };

            
            function updatePieChart() {
                var pendingCount = $scope.tasks.filter(task => !task.completed && !task.inProgress).length;
                var ongoingCount = $scope.tasks.filter(task => task.inProgress && !task.completed).length;
                var completedCount = $scope.tasks.filter(task => task.completed).length;

                var totalTasks = $scope.tasks.length;

                // Calculate
                var pendingPercentage = totalTasks > 0 ? ((pendingCount / totalTasks) * 100).toFixed(2) : 0;
                var ongoingPercentage = totalTasks > 0 ? ((ongoingCount / totalTasks) * 100).toFixed(2) : 0;
                var completedPercentage = totalTasks > 0 ? ((completedCount / totalTasks) * 100).toFixed(2) : 0;

                
                if (pendingCount === 0 && ongoingCount === 0 && completedCount > 0) {
                    completedPercentage = 100;
                }

                // Update 
                var ctx = document.getElementById('taskPieChart').getContext('2d');
                if (window.taskChart) {
                    window.taskChart.destroy(); // Destroy existing chart instance if any
                }
                window.taskChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: [
                            `Completed (${completedPercentage}%)`,
                            `Pending (${pendingPercentage}%)`,
                            `Ongoing (${ongoingPercentage}%)`
                        ],
                        datasets: [{
                            label: 'Task Distribution',
                            data: [completedCount, pendingCount, ongoingCount],
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.8)', 
                                'rgba(255, 159, 64, 0.8)', 
                                'rgba(153, 102, 255, 0.8)' 
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: {
                            position: 'top',
                        },
                        onClick: handleChartClick 
                    }
                });
            }

           
            function handleChartClick(event, chartElements) {
                if (chartElements.length > 0) {
                    var clickedElement = chartElements[0];
                    if (clickedElement && clickedElement._chart && clickedElement._index !== undefined) {
                        var clickedLabel = clickedElement._chart.data.labels[clickedElement._index];
                        var clickedCategory = clickedLabel.split(' ')[0].toLowerCase(); 

                        
                        var filteredTasks = $scope.tasks.filter(function(task) {
                            if (clickedCategory === 'completed') {
                                return task.completed;
                            } else if (clickedCategory === 'pending') {
                                return !task.completed && !task.inProgress;
                            } else if (clickedCategory === 'ongoing') {
                                return task.inProgress && !task.completed;
                            }
                            return false;
                        });

                                                if (filteredTasks.length > 0) {
                            var taskNames = filteredTasks.map(task => task.name).join(', ');
                            alert(`Tasks ${clickedCategory}: ${taskNames}`);
                        } else {
                            alert(`No tasks ${clickedCategory} found.`);
                        }
                    }
                }
            }

            
            updatePieChart();

            
            $scope.$watch('tasks', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    updatePieChart();
                }
            }, true);
        });