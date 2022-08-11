//------------------DEFINE VARIABLES--------------------------------------:
var fetchButtonEl = document.querySelector("#fetch-btn");

var originInputEl = document.querySelector("#origin-input");

var destinationInput = document.querySelector("#destination-input");

var checkInEl = document.querySelector("#checkin-input");

var checkOutEl = document.querySelector("#checkout-input");

var hotelContainerEl = document.querySelector("#hotel-results-container")

var hotelResults ='';



    //Hotels com API api through rapidapi.com
    //searches nearby hotels relative to the query(geoposition: latitude and longitude)
const optionsHotel = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'c20bfb4b26msh90013965b57ab59p153be0jsn7a6405d62cf9',
		'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
	}
};

    //google maps geocoding api through rapidapi.com
    //returns lat lon geopositioning based on string (address) provided by user
const optionsGeoPos = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'c20bfb4b26msh90013965b57ab59p153be0jsn7a6405d62cf9',
		'X-RapidAPI-Host': 'google-maps-geocoding.p.rapidapi.com'
	}
};



//-----------------DEFINE FUNCTIONS----------------------:
//user input (origin, destination and time departure-default: current time) is passed through this function; data repackaged and sent to fetch function
var convertOriginGeoPos = function(){
    console.log('this will convert user input destination string to latitude and longitude')
    var originInput = originInputEl.value.trim();
    console.log(originInput);
    var geoPosUrl= 'https://google-maps-geocoding.p.rapidapi.com/geocode/json?address=' + originInput + '&language=en'
    console.log(geoPosUrl);
    fetch(geoPosUrl, optionsGeoPos)
        .then(function(response){
            if (response.ok){
                response.json().then(function(data){
                    console.log(data)
                    fetchHotelsFunction(data);
                })
            }
        })
        .catch(function(error){
            alert("unable to connect to google maps");//switch to modal
        });
};

//search nearby hotels by lat and lon
var fetchHotelsFunction = function(geoPos){
    console.log('this fetches list of nearby hotels by lat and lon')
    console.log(geoPos)//use lat and lon to define hotelApiUrl
    var checkin = checkInEl.value;
    var checkout = checkOutEl.value;
    var originGeoPos = geoPos.results[0].geometry.location;
    var originLat = originGeoPos.lat;
    var originLong = originGeoPos.lng;
    console.log(originGeoPos);
    console.log(originLat);
    console.log(originLong);
    
    var hotelApiUrl = 'https://hotels-com-provider.p.rapidapi.com/v1/hotels/nearby?latitude='+originLat+'&currency=USD&longitude='+originLong+'&checkout_date='+checkout+'&sort_order=STAR_RATING_HIGHEST_FIRST&checkin_date='+checkin+'&adults_number=1&locale=en_US&guest_rating_min=4&star_rating_ids=3%2C4%2C5&children_ages=4%2C0%2C15&page_number=1&price_min=10&accommodation_ids=20%2C8%2C15%2C5%2C1&theme_ids=14%2C27%2C25&price_max=500&amenity_ids=527%2C2063'
    fetch(hotelApiUrl, optionsHotel)
        .then(function(response){
            response.json().then(function(data){
                console.log(data);
                hotelListHandler(data);
            })})
        
        .catch(err => console.error(err));

        //output data to create DOM elements and user can pick a hotel
};

//need function to take user input(picked hotel), take address and get geoposition
var hotelListHandler = function(hotelList){
    console.log(hotelList,"create Elements based on hotels listed");
    hotelResults = hotelList.searchResults.results;
    console.log(hotelResults);
    for(var i = 0; i < hotelResults.length; i++){
        console.log(hotelResults[i]);//this will list all hotels found and other properties

        var hotelResultsEl = document.createElement("button")
        hotelResultsEl.textContent= hotelResults[i].name;
        hotelResultsEl.setAttribute("id",hotelResults[i].name);

        hotelContainerEl.append(hotelResultsEl)

    }

    
}
//once user picks a hotel,retrieves directions to get to destination
var fetchDirectionsFunction = function(event){
    var hotel = event.target
    console.log(hotel);
    console.log(hotelResults);//data captured from hotelListHandler function
    console.log('this will fetch from directions api')


}

function initMap(){
    var mapOptions ={ 
        center:{lat:43.6532,lng:79.3832},
        zoom:8}
    console.log(google)
    map = new google.maps.Map(document.getElementById('map'), mapOptions)
}

//google maps api
//not yet working

// var googleMapsApiKey = 'AIzaSyDfINFfuRcSYAh-2ukV1n032OjpcZUXNJw';

// var googleDirectionsUrl='https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=AIzaSyDfINFfuRcSYAh-2ukV1n032OjpcZUXNJw'
// fetch(googleDirectionsUrl)
// 	.then(response => response.json())
// 	.then(response => console.log(response))
// 	.catch(err => console.error(err));

//----------------------addEventListeners-------------------------:

hotelContainerEl.addEventListener("click", fetchDirectionsFunction)
fetchButtonEl.addEventListener("click",convertOriginGeoPos);

