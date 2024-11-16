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
fill_blanks_rules_df = pd.read_excel('data/German.xls', sheet_name='FillBlanksRules')

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
    case_filter = filters.get('case', [])
    type_filter = filters.get('type', [])

    filtered_df = fill_blanks_df
    if case_filter:
        filtered_df = filtered_df[filtered_df['case'].isin(case_filter)]
    if type_filter:
        filtered_df = filtered_df[filtered_df['type'].isin(type_filter)]

    if not filtered_df.empty:
        phrases = filtered_df.to_dict(orient='records')
    else:
        phrases = []

    return jsonify({'phrases': phrases})

@app.route('/get_fill_blank_rules', methods=['POST'])
def get_fill_blank_rules():
    rule_type = request.json.get('type')

    filtered_rules = fill_blanks_rules_df[fill_blanks_rules_df['type'] == rule_type]

    rules = filtered_rules.to_dict(orient='records')
    return jsonify({'rules': rules})

if __name__ == '__main__':
    app.run(debug=True)
