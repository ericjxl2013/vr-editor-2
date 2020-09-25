import { Element } from "./element"

// 下拉选择列表
export class SelectField extends Element {


    public elementValue: HTMLElement;
    public elementOptions: HTMLElement;

    public options: any;
    public optionsKeys: string[];

    private _oldValue: any;
    private _value: any;
    private _type: string;
    private _optionClassNamePrefix: string;
    private timerClickAway: any;
    private evtTouchId: number;
    private evtTouchSecond: boolean;
    private evtMouseDist: number[] = [0, 0];

    public optionElements: { [key: string]: HTMLElement };


    public get value(): any {
        if (this._link) {
            return this._link.get(this.path);
        } else {
            return this._value;
        }
    }
    public set value(raw: any) {
        var value = this.valueToType(raw);

        if (this._link) {
            this._oldValue = this._value;
            this.emit('change:before', value);
            this._link.set(this.path, value);
        } else {
            if ((value === null || value === undefined || raw === '') && this.optionElements[''])
                value = '';

            if (this._oldValue === value) return;
            if (value !== null && this.options[value] === undefined) return;

            // deselect old one
            if (this.optionElements[this._oldValue])
                this.optionElements[this._oldValue].classList.remove('selected');

            this._value = value;
            if (value !== '')
                this._value = this.valueToType(this._value);

            this.emit('change:before', this._value);
            this._oldValue = this._value;
            if (this.options[this._value]) {
                this.elementValue.textContent = this.options[this._value];
                // console.warn(this._value);
                this.optionElements[this._value].classList.add('selected');
            } else {
                this.elementValue.textContent = '';
            }
            this.emit('change', this._value);
        }
    }

    public get placeholder(): string {
        return this.elementValue.getAttribute('placeholder') || '';
    }
    public set placeholder(val: string) {
        if (!val) {
            this.elementValue.removeAttribute('placeholder');
        } else {
            this.elementValue.setAttribute('placeholder', val);
        }
    }

    public constructor(args: any) {
        super();

        // let self = this;

        args = args || {};
        this.options = args.options || {};
        this.optionsKeys = [];

        if (this.options instanceof Array) {
            var options: any = {};
            for (var i = 0; i < this.options.length; i++) {
                this.optionsKeys.push(this.options[i].v);
                options[this.options[i].v] = this.options[i].t;
            }
            this.options = options;
        } else {
            this.optionsKeys = Object.keys(this.options);
        }

        this.element = document.createElement('div');
        this.element.tabIndex = 0;
        this.element.classList.add('ui-select-field', 'noSelect');

        this.elementValue = document.createElement('div');
        this.elementValue.ui = this;
        this.elementValue.classList.add('value');
        this.element.appendChild(this.elementValue);

        this._oldValue = null;
        this._value = null;
        this._type = args.type || 'string';

        this._optionClassNamePrefix = args.optionClassNamePrefix || '';

        this.timerClickAway = null;
        this.evtTouchId = -9;
        this.evtTouchSecond = false;
        this.evtMouseDist = [0, 0];

        this.elementValue.addEventListener('mousedown', this._onMouseDown.bind(this), false);
        this.elementValue.addEventListener('touchstart', this._onTouchStart.bind(this), false);

        this.elementOptions = document.createElement('ul');
        this.element.appendChild(this.elementOptions);
        

        this.optionElements = {};

        if (args.default !== undefined && this.options[args.default] !== undefined) {
            this._value = this.valueToType(args.default);
            this._oldValue = this._value;
        }

        this.on('link', this._onLink);
        this._updateOptions();

        this.on('change', this._onChange.bind(this));

        // arrows - change
        this.element.addEventListener('keydown', this._onKeyDown.bind(this), false);

        if (args.placeholder)
            this.placeholder = args.placeholder;
    }


    private _onHoldSelect(target: HTMLElement, x: number, y: number, evt?: TouchEvent) {
        if (target && target.uiElement && target.uiElement === this && target.classList.contains('selected'))
            return;

        if ((Math.abs(x - this.evtMouseDist[0]) + Math.abs(y - this.evtMouseDist[1])) < 8)
            return;

        if (target && target.uiElement && target.uiElement === this && evt !== undefined)
            this._onOptionSelect.call(target, evt);
        // console.log(target.textContent);
        this.close(target.textContent!);
    };

