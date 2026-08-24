import zipfile
import xml.etree.ElementTree as ET
import os

def read_docx(file_path):
    if not os.path.exists(file_path):
        return f"File not found: {file_path}"
    
    try:
        with zipfile.ZipFile(file_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # w:t 태그에 있는 텍스트 추출 (Word XML Namespace)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            paragraphs = []
            
            # 모든 w:p (Paragraph) 요소를 순회하면서 텍스트 합치기
            for p in root.findall('.//w:p', namespaces):
                texts = []
                for t in p.findall('.//w:t', namespaces):
                    if t.text:
                        texts.append(t.text)
                if texts:
                    paragraphs.append("".join(texts))
            
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error reading docx: {str(e)}"

if __name__ == "__main__":
    resume_path = r"C:\coding\YOURPB\yourpb.com\samples\resume.docx"
    content = read_docx(resume_path)
    output_path = r"C:\coding\YOURPB\yourpb.com\scratch\resume_text.txt"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Saved extracted text to {output_path}")
