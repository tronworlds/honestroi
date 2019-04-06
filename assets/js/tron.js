/*
** This source code is published only for verification purpose.
** You have no permission to copy it. If you want to use this script contact
** the author: https://github.com/tronworlds
*/


const SUN_IN_TRX = 1000000;
const ENERGY_LIMIT = 10000000;

//const PAYMENT_PERIOD = 3600;
const PAYMENT_PERIOD = 6; //Shasta
HOURLY_PROFIT_DIVIDER = 2400;
MIN_DEPOSIT = 10;
//const CONTRACT_ADDRESS = "TJYNMUtUeDTEQGHKQQ7ZijMkh1E2kGKg4C";
const CONTRACT_ADDRESS = "TKVy5L9FpPNT5e6BU6A19dzS4Z9w5xYcbk"; //Shasta

var contract = false;

var profit = 0;
var started = false;

function getGameInfo() {
	if (contract) {
		contract.totalPayout().call().then(result => {setInfo("total-payout", (result / SUN_IN_TRX).toFixed(2));});
		contract.totalUsers().call().then(result => {setInfo("total-users", result);});
		contract.totalDeposited().call().then(result => {setInfo("total-deposited", (result / SUN_IN_TRX).toFixed(2));});
		tronWeb.trx.getBalance(CONTRACT_ADDRESS).then(result => {setInfo("contract-balance", (result / SUN_IN_TRX).toFixed(2));});
	}
}

function gameStartTime() {
	if (contract) {
		contract.startTime().call().then(result => {
			var now = new Date().getTime();
			var distance = result.toNumber() - now / 1000;
			if (distance > 0) {
				setInfo("couner-title", "Starts in");
				countDown(distance);
			} else {
				started = true;
				countUp(-distance);
			}
		});
	}
}

function getUserBalance() {
	tronWeb.trx.getBalance().then(result => {setInfo("balance", (result / SUN_IN_TRX).toFixed(2));});
}

function getUserInfo() {
	if (contract) {
		contract.getMyInfo().call().then(result => {
			setInfo("user-deposit", (result[0] / SUN_IN_TRX).toFixed(2));
			setInfo("user-daily-profit", (result[0] / SUN_IN_TRX / 100).toFixed(2));
			setInfo("user-total-withdrawn", (result[2] / SUN_IN_TRX).toFixed(2));
			var periods = Math.floor((result[4] - result[3]) / PAYMENT_PERIOD);
			profit = result[1].toNumber();
			if(periods > 0) {
				profit += (result[0] / HOURLY_PROFIT_DIVIDER) * periods;
			}
			setInfo("user-withdrawable", (profit / SUN_IN_TRX).toFixed(2));
			});
	}
		
}

function deposit() {
	var amount = Math.floor(document.getElementById("deposit-amount").value);
	console.log(amount);
	if (contract && started && amount >= MIN_DEPOSIT) {
		var args = {
			feeLimit:ENERGY_LIMIT,
			callValue:amount * SUN_IN_TRX,
			shouldPollResponse: false
		};
	contract.deposit().send(args);
	}
}

function withdrawAll() {
	if (contract && started && profit > 0) {
		var args = {
			feeLimit:ENERGY_LIMIT,
			callValue:0,
			shouldPollResponse: false
		};
	contract.withdrawAll().send(args);
	}
}

function reinvestAll() {
	if (contract && started && profit >= MIN_DEPOSIT * SUN_IN_TRX) {
		var args = {
			feeLimit:ENERGY_LIMIT,
			callValue:0,
			shouldPollResponse: false
		};
	contract.reinvestAll().send(args);
	}
}

function countDown(distance) {
	setInterval(function() {
		showTime(distance);
		distance--;
		if (distance <= 0) {
			window.location.reload();
		}
	}, 1000)
}

function countUp(distance) {
	setInterval(function() {
		showTime(distance);
		distance++;
	}, 1000)
}

function showTime(distance) {
	var days = Math.floor(distance / (60 * 60 * 24));
    var hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
    var minutes = Math.floor((distance % (60 * 60)) / 60);
    var seconds = Math.floor((distance % 60));
	setInfo("days" , days);
	setInfo("hours" , hours);
	setInfo("minutes" , minutes);
	setInfo("seconds" , seconds);
}

function setInfo(id, value) {
	document.getElementById(id).innerHTML = value;
}

window.onload = function() {
	console.log(window);
	if (!!window.tronWeb) {
		if(!window.tronWeb.ready) {
			setTimeout(function(){
				if(!window.tronWeb.ready) jQuery("#tronWalletModal").modal('show');
			}, 2000);
		}
		tronWeb = window.tronWeb;
		tronWeb.contract().at(CONTRACT_ADDRESS).then(result => {
			contract = result;
			gameStartTime();
			getGameInfo();
			getUserInfo();
			getUserBalance();			
			setInterval(function(){
				getGameInfo();
				getUserInfo();
				getUserBalance();
			}, 3000);
		});
	} else {
		jQuery("#tronWalletModal").modal('show');
	}
}