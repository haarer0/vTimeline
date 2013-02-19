(function( $ ) {

	var _$container = null;
	var _$controls = null;
	var _$nav = null;
	var _$items = null;

	var _aItems = [];

	var _nNavLineHOffset = 0;
	var _nNavLineVOffset = 0;

	var _settings = {
		items : {
			containerClass : 'timeline-item',
			arrowClass : 'timeline-item-arrow',
			arrowClassRight: 'right',
			arrowClassLeft: 'left',

			sortType : 'desc',
			applySort : true,

			dateAttributeName: 'date',
			dateRegExpPattern: /(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/i
		},

		controls : {
			containerClass : 'timeline-controls'
		},

		nav : {
			containerClass : 'timeline-nav',
			lineClass : 'timeline-nav-line',
			pointClass : 'timeline-nav-point'
		},

		separators : {
			list : []
		}
	};

	//Internal use. Getting param from initial settings.
	function _GetSettingsParam(sCategoryName, sParam) {
		if (_settings[sCategoryName] === undefined) {
			$.error('_GetSettingsParam: invalid settings type');
		}

		if (_settings[sCategoryName][sParam] === undefined) {
			$.error('_GetSettingsParam: invalid settings param name');
		}

		return _settings[sCategoryName][sParam];
	}

	//Internal use. Converts string date to JS Date object
	function _GetDateFromCustomString(sDateString) {
		var aRes = sDateString.match(_GetSettingsParam('items', 'dateRegExpPattern'));
		if (!aRes || (aRes.length < 1)) {
			$.error("_GetDateFromCustomString: Cannot evaluate date from string '" + sDateString + "'");
		}

		return new Date(aRes[1] || 0, parseInt(aRes[2] || 1, 10) - 1, aRes[3] || 0, aRes[4] || 0, aRes[5] || 0, aRes[6] || 0);
	}

	//Internal use. This func sorts all items by date
	function _SortItems(aItems) {

		if (!_GetSettingsParam('items', 'applySort')) {
			return;
		}

	    var bIsSortDesc = _GetSettingsParam('items', 'sortType') === 'desc';
		aItems.sort(function(item1, item2) {
			return bIsSortDesc ? (item2.date.getTime() - item1.date.getTime()) : (item1.date.getTime() - item2.date.getTime());
		});
	}

	function _InitializeContainers() {
		_$container.css('position', 'relative');
		_$controls.css('position', 'absolute');
		_$nav.css('position', 'absolute');
	}

	function _PrepareControls() {
		_$controls.css({'left' : _$container.outerWidth(true) / 2 - _$controls.outerWidth() / 2});
	}

	function _PrepareNav() {
		_$nav.html('');

		var navLine = _CreateElement(_GetSettingsParam('nav', 'lineClass'), _$nav);

		_nNavLineHOffset = (_$container.outerWidth(true) - _$nav.outerWidth(true)) / 2;
		_$nav.css({
			'width': navLine.width(),
			'left' : _nNavLineHOffset
		});

		navLine.css({
			'position': 'absolute',
			'height': -parseInt(_$nav.css('margin-top'), 10)
		});
	}

	function _PrepareItems() {
		_aItems = [];

		_$items = _$container.find('.' + _GetSettingsParam('items', 'containerClass'));
		_$items.css('position', 'absolute');

		var sDateAttrName = _GetSettingsParam('items', 'dateAttributeName');

		_$items.each(function() {
//if ($(this).find('hr').length === 0) $(this).append('<hr>' + $(this).data('date'))
			_aItems.push({
				$el: $(this),
				date: _GetDateFromCustomString($(this).data(sDateAttrName))
			});
		});

		_SortItems(_aItems);

		_$items.css({'width' : _$container.width() / 2 - _$nav.outerWidth(true) / 2 - parseInt(_$items.css('padding-left'), 10) - parseInt(_$items.css('padding-right'), 10)});		
	}

	function _GetSeparator(curDate, prevDate) {
		var nGap = 0;
		var aSeparators = _GetSettingsParam('separators', 'list');
		for (var i in aSeparators) {
			switch (aSeparators[i].separateItemType) {
				case 'year' : 
					if ((curDate.getYear() !== prevDate.getYear()))	{
						nGap = nGap > aSeparators[i].gapSize ? nGap : aSeparators[i].gapSize;
						continue;
					}
					break;

				case 'month' : 
					if ((curDate.getMonth() !== prevDate.getMonth()) || 
							(curDate.getYear() !== prevDate.getYear()))	{
						nGap = nGap > aSeparators[i].gapSize ? nGap : aSeparators[i].gapSize;
						continue;
					}
					break;

				case 'day' : 
					if ((curDate.getDate() !== prevDate.getDate())	||
							(curDate.getMonth() !== prevDate.getMonth()) || 
							(curDate.getYear() !== prevDate.getYear()))	{
						nGap = nGap > aSeparators[i].gapSize ? nGap : aSeparators[i].gapSize;
						continue;
					}
					break;

				case 'hour' : 
					if ((curDate.getHours() !== prevDate.getHours()) ||
							(curDate.getDate() !== prevDate.getDate())	||
							(curDate.getMonth() !== prevDate.getMonth()) || 
							(curDate.getYear() !== prevDate.getYear()))	{
						nGap = nGap > aSeparators[i].gapSize ? nGap : aSeparators[i].gapSize;
						continue;
					}
					break;
			}
		}

		return nGap;
	}

	function _PlaceItems() {
		if (!_aItems.length) {
			return;
		}

		var nLeftOffset = parseInt(_$container.css('padding-top'), 10);
		var nRightOffset = nLeftOffset;

		var nElementsGap = parseInt(_$items.css('margin-top'), 10) + parseInt(_$items.css('margin-bottom'), 10);

		var prevDate = _aItems[0].date;

		var nSeparator = 0;

		var navLineClass = _GetSettingsParam('nav', 'lineClass');
		var navLineW = $('.' + navLineClass).width();
		var nLastNavLineTop = _nNavLineVOffset;

		var navPointClass = _GetSettingsParam('nav', 'pointClass');	
		var nPointTopPos = 0;	

		var arrowClass = _GetSettingsParam('items', 'arrowClass');	
		var arrowLeftClass = _GetSettingsParam('items', 'arrowClassLeft');
		var arrowRightClass = _GetSettingsParam('items', 'arrowClassRight');
		var nTotalH = nLeftOffset;

		for (var i in _aItems) {
			var $el = _aItems[i].$el;

			nSeparator = _GetSeparator(_aItems[i].date, prevDate);
			if (nSeparator) {

				nSeparator = nSeparator > nElementsGap ? nSeparator : nElementsGap;

				var nDelta = nLeftOffset - nRightOffset;
				if (nDelta >= 0) {
					nLeftOffset += nSeparator - nElementsGap;
					nRightOffset = nLeftOffset;
				} else {
					nRightOffset += nSeparator - nElementsGap;
					nLeftOffset = nRightOffset;					
				}
			}

			var arrow = _CreateElement(arrowClass, _$nav);

			//nPointTopPos += (nLeftOffset === nRightOffset === nPointTopPos) && nPointTopPos ? 20 : 0;
			if (nLeftOffset <= nRightOffset) {
				$el.css({
					'left' : parseInt(_$container.css('padding-left'), 10),
					'top' :  nLeftOffset
				});

				nPointTopPos = nLeftOffset + ((nLeftOffset > (nPointTopPos - 20)) ? 20 : 60);


				arrow.addClass(arrowRightClass);
				arrow.css({
					'left' : -parseInt(_$nav.css('margin-left'), 10)
				});

				nLeftOffset += $el.outerHeight(false) + nElementsGap;
			} else {
				$el.css({
					'left': _$nav.position().left + _$nav.outerWidth(true),
					'top' : nRightOffset
				});

				nPointTopPos = nRightOffset + ((nRightOffset > (nPointTopPos - 20)) ? 20 : 60);

				arrow.addClass(arrowLeftClass);
				arrow.css({
					'right' : -parseInt(_$nav.css('margin-right'), 10)
				});

				nRightOffset += $el.outerHeight(false) + nElementsGap;
			}


			var point = _CreateElement(navPointClass, _$nav);
			point.css({
				'top' : nPointTopPos,
				'left' : -point.outerWidth(true) / 2 + navLineW / 2,
				'position' : 'absolute'
			});			

			var navLine = _CreateElement(navLineClass, _$nav);
			navLine.css({
				'top' : nLastNavLineTop,
				'left': 0,
				'height' : nPointTopPos - nLastNavLineTop,
				'position' : 'absolute'
			});

			arrow.css({
				'top': nPointTopPos - parseInt(point.css('margin-bottom'), 10) / 2,
				'position' : 'absolute'
			});

			nLastNavLineTop = nPointTopPos + point.outerHeight(true);

			nNavH = $el.outerHeight(true) + nElementsGap;
			prevDate = _aItems[i].date;
		}


		var nContainerH = (nLeftOffset > nRightOffset ? nLeftOffset : nRightOffset) - nElementsGap;
		
		nContainerH -= parseInt(_$container.css('padding-top'), 10);
	
		_$container.css('height', nContainerH);
		_$nav.css({'height': nLastNavLineTop + point.outerHeight(true)});
	}


	function _CreateElement(sElementClass, $containerAppendedTo) {
		$containerAppendedTo = $containerAppendedTo || _$container;
		var e = $(document.createElement('div'));
		e.addClass(sElementClass);
		e.appendTo($containerAppendedTo);
		return e;
	}

	var methods = {
	    init : function(options) {	    	
	    	for (var i in options) {
	    		_settings[i] = _settings[i] || {};
	    		for (var ii in options[i]) {
	    			_settings[i][ii] = options[i][ii];
	    		}
	    	}

	    	_$container = this;	    	
			_$controls = _$container.find('.' + _GetSettingsParam('controls', 'containerClass'));
			_$nav = _$container.find('.' + _GetSettingsParam('nav', 'containerClass'));

			_InitializeContainers();
		},

	    update : function() {
			_PrepareNav();
			_PrepareControls();
			_PrepareItems();
			_PlaceItems();
	    }
	};

	$.fn.vTimeline = function(method) {
	    if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
	    } else {
			$.error('Method ' +  method + ' does not exist on jQuery.akqaTimelineV');
	    }
	};
})( jQuery );