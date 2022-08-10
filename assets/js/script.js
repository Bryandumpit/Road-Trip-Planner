//Travel advisor api through rapidapi.com
//searches nearby hotels relative to the query(geoposition: latitude and longitude)

const axios = require("axios");

const options = {
  method: 'POST',
  url: 'https://travel-advisor.p.rapidapi.com/locations/v2/list-nearby',
  params: {currency: 'USD', units: 'km', lang: 'en_US'},
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': '9f86138359msh4f6cbfb84ac53aap1ab4ffjsn0cf02957ece8',
    'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
  },
  data: '{"contentId":"cc8fc7b8-88ed-47d3-a70e-0de9991f6604","contentType":"restaurant","filters":[{"id":"placetype","value":["hotel","attraction","restaurant"]},{"id":"minRating","value":["30"]}],"boundingBox":{"northEastCorner":{"latitude":12.248278039408776,"longitude":109.1981618106365},"southWestCorner":{"latitude":12.243407232845051,"longitude":109.1921640560031}}}'
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});

fetch('https://hotels-com-provider.p.rapidapi.com/v1/hotels/nearby?latitude=51.509865&currency=USD&longitude=-0.118092&checkout_date=2022-08-27&sort_order=STAR_RATING_HIGHEST_FIRST&checkin_date=2022-08-26&adults_number=1&locale=en_US&guest_rating_min=4&star_rating_ids=3%2C4%2C5&children_ages=4%2C0%2C15&page_number=1&price_min=10&accommodation_ids=20%2C8%2C15%2C5%2C1&theme_ids=14%2C27%2C25&price_max=500&amenity_ids=527%2C2063', options)
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