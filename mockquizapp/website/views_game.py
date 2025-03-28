


import random
from docx import Document
from PyPDF2 import PdfReader

import json
from django.http import HttpResponse, JsonResponse


from .models import *

from .admin_utils import *
from .student_utils import *


def upload_file_view(request):
    
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return JsonResponse({'error': 'No file uploaded.'}, status=400)

        # Identify file type
        file_type = identify_file_type(uploaded_file)

        if file_type == 'invalid':
            return JsonResponse({'error': 'Unsupported file type. Only .docx, .pdf, and .txt are allowed.'}, status=400)

        file_content = ""
        # Process the file based on its type

        if file_type == 'txt':   
            lines = uploaded_file.read().decode('utf-8').splitlines()  # Decode and split into lines
            total_lines = len(lines)
            if total_lines > 21:
                # If more than 21 lines then randomly select 21 lines uniquely
                selected_lines = []
                while len(selected_lines) < 21:
                    random_line = random.randint(0, total_lines - 1)
                    if random_line not in selected_lines:
                        selected_lines.append(random_line)
                
                file_content = '\n'.join(lines[i] for i in selected_lines)
            elif total_lines > 0:
                file_content = '\n'.join(lines)
            else:
                file_content = None
            
            if not file_content:
                return JsonResponse({'error': 'No content found in the file.'}, status=400)
            
            
        elif file_type == 'pdf':
            reader = PdfReader(uploaded_file)
            total_pages = len(reader.pages)
            
            if total_pages > 0:
                selected_page = random.randint(0, total_pages - 1)  # Select a random page
                page_text = reader.pages[selected_page].extract_text()
                extracted_text =  page_text.strip() if page_text.strip() else None
            else:
                extracted_text =  None
            
            
        elif file_type == 'docx':
            document = Document(uploaded_file)
            paragraphs = [p.text for p in document.paragraphs if p.text.strip()]  # Non-empty paragraphs
            total_pages = len(paragraphs)  # Treating paragraphs as "pages" for simplicity

            if total_pages > 0:
                selected_page = random.randint(0, total_pages - 1)  # Select a random page (paragraph)
                extracted_text = paragraphs[selected_page]
            else:
                extracted_text = None
        
        else:
            extracted_text = None
            
            
        if not extracted_text:
            return JsonResponse({'error': 'Failed to extract text from the uploaded file.'}, status=500)
        
        # TODO: Generate questionaire based on the text of the uploaded file
        
        # TODO: Create new QuizData object to save the current session
        # TODO: Return response that the user can now start the quizes based on the uploaded file
                
    
 