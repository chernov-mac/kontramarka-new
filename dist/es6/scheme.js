/*jslint esversion: 6 */

const SchemeDefaults = {
	category: 0
};

class Scheme {

	constructor(scheme, places, options) {
		this.scheme = scheme;
		this.places = places;
		this.notFoundCount = 0;
		this.options = Object.assign({}, SchemeDefaults, options);

		this.init();
    }

	init() {

		if (typeof scheme == 'string') {
			// load as html
		}

		// after that we are agreed that `schemes` is alive dom element
		var start = performance.now();

		this.places.forEach(place => {
			let placeId = '' + place.ticket_block_name + '-' + place.ticket_row + '-' + place.ticket_place;
			let placeElem = this.scheme.querySelector('#' + placeId.replace(/\s{1,}/g, ''));

			// placeElem.classList.remove('empty_label');
			if (placeElem) {
				placeElem.style.backgroundColor = 'rgba(0, 100, 255, 0.75)';
				placeElem.addEventListener('click', markerPlace.bind(this, placeId, this.options.category, place.ticket_price, place.ticket_currency));
			} else {
				console.log(++this.notFoundCount + '. WARN: element with id \'' + placeId + '\' is not found in the scheme.');
			}
		});

		var finish = performance.now();
		console.log("Work with DOM elements took " + (finish - start) + " milliseconds.")
	}

}
