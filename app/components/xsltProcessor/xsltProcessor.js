'use strict';
angular.module('xsltProcessor', [])

	// Repository store handler
	.factory('xsltTransform', function ($q, $window, $document, schemasFactory, x2js, _) {

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

		// parameters is of {one: 1, two: 2, three: 3} type
		var transformXml = function (xml, xsl, parameters) {
			if (!browserSupport(window))
				return 'XSL transformation is not supported by your browser';

			var result = '';

			// code for IE - untested, if you use IE, YOLO...
			if (window.ActiveXObject)
			{
				_.map(parameters, function (value, param) {
					xsltProcessor.addParameter(param, value);
				});
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
				_.map(parameters, function (value, param) {
					xsltProcessor.setParameter(null, param, value);
				});
				xsltProcessor.importStylesheet(xslDoc);
				result = (new XMLSerializer()).serializeToString(xsltProcessor.transformToFragment(xmlDoc, document));
			}
			return result;
		}

		return{
			"importFlavor": function (flavor) {
				var creamFile = schemasFactory.getFile("creamtable.xml")
					.then(function (response) {
						return response;
					}, function (error) {
						console.error(error);
						return(error);
					});

				if (flavor.file != null) {
					console.log('Applying XSL stylesheet: ' + flavor.name);
					var xslFile = schemasFactory.getFile(flavor.file)
						.then(function (response) {
							return response;
						}, function (error) {
							console.error(error);
							return(error);
						});

					return $q.all([creamFile, xslFile]).then(function wrapUp(files) {
						return x2js.xml_str2json(xsltTransform.transformXml(files[0].data, files[1].data, null));
					});
				} else {
					return $q.resolve(creamFile).then(function (response) {
						// firefox throws a syntax error in the console about this - I tracked it down it's no big deal.
						return x2js.xml_str2json(response.data);
					}, function (error) {
						console.error(error);
						return(error);
					});
				}
			}
		}
	}
	);