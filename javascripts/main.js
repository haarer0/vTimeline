$(document).ready(function() {

	$('a.pseudolink').click(function(e) {
		ChangePane($(this).attr('href').substr(1));
		e.preventDefault();
	});

	var sCurPage = $('nav a.current').attr('href').substr(1);
	$('#page-' + sCurPage).show();

	function ChangePane(sTo) {
		if (sCurPage == sTo) {
			return;
		}

		$('#page-' + sCurPage).hide();
		$('#nav-' + sCurPage).removeClass('current');
		$('#page-' + sTo).show();
		$('#nav-' + sTo).addClass('current');
		sCurPage = sTo;

		if (sCurPage === 'example') {
			$('#timeline-container').vTimeline('update');
		}
	}

	var aRandomTexts = [
		"Vestibulum non elit a urna facilisis porta. Vivamus porta metus ut metus tempus nec varius velit varius. Quisque ut justo mi. Fusce congue fringilla purus.",
		"Integer consequat tristique nulla, nec dignissim eros viverra at. Nunc malesuada urna non elit lacinia semper. Etiam dapibus porta turpis, in consequat eros tincidunt vel.",
		"Suspendisse potenti. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut nibh quam, elementum at eleifend nec, feugiat vitae metus.",
		"Nam lacus mi, tincidunt in iaculis vel, tristique id augue. In sed lectus ligula. Suspendisse quis pretium massa. Integer a felis eu nisl gravida placerat.",
		"Donec pharetra iaculis nisi at vestibulum. Donec erat purus, mollis a dignissim sed, dapibus vitae justo. In at purus sed dolor fermentum bibendum et id.",
		"Quisque lectus elit, sodales id convallis sed, ullamcorper ut dui. Sed eget elit nec lorem porta ultrices id et sem. Pellentesque ac purus dui, ac.",
		"Pellentesque ultrices orci vel elit consequat tempor. Duis eu metus a est elementum gravida eget pharetra libero. Phasellus mattis ornare est. Ut dictum faucibus sem.",
		"Cras ut nulla vel neque euismod mattis. Morbi nulla magna, lobortis at posuere a, dictum a odio. Morbi ultricies blandit lacus eget rutrum. Ut tincidunt."
	];

	$("#add-random").click(function(e) {
		var d = new Date();
		var sText = aRandomTexts[parseInt(Math.random() * (aRandomTexts.length - 1), 10)];
		var aWords = sText.split(' ');
		var sHeader = aWords[0] + ' ' + aWords[1];
		var nMonth = d.getMonth() + 1;
		var sDateAttr = d.getFullYear() + '-' + (nMonth < 10 ? '0' : '') + nMonth + '-' + d.getDate() + ' ' + d.toString().substr(16, 8);

		$('#timeline-container').append('<div class="timeline-item" data-date="' + sDateAttr + '"><p class="entry-datetime">' + d.toUTCString().substr(5, 20) + '</p><p class="entry-header">' + sHeader + '</p><p class="entry-author">Jonh Doe</p><p class="entry-text">' + sText + '</p></div>');
		$('#timeline-container').vTimeline('update');
	});

	$('#timeline-container').vTimeline();
});