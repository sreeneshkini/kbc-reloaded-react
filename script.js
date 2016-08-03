/* Component - QuestionAnswerCollection
*  This component fetches data(question, options, answers, cashset) from json files and passes it to child component 'QuestionAnswers'  
*/

var QuestionAnswerCollection = React.createClass({
	getInitialState : function(){
		return ({
			qaList : [],
			countIndex : [],
			cashSet : {},
			randomIndex : 0,
			countIndexLength : 0,
			qaLength : this.props.questions.length,
			showQuestions : true,
			showStartGameButton : true,
			checkQuestionCount : 0
		})
	},

	/* Method - componentDidMount
	*  This is a React lifecycle method which fetches the cashset once after initial rendering of the component on client side  
	*/

	componentDidMount : function(){
		$.ajax({
			url : this.props.cash,
			cache:false,
			dataType : 'json',
			success : function(result){
				var cashset = result.data;
				this.setState({
					cashSet : cashset
				});
			}.bind(this)
		});
	},

	/* Method - checkIndexAvailability
	*  This method checks whether the question was already asked(repeated) in current game session. If the question is repeated it will call 'setNewIndexes' method to
	*  fetch new random index. If the question is not repeated(new) then it will add that question index to an array 'countIndex', which keeps the track of all done(asked)
	*  questions.
	*/

	checkIndexAvailability : function(randomIndex, valuesLength){
		if(this.state.checkQuestionCount == 6){
			this.setState({
				countIndex : [],
				checkQuestionCount : 1
			});
		}
		if($.inArray(randomIndex, this.state.countIndex) == -1){
			this.state.countIndex.push(randomIndex);
			this.setState({
				countIndex : this.state.countIndex,
				countIndexLength : this.state.countIndexLength
			});
		}else{
			this.setNewIndexes(valuesLength);
		}
	},

	/* Method - setNewIndexes
	*  This method fetches new random index for questions and passes it to 'checkIndexAvailability' method
	*/

	setNewIndexes : function(valuesLength){
		var randomIndex;
		randomIndex = Math.floor(Math.random() * valuesLength);
		this.setState({
			randomIndex : randomIndex
		});
		this.checkIndexAvailability(this.state.randomIndex, valuesLength);
	},

	/* Method - getRandomIndexes
	*  This method fetches random index for questions, passes it to 'checkIndexAvailability' method and sets that question along with its options in the component state
	*/

	getRandomIndexes : function(values, valuesLength){
		var randomIndex;
		randomIndex = Math.floor(Math.random() * valuesLength);
		this.setState({
			randomIndex : randomIndex
		});
		this.checkIndexAvailability(this.state.randomIndex, valuesLength);
		var qaListing = new Array(values[this.state.randomIndex]);
		this.setState({
			qaList : qaListing,
			countIndex : this.state.countIndex
		});
	},

	/* Method - getQA
	*  This method fetches questions, options and answer from the json file depending on the type of cashset range. Depending on cashset range, 'easy', 'medium' or
	*  'difficult' level questions are fetched and then passed onto 'getRandomIndexes' method for further processing
	*/

	getQA : function(currentCashSet, criteria){
		if(currentCashSet == 0){
			this.setState({
				showStartGameButton : false,
				showQuestions : false
			});
		}else{
			this.setState({
				showStartGameButton : false,
				showQuestions : true
			});
			$.ajax({
				url : this.props.questions,
				cache: false,
				dataType : 'json',
				success : function(result){
					var values = result.data[0];
					if(currentCashSet >= 1000 && currentCashSet <= 10000){
						if(criteria == "continuition"){
							this.setState({
								checkQuestionCount : this.state.checkQuestionCount + 1
							});
						}
						this.getRandomIndexes(values.easy, values.easy.length);
					}
					if(currentCashSet > 10000 && currentCashSet <= 320000){
						if(criteria == "continuition"){
							this.setState({
								checkQuestionCount : this.state.checkQuestionCount + 1
							});
						}
						this.getRandomIndexes(values.moderate, values.moderate.length);
					}
					if(currentCashSet > 320000 && currentCashSet <= 10000000){
						if(criteria == "continuition"){
							this.setState({
								checkQuestionCount : this.state.checkQuestionCount + 1
							});
						}
						this.getRandomIndexes(values.difficult, values.difficult.length);
					}
				}.bind(this),
				error : function(error){
					console.log(error);
				}
			});
		}
	},

	/* Method - getNextQuestion
	*  This method fetches next question by calling 'getQA' method
	*/

	getNextQuestion : function(currentCashSet, criteria){
		this.getQA(currentCashSet, criteria);
	},

	/* Method - getQuestions
	*  This method returns the 'QuestionAnswers' component with required props attached to its as attributes
	*/

	getQuestions : function(){
		return (
			<div className="row questionAnswers">
				<div className="col-md-12">
					<QuestionAnswers qalist={this.state.qaList} getNextQuestion={this.getNextQuestion} getCashSet={this.state.cashSet} />
				</div>
			</div>
		)
	},

	/* Method - getGameOver
	*  This method returns the 'Play The Game Again' element
	*/

	getGameOver : function(){
		return (
			<div className="row questionAnswers">
				<div className="text-center col-md-12">
					<button className="btn btn-default gameOver" onClick={this.getQA.bind(this, 1000, "continuition")}>Play The Game Again</button>
				</div>
			</div>
		)
	},

	/* Method - getGameOver
	*  This method returns the 'Basic App Info and Start The Game' elements
	*/

	getStartGameButton : function(){
		return (
				<div className="row questionAnswers">
					<div className="col-md-12">
						<div className="row">
							<div className="text-center col-md-12">
								<span className="title">KBC</span><span className="tag">Reloaded</span>
							</div>
						</div>
						<div className="row">
							<div className="hidden-xs hidden-sm col-md-12">
								<img className="gameScreenshot" src="game1.PNG" />
							</div>
						</div>
						<div className="row">
							<div className="col-md-9 gameInstructions">
								<ul>
									<li>You need to answer 15 questions correctly to win Rs. 1 crore.</li>
									<li>There will be a timer of 30 seconds each for first 5 questions ranging from Rs. 1,000 to Rs. 10,000, after which the timer will moved off.</li>
									<li>You are provided with two lifelines, namely, '50-50' and 'Switch The Question', which you can use anytime throughout the game.</li>
									<li>The bottom part of the game displays the 'Cashset' which shows us the amount that we have won and the question number we are heading to.</li>
									<li>Do not refresh your page anytime in middle of game. This will lead to end of the game.</li>
									<li>Click the 'Start The Game' button to start the game. All the best!!!</li>
								</ul>
							</div>
							<div className="text-center col-md-3">
								<button className="btn btn-default startButton" onClick={this.getQA.bind(this, 1000, "continuition")}>Start The Game</button>
							</div>
						</div>
					</div>
				</div>
		)
	},

	/* Method - render
	*  This method is a React render method which renders this 'QuestionAnswerCollection' component
	*/

	render : function(){
		if(this.state.showStartGameButton == true){
			return this.getStartGameButton();
		}
		if(this.state.showQuestions == true){
			return this.getQuestions();
		}else{
			return this.getGameOver();
		}
	}
}); 