    private _onMouseDown(evt: MouseEvent): void {
        if (this.disabled && !this.disabledClick)
            return;

        if (this.element!.classList.contains('active')) {
            this.close();
        } else {
            evt.preventDefault();
            evt.stopPropagation();
            this.evtMouseDist[0] = evt.pageX;
            this.evtMouseDist[1] = evt.pageY;
            this.element!.focus();
            this.open();
            window.addEventListener('mouseup', this.evtMouseUp.bind(this));
        }
    };

    private _onTouchStart(evt: TouchEvent): void {
        if (this.disabled && !this.disabledClick)
            return;

        if (this.element!.classList.contains('active')) {
            this.close();
        } else {
            evt.preventDefault();
            evt.stopPropagation();

            var touch;

            for (var i = 0; i < evt.changedTouches.length; i++) {
                if ((<HTMLElement>(evt.changedTouches[i].target)).uiElement !== this)
                    continue;

                touch = evt.changedTouches[i];

                break;
            }

            if (!touch) return;

            this.evtTouchId = touch.identifier;
            this.evtMouseDist[0] = touch.pageX;
            this.evtMouseDist[1] = touch.pageY;
            this.element!.focus();
            this.open();
            window.addEventListener('touchend', this.evtTouchEnd.bind(this));
        }
    };

    private _onLink(path: string): void {
        if (this._link!.schema && this._link!.schema.has(path)) {
            var field = this._link!.schema.get(path);
            var options = field.options || {};
            this._updateOptions(options);
        }
    };

    private _onChange(): void {
        if (!this.renderChanges)
            return;

        this.flash();
    };

    private _onKeyDown(evt: KeyboardEvent): void {
        if (evt.keyCode === 27) {
            this.close();
            (<HTMLElement>evt.target).blur();
            return;
        }

        if ((this.disabled && !this.disabledClick) || [38, 40].indexOf(evt.keyCode) === -1)
            return;

        evt.stopPropagation();
        evt.preventDefault();

        var keys = Object.keys(this.options);
        var ind = keys.indexOf(this.value !== undefined ? this.value.toString() : null);

        var y = evt.keyCode === 38 ? -1 : 1;

        // already first item
        if (y === -1 && ind <= 0)
            return;

        // already last item
        if (y === 1 && ind === (keys.length - 1))
            return

        // set new item
        this.value = keys[ind + y];
    };

    private valueToType(value: any): any {
        switch (this._type) {
            case 'boolean':
                return !!value;
                break;
            case 'number':
                return parseInt(value, 10);
                break;
            case 'string':
                return '' + value;
                break;
        }
    };




    private evtMouseUp(evt: MouseEvent): void {
        evt.preventDefault();
        evt.stopPropagation();
        this._onHoldSelect(<HTMLElement>evt.target, evt.pageX, evt.pageY);
    };

    private evtTouchEnd(evt: TouchEvent): void {
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var touch = evt.changedTouches[i];
            if (touch.identifier !== this.evtTouchId)
                continue;

            this.evtTouchId = -9;

            evt.preventDefault();
            evt.stopPropagation();

            var target = document.elementFromPoint(touch.pageX, touch.pageY);

            this._onHoldSelect(<HTMLElement>target, touch.pageX, touch.pageY, evt);
        }

