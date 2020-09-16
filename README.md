# PDF-Template-Generator
(1.6.0)

User interface to generate a JSON with template information, ready to be filled in with data and converted into a PDF.

## Author

Shaheen Sarafa

## Current Features

* Removing and Placing components
    * Text:
        * Place text components
        * Autocomplete list based on sample data
        * Changing text using input box
        * Drag and dropping existing elements (unavialable on Firefox)
        * Templating
        * Edit Font, Font size, color and weight
        * Custom font support
    * Image:
        * Place image components
        * Resize using 3 knobs (width, height and maintain aspect ratio)
        * Change them by inputting image URL
        * Images can be sources from the internet, browsed locally or from our servers
    * Barcode:
        * Place barcode component
        * Change barcode format (128, 2of5)
        * Accept variables or plain text
        * Dynamically generate barcode as user types
    * QR Code:
        * Place QR Code component
        * Accept variables or plain text
        * Dynamically generate QR code dynamically as user types
    * Rectangle:
        * Place rectangle component
        * Can toggle between rectangle and line
        * Change stroke and fill color
* Template Engine:
    * Parsing variables in curly braces
    * Accessing nested objects (regardless of how deeply nested)
    * Parses the JSON to PDF using JSPDF
    * Functional statements:
        * FOREACH
        * IF
* Undo and Redo
* Endpoint to generate PDF.
* Change variable list by giving sample JSON

## TODOs
* Tooltips integration
* Refactoring/Bug fixing

## Known issues
    * No support for interlaced PNG images

## License

MIT. 

