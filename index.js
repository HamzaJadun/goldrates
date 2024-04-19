const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const goldRatesApp = express();

async function fetchGoldRates() {
    try {
        const url = 'https://www.urdupoint.com/business/gold-rates.html';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // Find the table containing gold rates
        const table = $('table.resp_table.mb0');
        
        // Extract data from each row of the table
        const goldRatesData = [];
        table.find('tr').each((index, element) => {
            if (index !== 0) { // Skipping the header row
                const cells = $(element).find('td');
                if (cells.length === 3) { // Assuming each row has 3 cells containing data
                    const purity = cells.eq(0).text().trim();
                    const perTola = cells.eq(1).text().trim();
                    const per10Gram = cells.eq(2).text().trim();
                    
                    // Creating a dictionary for each row of data
                    const rowData = {
                        purity: purity,
                        per_tola: perTola,
                        per_10_gram: per10Gram
                    };
                    goldRatesData.push(rowData);
                }
            }
        });
        
        return goldRatesData;
    } catch (error) {
        console.error('Error fetching gold rates:', error);
        return [];
    }
}

// Define a route for fetching gold rates
goldRatesApp.get('/gold-rates', async (req, res) => {
    const goldRatesData = await fetchGoldRates();
    res.json(goldRatesData);
});

// Define a route for the root URL
goldRatesApp.get('/', (req, res) => {
    res.send('Welcome to the Gold Rates API');
});

// Start the server
const PORT = process.env.PORT || 3000;
goldRatesApp.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
