/*jslint esversion: 6 */

const AutocompleteDefaults = {
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

class Autocomplete {

    constructor(input, data, options) {

        this.input = input;
        this.data = data;
        this.options = Object.assign({}, AutocompleteDefaults, options);
        this.resultData = [];

        this.init();
    }

    get isOpened() {
        return this._isOpened;
    }

    set isOpened(value) {
        this._isOpened = value;
    }

    init() {
        this.suggestions = this.input.closest('.autocomplete').querySelector('.autocomplete-results');
        this.createButtons();
        this.setData();
        this.initHandlers();

        this.isOpened = true;
    }

    setData() {
        if(typeof this.data == 'object') {
            this.data = Object.values(this.data);
            this.resultData = this.data;
            this.setDialogList();
        } else {
            console.error('There is no data to autocomplete.');
            return false;
        }
    }

    createButtons() {
        // create close button
        this.close = document.createElement('button');
        this.close.classList.add('close');
        this.close.setAttribute('aria-label', 'Close');
        this.close.setAttribute('hidden', true);
        this.close.innerHTML = '<span aria-hidden="true">&times;</span>';
        this.input.parentNode.appendChild(this.close);
    }

    clearDialog() {
        this.suggestions.innerHTML = '';
        this.input.closest('.autocomplete').classList.remove('error');
    }

    setDialogList() {
        this.clearDialog();

        let items = '';
        if (!this.resultData.length) {
            this.input.closest('.autocomplete').classList.add(this.options.errorClass);
            items += `<li class="dropdown-item message empty">${this.options.noSuggestionText}</li>`;
        } else {
            const hl = new RegExp(`<span.*?>(.+?)</span>`, 'gi');

            for (let i = 0; i < this.resultData.length; i++) {
                let name = this.resultData[i].name;
                let dataName = name.replace(hl, '$1');
                let href = this.options.hrefPrefix + this.resultData[i].href;

                let active = '';
                if (dataName == this.options.activeName) active = 'active';

                items += `<li class="dropdown-item ${active}"><a href="${href}" class="autocomplete-item" title="${dataName}" tabindex="${i + 1}">${name}</a></li>`;
            }
        }

        this.suggestions.innerHTML = items;
    }

    match(str) {
        this.resultData = [];

        const value = this.input.value;
        const fromStart = this.options.fromStart ? '^' : '';
        const regexp = new RegExp(`${fromStart}(${value})`, 'gi');

        let count = 0;
        let limit = this.options.limit || this.data.length;

        for (let i = 0; i < this.data.length && count < limit; i++) {
            let item = this.data[i];
            const matches = item.name.match(regexp);
            if (matches) {
                let highlightedName = item.name.replace(regexp, `<span class="${this.options.highliteMatchesClass}">$1</span>`);
                this.resultData.push({
                    href: item.href,
                    name: highlightedName
                });
                count++;
            }
        }
        this.setDialogList();
    }

    selectOption(option) {
        let str = option.getAttribute('title');
        this.input.value = str;
        this.match(str);
        this.close.removeAttribute('hidden');
        this.input.focus();

        str && this.options.onSelect && this.options.onSelect.call(this, str);
    }

    initHandlers() {
        this.input.addEventListener('focus', this.onInputFocus.bind(this));
        this.input.addEventListener('keyup', this.onInput.bind(this));
        this.close.addEventListener('click', this.onCloseClick.bind(this));
        this.suggestions.addEventListener('click', this.onSuggestionsClick.bind(this));
    }

    onInputFocus(event) {
        // this.isOpened = true;
    }

    onInput(event) {
        if(event.keyCode != 38 && event.keyCode != 40 && event.keyCode != 13) {
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

    onCloseClick(event) {
        this.resultData = this.data;
        this.setDialogList();

        this.close.setAttribute('hidden', true);
        // this.isOpened = true;

        this.input.value = '';
        this.input.focus();
    }

    onSuggestionsClick(event) {
        if (this.suggestions.contains(event.target) && event.target.classList.contains('autocomplete-item')) {
            this.selectOption(event.target);
        }
    }

}
