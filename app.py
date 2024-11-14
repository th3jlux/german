from flask import Flask, render_template, request, jsonify
import pandas as pd
import re

def sort_key(value):
    numbers = re.findall(r'\d+', value)
    return (int(numbers[0]) if numbers else float('inf'), value)

app = Flask(__name__)

# Load data once when the app starts
df = pd.read_excel('data/German.xls', sheet_name='Nouns')
fill_blanks_df = pd.read_excel('data/German.xls', sheet_name='FillBlanks')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/nouns')
def nouns():
    categories = sorted(df['category'].unique(), key=sort_key)
    return render_template('nouns.html', categories=categories)

@app.route('/get_words', methods=['POST'])
def get_words():
    selected_categories = request.json.get('categories', [])
    filtered_df = df[df['category'].isin(selected_categories)]
    words = [
        {
            "english": row['english'],
            "german": row['german'],
            "gender": row['gender']
        }
        for _, row in filtered_df.iterrows()
    ]
    return jsonify(words)

@app.route('/fill_blanks')
def fill_blanks():
    unique_cases = fill_blanks_df['case'].unique().tolist()
    unique_types = fill_blanks_df['type'].unique().tolist()
    return render_template('fill_blanks.html', unique_cases=unique_cases, unique_types=unique_types)

@app.route('/get_random_phrase', methods=['POST'])
def get_random_phrase():
    filters = request.json
    case_filter = filters.get('case')
    type_filter = filters.get('type')

    filtered_df = fill_blanks_df
    if case_filter:
        filtered_df = filtered_df[filtered_df['case'] == case_filter]
    if type_filter:
        filtered_df = filtered_df[filtered_df['type'] == type_filter]

    if not filtered_df.empty:
        random_row = filtered_df.sample(1).iloc[0]
        english_phrase = random_row['english']
        german_phrase = random_row['german']
        correct_article = random_row['article']  # Include the article
    else:
        english_phrase = "No matching data"
        german_phrase = "Keine passenden Daten"
        correct_article = ""

    return jsonify({'english': english_phrase, 'german': german_phrase, 'article': correct_article})



if __name__ == '__main__':
    app.run(debug=True)