/* Component - QuestionAnswers
*  This component fetches data(question, options, answers, cashset) from component 'QuestionAnswerCollection' and iterate a loop, passing the data to 'QuestionAnswer' component  
*/

var QuestionAnswers = React.createClass({
	getQuestionAnswerLoop : function(qa, index){
		return (
			<div key={index}>
				<QuestionAnswer key={index} index={index} question={qa.question} option={qa.options} answer={qa.answer} getNextQuestion={this.props.getNextQuestion} getCashSet={this.props.getCashSet} /> 
			</div>
		)
	},

	/* Method - render
	*  This method is a React render method which renders this 'QuestionAnswers' component
	*/

	render : function(){
		return (
			<div>
				{
					this.props.qalist.map(this.getQuestionAnswerLoop)
				}
			</div>
		)
	}
});


/* Component - QuestionAnswer
*  This component fetches data(question, options, answers, cashset) from component 'QuestionAnswers' and displays them on the UI. It also carries many of the operations related to
*  option selection, cashset incrementation, timer, displaying wrong and right answers
*/

var QuestionAnswer = React.createClass({
	getInitialState : function(){
		return ({
			optionIndex : [0,1,2,3],
			disableOptionButtons : false,
			getCashSetLength : this.props.getCashSet.length,
			getCashSet : this.props.getCashSet,
			cashCounter : 0,
			currentCashSet : 1000,
			cashSetArray : [],
			showConfirmBox : {
				display : 'none'
			},
			disableBackground : {
				opacity : 1
			},
			showFiftyFifty : false,
			showSwitchQuestion : false,
			FiftyFiftyUsed : false,
			SwitchQuestionUsed : false,
			switchQuestionColor : {},
			fiftyFiftyColor : {},
			selectedOption : null,
			optionIndex : null,
			correctAnswer : null,
			allOptions : [],
			proceedOptionSelection : null,
			skipQuestion : false,
			optionClicked : false,
			restartClock : false,
			clockCounter : 31,
			showClock : {
				display : 'block'
			}
		})
	},

	/* Method - componentDidMount
	*  This is a React lifecycle method which sets the starting color marker for cashset once after initial rendering of the component on client side  
	*/

	componentDidMount : function(){
		var getCashDOM = ReactDOM.findDOMNode(this);
		var getMessageDOM = ReactDOM.findDOMNode(this);
		var getSelectedCash = getCashDOM.children[3].children[this.state.getCashSetLength];
		getSelectedCash.style.backgroundColor = "#d7db64";
		var getMessage = getMessageDOM.children[2].children[0].innerHTML = "Welcome to KBC Reloaded!! Here we bring the First Question for Rs. 1000";
	},

	/* Method - setQAParameters
	*  This method sets the parameters regarding the question-answers and options. This is called when any option is clicked
	*/

	setQAParameters : function(selectedOption, index, answer, allOptions, proceedOptionSelection){
		this.setState({
			showConfirmBox : {
				display : 'block'
			},
			disableBackground : {
				opacity : 0.5
			},
			showFiftyFifty : true,
			showSwitchQuestion : true,
			disableOptionButtons : true,
			selectedOption : selectedOption,
			optionIndex : index,
			correctAnswer : answer,
			allOptions : allOptions,
			proceedOptionSelection : proceedOptionSelection
		});
	},

	/* Method - getMatch
	*  This method checks(matches) whether the selected option is correct or wrong. Depending the output, it changes the color of the options conveying whether
	*  the option selected by user is correct or wrong. Also, it takes care of showing the timer for first five questions and keeping the track of 'states' of 
	*  this component regarding fetching next question, timer set and reset
	*/

	getMatch : function(selectedOption, index, answer, allOptions, proceedOptionSelection, showConfirmBox, disableBackground, switchQuestionColor, fiftyFiftyColor, showFiftyFifty, showSwitchQuestion, disableOptionButtons){
		this.setState({
			showConfirmBox : showConfirmBox,
			disableBackground : disableBackground,
			showFiftyFifty : showFiftyFifty,
			showSwitchQuestion : showSwitchQuestion,
			disableOptionButtons : disableOptionButtons,
			fiftyFiftyColor : fiftyFiftyColor,
			switchQuestionColor : switchQuestionColor
		});
		if(proceedOptionSelection == true){
			var getQuestionDOM = ReactDOM.findDOMNode(this);
			var getCashDOM = ReactDOM.findDOMNode(this);
			var getMessageDOM = ReactDOM.findDOMNode(this);
			var getMessage;
			var getSelectedOption = getQuestionDOM.children[1].children[1].children[index].children[0];
			var cashCounter = this.state.cashCounter;	
			var correctAnswer = answer;
			var cashSetArray = [];	
			var currentCashSet, getNextCashSet, getPreviousCashSet, getMorePreviousCashSet;	
			getSelectedOption.style.backgroundColor = "#FAFE7F";
			if(this.state.skipQuestion == false){
				this.setState({
					disableOptionButtons : true,
					getCashSetLength : this.state.getCashSetLength - 1
				});
				this.state.getCashSet.map(function(value, index){
					cashSetArray.push(value.amount);
				});
				this.setState({
					cashSetArray : cashSetArray
				});
				if(cashCounter <= 14){
					cashCounter++;
					currentCashSet = cashSetArray[cashCounter];
					this.setState({
						currentCashSet : currentCashSet,
						cashCounter : cashCounter
					});
				}
			}
			setTimeout(() => {
				if(selectedOption == correctAnswer){
					setTimeout(() => {
						if(this.state.cashCounter < 15){
							this.props.getNextQuestion(parseInt(this.state.currentCashSet), "continuition");
						}else{
							this.props.getNextQuestion(0, "continuition");
						}
						if(this.state.skipQuestion == true){
							this.setState({
								restartClock : true,
								showClock : {
									display : 'block'
								}
							});
						}
						this.setState({
							disableOptionButtons : false,
							skipQuestion : false
						});
						if(this.state.cashCounter < 5){
							this.setState({
								restartClock : true,
								optionClicked : false,
								showClock : {
									display : 'block'
								}
							});
						}else{
							this.setState({
								restartClock : false,
								optionClicked : false,
								showClock : {
									display : 'none'
								}
							});
						}
						for(var i=0;i<4;i++){
							getQuestionDOM.children[1].children[1].children[i].style.pointerEvents = "auto";
							getQuestionDOM.children[1].children[1].children[i].style.cursor = "pointer";
							getQuestionDOM.children[1].children[1].children[i].children[0].children[1].style.display = "inline";
							getQuestionDOM.children[1].children[1].children[i].children[0].children[0].style.color = "#094F1D";
							getQuestionDOM.children[1].children[1].children[i].children[0].children[1].style.color = "#3474DD";
						}
						getSelectedOption.style.backgroundColor = "white";
					}, 3000);
					getSelectedOption.style.backgroundColor = "#05C149";
					getSelectedOption.children[0].style.color = "white";
					getSelectedOption.children[1].style.color = "white";
					if(this.state.skipQuestion == false){
						if(this.state.cashCounter < 16){
							var getSelectedCashPrevious = getCashDOM.children[3].children[this.state.getCashSetLength + 1];
							getSelectedCashPrevious.style.backgroundColor = "#05C149";
						}
						if(this.state.cashCounter < 15){
							var getSelectedCashNext = getCashDOM.children[3].children[this.state.getCashSetLength];
							getSelectedCashNext.style.backgroundColor = "#d7db64";
						}
					}
					if(this.state.cashCounter < 15){
						if(this.state.skipQuestion == false){
							getPreviousCashSet = cashSetArray[cashCounter - 1];
							getMessage = getMessageDOM.children[2].children[0].innerHTML = "Congratulations!! You have won Rs." + getPreviousCashSet;
							setTimeout(() => {
								getNextCashSet = currentCashSet;
								var getMessage = getMessageDOM.children[2].children[0].innerHTML = "Next Question for Rs. " + getNextCashSet;
							}, 3000);
						}else{
							getPreviousCashSet = cashSetArray[cashCounter - 1];
							getMessage = getMessageDOM.children[2].children[0].innerHTML = "This would have been the right answer!! No worries, here is your new question for Rs." + this.state.currentCashSet;
						}
					}else{
						getMessage = getMessageDOM.children[2].children[0].innerHTML = "Congratulations!! You have become Crorepati!! You can take away Rs. 10000000. Thanks for playing!!!";
					}
				}else{
					setTimeout(() => {
						if(this.state.skipQuestion == false){
							this.props.getNextQuestion(0, "continuition");
						}else{
							this.props.getNextQuestion(parseInt(this.state.currentCashSet), "continuition");
							this.setState({
								restartClock : true,
								optionClicked : false,
								showClock : {
									display : 'block'
								}
							});
							if(this.state.cashCounter < 5){
								this.setState({
									restartClock : true,
									optionClicked : false,
									showClock : {
										display : 'block'
									}
								});
							}else{
								this.setState({
									restartClock : false,
									optionClicked : false,
									showClock : {
										display : 'none'
									}
								});
							}
							this.setState({
								skipQuestion : false
							});
						}
						for(var i=0;i<4;i++){
							getQuestionDOM.children[1].children[1].children[i].style.pointerEvents = "auto";
							getQuestionDOM.children[1].children[1].children[i].style.cursor = "pointer";
							getQuestionDOM.children[1].children[1].children[i].children[0].children[1].style.display = "inline";
							getQuestionDOM.children[1].children[1].children[i].children[0].style.backgroundColor = "white";
							getQuestionDOM.children[1].children[1].children[i].children[0].children[0].style.color = "#094F1D";
							getQuestionDOM.children[1].children[1].children[i].children[0].children[1].style.color = "#3474DD";
						}
					}, 3000);
					getSelectedOption.style.backgroundColor = "#FD4444";
					getSelectedOption.children[0].style.color = "white";
					getSelectedOption.children[1].style.color = "white";
					if(this.state.skipQuestion == false){
						var getSelectedCashCurrent = getCashDOM.children[3].children[this.state.getCashSetLength + 1];
						getSelectedCashCurrent.style.backgroundColor = "#FD4444";
					}
					allOptions.map(function(value, i){
						if(value.option == correctAnswer){
							var getCorrectOption = getQuestionDOM.children[1].children[1].children[i].children[0];
							getCorrectOption.style.backgroundColor = "#05C149";
							getCorrectOption.children[0].style.color = "white";
							getCorrectOption.children[1].style.color = "white";
						}
					});
					if(this.state.skipQuestion == false){
						getPreviousCashSet = cashSetArray[cashCounter - 1];
						getMorePreviousCashSet = cashSetArray[cashCounter - 2];
						if(getPreviousCashSet == "1000"){
							getMessage = getMessageDOM.children[2].children[0].innerHTML = "Oops!! You could not win Rs." + getPreviousCashSet + ". You have no money to take away. Thank you!!";
						}else{
							getMessage = getMessageDOM.children[2].children[0].innerHTML = "Oops!! You could not win Rs." + getPreviousCashSet + ". You can take away Rs." + getMorePreviousCashSet + " Thank you!!";
						}
					}else{
						getPreviousCashSet = cashSetArray[cashCounter - 1];
						getMessage = getMessageDOM.children[2].children[0].innerHTML = "Great!! This would have been the wrong answer!! Here is your new question for Rs." + this.state.currentCashSet;
					}
				}
			}, 2000);
		}
	},

	/* Method - getCashLoop
	*  This method returns the 'cashset' element
	*/

	getCashLoop : function(cashset, index){
		return (
			<div className="cashSet col-xs-6 col-sm-3 col-md-2" key={index}>
				<span className="cash">{index + 1} - Rs. {cashset.cash}</span>
			</div>
		)
	},

	/* Method - getOptionLoop
	*  This method returns the 'options' element
	*/

	getOptionLoop : function(op, index){
		return (
			<div className="text-center col-sm-6 col-md-6" key={index}>
				<button onClick={this.setQAParameters.bind(this, op.option, index, this.props.answer, this.props.option, false)} disabled={this.state.disableOptionButtons} className="col-md-6 col-sm-6 col-sm-12 fourOptionButtons optionButtons{index}">
					<span className="optionCharacters pull-left">{String.fromCharCode(65 + index) + ' : '}</span>
					<span className="options pull-left">{op.option}</span>
				</button>
			</div>
		)
	},

	/* Method - applyFiftyfifty
	*  This method is made for '50-50' lifeline. This is called when the user clicks the '50-50' lifeline option and two incorrect options are randomly removed from
	*  the list of four options
	*/

	applyFiftyfifty : function(answer, allOptions){
		var saveWrongAnswers = [];
		var saveRandomIndexes = [];
		var randomIndex, getOptionToHide, getOptionDOMToHide, getFiftyFiftyDOM, disableFiftyFiftyOption;
		var getOptionDOM = ReactDOM.findDOMNode(this);
		var getMessageDOM = ReactDOM.findDOMNode(this);
		var getMessage;
		getMessage = getMessageDOM.children[2].children[0].innerHTML = "You have used '50-50' lifeline. Please choose your answer from two remaining options!!";
		allOptions.map(function(value, index){
			if(value.option != answer){
				saveWrongAnswers.push(index);
			}
		});
		for(var i=0;i<2;i++){
			randomIndex = Math.floor(Math.random() * saveWrongAnswers.length);
			if($.inArray(randomIndex, saveRandomIndexes) == -1){
				saveRandomIndexes.push(randomIndex);
			}else{
				i--;
			}
			getOptionToHide = saveWrongAnswers[randomIndex];
			getOptionDOMToHide = getOptionDOM.children[1].children[1].children[getOptionToHide];
			getOptionDOMToHide.style.pointerEvents = "none";
			getOptionDOMToHide.style.cursor = "none";
			getOptionDOMToHide.children[0].children[1].style.display = "none";
		}
		this.setState({
			showFiftyFifty : true,
			FiftyFiftyUsed : true,
			fiftyFiftyColor : {
				backgroundColor : '#FD4444',
				border : '1px solid #ad0f0f'
			}
		});
	},

	/* Method - applySwitchQuestion
	*  This method is made for 'Switch The Question' lifeline. This is called when the user clicks the 'Switch The Question' lifeline option and the user will be 
	*  switched to new question
	*/

	applySwitchQuestion : function(){
		var getMessageDOM = ReactDOM.findDOMNode(this);
		var getMessage;
		getMessage = getMessageDOM.children[2].children[0].innerHTML = "You have used 'Switch The Question' lifeline. You will be switched to new question. Before that, if you would have answered this question, which option would have you chosen?";
		this.setState({
			showSwitchQuestion : true,
			SwitchQuestionUsed : true,
			skipQuestion : true,
			switchQuestionColor : {
				backgroundColor: '#FD4444',
				border: '1px solid #ad0f0f'
			},
			restartClock : false,
			optionClicked : true,
			showClock : {
				display : 'none'
			}
		});
	},

	/* Method - stopClock
	*  This method is used to stop the clock by changing its state when the user selects any option for answering a question
	*/

	stopClock : function(stopClock){
		this.setState({
			optionClicked : stopClock
		});
	},

	/* Method - setParametersAfterTimeout
	*  This method is called when the timer's time limit is over and the user has still not answer the question. When time limit is over, the game comes to an end
	*/

	setParametersAfterTimeout : function(){
		var getPreviousCashSet = this.state.cashSetArray[this.state.cashCounter - 1];
		var getMessageDOM = ReactDOM.findDOMNode(this);
		this.setState({
			disableOptionButtons : true
		});
		if(this.state.currentCashSet == 1000){
			getMessageDOM.children[2].children[0].innerHTML = "Sorry!! Your Time is up! You have no money to take. Thank you";
		}else{
			getMessageDOM.children[2].children[0].innerHTML = "Sorry!! Your Time is up! You can take away Rs." + getPreviousCashSet + ". Thank you"
		}
		setTimeout(() => {
			this.props.getNextQuestion(0, "continuition");
		}, 3000);
	},

	/* Method - setRestartClockToFalse
	*  This method is used to reset the state of clock to false when the clock was restarted for every question
	*/

	setRestartClockToFalse : function(){
		this.setState({
			restartClock : false
		});
	},

	/* Method - hideClock
	*  This method is used to hide the clock when the user answers the question by selecting the option
	*/

	hideClock : function(){
		this.setState({
			showClock : {
				display : 'none'
			}
		});
	},

	/* Method - render
	*  This method is a React render method which renders this 'QuestionAnswer' component and brings entire UI for the game. Its also passes the required props as 
	*  attributes to 'ConfirmBox' and 'Clock' components
	*/

	render : function(){
		return (
			<div className="row">
				<div className="text-center col-md-12">
					<div className="row">
						<div className="col-md-9 col-sm-9 col-xs-9">
							<span className="title">KBC</span><span className="tag">Reloaded</span>
						</div>
						<div style={this.state.showClock} className="clock text-center col-md-3 col-sm-3 col-xs-3">
							<Clock optionClicked={this.state.optionClicked} restartClock={this.state.restartClock} clockCounter={this.state.clockCounter} hideClock={this.hideClock} setOptionDisable={this.setParametersAfterTimeout} setRestartClockToFalse={this.setRestartClockToFalse} />
						</div>
					</div>
				</div>
				<div style={this.state.disableBackground} className="col-md-12 col-sm-12 col-xs-12">
					<div>
						<p className="text-center questions">{this.props.question}</p>
					</div>
					<div>
						{
							this.props.option.map(this.getOptionLoop)
						}
					</div>
				</div>
				<div className="messageDiv text-center col-md-12 col-sm-12 col-xs-12">
					<p className="messages">Hello</p>
				</div>
				<div style={this.state.disableBackground} className="lifeLinesOptionsCol col-md-12 col-sm-12 col-xs-12">
					<div className="text-center lifeLinesGroup">
						<button style={this.state.fiftyFiftyColor} disabled={this.state.showFiftyFifty} onClick={this.applyFiftyfifty.bind(this, this.props.answer, this.props.option)} className="lifeLines">50-50</button>
						<button style={this.state.switchQuestionColor} disabled={this.state.showSwitchQuestion} onClick={this.applySwitchQuestion} className="lifeLines">Switch The Question</button>
					</div>
					{
						this.props.getCashSet.map(this.getCashLoop).reverse()
					}
				</div>
				<div className="col-md-12 col-sm-12 col-xs-12">
					<ConfirmBox showConfirmBox={this.state.showConfirmBox} disableBackground={this.state.disableBackground} 
					showFiftyFifty={this.state.showFiftyFifty} showSwitchQuestion={this.state.showSwitchQuestion} FiftyFiftyUsed={this.state.FiftyFiftyUsed} SwitchQuestionUsed={this.state.SwitchQuestionUsed} disableOptionButtons={this.state.disableOptionButtons} selectedOption={this.state.selectedOption}
					optionIndex={this.state.optionIndex} correctAnswer={this.state.correctAnswer} allOptions={this.state.allOptions} getMatch={this.getMatch} optionClicked={this.state.optionClicked} stopClock={this.stopClock} />
				</div>
			</div>
		)
	}
});


