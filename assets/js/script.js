//------------------DEFINE VARIABLES--------------------------------------:

//Hotels com API through rapidapi.com
//searches nearby hotels relative to the query(geoposition: latitude and longitude)
const optionsHotel = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '2e6d3d3e5amsh64a2efba554e4b9p156f3ajsnffe6aa484f43',
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

var modalEl = document.querySelector(".modal")

var okayEl = document.querySelector("#ok-btn")

var recallContainerEl = document.querySelector('#recall')
// var recallHotelContainer = document.querySelector("#recall-hotel-container")

// add var map
var mapEl = document.querySelector('#map');

var moveMap = document.querySelector('#move-map');

var userInput = []



//-----------------DEFINE FUNCTIONS----------------------:
//this function is called after pressing Search button and validates value of each input
var inputValidation = function (event) {
    
    console.log('what')

    userInput.length=0;
    
    //initial input validation
    var modalKey = '';
    console.log('where')

    

    if (originInputEl.value === '') {
        modalKey = "invalid-origin";
        modalHandler(modalKey);
    } else if (destinationInputEl.value === '') {
        modalKey = "invalid-destination";
        modalHandler(modalKey);
    } else if (checkInEl.value === '' || checkInEl.value.length !== 10) {
        modalKey = "invalid-checkin";
        modalHandler(modalKey);
    } else if (checkOutEl.value === '' || checkOutEl.value.length !== 10) {
        modalKey = "invalid-checkout";
        modalHandler(modalKey);
    } else {
        dateHandler();//calls dateHandler function
    }
}

