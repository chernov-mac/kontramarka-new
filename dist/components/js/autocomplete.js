'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*jslint esversion: 6 */

var AutocompleteDefaults = {
    noSuggestionText: 'No matches',
    searchKey: 'name',
    arrowNavigation: true,
    symbolsToStart: 1, // start matching from this symbols amount
    limit: 0, // 0 - all suggestions
    sort: 'ASC', // ASC || DESC
    onSelect: null, // callback function on item select
    errorClass: 'error', // sort order
    highliteMatchesClass: 'highlite', // span.highlite
    hrefPrefix: '',
    fromStart: true,
    activeName: ''
};

var Autocomplete = function () {
    function Autocomplete(input, data, options) {
        _classCallCheck(this, Autocomplete);

        this.input = input;
        this.data = data;
        this.options = Object.assign({}, AutocompleteDefaults, options);
        this.resultData = [];

        this.init();
    }

    _createClass(Autocomplete, [{
        key: 'init',
        value: function init() {
            this.suggestions = this.input.closest('.autocomplete').querySelector('.autocomplete-results');
            this.createButtons();
            this.setData();
            this.initHandlers();

            this.isOpened = true;
        }
    }, {
        key: 'setData',
        value: function setData() {
            if (_typeof(this.data) == 'object') {
                this.data = Object.values(this.data);
                this.resultData = this.data;
                this.setDialogList();
            } else {
                console.error('There is no data to autocomplete.');
                return false;
            }
        }
    }, {
        key: 'createButtons',
        value: function createButtons() {
            // create close button
            this.close = document.createElement('button');
            this.close.classList.add('close');
            this.close.setAttribute('aria-label', 'Close');
            this.close.setAttribute('hidden', true);
            this.close.innerHTML = '<span aria-hidden="true">&times;</span>';
            this.input.parentNode.appendChild(this.close);
        }
    }, {
        key: 'clearDialog',
        value: function clearDialog() {
            this.suggestions.innerHTML = '';
            this.input.closest('.autocomplete').classList.remove('error');
        }
    }, {
        key: 'setDialogList',
        value: function setDialogList() {
            this.clearDialog();

            var items = '';
            if (!this.resultData.length) {
                this.input.closest('.autocomplete').classList.add(this.options.errorClass);
                items += '<li class="dropdown-item message empty">' + this.options.noSuggestionText + '</li>';
            } else {
                var hl = new RegExp('<span.*?>(.+?)</span>', 'gi');

                for (var i = 0; i < this.resultData.length; i++) {
                    var name = this.resultData[i].name;
                    var dataName = name.replace(hl, '$1');
                    var href = this.options.hrefPrefix + this.resultData[i].href;

                    var active = '';
                    if (dataName == this.options.activeName) active = 'active';

                    items += '<li class="dropdown-item ' + active + '"><a href="' + href + '" class="autocomplete-item" title="' + dataName + '" tabindex="' + (i + 1) + '">' + name + '</a></li>';
                }
            }

            this.suggestions.innerHTML = items;
        }
    }, {
        key: 'match',
        value: function match(str) {
            this.resultData = [];

            var value = this.input.value;
            var fromStart = this.options.fromStart ? '^' : '';
            var regexp = new RegExp(fromStart + '(' + value + ')', 'gi');

            var count = 0;
            var limit = this.options.limit || this.data.length;

            for (var i = 0; i < this.data.length && count < limit; i++) {
                var item = this.data[i];
                var matches = item.name.match(regexp);
                if (matches) {
                    var highlightedName = item.name.replace(regexp, '<span class="' + this.options.highliteMatchesClass + '">$1</span>');
                    this.resultData.push({
                        href: item.href,
                        name: highlightedName
                    });
                    count++;
                }
            }
            this.setDialogList();
        }
    }, {
        key: 'selectOption',
        value: function selectOption(option) {
            var str = option.getAttribute('title');
            this.input.value = str;
            this.match(str);
            this.close.removeAttribute('hidden');
            this.input.focus();

            str && this.options.onSelect && this.options.onSelect.call(this, str);
        }
    }, {
        key: 'initHandlers',
        value: function initHandlers() {
            this.input.addEventListener('focus', this.onInputFocus.bind(this));
            this.input.addEventListener('keyup', this.onInput.bind(this));
            this.close.addEventListener('click', this.onCloseClick.bind(this));
            this.suggestions.addEventListener('click', this.onSuggestionsClick.bind(this));
        }
    }, {
        key: 'onInputFocus',
        value: function onInputFocus(event) {
            // this.isOpened = true;
        }
    }, {
        key: 'onInput',
        value: function onInput(event) {
            if (event.keyCode != 38 && event.keyCode != 40 && event.keyCode != 13) {
                if (this.input.value.length >= this.options.symbolsToStart) {
                    this.close.removeAttribute('hidden');
                    this.match(this.input.value);
                } else {
                    this.close.setAttribute('hidden', true);
                    this.resultData = this.data;
                    this.setDialogList();
                }
            }
        }
    }, {
        key: 'onCloseClick',
        value: function onCloseClick(event) {
            this.resultData = this.data;
            this.setDialogList();

            this.close.setAttribute('hidden', true);
            // this.isOpened = true;

            this.input.value = '';
            this.input.focus();
        }
    }, {
        key: 'onSuggestionsClick',
        value: function onSuggestionsClick(event) {
            if (this.suggestions.contains(event.target) && event.target.classList.contains('autocomplete-item')) {
                this.selectOption(event.target);
            }
        }
    }, {
        key: 'isOpened',
        get: function get() {
            return this._isOpened;
        },
        set: function set(value) {
            this._isOpened = value;
        }
    }]);

    return Autocomplete;
}();