/* Component - ConfirmBox
*  This component provides a 'confirm box' when the user clicks on any of the option. This confirm box asks for final confirmation to lock the option
*/

var ConfirmBox = React.createClass({
	getInitialState : function(){
		return ({
			showConfirmBox : this.props.showConfirmBox,
			disableBackground :this.props.disableBackground,
			showFiftyFifty : this.props.showFiftyFifty,
			showSwitchQuestion : this.props.showSwitchQuestion,
			disableOptionButtons : this.props.disableOptionButtons,
			optionClicked : this.props.optionClicked
		})
	},

	/* Method - submitOption
	*  This method is called when the user selects any option. This method provided two buttons 'yes' and 'no' in the confirm box
	*/

	submitOption : function(selectedOption, index, answer, allOptions, submitOptionValue){
		var showFiftyFifty, showSwitchQuestion, showConfirmBox, disableBackground, switchQuestionColor, fiftyFiftyColor, disableOptionButtons, stopClock;
		if(this.props.FiftyFiftyUsed == false){
			showFiftyFifty = false;
		}else{
			showFiftyFifty = true;
			fiftyFiftyColor = {
				backgroundColor : '#FD4444',
				border : '1px solid #ad0f0f'
			};
		}
		if(this.props.SwitchQuestionUsed == false){
			showSwitchQuestion = false;
		}else{
			showSwitchQuestion = true;
			switchQuestionColor = {
				backgroundColor : '#FD4444',
				border : '1px solid #ad0f0f'
			};
		}
		showConfirmBox = {
			display : 'none'
		};
		disableBackground = {
			opacity : 1
		};
		disableOptionButtons = false;
		if(this.state.optionClicked == false && submitOptionValue == true){
			stopClock = true;
			this.props.stopClock(stopClock);
		}
		this.props.getMatch(selectedOption, index, answer, allOptions, submitOptionValue, showConfirmBox, disableBackground, switchQuestionColor, fiftyFiftyColor, showFiftyFifty, showSwitchQuestion, disableOptionButtons);
	},

	/* Method - render
	*  This method is a React render method which renders this 'ConfirmBox' component and displays the 'confirm box'
	*/

	render : function(){
		return (
			<div style={this.props.showConfirmBox} className="text-center confirmBox">
				<p>Are you sure you want to lock this option - <b>{String.fromCharCode(65 + this.props.optionIndex)} : {this.props.selectedOption} ?</b></p>
				<button className="yesButton btn btn-success" onClick={this.submitOption.bind(this, this.props.selectedOption, this.props.optionIndex, this.props.correctAnswer, this.props.allOptions, true)}>Yes</button>
				<button className="noButton btn btn-danger" onClick={this.submitOption.bind(this, this.props.selectedOption, this.props.optionIndex, this.props.correctAnswer, this.props.allOptions, false)}>No</button>
			</div>
		)
	}
});