//transforms date to YYYY-MM-DD format
var dateHandler = function () {


    var dateInput = []//empty array; push API response based on input into array
    console.log(dateInput);

    var checkIn = checkInEl.value;
    console.log(checkIn)

    checkIn = moment(checkIn).format("YYYY-MM-DD");
    var checkInIdentifier = {identifier:'checkin'};
    var checkInObj = {date: checkIn};
    var checkInData = Object.assign(checkInObj, checkInIdentifier);
    console.log(checkInData);
    dateInput.push(checkInData);

    var checkOut = checkOutEl.value;

    checkOut = moment(checkOut).format("YYYY-MM-DD")
    var checkOutIdentifier = {identifier:'checkout'};
    var checkOutObj = {date:checkOut};
    var checkOutData = Object.assign(checkOutObj, checkOutIdentifier);
    console.log(checkOutData);
    dateInput.push(checkOutData);

    originHandler(dateInput);//passes dates to originHandler; originHandler will add its data to the array
}
//converts origin string input into geoposition data
var originHandler = function (input) {

    console.log(input)
    userInput.push(input);//pushed dateInput (parameter: input) into the global userInput array

    //defines API url for fetch function
    var originInput = originInputEl.value.trim();
    var originGeoPosUrl = 'https://google-maps-geocoding.p.rapidapi.com/geocode/json?address=' + originInput + '&language=en'
    console.log(originGeoPosUrl);
    //fetches geolocation data for string input by user
    fetch(originGeoPosUrl, optionsGeoPos)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    if (data.results.length !== 0) {
                        var originIdentifier = { identifier: 'origin' }//need to add identifier since order of data pushed into array is not definite (i.e. varying response times);
                        var originData = Object.assign(data, originIdentifier)
                        console.log(originData);
                        userInput.push(originData);
                        destinationHandler(userInput);//calls next input handler (destination handler); and sends the userInput package so next handler can add its data to the package.
                    } else {
                        originInputEl.value = '';
                        var modalKey = "no-origin";
                        modalHandler(modalKey);
                    }
                })
            }
        })
        .catch(function (error) {
            console.log(error);
            reset();
            var modalKey = "origin-error"
            modalHandler(modalKey);
        });

    console.log(userInput)
}
//converts destination string input into geoposition data
var destinationHandler = function (userInput) {
    //API URL fo fetch
    var destinationInput = destinationInputEl.value.trim();
    var destinationGeoPosUrl = 'https://google-maps-geocoding.p.rapidapi.com/geocode/json?address=' + destinationInput + '&language=en'
    console.log(destinationGeoPosUrl);
    //fetches geolocation based on destination string input by user
    fetch(destinationGeoPosUrl, optionsGeoPos)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    console.log(data);
                    console.log(data.status)
                    if (data.results.length === 0) {
                        reset();
                        var modalKey = "no-destination"
                        modalHandler(modalKey);
                    } else {
                        var destinationIdentifier = { identifier: 'destination' };
                        var destinationData = Object.assign(data, destinationIdentifier)
                        console.log(destinationData);
                        userInput.push(destinationData);
                        console.log(userInput)
                        fetchHotels(userInput);//by this point all the required data has been packaged into userInput (checkIn, checkOut, origin, destination); 
                        //sends to subsequent function to unpack relevant data to be processed
                    }
                })
            }
        })
        .catch(function (error) {
            console.log(error);
            reset();
            var modalKey = "destination-error"
            modalHandler(modalKey);
        });

}
//fetches nearby hotels to destination identified by user   
var fetchHotels = function (userInput) {

    console.log(userInput);

    var destinationInput = {};//empty object

    //retrieve destination from data package
    for (var i = 0; i < userInput.length; i++) {
        if (userInput[i].identifier === 'destination') {
            destinationInput = userInput[i];//reassign data retrieved from data package
            break;
        }
    }
    console.log(destinationInput);

    //retrieve checkin and checkout time from data package
    var checkIn = userInput[0][0].date
    console.log(checkIn);
    var checkOut = userInput[0][1].date
    console.log(checkOut)


    //define parameters to be used for apiUrl
    var destinationLat = destinationInput.results[0].geometry.location.lat;
    var destinationLng = destinationInput.results[0].geometry.location.lng;


    //API URL for hotel fetch   
    var hotelApiUrl = 'https://hotels-com-provider.p.rapidapi.com/v1/hotels/nearby?latitude=' + destinationLat + '&currency=USD&longitude=' + destinationLng + '&checkout_date=' + checkOut + '&sort_order=STAR_RATING_HIGHEST_FIRST&checkin_date=' + checkIn + '&adults_number=1&locale=en_US&guest_rating_min=4&star_rating_ids=3%2C4%2C5&children_ages=4%2C0%2C15&page_number=1&price_min=10&accommodation_ids=20%2C8%2C15%2C5%2C1&theme_ids=14%2C27%2C25&price_max=500&amenity_ids=527%2C2063'
    fetch(hotelApiUrl, optionsHotel)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    if (data.searchResults.results.length !== 0) {
                        console.log(data);
                        hotelListHandler(data, userInput);//data from response is sent to handler function to add elements to DOM
                    } else {
                        reset();
                        var modalKey = "no-hotel"
                        modalHandler(modalKey);
                    }
                })
            }
        })
        .catch(function (error) {
            console.log(error);
            reset();
            var modalKey = "hotel-error"
            modalHandler(modalKey);
        })

}

//creates interactive element (currently buttons) for nearby hotels identified
var hotelListHandler = function (hotelList, userInput) {
    console.log(hotelList);
    console.log(userInput);
    hotelResults = hotelList.searchResults.results;//sets the hotels identified into global variable hotelResults
    console.log(hotelResults);

    hotelContainerEl.replaceChildren();

    // removes hidden container for hotels
    hotelContainerEl.classList.remove('is-hidden')
    hotelContainerEl.classList = ('card m-3 is-align-items-center is-flex is-justify-content-center')

    for (var i = 0; i < hotelResults.length; i++) {
        console.log(hotelResults[i]);//this will list all hotels found and other properties

        var hotelResultsEl = document.createElement("button")
        hotelResultsEl.textContent = hotelResults[i].name;
        hotelResultsEl.setAttribute("id", hotelResults[i].name);
        hotelResultsEl.setAttribute("data-id", 'hotel-button')
        // add css attribute to hotels
        hotelResultsEl.setAttribute("class", "button is-text")

        hotelContainerEl.append(hotelResultsEl)
    }
}
//once user picks a hotel,identifies which hotel from hotels object was clicked
var selectedHotel = function (event) {
    var hotel = event.target
    console.log(userInput)//global array userInput was continuously updated in input handler functions above; didnt need to run this as an argument/parameter
    console.log(hotel);
    console.log(hotelResults);//data captured from hotelListHandler function
    console.log('this will fetch from directions api')
    console.log(hotel.textContent)

    // remove css style "is-hidden" to display map when a hotel is clicked
    moveMap.classList.remove('is-hidden');
    mapEl.classList.remove('is-hidden');

    var index = '';
    //makes sure the subsequent tasks only happen if the click was on the button not the div container
    if (event.target.getAttribute("data-id") === 'hotel-button') {
        for (var i = 0; i < hotelResults.length; i++) {
            if (hotelResults[i].name === hotel.textContent) {
                console.log(hotelResults[i].name);
                index = i;//assigns the i of the loop to var index
                break
            } else if (hotelResults[i].name !== hotel.textContent) {
                continue
            }
        }

        console.log(index);

        var hotelSelected = hotelResults[index];

        console.log(hotelSelected);
        recallHandler(userInput, hotelSelected)//calls function to make buttons for search history
        initTravelMap(userInput, hotelSelected)//calls function to update intial map from initMap()

    }
}

