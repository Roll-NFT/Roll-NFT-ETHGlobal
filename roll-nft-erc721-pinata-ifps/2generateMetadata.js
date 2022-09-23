const fs = require("fs");

require('dotenv').config();

const countries = require("./countries-shuffle.json");

async function run(){
    for (let i = 0; i < countries.length; i++) {
        let countryMetadata = {};
        const country = countries[i];
        countryMetadata["name"] = `Flag from ${country.name} -- NFT #:${i}`;
        countryMetadata["description"] = `This NFT is a unique digital version of the flag of ${country.name}`;
        countryMetadata["image"] = `ipfs://${country.ipfsCID}`;
        countryMetadata["attributes"] = [
            {"trait_type": "Code", "value": country.code},
            {"trait_type": "City", "value": country.city},
            {"trait_type": "Population", "value": country.population},
            {"trait_type": "Currency", "value": country.currency}
        ]
        countryMetadataJSON = JSON.stringify(countryMetadata);
        fs.writeFile(`./countries-metadata/${i}.json`, countryMetadataJSON, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            console.log(`File ${i}.json was saved!`);
        });
    }
}

run();