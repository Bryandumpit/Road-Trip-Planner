//Travel advisor api through rapidapi.com
//searches nearby hotels relative to the query(geoposition: latitude and longitude)

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '9f86138359msh4f6cbfb84ac53aap1ab4ffjsn0cf02957ece8',
		'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
	}
};

fetch('https://travel-advisor.p.rapidapi.com/locations/v2/auto-complete?query=eiffel%20tower&lang=en_US&units=km', options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));

//google maps api
//not yet working

// var googleMapsApiKey = 'AIzaSyDfINFfuRcSYAh-2ukV1n032OjpcZUXNJw';

// var googleDirectionsUrl='https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=AIzaSyDfINFfuRcSYAh-2ukV1n032OjpcZUXNJw'
// fetch(googleDirectionsUrl)
// 	.then(response => response.json())
// 	.then(response => console.log(response))
// 	.catch(err => console.error(err));