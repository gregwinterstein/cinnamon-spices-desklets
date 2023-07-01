/*
 * HTML entity decoder
 * Copyright 2023 Greg Winterstein
 * Distributed under the terms of the XXXXXXX
  */

"use strict";

/**
 * Search text for HTML entities and convert to character equivalents
 * @param {String} text Text to have HTML entities converted
 * @returns Converted text
 */
function replaceHtmlEntities(text) {
    if (text === null) {
        return text;
    }

    return decodeHtmlEntities(
        decodeHtmlDecimalCharCodes(
            decodeHtmlHexCharCodes(text)));
}

/**
 * Convert decimal numeric HTML entities in the format: &#dddd; to the character equivalent
 * @param {String} text Text to search for decimal numeric HTML entities and convert
 * @returns text with numeric HTML entities converted to character equivalents
 */
function decodeHtmlDecimalCharCodes(text) {
    return text.replace(/(&#(\d+);)/g,
        function (match, capture, charCode) {
            return String.fromCharCode(charCode);
        }
    );
}

/**
 * Convert hex numeric HTML entities in the format: &#xHHHH; to the character equivalent
 * @param {String} text Text to search for hex numeric HTML entities and convert
 * @returns text with numeric HTML entities converted to character equivalents
 */
function decodeHtmlHexCharCodes(text) {
    return text.replace(/(&#[xX]([0-9a-fA-F]+);)/g,
        function (match, capture, hexCode) {
            return String.fromCharCode(parseInt(hexCode, 16));
        }
    );
}

/**
 * Convert HTML entities in the format: &xxx; to the character equivalent
 * @param {String} text Text to search for HTML entities and convert
 * @returns text with HTML entities converted to character equivalents
 */
function decodeHtmlEntities(text) {
    return text.replace(/(&([a-zA-Z0-9]]+);)/g,
        function (match, capture, entityCode) {
            let entity = entityCode;
            if (HTML_ENTITIES.has(entityCode)) {
                let charCode = HTML_ENTITIES.get(entityCode);
                entity = String.fromCharCode(charCode);
            }
            return entity;
        }
    );
}

/**
 * Maps HTML entity name to decimal code from:
 * https://www.w3.org/TR/html4/sgml/entities.html
 * 
 * Visual Studio Code regex:
 *      Search: ^<!ENTITY\s+([^ ]+)\s+CDATA\s+"&#(\d+);".*$
 *      Replace: HTML_ENTITIES.set('$1', $2);
 */
var HTML_ENTITIES = new Map();
HTML_ENTITIES.set('nbsp', 160);
HTML_ENTITIES.set('iexcl', 161);
HTML_ENTITIES.set('cent', 162);
HTML_ENTITIES.set('pound', 163);
HTML_ENTITIES.set('curren', 164);
HTML_ENTITIES.set('yen', 165);
HTML_ENTITIES.set('brvbar', 166);
HTML_ENTITIES.set('sect', 167);
HTML_ENTITIES.set('uml', 168);
HTML_ENTITIES.set('copy', 169);
HTML_ENTITIES.set('ordf', 170);
HTML_ENTITIES.set('laquo', 171);
HTML_ENTITIES.set('not', 172);
HTML_ENTITIES.set('shy', 173);
HTML_ENTITIES.set('reg', 174);
HTML_ENTITIES.set('macr', 175);
HTML_ENTITIES.set('deg', 176);
HTML_ENTITIES.set('plusmn', 177);
HTML_ENTITIES.set('sup2', 178);
HTML_ENTITIES.set('sup3', 179);
HTML_ENTITIES.set('acute', 180);
HTML_ENTITIES.set('micro', 181);
HTML_ENTITIES.set('para', 182);
HTML_ENTITIES.set('middot', 183);
HTML_ENTITIES.set('cedil', 184);
HTML_ENTITIES.set('sup1', 185);
HTML_ENTITIES.set('ordm', 186);
HTML_ENTITIES.set('raquo', 187);
HTML_ENTITIES.set('frac14', 188);
HTML_ENTITIES.set('frac12', 189);
HTML_ENTITIES.set('frac34', 190);
HTML_ENTITIES.set('iquest', 191);
HTML_ENTITIES.set('Agrave', 192);
HTML_ENTITIES.set('Aacute', 193);
HTML_ENTITIES.set('Acirc', 194);
HTML_ENTITIES.set('Atilde', 195);
HTML_ENTITIES.set('Auml', 196);
HTML_ENTITIES.set('Aring', 197);
HTML_ENTITIES.set('AElig', 198);
HTML_ENTITIES.set('Ccedil', 199);
HTML_ENTITIES.set('Egrave', 200);
HTML_ENTITIES.set('Eacute', 201);
HTML_ENTITIES.set('Ecirc', 202);
HTML_ENTITIES.set('Euml', 203);
HTML_ENTITIES.set('Igrave', 204);
HTML_ENTITIES.set('Iacute', 205);
HTML_ENTITIES.set('Icirc', 206);
HTML_ENTITIES.set('Iuml', 207);
HTML_ENTITIES.set('ETH', 208);
HTML_ENTITIES.set('Ntilde', 209);
HTML_ENTITIES.set('Ograve', 210);
HTML_ENTITIES.set('Oacute', 211);
HTML_ENTITIES.set('Ocirc', 212);
HTML_ENTITIES.set('Otilde', 213);
HTML_ENTITIES.set('Ouml', 214);
HTML_ENTITIES.set('times', 215);
HTML_ENTITIES.set('Oslash', 216);
HTML_ENTITIES.set('Ugrave', 217);
HTML_ENTITIES.set('Uacute', 218);
HTML_ENTITIES.set('Ucirc', 219);
HTML_ENTITIES.set('Uuml', 220);
HTML_ENTITIES.set('Yacute', 221);
HTML_ENTITIES.set('THORN', 222);
HTML_ENTITIES.set('szlig', 223);
HTML_ENTITIES.set('agrave', 224);
HTML_ENTITIES.set('aacute', 225);
HTML_ENTITIES.set('acirc', 226);
HTML_ENTITIES.set('atilde', 227);
HTML_ENTITIES.set('auml', 228);
HTML_ENTITIES.set('aring', 229);
HTML_ENTITIES.set('aelig', 230);
HTML_ENTITIES.set('ccedil', 231);
HTML_ENTITIES.set('egrave', 232);
HTML_ENTITIES.set('eacute', 233);
HTML_ENTITIES.set('ecirc', 234);
HTML_ENTITIES.set('euml', 235);
HTML_ENTITIES.set('igrave', 236);
HTML_ENTITIES.set('iacute', 237);
HTML_ENTITIES.set('icirc', 238);
HTML_ENTITIES.set('iuml', 239);
HTML_ENTITIES.set('eth', 240);
HTML_ENTITIES.set('ntilde', 241);
HTML_ENTITIES.set('ograve', 242);
HTML_ENTITIES.set('oacute', 243);
HTML_ENTITIES.set('ocirc', 244);
HTML_ENTITIES.set('otilde', 245);
HTML_ENTITIES.set('ouml', 246);
HTML_ENTITIES.set('divide', 247);
HTML_ENTITIES.set('oslash', 248);
HTML_ENTITIES.set('ugrave', 249);
HTML_ENTITIES.set('uacute', 250);
HTML_ENTITIES.set('ucirc', 251);
HTML_ENTITIES.set('uuml', 252);
HTML_ENTITIES.set('yacute', 253);
HTML_ENTITIES.set('thorn', 254);
HTML_ENTITIES.set('yuml', 255);

// <!-- Latin Extended-B -->
HTML_ENTITIES.set('fnof', 402);

// <!-- Greek -->
HTML_ENTITIES.set('Alpha', 913);
HTML_ENTITIES.set('Beta', 914);
HTML_ENTITIES.set('Gamma', 915);
HTML_ENTITIES.set('Delta', 916);
HTML_ENTITIES.set('Epsilon', 917);
HTML_ENTITIES.set('Zeta', 918);
HTML_ENTITIES.set('Eta', 919);
HTML_ENTITIES.set('Theta', 920);
HTML_ENTITIES.set('Iota', 921);
HTML_ENTITIES.set('Kappa', 922);
HTML_ENTITIES.set('Lambda', 923);
HTML_ENTITIES.set('Mu', 924);
HTML_ENTITIES.set('Nu', 925);
HTML_ENTITIES.set('Xi', 926);
HTML_ENTITIES.set('Omicron', 927);
HTML_ENTITIES.set('Pi', 928);
HTML_ENTITIES.set('Rho', 929);
HTML_ENTITIES.set('Sigma', 931);
HTML_ENTITIES.set('Tau', 932);
HTML_ENTITIES.set('Upsilon', 933);
HTML_ENTITIES.set('Phi', 934);
HTML_ENTITIES.set('Chi', 935);
HTML_ENTITIES.set('Psi', 936);
HTML_ENTITIES.set('Omega', 937);
HTML_ENTITIES.set('alpha', 945);
HTML_ENTITIES.set('beta', 946);
HTML_ENTITIES.set('gamma', 947);
HTML_ENTITIES.set('delta', 948);
HTML_ENTITIES.set('epsilon', 949);
HTML_ENTITIES.set('zeta', 950);
HTML_ENTITIES.set('eta', 951);
HTML_ENTITIES.set('theta', 952);
HTML_ENTITIES.set('iota', 953);
HTML_ENTITIES.set('kappa', 954);
HTML_ENTITIES.set('lambda', 955);
HTML_ENTITIES.set('mu', 956);
HTML_ENTITIES.set('nu', 957);
HTML_ENTITIES.set('xi', 958);
HTML_ENTITIES.set('omicron', 959);
HTML_ENTITIES.set('pi', 960);
HTML_ENTITIES.set('rho', 961);
HTML_ENTITIES.set('sigmaf', 962);
HTML_ENTITIES.set('sigma', 963);
HTML_ENTITIES.set('tau', 964);
HTML_ENTITIES.set('upsilon', 965);
HTML_ENTITIES.set('phi', 966);
HTML_ENTITIES.set('chi', 967);
HTML_ENTITIES.set('psi', 968);
HTML_ENTITIES.set('omega', 969);
HTML_ENTITIES.set('thetasym', 977);
HTML_ENTITIES.set('upsih', 978);
HTML_ENTITIES.set('piv', 982);

// <!-- General Punctuation -->
HTML_ENTITIES.set('bull', 8226);
HTML_ENTITIES.set('hellip', 8230);
HTML_ENTITIES.set('prime', 8242);
HTML_ENTITIES.set('Prime', 8243);
HTML_ENTITIES.set('oline', 8254);
HTML_ENTITIES.set('frasl', 8260);

// <!-- Letterlike Symbols -->
HTML_ENTITIES.set('weierp', 8472);
HTML_ENTITIES.set('image', 8465);
HTML_ENTITIES.set('real', 8476);
HTML_ENTITIES.set('trade', 8482);
HTML_ENTITIES.set('alefsym', 8501);

// <!-- Arrows -->
HTML_ENTITIES.set('larr', 8592);
HTML_ENTITIES.set('uarr', 8593);
HTML_ENTITIES.set('rarr', 8594);
HTML_ENTITIES.set('darr', 8595);
HTML_ENTITIES.set('harr', 8596);
HTML_ENTITIES.set('crarr', 8629);
HTML_ENTITIES.set('lArr', 8656);
HTML_ENTITIES.set('uArr', 8657);
HTML_ENTITIES.set('rArr', 8658);
HTML_ENTITIES.set('dArr', 8659);
HTML_ENTITIES.set('hArr', 8660);

// <!-- Mathematical Operators -->
HTML_ENTITIES.set('forall', 8704);
HTML_ENTITIES.set('part', 8706);
HTML_ENTITIES.set('exist', 8707);
HTML_ENTITIES.set('empty', 8709);
HTML_ENTITIES.set('nabla', 8711);
HTML_ENTITIES.set('isin', 8712);
HTML_ENTITIES.set('notin', 8713);
HTML_ENTITIES.set('ni', 8715);
HTML_ENTITIES.set('prod', 8719);
HTML_ENTITIES.set('sum', 8721);
HTML_ENTITIES.set('minus', 8722);
HTML_ENTITIES.set('lowast', 8727);
HTML_ENTITIES.set('radic', 8730);
HTML_ENTITIES.set('prop', 8733);
HTML_ENTITIES.set('infin', 8734);
HTML_ENTITIES.set('ang', 8736);
HTML_ENTITIES.set('and', 8743);
HTML_ENTITIES.set('or', 8744);
HTML_ENTITIES.set('cap', 8745);
HTML_ENTITIES.set('cup', 8746);
HTML_ENTITIES.set('int', 8747);
HTML_ENTITIES.set('there4', 8756);
HTML_ENTITIES.set('sim', 8764);
HTML_ENTITIES.set('cong', 8773);
HTML_ENTITIES.set('asymp', 8776);
HTML_ENTITIES.set('ne', 8800);
HTML_ENTITIES.set('equiv', 8801);
HTML_ENTITIES.set('le', 8804);
HTML_ENTITIES.set('ge', 8805);
HTML_ENTITIES.set('sub', 8834);
HTML_ENTITIES.set('sup', 8835);
HTML_ENTITIES.set('nsub', 8836);
HTML_ENTITIES.set('sube', 8838);
HTML_ENTITIES.set('supe', 8839);
HTML_ENTITIES.set('oplus', 8853);
HTML_ENTITIES.set('otimes', 8855);
HTML_ENTITIES.set('perp', 8869);
HTML_ENTITIES.set('sdot', 8901);

// <!-- Miscellaneous Technical -->
HTML_ENTITIES.set('lceil', 8968);
HTML_ENTITIES.set('rceil', 8969);
HTML_ENTITIES.set('lfloor', 8970);
HTML_ENTITIES.set('rfloor', 8971);
HTML_ENTITIES.set('lang', 9001);
HTML_ENTITIES.set('rang', 9002);

// <!-- Geometric Shapes -->
HTML_ENTITIES.set('loz', 9674);

// <!-- Miscellaneous Symbols -->
HTML_ENTITIES.set('spades', 9824);
HTML_ENTITIES.set('clubs', 9827);
HTML_ENTITIES.set('hearts', 9829);
HTML_ENTITIES.set('diams', 9830);

// <!-- C0 Controls and Basic Latin -->
HTML_ENTITIES.set('quot', 34);
HTML_ENTITIES.set('amp', 38);
HTML_ENTITIES.set('lt', 60);
HTML_ENTITIES.set('gt', 62);

// <!-- Latin Extended-A -->
HTML_ENTITIES.set('OElig', 338);
HTML_ENTITIES.set('oelig', 339);
HTML_ENTITIES.set('Scaron', 352);
HTML_ENTITIES.set('scaron', 353);
HTML_ENTITIES.set('Yuml', 376);

// <!-- Spacing Modifier Letters -->
HTML_ENTITIES.set('circ', 710);
HTML_ENTITIES.set('tilde', 732);

// <!-- General Punctuation -->
HTML_ENTITIES.set('ensp', 8194);
HTML_ENTITIES.set('emsp', 8195);
HTML_ENTITIES.set('thinsp', 8201);
HTML_ENTITIES.set('zwnj', 8204);
HTML_ENTITIES.set('zwj', 8205);
HTML_ENTITIES.set('lrm', 8206);
HTML_ENTITIES.set('rlm', 8207);
HTML_ENTITIES.set('ndash', 8211);
HTML_ENTITIES.set('mdash', 8212);
HTML_ENTITIES.set('lsquo', 8216);
HTML_ENTITIES.set('rsquo', 8217);
HTML_ENTITIES.set('sbquo', 8218);
HTML_ENTITIES.set('ldquo', 8220);
HTML_ENTITIES.set('rdquo', 8221);
HTML_ENTITIES.set('bdquo', 8222);
HTML_ENTITIES.set('dagger', 8224);
HTML_ENTITIES.set('Dagger', 8225);
HTML_ENTITIES.set('permil', 8240);
HTML_ENTITIES.set('lsaquo', 8249);
HTML_ENTITIES.set('rsaquo', 8250);
HTML_ENTITIES.set('euro', 8364);