//displays initial map; lets user know the website provides a map
function initMap() {
    var mapOptions = {
        center: {
            lat: 56.1304
            , lng: -106.3468
        },
        zoom: 9
    }
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

//generates zoomed map, draws route and displays direction steps
var initTravelMap = function (input, hotel) {



    console.log(input)
    console.log(hotel)

    var originInput = {}

    //retrieve origin data from data package
    for (var i = 0; i < input.length; i++) {
        if (input[i].identifier === 'origin') {
            originInput = input[i];
            break;
        }
    }

    console.log(originInput);

    var originLat = originInput.results[0].geometry.location.lat;
    var originLng = originInput.results[0].geometry.location.lng;

    document.getElementById('map').replaceChildren();

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();



    var mapOptions = {
        center: {
            lat: originLat
            , lng: originLng
        },
        zoom: 14
    }
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);



    directionsRenderer.setMap(map);//renders map

    directionsRenderer.setPanel(document.getElementById('directionsPanel'));
    calculateAndDisplayRoute(directionsService, directionsRenderer, originInput, hotel, userInput);
}
//function that adds route and directions
var calculateAndDisplayRoute = function (directionsService, directionsRenderer, originInput, hotel, userInput) {

    document.getElementById('directionsPanel').replaceChildren();

    var hotelLat = hotel.coordinate.lat;
    var hotelLng = hotel.coordinate.lon;
    console.log(hotelLat, hotelLng);

    var originLat = originInput.results[0].geometry.location.lat;
    var originLng = originInput.results[0].geometry.location.lng;

    console.log(originLat, originLng);

    var start = new google.maps.LatLng(originLat, originLng);
    var end = new google.maps.LatLng(hotelLat, hotelLng);
    //renders driving route
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: 'DRIVING',//default travel mode is driving
    })
        .then((response) => {
            directionsRenderer.setDirections(response);//adds directions
        })
        .catch(function (error) {
            console.log(error);
            reset();
            var modalKey = "direction-error";
            modalHandler(modalKey);
        });
    //package essential data and call save function to store to localStorage for recall
    var storedTrip = []
    var tripId = originInput.results[0].address_components[0].short_name + '-' + hotel.name;
    console.log(tripId)
    storedTrip.push(tripId)
    storedTrip.push(userInput);
    storedTrip.push(hotel);
    saveTrip(storedTrip)

}
//creates buttons for previous searches; enables user to recall previous trips searched in the same session
var recallHandler = function (userInput, hotelSelected) {
    var recallButton = document.createElement("button");
    var recallString = userInput[1].results[0].address_components[0].short_name + '-' + hotelSelected.name + ' Trip'
    recallButton.textContent = recallString
    recallButton.setAttribute("id", recallString)
    recallContainerEl.append(recallButton)
    console.log('recallHandler called')

    // add attributes to recall container
    recallContainerEl.classList.remove('is-hidden');
    recallContainerEl.classList = ('card m-3 has-background-primary-light is-align-items-center is-flex is-justify-content-center');
    // recallContainerEl.classList.remove('is-hidden')
    recallButton.setAttribute('class', 'button is-text');
}
//sends data package to localStorage for later recall
var saveTrip = function (storedTrip) {
    console.log('saveTrip called')
    console.log(storedTrip[0])
    localStorage.setItem(storedTrip[0] + ' Trip', JSON.stringify(storedTrip))
}
//when recall button is clicked, takes unique data from localStorage, unpacks it and sends to initTravelMap
var loadTrip = function (event) {
    event.preventDefault
    var trip = event.target.getAttribute("id")
    var loadedTripString = localStorage.getItem(trip);
    var loadedTrip = JSON.parse(loadedTripString);
    console.log(loadedTrip)
    loadedTripData = loadedTrip.splice(1, 3);
    console.log(loadedTripData);
    var loadedUserInput = loadedTripData[0];
    var loadedHotelInput = loadedTripData[1];
    initTravelMap(loadedUserInput, loadedHotelInput);
}

