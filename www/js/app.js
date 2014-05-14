angular.module('todo', ['ionic'])
/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */
.factory('Projects', function() {
  return {
    all: function() {
      var projectString = window.localStorage['projects'];
      if(projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
})

.controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects) {

  // A utility function for creating a new project
  // with the given projectTitle
  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length-1);
  }


  $scope.showDelete = false;
  
  // Load or initialize projects
  $scope.projects = Projects.all();

  // Grab the last active, or the first project
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

  // Called to create a new project
  $scope.newProject = function() {
    var projectTitle = prompt('Nome do Projeto');
    if(projectTitle) {
      createProject(projectTitle);
    }
  };

  // Called to select the given project
  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    //$scope.sideMenuController.close();
  };

  // Create our modal
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });
  
  $ionicModal.fromTemplateUrl('check-task.html', function(modal){
	$scope.checkTaskModal = modal;
  }, {
	scope: $scope
  });

  $scope.selectTask = function(task){
	$scope.selectedTask = task;
  }
  
  $scope.markAsFinished = function(){
	$scope.selectedTask.finished = true;
	
	var l = $scope.activeProject.tasks;
	for(var i = 0x0; i < l.length; i++){
		if (l[i].title == $scope.selectedTask.title)
			l[i] = $scope.selectedTask;
	}
	// Inefficient, but save all the projects
	Projects.save($scope.projects);
	
	closeElement($scope.checkTaskModal);
  }
  
  $scope.moveItem = function(item, fromIndex, toIndex) {
    $scope.activeProject.tasks(fromIndex, 1);
    $scope.activeProject.tasks(toIndex, 0, item);
  };
  
  $scope.onTaskDelete = function(task){
	
	var j = [];
	var l = $scope.activeProject.tasks;
	var k = 0x0;
	for(var i = 0x0; i < l.length; i++){
		if (l[i].title == task.title)
			continue;
		j[k++] = l[i];
	}

	$scope.activeProject.tasks = j;
	// Inefficient, but save all the projects
	Projects.save($scope.projects);
	
	
  };
  
  $scope.createTask = function(task) {
    if(!$scope.activeProject || !task) {
      return;
    }
    $scope.activeProject.tasks.push({
      title: task.title,
	  finished: false
    });
    $scope.taskModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);

    task.title = "";
	task.finished = false;
  };
  
  function closeElement(el){
	el.hide();
  }

  $scope.checkTask = function(){
	$scope.checkTaskModal.show();
  };
  
  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  }
  
  $scope.closeCheckTask = function() {
    closeElement($scope.checkTaskModal);
  }

  $scope.toggleProjects = function() {
    $scope.sideMenuController.toggleLeft();
  };

  
  

  // Try to create the first project, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
  $timeout(function() {
    if($scope.projects.length == 0) {
      while(true) {
        var projectTitle = prompt('Nome do seu primeiro projeto:');
        if(projectTitle) {
          createProject(projectTitle);
          break;
        }
      }
    }
  });

});