        if (this.evtTouchSecond) {
            evt.preventDefault();
            evt.stopPropagation();
            self.close();
        } else if (this.element!.classList.contains('active')) {
            this.evtTouchSecond = true;
        }
    };


    private open(): void {
        if ((this.disabled && !this.disabledClick) || this.element!.classList.contains('active'))
            return;

        this.element!.classList.add('active');

        var rect = this.element!.getBoundingClientRect();

        // left
        var left = Math.round(rect.left) + ((Math.round(rect.width) - this.element!.clientWidth) / 2);

        // top
        var top = rect.top;
        if (this.optionElements[this._value]) {
            top -= this.optionElements[this._value].offsetTop;
            top += (Math.round(rect.height) - this.optionElements[this._value].clientHeight) / 2;
            top = rect.top + rect.height + 3;
        }

        // limit to bottom / top of screen
        if (top + this.elementOptions.clientHeight > window.innerHeight) {
            top = window.innerHeight - this.elementOptions.clientHeight + 1;
        } else if (top < 0) {
            top = 0;
        }

        // top 
        this.elementOptions.style.top = Math.max(0, top) + 'px';
        // left
        this.elementOptions.style.left = left + 'px';
        // right
        this.elementOptions.style.width = Math.round(this.element!.clientWidth) + 'px';
        // bottom
        if (top <= 0 && this.elementOptions.offsetHeight >= window.innerHeight) {
            this.elementOptions.style.bottom = '0';
            this.elementOptions.style.height = 'auto';

            // scroll to item
            if (this.optionElements[this._value]) {
                var off = this.optionElements[this._value].offsetTop - rect.top;
                this.elementOptions.scrollTop = off;
            }
        } else {
            this.elementOptions.style.bottom = '';
            this.elementOptions.style.height = '';
        }

        var self = this;
        this.timerClickAway = setTimeout(function () {
            var looseActive = function () {
                self.element!.classList.remove('active');
                self.element!.blur();
                window.removeEventListener('click', looseActive);
            };

            window.addEventListener('click', looseActive);
        }, 300);

        this.emit('open');
    };


    private close(title: string = ''): void {
        if ((this.disabled && !this.disabledClick) || !this.element!.classList.contains('active'))
            return;

        window.removeEventListener('mouseup', this.evtMouseUp.bind(this));
        window.removeEventListener('touchend', this.evtTouchEnd.bind(this));

        if (this.timerClickAway) {
            clearTimeout(this.timerClickAway);
            this.timerClickAway = null;
        }

        this.element!.classList.remove('active');

        this.elementOptions.style.top = '';
        this.elementOptions.style.right = '';
        this.elementOptions.style.bottom = '';
        this.elementOptions.style.left = '';
        this.elementOptions.style.width = '';
        this.elementOptions.style.height = '';

        this.emit('close', title);

        this.evtTouchSecond = false;
    };

    private toggle(): void {
        if (this.element!.classList.contains('active')) {
            this.close();
        } else {
            this.open();
        }
    };

    public _updateOptions(options?: any) {
        if (options !== undefined) {
            if (options instanceof Array) {
                this.options = {};
                this.optionsKeys = [];
                for (var i = 0; i < options.length; i++) {
                    this.optionsKeys.push(options[i].v);
                    this.options[options[i].v] = options[i].t;
                }
            } else {
                this.options = options;
                this.optionsKeys = Object.keys(options);
            }
        }

        this.optionElements = {};
        this.elementOptions.innerHTML = '';

        for (var i = 0; i < this.optionsKeys.length; i++) {
            if (!this.options.hasOwnProperty(this.optionsKeys[i]))
                continue;

            // 用|分隔，前面是name，后面是class
            let infos = this.options[this.optionsKeys[i]].split('|');
            this.options[this.optionsKeys[i]] = infos[0];

            var element = document.createElement('li');
            element.textContent = infos[0];
            element.uiElement = this;
            element.uiValue = this.optionsKeys[i];
            element.addEventListener('touchstart', this._onOptionSelect.bind(this));
            element.addEventListener('mouseover', this._onOptionHover.bind(this));
            element.addEventListener('mouseout', this._onOptionOut.bind(this));

            if (this._optionClassNamePrefix && infos.length > 1) {
                element.classList.add(this._optionClassNamePrefix + '-' + infos[1].toLowerCase());
            }

            this.elementOptions.appendChild(element);
            // console.log(this.optionsKeys[i]);
            this.optionElements[this.optionsKeys[i]] = element;
        }
    };

    private _onOptionSelect(evt: TouchEvent): void {
        this.value = (<HTMLElement>evt.target).uiValue;
    };

    private _onOptionHover(): void {
        this.element!.classList.add('hover');
    };

    private _onOptionOut(): void {
        this.element!.classList.remove('hover');
    };

    public _onLinkChange(value: any) {
        if (this.optionElements[value] === undefined)
            return;

        if (this.optionElements[this._oldValue]) {
            this.optionElements[this._oldValue].classList.remove('selected');
        }

        this._value = this.valueToType(value);
        this.elementValue.textContent = this.options[value];
        this.optionElements[value].classList.add('selected');
        this.emit('change', value);
    };


}