//--------------------------field resetter---------------------------:
//resets elements on the page; called when error occurs
var reset = function () {
    originInputEl.value = ''
    destinationInputEl.value = ''
    checkInEl.value = ''
    checkOutEl.value = ''
    hotelContainerEl.replaceChildren();
    initMap();
    directionsPanel.replaceChildren();
}



//--------------------------modal handler----------------------------:
//switch statement depends on modalKey; triggered by error or invalid input


var modalHandler = function (modalKey) {

    switch (modalKey) {
        case "invalid-origin":
            modalTitleEl.textContent = 'Invalid Origin'
            modalBodyEl.textContent = 'Please enter a valid origin'
            modalEl.classList.add("is-active")
            break;
        case "invalid-destination":
            modalTitleEl.textContent = 'Invalid Destination'
            modalBodyEl.textContent = 'Please enter a valid destination'
            modalEl.classList.add("is-active")
            break;
        case "invalid-checkin":
            modalTitleEl.textContent = 'Invalid Check-In Date'
            modalBodyEl.textContent = 'Please enter a valid check-in date. Please note the format (YYYY-MM-DD)'
            modalEl.classList.add("is-active")
            break;
        case "invalid-checkout":
            modalTitleEl.textContent = 'Invalid Check-Out Date'
            modalBodyEl.textContent = 'Please enter a valid check-out date. Please note the format (YYYY-MM-DD)'
            modalEl.classList.add("is-active")
            break;
        case "no-destination":
            modalTitleEl.textContent = 'Error:'
            modalBodyEl.textContent = 'Destination was not recognized'
            modalEl.classList.add("is-active")
            break;
        case "destination-error":
            modalTitleEl.textContent = 'Error:'
            modalBodyEl.textContent = 'Could not retrieve destination data'
            modalEl.classList.add("is-active")
            break;
        case "no-hotel":
            modalTitleEl.textContent = 'Error:'
            modalBodyEl.textContent = 'No nearby hotels identified'
            modalEl.classList.add("is-active")
            break;
        case "hotel-error":
            modalTitleEl.textContent = 'Error:'
            modalBodyEl.textContent = 'Could not retrieve hotel data'
            modalEl.classList.add("is-active")
            break;
        case "no-origin":
            modalTitleEl.textContent = 'Error:'
            modalBodyEl.textContent = 'Origin was not recognized'
            modalEl.classList.add("is-active")
            break;
        case "origin-error":
            modalTitleEl.textContent = 'Error:'
            modalBodyEl.textContent = 'Could not retrieve origin data'
            modalEl.classList.add("is-active")
            break;
        case "direction-error":
            modalTitleEl.textContent = 'Error:'
            modalBodyEl.textContent = 'Could not retrieve directions data'
            modalEl.classList.add("is-active")
    }
}

//----------------------Global addEventListeners-------------------------:
recallContainerEl.addEventListener("click", loadTrip)
hotelContainerEl.addEventListener("click", selectedHotel)
fetchButtonEl.addEventListener("click", inputValidation);
okayEl.addEventListener("click", function (e) {
    modalEl.classList.remove("is-active");
});