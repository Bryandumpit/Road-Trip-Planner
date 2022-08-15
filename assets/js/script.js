//------------------DEFINE VARIABLES--------------------------------------:

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

var fetchButtonEl = document.querySelector("#fetch-btn");

var originInputEl = document.querySelector("#origin-input");

var destinationInputEl = document.querySelector("#destination-input");

var checkInEl = document.querySelector("#checkin-input");

var checkOutEl = document.querySelector("#checkout-input");

var hotelContainerEl = document.querySelector("#hotel-results-container")

var hotelResults;

var modalTitleEl = document.querySelector("#modal-title")

var modalBodyEl = document.querySelector("#modal-body")


//-----------------DEFINE FUNCTIONS----------------------:
//user input (origin, destination and time departure-default: current time) is passed through this function; data repackaged and sent to fetch function
var inputValidation = function (){
    //initial input validation
    var modalKey ='';  

    if (originInputEl.value===''){
        modalKey="invalid-origin";
        modalHandler(modalKey);
    } else if(destinationInputEl.value ==='') {
        modalKey="invalid-destination";
        modalHandler(modalKey);
    } else if(checkInEl.value===''||checkInEl.value.length!==10) {
        modalKey="invalid-checkin";
        modalHandler(modalKey);
    } else if(checkOutEl.value===''||checkOutEl.value.length!==10){
        modalKey="invalid-checkout";
        modalHandler(modalKey);
    } else {
        convertDestinationGeoPos();
    }
}

var convertDestinationGeoPos = function(){
    console.log('this will convert user input destination string to latitude and longitude')
  
    var destinationInput = destinationInputEl.value.trim();
    var destinationGeoPosUrl= 'https://google-maps-geocoding.p.rapidapi.com/geocode/json?address=' + destinationInput + '&language=en'
    console.log(destinationGeoPosUrl);
    
    
    fetch(destinationGeoPosUrl, optionsGeoPos)
        .then(function(response){
            if (response.ok){
                response.json().then(function(data){
                    console.log(data);
                    console.log(data.status)
                    if(data.results.length===0){
                        reset();
                        var modalKey = "no-destination"
                        modalHandler(modalKey);
                    } else {
                        fetchHotelsFunction(data);
                        console.log('else executed')
                    }                    
                })
            }
        })
        .catch(function(error){
            console.log(error);
            reset();
            var modalKey = "destination-error"
            modalHandler(modalKey);
        });
};



//search nearby hotels by lat and lon
var fetchHotelsFunction = function(destinationGeoPos){
    console.log('this fetches list of nearby hotels by lat and lon')
    console.log(destinationGeoPos)
    
    var checkIn = checkInEl.value;
    
    checkIn = moment(checkIn).format("YYYY-MM-DD")
    console.log(checkIn);
    
    var checkOut = checkOutEl.value;
    
    checkOut = moment(checkOut).format("YYYY-MM-DD")
    console.log(checkOut)
    

    var destinationLat = destinationGeoPos.results[0].geometry.location.lat;
    var destinationLng = destinationGeoPos.results[0].geometry.location.lng;
       
    var hotelApiUrl = 'https://hotels-com-provider.p.rapidapi.com/v1/hotels/nearby?latitude='+destinationLat+'&currency=USD&longitude='+destinationLng+'&checkout_date='+checkOut+'&sort_order=STAR_RATING_HIGHEST_FIRST&checkin_date='+checkIn+'&adults_number=1&locale=en_US&guest_rating_min=4&star_rating_ids=3%2C4%2C5&children_ages=4%2C0%2C15&page_number=1&price_min=10&accommodation_ids=20%2C8%2C15%2C5%2C1&theme_ids=14%2C27%2C25&price_max=500&amenity_ids=527%2C2063'
    fetch(hotelApiUrl, optionsHotel)
        .then(function(response){
            if (response.ok){
                response.json().then(function(data){
                    console.log(data);
                    if (data.searchResults.results.length!==0){
                        hotelListHandler(data);
                    } else {
                        reset();
                        var modalKey = "no-hotel"
                        modalHandler(modalKey);
                    }                   
                })
            }
            })       
        .catch(function(error){
            console.log(error);
            reset();
            var modalKey = "hotel-error"
            modalHandler(modalKey);
        })

        //output data to create DOM elements and user can pick a hotel
};

//creates interactive element (currently buttons) for nearby hotels identified
var hotelListHandler = function(hotelList){
    console.log(hotelList,"create Elements based on hotels listed");
    hotelResults = hotelList.searchResults.results;
    console.log(hotelResults);

    hotelContainerEl.replaceChildren();
    
    for(var i = 0; i < hotelResults.length; i++){
        console.log(hotelResults[i]);//this will list all hotels found and other properties

        var hotelResultsEl = document.createElement("button")
        hotelResultsEl.textContent= hotelResults[i].name;
        hotelResultsEl.setAttribute("id",hotelResults[i].name);
        hotelResultsEl.setAttribute("data-id", 'hotel-button')

        hotelContainerEl.append(hotelResultsEl)
    }    
}
//once user picks a hotel,identifies which hotel from hotels object was clicked
var selectedHotel = function(event){
    var hotel = event.target
    console.log(hotel);
    console.log(hotelResults);//data captured from hotelListHandler function
    console.log('this will fetch from directions api')
    console.log(hotel.textContent)

    var index ='';

    if (event.target.getAttribute("data-id")==='hotel-button'){
        for (var i = 0; i<hotelResults.length; i++) {
            if (hotelResults[i].name === hotel.textContent){
                console.log(hotelResults[i].name);
                index = i;
                break
            } else if (hotelResults[i].name !== hotel.textContent){
                continue
            }
        }
    
        console.log(index);
        
        var hotelSelected = hotelResults[index];
    
        console.log(hotelSelected);
    
        convertOriginGeoPos(hotelSelected);
    }        
}

