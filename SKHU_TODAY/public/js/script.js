$(document).ready(function() {
	var gift;
	var present = [1, 2, 3, 4, 5, 6]

	iniGame = function(num) {
		gift = num;

		//$(".board_start").html('<img src="images/roulette_board_go.png">');
		TweenLite.killTweensOf($(".board_on"));
		TweenLite.to($(".board_on"), 0, {
			css : {
				rotation : rotationPos[gift]
			}
		});
		TweenLite.from($(".board_on"), 5, {
			css : {
				rotation : -3000
			},
			onComplete : endGame,
			ease : Sine.easeOut
		});
		console.log("gift 숫자 : " + (gift + 1));
	}
	var rotationPos = new Array(60, 120, 180, 240, 300, 360);

	TweenLite.to($(".board_on"), 60, {
		css : {
			rotation : -4000
		},
		ease : Linear.easeNone
	});
	function endGame() {
		var copImg = "img/album" + (gift + 1) + ".jpg";
		console.log("이미지 : " + copImg);

		$("#popup_gift .lottery_present").text(function() {
			
		
			if((gift+1) == 6){
	return "축하합니다! 당첨되었습니다.";
}else{
	return "꽝입니다. 다음 기회에 노려보세요~";
}

		});
		$('<img  src="' + copImg + '" />').prependTo("#popup_gift .lottery_present");

		setTimeout(function() {
			openPopup("popup_gift");
		}, 1000);
	}


	$(".popup .btn").on("click", function() {
		location.reload();
	});
	function openPopup(id) {
		closePopup();
		$('.popup').slideUp(0);
		var popupid = id
		$('body').append('<div id="fade"></div>');
		$('#fade').css({
			'filter' : 'alpha(opacity=60)'
		}).fadeIn(300);
		var popuptopmargin = ($('#' + popupid).height()) / 2;
		var popupleftmargin = ($('#' + popupid).width()) / 2;
		$('#' + popupid).css({
			'margin-left' : -popupleftmargin
		});
		$('#' + popupid).slideDown(500);
	}

	function closePopup() {
		$('#fade').fadeOut(300, function() {
			// $(".player").html('');
		});
		$('.popup').slideUp(400);
		return false
	}


	$(".close").click(closePopup);

});

$(function() {
	var clicked = 0;
	for ( i = 1; i < 7; i++) {

		var pictures = "img/album" + i + ".jpg";
		$(".board_on").append('<img  src="' + pictures + '" />');

	}
	$(".join").on("mousedown", function() {
		if (clicked <= 0) {
			iniGame(Math.floor(Math.random() * 6));
		} else if (clicked >= 1) {
			event.preventDefault();
			alert("이벤트 참여 하셨습니다.");
		}
		clicked++
	});
})