import React from 'react';
import logo from './logo.svg';
import PdfViewerComponent from './components/PdfViewerComponent';
import './App.css';


function App() {
  return (
    <div className="App">
			<div className="PDF-viewer">
			<PdfViewerComponent
				document={"Document.pdf"}
			/>
			</div>
		</div>
  );
}

export default App;
