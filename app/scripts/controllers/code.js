app.controller('code', function code($scope, $timeout, $q, insight, fullscreen, snippets, typingAverage) {
	'use strict';
	$scope.code = "";
	var compilationInfo = [];
	var cmLeft, cmRight = null;


	$scope.fullscreen = function(){
		fullscreen.apply(true);
	}

	// for the pending of the insight
	$scope.editorSending = {
		canShowInsight: true,
		numberOfChanges: 0
	};

	function updateMirrors(cm, f){
		var cur = cm.getCursor();
		var lines = $scope.code.split("\n");
		var pos = cur.ch;
		for (var i = 0; i < cur.line; i++){
			pos += lines[i].length + 1;
		}
		insight($scope.code, pos).then(f);        
	}

	CodeMirror.commands.autocomplete = function(cm) {
		$scope.editorSending.canShowInsight = false;

		updateMirrors(cm, function(data){
			$scope.insight = data.insight;
			$scope.editorSending.canShowInsight = true;

			CodeMirror.showHint(cm, function(cm, options){
				var inner = {from: cm.getCursor(), to: cm.getCursor(), list: data.completions};
				return inner;
			});                
		});
	};

	$scope.optionsCode = {
		extraKeys: {"Ctrl-Space": "autocomplete"},
		fixedGutter: false,
		lineNumbers: true,
		mode: 'text/x-scala',
		theme: 'solarized light',
		smartIndent: false,
		autofocus: true,
		onChange: function(cm) {
			$scope.editorSending.canShowInsight = false;

			var mightBePromise = typingAverage.onKeyPressed();

			console.log('mightBePromise value: ');
			console.log(mightBePromise);

			if (mightBePromise !== null) {
				mightBePromise.then(function(totalPromise) {
					updateMirrors(cm, function(data) {
						console.log('data has been sent!');
						console.log('data: ' + cm.getDoc().getValue());
						console.log('total promises: ' + totalPromise);

						$scope.insight = data.insight;
						compilationInfo = data.CompilationInfo;
					
						$scope.editorSending.canShowInsight = true;

						if (totalPromise > 0) { 
							typingAverage.reset();
						}
					});
				});	
			}
		},
		onScroll: function(cm) {
			if ($scope.cmLeft === null) {
				$scope.cmLeft = cm;
			}

			var scrollLeftInfo = cm.getScrollInfo();
			if ($scope.cmRight !== null) {
				$scope.cmRight.scrollTo(null, scrollLeftInfo['top']);
			}
		},
		onLoad: function(cm) {
			$scope.cmLeft = cm;
		}
	};
	$scope.optionsInsight = {
		fixedGutter: false,
		lineNumbers: true,
		mode: 'text/x-scala',
		theme: 'solarized light',
		readOnly: 'nocursor',
		onScroll: function(cm) {
			if($scope.cmRight === null) {
				$scope.cmRight = cm;
			}
			var scrollRightInfo = cm.getScrollInfo();
			if ($scope.cmLeft !== null) {
				$scope.cmLeft.scrollTo(null, scrollRightInfo['top']);
			}
		},
		onLoad: function(cm) {
			$scope.cmRight = cm;
		}
	};

	$scope.withInsight = true;
	$scope.toogleInsight = function() {
		$scope.withInsight = !$scope.withInsight;
	}

	$scope.publish = function(){
		snippets.save({code: $scope.code});
	}

	// (function() { /* The pace of the keyboard before sending data to the server */
	// 	$scope.isEditorPending = false;
	// 	$scope.editorPendingPromise = null;

	// 	function sendDataToServer() {
	// 		$scope.isEditorPending = false;
	// 		$scope.editorPendingPromise = null;
	// 	}

	// 	$scope.onEditorCodeChange = function() {
	// 		if ($scope.isEditorPending && $scope.editorPendingPromise != null) {
	// 			$timeout.cancel($scope.editorPendingPromise);
	// 			$scope.editorPendingPromise = $timeout(sendDataToServer, 2000);
	// 		} else {
	// 			$scope.isEditorPending = true;
	// 			$scope.editorPendingPromise = $timeout(sendDataToServer, 2000);
	// 		}
	// 		$scope.insightCode = "";
	// 	}
	// })();
});