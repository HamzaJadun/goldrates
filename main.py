from quart import Quart, jsonify, request
from bs4 import BeautifulSoup
import httpx

app = Quart(__name__)

def get_gold_rates():
    url = 'https://www.urdupoint.com/business/gold-rates.html'
    response = httpx.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the table containing gold rates
    table = soup.find('table', class_='resp_table mb0')
    
    # Extract data from each row of the table
    rows = table.find_all('tr')
    data = []
    for row in rows[1:]:  # Skipping the header row
        cells = row.find_all('td')
        if len(cells) == 3:  # Assuming each row has 3 cells containing data
            purity = cells[0].text.strip()
            per_tola = cells[1].text.strip()
            per_10_gram = cells[2].text.strip()
            
            # Creating a dictionary for each row of data
            row_data = {
                'purity': purity,
                'per_tola': per_tola,
                'per_10_gram': per_10_gram,
            }
            data.append(row_data)
    
    return data

@app.route('/')
async def index():
    return 'Welcome to the Gold Rates API'

@app.route('/api/gold-rates', methods=['GET'])
async def gold_rates_api():
    gold_rates_data = get_gold_rates()
    return jsonify(gold_rates_data)

@app.route('/api/gold-rates/<int:index>', methods=['GET'])
async def get_gold_rate(index):
    gold_rates_data = get_gold_rates()
    if index < len(gold_rates_data):
        return jsonify(gold_rates_data[index])
    else:
        return jsonify({'error': 'Index out of range'})

if __name__ == '__main__':
    app.run(debug=True)
