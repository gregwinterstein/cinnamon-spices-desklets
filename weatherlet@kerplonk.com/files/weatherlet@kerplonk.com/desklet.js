"use strict";
/* global imports */
const Cinnamon = imports.gi.Cinnamon;
const Desklet = imports.ui.desklet;
const Gettext = imports.gettext;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const Soup = imports.gi.Soup;
const St = imports.gi.St;
const Util = imports.misc.util;
const uuid = "weatherlet@kerplonk.com";

var session = new Soup.SessionAsync();

// setTimeout(() => { }, 500);
Gettext.bindtextdomain(uuid, GLib.get_home_dir() + "/.local/share/locale");

function _(str) {
    return Gettext.dgettext(uuid, str);
}

function Weatherlet(metadata, deskletId) {
    this._init(metadata, deskletId);
}

Weatherlet.prototype = {
    __proto__: Desklet.Desklet.prototype,

    _init(metadata, deskletId) {
        Desklet.Desklet.prototype._init.call(this, metadata, deskletId);

        this._log('Starting init');
        this.updateId = null;
        this.settingsChangedInProgress = false;
        this.measureData = [];
        this._header = new St.BoxLayout({});
        this._footer = new St.BoxLayout({});

        try {
            this.settings = new Settings.DeskletSettings(this, this.metadata["uuid"], this.instance_id);

            this.settings.bindProperty(Settings.BindingDirection.IN, "url", "url", this._onSettingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "delay", "delay", this._onSettingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "measureConfigs", "measureConfigs", this._onSettingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "lastUpdatePattern", "lastUpdatePattern", this._onSettingsChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "offlinePattern", "offlinePattern", this._onSettingsChanged, null);


            this.settings.bindProperty(Settings.BindingDirection.IN, "font", "font", this._onStyleSettingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "font-color", "fontColor", this._onStyleSettingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "background-color", "backgroundColor", this._onStyleSettingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "background-transparency", "backgroundTransparency", this._onStyleSettingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "border-width", "borderWidth", this._onStyleSettingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "border-color", "borderColor", this._onStyleSettingChanged, null);
        }
        catch (e) {
            global.logError(e);
        }

        this._onSettingChanged();
        this._log('Ending init');
    },

    /**
     * Call back for settings changes
     * Sets up UI display (measureDisplay) from settings values
     * @returns Nothing
     */
    _onSettingChanged: function () {
        // Avoid accidently having more than one Mainloop timeout active at a time
        if (this.settingsChangedInProgress) {
            return;
        }
        this.settingsChangedInProgress = true;
        this._log('Starting _onSettingChanged');

        if (this.updateId > 0) {
            Mainloop.source_remove(this.updateId);
        }

        this._content = new St.BoxLayout({
            vertical: true
        });
        this._addHeader('');

        this._onStyleSettingChanged();
        this.setContent(this._content);

        // Set up data object from config object
        this._log('_onSettingChanged configuring measureData');
        this.measureData.length = 0;
        for (let measureConfig of this.measureConfigs) {
            let measure = {
                label: measureConfig.label,
                labelAlignRight: measureConfig["labelAlignRight"],
                measureAlignRight: measureConfig["measureAlignRight"],
                regex: measureConfig["regex"],
                indent: measureConfig["indent"],
                smaller: measureConfig["smaller"],
                isSeparator: measureConfig["isSeparator"]
            };

            this._log('_onSettingChanged: ' + measure.label + " " + measure.regex);

            this._addLabel(measure, "Loading...");
            this.measureData.push(measure);
        }

        this._log('_onSettingChanged configuring _footer');
        this._footer.regex = this.lastUpdatePattern;
        this._footer.label = "Last Update:";
        this._addFooter('Loading...');

        this._update();
        this.settingsChangedInProgress = false;
        this._log('Ending _onSettingChanged');
    },

    /**
     * Configure display styles from settings
     */
    _onStyleSettingChanged: function () {
        this._log('Starting _onStyleSettingChanged');
        let fontProperties = this.getCssFont(this.font);
        this._content.style = (fontProperties.names.length === 0 ? "" : ("font-family: " + fontProperties.names.join(", ") + ";\n")) +
            (fontProperties.size === "" ? "" : ("font-size: " + fontProperties.size + "px;\n")) +
            (fontProperties.style === "" ? "" : ("font-style: " + fontProperties.style + ";\n")) +
            (fontProperties.weight === "" ? "" : ("font-weight: " + fontProperties.weight + ";\n")) +
            "color: " + this.fontColor + ";\n" +
            "background-color: " + this.getCssColor(this.backgroundColor, this.backgroundTransparency) + ";\n" +
            "border-width: " + this.borderWidth + "px;\n" +
            "border-color: " + this.getCssColor(this.borderColor, this.backgroundTransparency) + ";\n" +
            "border-radius: 10pt;\n" +
            "padding: 5px 10px;";
        this._log('Ending _onStyleSettingChanged');
    },

    /**
     * Extract font properties from font settings
     * @param {*} font FontChooser object (list of font names and a size)
     * @returns font properties object with separated values for font names, size, style, & weight
     */
    getCssFont: function (font) {
        this._log('Starting getCssFont');
        let names = [];
        let namesTmp;
        let fontConfigProperties = font.split(" ");
        let size = fontConfigProperties.pop();
        let style = "";
        let weight = "";
        let defaultFont = "";

        // Extract font names
        this._log('getCssFont extracting font names');
        names.push(fontConfigProperties.join(" ").replace(/,/g, " "));

        this._log('getCssFont getting italic font names');
        namesTmp = [];
        ["italic", "oblique"].forEach(function (item, i) {
            names.forEach(function (item2, i2) {
                if (item2.toLowerCase().includes(item)) {
                    if (style === "") {
                        style = item;
                    }
                    namesTmp.push(item2.replace(new RegExp(item, "ig"), "").trim());
                }
            });
        });

        namesTmp.forEach(function (item, i) {
            names.push(item);
        });

        this._log('getCssFont getting font weight names');
        namesTmp = [];
        [
            { weight: "100", names: ["ultra-light", "extra-light"] },
            { weight: "200", names: ["light", "thin"] },
            { weight: "300", names: ["book", "demi"] },
            { weight: "400", names: ["normal", "regular"] },
            { weight: "500", names: ["medium"] },
            { weight: "600", names: ["semibold", "demibold"] },
            { weight: "900", names: ["extra-black", "fat", "poster", "ultra-black"] },
            { weight: "800", names: ["black", "extra-bold", "heavy"] },
            { weight: "700", names: ["bold"] }
        ].forEach(function (item, i) {
            item.names.forEach(function (item2, i2) {
                names.forEach(function (item3, i3) {
                    if (item3.toLowerCase().includes(item2)) {
                        if (weight === "") {
                            weight = item.weight;
                        }
                        namesTmp.push(item3.replace(new RegExp(item2, "ig"), "").trim());
                    }
                });
            });
        });

        namesTmp.forEach(function (item, i) {
            names.push(item);
        });

        this._log('getCssFont getting generic font names');
        [
            { generic: "monospace", names: ["mono", "console"] },
            { generic: "cursive", names: ["brush", "script", "calligraphy", "handwriting"] },
            { generic: "sans-serif", names: ["sans"] },
            { generic: "serif", names: ["lucida"] }
        ].forEach(function (item, i) {
            item.names.forEach(function (item2, i2) {
                names.forEach(function (item3, i3) {
                    if (item3.toLowerCase().includes(item2)) {
                        if (defaultFont === "") {
                            defaultFont = item.generic;
                        }
                    }
                });
            });
        });

        this._log('getCssFont setting fallback default font');
        if (defaultFont === "") {
            defaultFont = "sans-serif";
        }

        namesTmp = [];
        names.forEach(function (item, i) {
            namesTmp.push("\"" + item + "\"");
        });
        names = namesTmp;

        names.push(defaultFont);

        return {
            names,
            size,
            style,
            weight
        };
    },

    /**
     * Calculate CSS color from color and transparency
     * @param {*} color CSS Color config
     * @param {*} transparency Transparency value
     * @returns CSS color style
     */
    getCssColor: function (color, transparency) {
        this._log('Starting getCssColor');
        return color.replace(")", "," + (1.0 - transparency) + ")").replace("rgb", "rgba");
    },

    onDeskletClicked: function (event) {
        this._log('Starting onDeskletClicked');
        // this._update();
    },

    onDeskletRemoved: function () {
        if (this.updateId > 0) {
            Mainloop.source_remove(this.updateId);
        }
    },

    /**
     * Get data and display results
     **/
    _update: function () {
        this._log('Starting _update');
        this._getWeatherData();
        this.updateId = Mainloop.timeout_add_seconds(this.delay, Lang.bind(this, this._update));
    },

    /**
     * Get data from this.url
     **/
    _getWeatherData: function () {
        this._log('Starting _getWeatherData');

        var urlCatch = Soup.Message.new('GET', this.url);
        session.queue_message(urlCatch, Lang.bind(this, this._parseData));
    },

    /**
     * Callback for _getWeatherData to parse data and update display
     * @param {*} session Global session object (not used, but part of callback signature)
     * @param {*} message Response to this.url
     */
    _parseData: function (session, message) {
        this._log('_parseData: Status code: ' + message.status_code);
        let weatherData = null;
        if (message.status_code === 200) {
            weatherData = message.response_body.data.toString();

            if (weatherData !== null) {
                if (this._matchRegexValue(this.offlinePattern, this.weatherData)) {
                    // Offline
                    this._log('_parseData: Offline');
                    this._header.labels.header.set_text("Offline");
                } else {
                    this._log('_parseData: Online');
                    this._header.labels.header.set_text('');

                    this._log('_parseData: Setting measure values');
                    // This is not working
                    for (let measure of this.measureData) {
                        if (!measure.isSeparator && measure.regex !== undefined && measure.regex !== null && measure.regex !== '') {
                            this._log('_parseData: evaluating ' + measure.label + 'for: ' + measure.regex);

                            let result = this._getRegexValue(measure.regex, weatherData);
                            measure.labels.label.set_text(measure.label);
                            measure.labels.result.set_text(result === null ? '' : result);
                        }
                    }
                    this._setFooter(weatherData);
                }
            } else {
                this._log('No data to display');
            }
        }
    },

    /**
     * Extract matching pattern from data
     * @param {*} pattern Regex pattern to match (\1 is extracted)
     * @param {*} data Data to search for pattern
     * @returns value if matched, otherwise null (null if either pattern or data are null)
     */
    _getRegexValue: function (pattern, data) {
        let value = null;

        if (pattern !== null && data !== null) {
            let regex = new RegExp(pattern, "m");
            let matches = data.match(regex);
            if (matches !== null) {
                value = matches[1];
                this._log('_getRegexValue: Pattern matched value: \'' + value + "'");
            } else {
                this._log('_getRegexValue: No match for pattern = \'' + pattern + "'");
            }
        } else {
            this._log('_getRegexValue: pattern or data is null.');
        }

        return value;
    },

    /**
     * Determine if pattern matches in data
     * @param {*} pattern Regex pattern to match (\1 is extracted)
     * @param {*} data Data to search for pattern
     * @returns true if match found, otherwise false, false if either pattern or data are null
     */
    _matchRegexValue: function (pattern, data) {
        let matched = false;

        if (pattern !== null && data !== null) {
            let regex = new RegExp(pattern, "m");
            matched = regex.test(data);
        } else {
            this._log('pattern or data is null.');
        }

        return matched;
    },

    /**
     * Set up label objects to display data
     * @param {*} measure Object where label will be added
     * @param {*} value Initial value to set on object
     */
    _addLabel: function (measure, value) {
        this._log('Starting _addLabel');

        // Set correct CSS class for indent/smaller
        let labelClass = measure.labelAlignRight ? "weatherlet-align-right" : "weatherlet-align-left";
        let measureClass = measure.measureAlignRight ? "weatherlet-align-right" : "weatherlet-align-left";

        if (measure.indent) {
            labelClass = labelClass + '-indent';
        }

        if (measure.smaller) {
            labelClass = labelClass + '-smaller';
            measureClass = measureClass + '-smaller';
        }

        // Don't set result for separator
        if (measure.isSeparator) {
            measure.labels = {
                label: new St.Label({
                    text: measure.label === null ? ' ' : measure.label,
                    style_class: labelClass
                })
            };

            let box = new St.BoxLayout({});
            box.add(measure.labels.label, { expand: measure.labelAlignRight });
            this._content.add(box, {});
        } else {
            measure.labels = {
                label: new St.Label({
                    text: measure.label,
                    style_class: labelClass
                }),
                result: new St.Label({
                    text: value,
                    style_class: measureClass
                })
            };

            let box = new St.BoxLayout({
            });
            box.add(measure.labels.label, {
                expand: measure.labelAlignRight
            });
            box.add(measure.labels.result, {
                expand: !measure.labelAlignRight
            });

            this._content.add(box, {
            });
        }
        this._log('Ending _addLabel');
    },

    /**
     * Set up header to display data_setFooter
     * @param {*} headerText Initial text to set to header
     */
    _addHeader: function (headerText) {
        this._log('Starting _addHeader');
        this._header.labels = {
            header: new St.Label({
                text: headerText
            })
        };

        let box = new St.BoxLayout({});
        box.add(this._header.labels.header, { expand: true });
        this._content.add(box, {});
        this._log('Ending _addHeader');
    },

    _addFooter: function (footerText) {
        this._log('Starting _addFooter');
        if (this._footer.regex !== undefined && this._footer.regex !== null && this._footer.regex !== '') {
            this._footer.labels = {
                label: new St.Label({
                    text: footerText,
                    style_class: "weatherlet-align-left-smaller"
                }),
                result: new St.Label({
                    text: footerText,
                    style_class: "weatherlet-align-right-smaller"
                })
            };

            let box = new St.BoxLayout({});
            box.add(this._footer.labels.label, { expand: false });
            box.add(this._footer.labels.result, { expand: true });
            this._content.add(box, {});
        }
        this._log('Ending _addFooter');
    },

    /**
     * Parse data for footer regex if any and set footer values
     * @param {*} data Data to parse
     */
    _setFooter: function (data) {
        this._log('Starting _setFooter');
        if (this._footer.regex !== undefined && this._footer.regex !== null && this._footer.regex !== '') {
            let result = this._getRegexValue(this._footer.regex, data);
            this._footer.labels.label.set_text(this._footer.label);
            this._footer.labels.result.set_text(result === null ? '' : result);
        }
        this._log('Ending _setFooter');
    },

    /**
     * Log messages with identifying prefix
     * @param {*} message Message to log
     */
    _log: function (message) {
        global.log('[Weatherlet] ' + message);
    }
};

function main(metadata, deskletId) {
    return new Weatherlet(metadata, deskletId);
}
