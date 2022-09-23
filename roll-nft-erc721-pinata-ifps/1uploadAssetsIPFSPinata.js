const fs = require("fs");

require('dotenv').config();

const pinataSDK = require("@pinata/sdk");

const countries = require("./countries-info/countries-codes.json");

const countriesCapitalCity = require("./countries-info/country-by-capital-city.json");
const countriesCurrency = require("./countries-info/country-by-currency-code.json");
const countriesPopulation = require("./countries-info/country-by-population.json");

const pinata = pinataSDK(
    process.env.PINATA_KEY,
    process.env.PINATA_SECRET
);

var countriesArray = Object.keys(countries).map((key) => ({"code": key, "name": countries[key]}));

var saveResultToFile = false;

async function run(){
    const countriesArrayWithIpfs = [];
    for (let i = 0; i < countriesArray.length; i++) {
        country = countriesArray[i];
        countryName = country["name"];
        countryCode = country["code"];
        flag = `./countries-info/countries-flags/${countryCode}.jpg`;
        readableStreamForFile = fs.createReadStream(flag);
        await pinata
            .pinFileToIPFS(readableStreamForFile, {})
            .then((result) => {
                country["ipfsCID"] = result["IpfsHash"];
                country["ipfsSize"] = result["PinSize"];
                countryPop = countriesPopulation.filter((obj) => obj.country === countryName);
                country["population"] = (countryPop.length > 0 ? countryPop[0]["population"] : "unknown");
                countryCurrency = countriesCurrency.filter((obj) => obj.country === countryName);
                country["currency"] = (countryCurrency.length > 0 ? countryCurrency[0]["currency_code"] : "unknown");
                countryCapital = countriesCapitalCity.filter((obj) => obj.country === countryName);
                country["city"] = (countryCapital.length > 0 ? countryCapital[0]["city"] : "unknown")
                countriesArrayWithIpfs.push(country);
                
                if(i == countriesArray.length - 1) {
                    if(saveResultToFile) {
                        countriesJSON = JSON.stringify(countriesArrayWithIpfs);
                        fs.writeFile("./countries.json", countriesJSON, 'utf8', function (err) {
                            if (err) {
                                return console.log(err);
                            }
                            console.log("The file was saved!");
                        });
                    }
                    console.log(countriesArrayWithIpfs)
                }
            })
            .catch((err) => {
                console.log(`ERROR for ${countryCode} | ${countryName}`)
            });
    }

}

run();