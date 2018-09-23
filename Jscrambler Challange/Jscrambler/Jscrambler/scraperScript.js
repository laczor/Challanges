const validUrl      = require('valid-url');         /*To check if the given input, is a valid url or not*/
const chalk         = require('chalk');             /*To draw the welcome message*/
const figlet        = require('figlet');            /*To draw the welcome message*/
const clear         = require('clear');             /*To clear the command line*/
const inquirer      = require('inquirer');          /*To recieve and validate input*/
const request       = require("request");           /*To make http requests*/
const jsdom         = require("jsdom");             /*To conver the recieved html to DOM*/
const { JSDOM }     = jsdom;                        /*To conver the recieved html to DOM*/
const jsonfile      = require('jsonfile');          /*To write out the created object into a seperate jsonfile*/
const validFilename = require('valid-filename');    /*Simple filename validation*/

/*0. If url(s) have been recieved, validation will take place, the automatic httprequest
  1.1. Welcome Message
  1.2. Get User input with inquirer
  1.3. Use inquirer callback to initate http request
  3. Scrape the recieved html body for: tags/attributes/childnotes/sources/depth of tree
    - Create a virtual DOM to use the default properties
    - Using the functions to gather the json objects
    - Creating json files, 
  3.1
    - Get all of the tagnames from the DOM
    - Making an array from it, so iteration can be done
    - Use reduce function, to count how many times certain html tags can be found in the DOM
    - arr.reduce will create an array of objects 'allNames', which will store the html tag name, count of the html tag, number of it's attributes
    - Since it is looping through all of the htmlDomElemenets, we can get all of the information in one go 
    - The following properties of the (htmlTagOjbects) have been used (localName, attribute)
    - From the created object tree, if the recieved ojbect is converted to string, then to Json, the result will be a completly formatted json.
  3.2 Child element looping with given object  
  4. Get the depth of a tree with a recursive children property name check
  5. Get the sources urls for the downloaded resource types
  6. Write out jsonfiles,
*/

