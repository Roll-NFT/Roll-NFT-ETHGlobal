//https://docs.nftport.xyz/docs/nftport/ZG9jOjQ0MDgxNDc3-how-to-create-your-nft-collection

const fs = require('fs');
const path = require('path')
const request = require('request');
require('dotenv').config();

NFT_PORT_KEY = process.env.NFT_PORT_KEY // Replace with your API key

METADATA_DIRECTORY_PATH = "countries-metadata" // Replace with your path to directory folder containing metadata json files

function isJson(filename) {
    return filename.split('.').pop() === "json"
}

function getFileStreamForJSONFiles(directory) {
    const jsonArray = [];
    fs.readdirSync(directory).forEach(file => {
        if(!isJson(file)) {
            return
        }
        const fileData = fs.createReadStream(path.join(directory, file));
        jsonArray.push(fileData)
    });
    return jsonArray
}

function sendRequest(metadataFileStreams, apiKey) {
    const options = {
        url: 'https://api.nftport.xyz/v0/metadata/directory',
        headers: { "Authorization": apiKey }
    }
    const req = request.post(options, function (err, resp, body) {
        if (err) {
            console.error('Error: ' + err);
        } else {
            console.log('Response: ' + body);
        }
    });
    const form = req.form();
    metadataFileStreams.forEach(file => {
        form.append('metadata_files', file);
    })
}

metadataFileStreams = getFileStreamForJSONFiles(METADATA_DIRECTORY_PATH);

sendRequest(metadataFileStreams, NFT_PORT_KEY)