//variables:
var fetchButtonEl = document.querySelector("#fetch-btn");

var originInput = document.querySelector("#origin-input").value;

var destinationInput = document.querySelector("#destination-input").value;

//Hotels com API api through rapidapi.com
//searches nearby hotels relative to the query(geoposition: latitude and longitude)
const optionsHotel = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'c20bfb4b26msh90013965b57ab59p153be0jsn7a6405d62cf9',
		'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
	}
};


//functions:
//user input (origin, destination and time departure-default: current time) is passed through this function; data repackaged and sent to fetch function
var convertStringGeoPos = function(){
    console.log('this will convert user input destination string to latitude and longitude')
    console.log(originInput);
    console.log(destinationInput);
}

//search nearby hotels by lat and lon
var fetchHotelsFunction = function(){
    console.log('this fetches list of nearby hotels by lat and lon')
    fetch('https://hotels-com-provider.p.rapidapi.com/v1/hotels/nearby?latitude=51.509865&currency=USD&longitude=-0.118092&checkout_date=2022-03-27&sort_order=STAR_RATING_HIGHEST_FIRST&checkin_date=2022-03-26&adults_number=1&locale=en_US&guest_rating_min=4&star_rating_ids=3%2C4%2C5&children_ages=4%2C0%2C15&page_number=1&price_min=10&accommodation_ids=20%2C8%2C15%2C5%2C1&theme_ids=14%2C27%2C25&price_max=500&amenity_ids=527%2C2063', optionsHotel)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));

        //output data to create DOM elements and user can pick a hotel
};

//need function to take user input(picked hotel), take address and get geoposition

//once user picks a hotel,retrieves directions to get to destination
var fetchDirectionsFunction = function(){
    console.log('this will fetch from directions api')
}

//google maps api
//not yet working

// var googleMapsApiKey = 'AIzaSyDfINFfuRcSYAh-2ukV1n032OjpcZUXNJw';

// var googleDirectionsUrl='https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=AIzaSyDfINFfuRcSYAh-2ukV1n032OjpcZUXNJw'
// fetch(googleDirectionsUrl)
// 	.then(response => response.json())
// 	.then(response => console.log(response))
// 	.catch(err => console.error(err));

//addEventListeners:

fetchButtonEl.addEventListener("click",fetchHotelsFunction)