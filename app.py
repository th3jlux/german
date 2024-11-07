from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

# Load data once when the app starts
df = pd.read_excel('data/German.xls', sheet_name='Nouns')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/nouns')
def nouns():
    # Get unique categories from the data
    categories = df['category'].unique()
    return render_template('nouns.html', categories=categories)

@app.route('/get_words', methods=['POST'])
def get_words():
    # Get selected categories
    selected_categories = request.json.get('categories', [])
    filtered_df = df[df['category'].isin(selected_categories)]
    
    # Prepare words for the flip card
    words = [
        {
            "english": row['english'],
            "german": row['german'],
            "gender": row['gender']
        }
        for _, row in filtered_df.iterrows()
    ]
    return jsonify(words)

if __name__ == '__main__':
    app.run(debug=True)
