# Changelog

## 1.0.0
* Initial Release

## 1.1.0
* Images are now changed by giving a URL instead of browing local file system.

## 1.2.0
* Barcode's format can now be changed.

## 1.3.0
* Sample endpoint can now be given to alter datalist *(in JSON format)*

### 1.3.1
* Fixed bug where resizing images moved them sometimes

## 1.4.0
* Rewrote template engine, now has for loops

## 1.4.1
* Made endpoints more friendly with different types of requests. Now will more easily support requests.
* Fixed bug where deleting an element(that is not at the end of children array) would break selecting elements.
* Can now have local files as img source. (potential to have default images)

## 1.4.2
* Added validation for generate endpoint
* Added SDK for C#

## 1.4.3
* Disabled native HTML autocomplete (to reduce clutter)
* Re-implemented image browsing
* Added 500kB limit on image uploads
* Added Coordinate picker/Remove element as base options for all componenets
* Added smarter image sourcing:
    * default:// *(for images on server)*
    * http:// or https:// *or* https *(for internet sourced images)*
    * ;base64, *(for base64 strings)*
* Fixed bug where /genereate would send 400 status code for no specified reason.
* Fixed bug where repeated variables would be printed blank
* Fixed bug where clicking autocomplete elements does not autocomplete
* Fixed bug where barcodes would not render on UI

## 1.4.4
* Added FOREACH statement
* Added IF statement
* Fixed bug where scaling would be choppy
* Support for custom fonts
* Rewrote function template engine to be more sophisticated
* Numerous bug fixes

# 1.5
* Added notifications
* Added support for multiline text elements

# 1.5.1
* Fixed bug where elements would be placed a little off from where they were placed.
* Can now position elements using keyboard

# 1.6.0
* New rectangle element
* Updates to performance and multiple bug fixes

# 1.7
* New line element
* Various bug fixes

