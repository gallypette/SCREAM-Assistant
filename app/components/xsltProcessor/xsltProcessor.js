'use strict';
angular.module('xsltProcessor', [])

	// Repository store handler
	.factory('xsltTransform', function ($window, $document, schemasFactory) {

// Return true if the webBrowser supports xslt

		var browserSupport = function () {
			return ('ActiveXObject' in window ||
				(angular.isDefined(XSLTProcessor) && angular.isDefined(XMLSerializer)));
		}

		var getParserError = function (document) {
			var err;
			if (err = document.getElementsByTagName('parsererror')[0])
				return err.textContent ? err.textContent.split('\n', 1)[0] : 'unknown parser error';

			return null;
		}

		return{
			"transformXml": function (xml, xsl) {
				if (!browserSupport(window))
					return 'XSL transformation is not supported by your browser';

				var result = '';

				// code for IE
				if (window.ActiveXObject)
				{
					ex = xml.transformNode(xsl);
					result = ex;
				}
				// code for Chrome, Firefox, Opera, etc.
				else if (document.implementation && document.implementation.createDocument)
				{
					var err = '';
					var xmlDoc = (new DOMParser()).parseFromString(xml, 'text/xml');
					if (err = getParserError(xmlDoc))
						console.log('XML parse error: ' + err);

					var xslDoc = (new DOMParser()).parseFromString(xsl, 'text/xml');
					if (err = getParserError(xslDoc))
						console.log('XSLT parse error: ' + err);

					var xsltProcessor = new XSLTProcessor();
					xsltProcessor.importStylesheet(xslDoc);
					result = (new XMLSerializer()).serializeToString(xsltProcessor.transformToFragment(xmlDoc, document));
				}
				return result;
			}
		}
	}
	);