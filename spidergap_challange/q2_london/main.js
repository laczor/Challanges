
// 1. Imported data from the json file
var partnersJson = require("./partners.json");
// 2. Inital geo location to which every address will be compared to. 
var london = {
             lat: '51.515419',
             lon: '-0.141099'
            };
var distance_criteria = 100;
// 3. An array of partners, which can be an empty array, of it can contain already invited partners
var partnersForSupper = [ ];
// var partnersForSupper = [ { name: 'Test1',
//                             address: 'Test1_Address' },
//                           { name: 'Test2',
//                             address: 'Test2_Address' },
//                          ];


console.log(supperInvite(partnersJson,partnersForSupper,distance_criteria));





///FUNCTIONS//////
// Custom function, which will take two arguments, 
// partners : the basic data from the json file, which contains all of the information regarding the partners
// partnerArray: an array where all of the partners will be listed, and the new can be added.
// criteria how far the distance should be in KM, waiting for integer values

// 1. Looping through all of the JSON file, change iteration of there are more than 1 addresses to the same company
function supperInvite(partners,partnerArray,criteria){
    for(var i =0; i<partners.length;i++){
        var lat1=0;                                             /*Store the latitude of the partner's geodata*/
        var lon1=0;                                             /*Store the longitude of the partner's geodata*/    
        var coordinate = "";                                    /*Coordinates of the partners, is a string, which containts both lat + lon, so with string functions it has to be seperated, converted to number*/
        var dist = 0;                                           /*Variable to store the calculated distance from the central point*/
//2.(Multiple address)Looping with string seperation to get the lat, long + calling distance calculation function + pushing the name/adress of the company if the distance is less then 100km 
         if(partners[i].offices.length>1){
             for(var x =0; x<partners[i].offices.length;x++){
                 coordinate =partners[i].offices[x].coordinates;
                 lat1 = Number(coordinate.substr(0,coordinate.indexOf(',')));
                 lon1 = Number(coordinate.substr(coordinate.indexOf(',')+1,coordinate.length));
                dist =  distance(london.lat,london.lon,lat1,lon1).toFixed(2);

                if(dist<=criteria){
                    partnerArray.push({
                                            name: partners[i].organization,
                                            address: partners[i].offices[x].address,
                                            });
                    
                };
                }
         } else{
//2.(Single Adress) Looping with string seperation to get the lat, long + calling distance calculation function + pushing the name/adress of the company if the distance is less then 100km 
             coordinate =partners[i].offices[0].coordinates;
             lat1 = Number(coordinate.substr(0,coordinate.indexOf(',')));
             lon1 = Number(coordinate.substr(coordinate.indexOf(',')+1,coordinate.length));
            
             dist =  distance(london.lat,london.lon,lat1,lon1).toFixed(2);
             if(dist<=criteria){
                partnerArray.push({
                                        name: partners[i].organization,
                                        address: partners[i].offices[0].address,
                                        });
                
             };
         };
    };
//3. Sorting the populated array, based on names 
    partnerArray.sort(function(a, b){
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
    });
        
    return partnerArray;
};

//This function takes in latitude and longitude of two location and returns the distance between them using  haversine formula
    function distance(lat1, lon1, lat2, lon2) 
        {
          var R = 6371; // km
          var dLat = toRad(lat2-lat1);
          var dLon = toRad(lon2-lon1);
          var lat1 = toRad(lat1);
          var lat2 = toRad(lat2);
    
          var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          var d = R * c;
          return d;
        };

// Converts numeric degrees to radians
    function toRad(Value) 
        {
            return Value * Math.PI / 180;
        };