//takes origin input from user-filled form and selected hotel data from hotel list generated
var convertOriginGeoPos = function(hotel){
    console.log('this will convert user input origin string to latitude and longitude')
    
    console.log(hotel);

    var originInput = originInputEl.value.trim();
    var originGeoPosUrl= 'https://google-maps-geocoding.p.rapidapi.com/geocode/json?address=' + originInput + '&language=en'
    console.log(originGeoPosUrl);
    
    fetch(originGeoPosUrl, optionsGeoPos)
        .then(function(response){
            if (response.ok){
                response.json().then(function(originGeoPos){
                    console.log(originGeoPos);
                    if (originGeoPos.results.length!==0){
                        initTravelMap(originGeoPos,hotel);
                    } else {
                        originInputEl.value ='';
                        var modalKey = "no-origin";
                        modalHandler(modalKey);
                    }                   
                })
            }
        })
        .catch(function(error){
            console.log(error);
            reset();
            var modalKey = "origin-error"
            modalHandler(modalKey);
        });
};

//displays initial map; lets user know that the website will generate a map visual
function initMap (){
    var mapOptions ={ 
        center:{lat:56.1304
            ,lng:-106.3468},
            zoom:9}
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

//generates zoomed map, draws route and displays direction steps
var initTravelMap = function (origin,hotel){
    
    document.getElementById('map').replaceChildren();

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    
    var hotelLatLng=hotel;
    console.log(hotelLatLng);

    var mapOptions ={ 
    center:{lat:origin.results[0].geometry.location.lat
        ,lng:origin.results[0].geometry.location.lng},
        zoom:14}
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    directionsRenderer.setMap(map);//renders map
    document.getElementById('directionsPanel').replaceChildren();
    directionsRenderer.setPanel(document.getElementById('directionsPanel'));//provides steps
    calculateAndDisplayRoute (directionsService,directionsRenderer,origin, hotelLatLng);

}

function calculateAndDisplayRoute (directionsService,directionsRenderer,origin,hotelLatLng) {

    var hotelLat = hotelLatLng.coordinate.lat;
    var hotelLng = hotelLatLng.coordinate.lon;
    console.log(hotelLat,hotelLng);

    var originLat = origin.results[0].geometry.location.lat;
    var originLng = origin.results[0].geometry.location.lng;

    console.log(originLat,originLng);
    
    var start = new google.maps.LatLng(originLat,originLng);
    var end = new google.maps.LatLng(hotelLat,hotelLng);
    //renders driving route
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'DRIVING',//default travel mode is driving
    })
    .then((response)=>{
        directionsRenderer.setDirections(response);
    })
    .catch(function(error){
        console.log(error);
        reset();
        var modalKey = "direction-error";
        modalHandler(modalKey);
    });
    
}

//--------------------------field resetter---------------------------:
//resets elements on the page; called when error occurs
var reset = function(){
    originInputEl.value=''
    destinationInputEl.value=''
    checkInEl.value=''
    checkOutEl.value=''
    hotelContainerEl.replaceChildren();
    initMap();
    directionsPanel.replaceChildren();
}

//--------------------------modal handler----------------------------:
//switch statement depends on modalKey; triggered by error or invalid input


var modalHandler = function (modalKey) {
    
    switch (modalKey) {
        case "invalid-origin":
            modalTitleEl.textContent='Invalid Origin'
            modalBodyEl.textContent='Please enter a valid origin'
            $('#modal').modal();
            break;
        case "invalid-destination":
            modalTitleEl.textContent='Invalid Destination'
            modalBodyEl.textContent='Please enter a valid destination'
            $('#modal').modal();
            break;
        case "invalid-checkin":
            modalTitleEl.textContent='Invalid Check-In Date'
            modalBodyEl.textContent='Please enter a valid check-in date. Please note the format (YYYY-MM-DD)'
            $('#modal').modal();
            break;
        case "invalid-checkout":
            modalTitleEl.textContent='Invalid Check-Out Date'
            modalBodyEl.textContent='Please enter a valid check-out date. Please note the format (YYYY-MM-DD)'
            $('#modal').modal();
            break;
        case "no-destination":
            modalTitleEl.textContent='Error:'
            modalBodyEl.textContent='Destination was not recognized'
            $('#modal').modal();
            break;
        case "destination-error":
            modalTitleEl.textContent='Error:'
            modalBodyEl.textContent='Could not retrieve destination data'
            $('#modal').modal();
            break;
        case "no-hotel":
            modalTitleEl.textContent='Error:'
            modalBodyEl.textContent='No nearby hotels identified'
            $('#modal').modal();
            break;
        case "hotel-error":
            modalTitleEl.textContent='Error:'
            modalBodyEl.textContent='Could not retrieve hotel data'
            $('#modal').modal();
            break;
        case "no-origin":
            modalTitleEl.textContent='Error:'
            modalBodyEl.textContent='Origin was not recognized'
            $('#modal').modal();
            break;
        case "origin-error":
            modalTitleEl.textContent='Error:'
            modalBodyEl.textContent='Could not retrieve origin data'
            $('#modal').modal();
            break;
        case "direction-error":
            modalTitleEl.textContent='Error:'
            modalBodyEl.textContent='Could not retrieve directions data'
            $('#modal').modal();           
    }
}

//----------------------addEventListeners-------------------------:

hotelContainerEl.addEventListener("click", selectedHotel)
fetchButtonEl.addEventListener("click",inputValidation);