let scraper = {

// url = the url of the website, where all of the html tag should be scraped, filename = is the name of the json file where the data sohuld be inserted
      init: function(url,filename='results'){
//  Store the filename, at a key-value pair of the scraper object.
        scraper.filename = filename;
          if(url){  /*undefiend is a falsy value, as a result, we have to validate it everytime*/
              // Check the validity of the url
              if (validUrl.isUri(url)){
                  scraper.requestURL(url);
              } else {
                 return false;
              }

          } else {
//1.1. Welcome message
// 1.2. using inquirer to get prompt messages, and get input for the urls
// 1.3. The inputs have been recieved, the paramaters can be passed to make an http request
              clear();
              console.log(
                chalk.yellow(
                  figlet.textSync('Jscramble', { horizontalLayout: 'full' })
                )
              );

              scraper.getUrl(inputarguments => {
                scraper.requestURL(inputarguments.username);
                scraper.filename = inputarguments.filename;
              });
          }
      },
// 3. 
      scrapStart:function(body,url){
        console.log('Scraping started for ... '+url);
        const dom = new JSDOM(body);
        const vdom = dom.window.document;
        let htmlTags = scraper.scrapeHtml(body,vdom);
        let depth = scraper.scrapeDepth(vdom);
        let resource = scraper.scrapeResource(vdom);
        let jsonObj = {
                        'URL':[url],
                        'ScrapingDate':Date.now(),
                        'HTMLTags':[htmlTags],
                        'Depth': [depth],
                        'Resources': [resource]
                     };
        this.writeJson(jsonObj);
        return jsonObj;

      },
      getUrl: function(callback) {
        let questions = [
          {
            name: 'username',
            type: 'input',
            message: 'Please enter URL including("https://") && for inserting use mouse right click:',
            validate: function(value) {
                if (validUrl.isUri(value)){
                  return true;
              } else {
                 return 'Please enter a valid URL including(http:// or https://):';
              }
            }
          },
          {
            name: 'filename',
            type: 'input',
            message: 'Please enter a filename for the json',
            validate: function(value) {
                if (validFilename(value)){
                  return true;
              } else {
                 return 'Please enter a valid filename and avoid using any of the following charachters : . \ / < >';
              }
            }
          },
        ];

      // The input the user provides will be passed in to the callback, so we’ll end up with simple object with the recieved url
        inquirer.prompt(questions).then(callback);
     },
//  If the http request completed successfully, recieved body will be passed to scraping
     requestURL: function(url){
        request(url, function (error, response, body) {
          if (!error) {
              scraper.scrapStart(body,url);
          } else {
              console.log('I am very sorry, but an error has been occured, please type in the url again');
              scraper.getUrl(inputarguments => {scraper.requestURL(inputarguments.username);});            
              // console.log(error);
          }
        });

      },
/*3.1 Will return an object of data*/
      scrapeHtml:function(html,vdom) {
        let arr = Array.from(vdom.getElementsByTagName("*"));
        let countedTags = arr.reduce(function (allNames, name) { 
              if (name.localName in allNames) {
                    // Counting the stored values in the object
                    allNames[name.localName]['count']     +=   1;
                    allNames[name.localName]['attribute'] +=  name.attributes.length;
                    let obj = scraper.childElements(Array.from(name.children),allNames[name.localName]['children']);
                  }
              else {
                     // Basic values, when the htmltags are pushed to the allNames array for the first time.
                    let b = name.attributes.length;
                    let obj = scraper.childElements(Array.from(name.children));
                    allNames[name.localName] = {'count':1,'attribute':b, "children":obj};
                   }
              return allNames;
            }, {});
      return countedTags;
      },
/*3.1 
- childElements function takes two argument( 1 nodelist converted to array, 1 array of key-value attributes, by default it is an empty ojbect)
- However, if an alredy populated object is given, the function will check if there is a key with the same name and instead of creating one, it is adding 1 to the current value
*/
      childElements:function(arr, allNames = {}){ 
        let result = arr.reduce(function (allNames, name) { 
          if (name.localName in allNames) {
            allNames[name.localName]  +=   1;
          }
          else {
            allNames[name.localName] = 1;
           }
          return allNames;
          }, {});
        return result;
        },
// 4. Get the depth of a tree by a recursive children property name check.
      scrapeDepth:function(document) {
        if (!document.children) return 0;
          let max = -1;
            for ( let i = 0; i < document.children.length; i++) {
                let h = scraper.scrapeDepth(document.children[i]);
                if (h > max) {
                    max = h;
                }
            }
        return max + 1;
      },
// 5. The possible types which can have src attribute, has been moved to an array
/*    - It is followed by a loop where we are trying to select every possible type
      - If it is sucessfull, then we are looping again through the nodelist, to get every Htmlelement's src attrbute in an array
      - Once we scraped all of the src attributes, we go add it to the srcObj and go to the next
      - At the end, we will have an ojbect, which will contain all of the src resource grouped by types.
*/
      scrapeResource:function(document){
        let srcObj = {};
        let sourceTypes = ["audio",
                           "embed",
                           "iframe",
                           "img",
                           "input",
                           "script",
                           "source",
                           "trackm",
                           "video",
                          ];

        sourceTypes.map(type => {
          let typeSel = document.querySelectorAll(`${type}[src]`); 
            if(typeSel.length > 0){
                 let tempArr = [];
                   Array.from(typeSel).map (typeelement=>{
                        tempArr.push(typeelement.src);
                    });
                let tempObj = {[type]:tempArr};
                srcObj = Object.assign(srcObj,tempObj);
            } 
          });  
      return srcObj;        
      },

// 
      writeJson:function(object){

        let currentDir = process.cwd();       //Determine current directory
        let file = currentDir+'/tmp/' + scraper.filename+'.json';
        let obj = object;
// {flag: 'a'} --> means we are always adding new lines to the json object, not deleting anaything even if it is wit the same name.
        jsonfile.writeFile(file, obj,{flag: 'a'}, function (err) {
          // console.error(err);
          console.log('Data has been added to the following File: '+ file);
        });
      }
  }; 

module.exports = scraper;