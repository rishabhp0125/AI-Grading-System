from openai import OpenAI

client = OpenAI(api_key='sk-None-d6pCJQFvUDZwwYSFEX6LT3BlbkFJNmWYusMKUWre4ORLAoi8')
from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz 
import os
import pytesseract
import numpy as np
import cv2

app = Flask(__name__)
CORS(app)


# Store the uploaded rubric
rubric_text = ""

def grade_essay(essay_text, rubric_text):
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Grade the following essay based on the rubric provided. Please ensure that you use the full range of scores appropriately. Do not provide too much explanation. Rubric: {rubric_text} \nEssay: {essay_text}"}
        ],
        max_tokens=300,
        n=1,
        stop=None,
        temperature=0.7)
        completion = response.choices[0].message.content.strip()
 
        return completion

    except Exception as e: 
        print(f"An error has occured: {e}")
        return "An error has occured while grading the essay. Please try again."

@app.route('/upload_rubric', methods=['POST'])
def upload_rubric():
    global rubric_text
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file provided'}), 400

    # Save the file temporarily
    file_path = os.path.join('/tmp', file.filename)
    file.save(file_path)

    # Extract text from the PDF
    rubric_text = extract_text_from_pdf(file_path)

    # Remove the temporary file
    os.remove(file_path)

    return jsonify({'message': 'Rubric uploaded successfully'})

def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

@app.route('/submit_assignment', methods=['POST'])
def submit_assignment():
    data = request.json
    assignment_text = data.get('text', '')
    if not assignment_text:
        return jsonify({'error': 'No text provided'}), 400
    if not rubric_text:
        return jsonify({'error': 'No rubric uploaded'}), 400
    grade = grade_essay(assignment_text, rubric_text)
    return jsonify({'grade': grade})


pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'

@app.route('/grade-test', methods=['POST'])
def grade_test():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"})
    
    # Read the image file
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    if img is None:
        return jsonify({"error": "Image not loaded properly"})
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply GaussianBlur to reduce noise and improve circle detection
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply thresholding to get a binary image
    _, thresh = cv2.threshold(blurred, 150, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours in the thresholded image
    contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    marked_answers = []

    for contour in contours:
        # Approximate the contour
        approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
        
        # Use bounding box to filter out small or large contours
        x, y, w, h = cv2.boundingRect(approx)
        
        if 20 < w < 50 and 20 < h < 50:  # Adjust these values based on your answer sheet
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            marked_answers.append((x, y, w, h))
    
    # Sort the marked answers based on their position (if needed)
    marked_answers = sorted(marked_answers, key=lambda k: [k[1], k[0]])

    # Use Tesseract to extract text
    extracted_text = pytesseract.image_to_string(gray)
    
    # Call OpenAI API to grade the test using gpt-3.5-turbo
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant for grading tests."},
            {"role": "user", "content": f"Grade the following test: {extracted_text}"}
        ],
        max_tokens=100,
        n=1,
        stop=None,
        temperature=0.7
    )
    
    grade = response.choices[0].message.content.strip()
    return jsonify({"grade": grade, "marked_answers": marked_answers})

if __name__ == '__main__':
    app.run(debug=True)