/* Component - Clock
*  This component provides a 'clock' as a timer for the questions
*/

var Clock = React.createClass({
	getInitialState : function(){
		return ({
			clockCounter : this.props.clockCounter
		})
	},

	/* Method - componentDidMount
	*  This method is a React lifecycle method which starts the clock for the very first question, invoked once after the initial rending of this component
	*/

	componentDidMount : function(){
		var getQuestionDOM = ReactDOM.findDOMNode(this);
		this.startClock();
	},

	/* Method - componentDidUpdate
	*  This method is a React lifecycle method restarts the clock, invoked when the component updates are flushed to DOM
	*/

	componentDidUpdate : function(){
		if(this.props.restartClock == true){
			this.startClock();
			this.props.setRestartClockToFalse();
		}
	},

	/* Method - startClock
	*  This method starts the clock
	*/

	startClock : function(){
		var clockCounter = this.state.clockCounter - 1;
		var disableOptionButtons;
		this.setState({
			clockCounter : clockCounter
		});
		if(clockCounter > 0){
			if(this.props.optionClicked == false){
				setTimeout(this.startClock, 1000);
			}else{
				this.setState({
					clockCounter : 31
				});
				this.props.hideClock();
			}
		}else{
			this.props.setOptionDisable();
		}
	},

	/* Method - render
	*  This method is a React render method which renders this 'Clock' component and displays the 'clock'
	*/

	render : function(){
		return (
			<div>
				<span>{this.state.clockCounter}</span>
			</div>
		)
	}
});

/* Component Invoking with DOM render with id 'container' - QuestionAnswerCollection
*  It invokes and render the 'QuestionAnswerCollection' component with the 'container' id
*/

var qaCollection = <QuestionAnswerCollection questions="questions.json" cash="cashset.json" />
ReactDOM.render(qaCollection, document.getElementById("container"));